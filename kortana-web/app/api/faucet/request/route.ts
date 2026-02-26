import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isValidEVMAddress, normalizeAddress, sanitizeInput, sanitizeErrorMessage } from '@/lib/validation';
import { requestDNR, type NetworkType } from '@/lib/faucetRpc';
import { FAUCET_CONFIG } from '@/lib/rpc';
import { initFaucetIndexes } from '@/lib/initFaucetIndexes';
import { Logger } from '@/lib/logger';
import {
  createValidationError,
  createRateLimitError,
  createDatabaseError,
  createTimeoutError,
  createRPCError,
  createNetworkError,
  createUnknownError,
  determineErrorType,
  ErrorType,
  type ErrorResponse,
} from '@/lib/errorHandler';

/**
 * Maximum allowed request payload size in bytes (10KB)
 * Requirements: 8.4
 */
const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB

/**
 * Allowed origins for CORS
 * Requirements: 8.4
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://kortana.xyz',
  'https://www.kortana.xyz',
];

/**
 * Helper function to set CORS headers
 * Requirements: 8.4
 */
function setCORSHeaders(response: NextResponse, origin: string | null): NextResponse {
  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 * Requirements: 8.4
 */
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return setCORSHeaders(response, origin);
}

/**
 * Helper function to convert ErrorResponse to NextResponse
 * Requirements: 7.2, 8.4
 */
function errorResponseToNextResponse(errorResponse: ErrorResponse, origin: string | null): NextResponse {
  // Sanitize error message before sending to client
  const sanitizedMessage = sanitizeErrorMessage(errorResponse.message);
  
  const response = NextResponse.json(
    {
      success: errorResponse.success,
      message: sanitizedMessage,
    },
    { status: errorResponse.statusCode }
  );

  // Add Retry-After header for rate limit errors
  // Requirements: 7.2
  if (errorResponse.retryAfter) {
    response.headers.set('Retry-After', errorResponse.retryAfter.toString());
  }

  // Add CORS headers
  return setCORSHeaders(response, origin);
}

/**
 * POST handler for faucet token requests
 * Validates address, checks rate limits, makes RPC call to blockchain, and stores request record
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5, 8.2, 8.4, 8.5
 */
export async function POST(req: NextRequest) {
    const origin = req.headers.get('origin');
    let requestId: string | undefined;
    let address: string | undefined;
    let network: string | undefined;

    try {
        // Check payload size limit
        // Requirements: 8.4
        const contentLength = req.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
            const error = createValidationError('Request payload too large', {});
            return errorResponseToNextResponse(error, origin);
        }

        const body = await req.json();
        
        // Sanitize inputs
        // Requirements: 2.1, 8.4
        address = body.address ? sanitizeInput(body.address) : undefined;
        network = body.network ? sanitizeInput(body.network) : undefined;

        const context: { address: string | undefined; network: string | undefined; requestId?: string } = { address, network };

        // Validate required fields
        // Requirements: 7.2, 7.4
        if (!address) {
            const error = createValidationError('Wallet address is required', context);
            return errorResponseToNextResponse(error, origin);
        }

        if (!network || (network !== 'testnet' && network !== 'devnet')) {
            const error = createValidationError('Invalid network selection', context);
            return errorResponseToNextResponse(error, origin);
        }

        // Server-side address validation using isValidEVMAddress()
        // Requirements: 2.1, 2.4, 7.4
        if (!isValidEVMAddress(address)) {
            const error = createValidationError(
                'Invalid wallet address format. Must be 0x followed by 40 hexadecimal characters.',
                context
            );
            return errorResponseToNextResponse(error, origin);
        }

        // Normalize address for consistent storage and comparison
        const normalizedAddress = normalizeAddress(address);
        context.address = normalizedAddress;

        Logger.info('Processing faucet request', context);

        // Connect to MongoDB
        let client;
        let db;
        let requests;
        let useDatabase = true;
        
        try {
            client = await clientPromise;
            db = client.db('faucet');
            requests = db.collection('faucet_requests');
            // Initialize indexes on first connection (idempotent operation)
            await initFaucetIndexes(client);
        } catch (dbError) {
            // If MongoDB is not available, log warning and continue without rate limiting
            Logger.warn('MongoDB not available, continuing without rate limiting', context);
            console.warn('⚠️  MongoDB not available. Rate limiting is disabled.');
            console.warn('⚠️  To enable rate limiting, install MongoDB and configure MONGODB_URI');
            useDatabase = false;
        }

        // Rate limit check: query MongoDB for requests within configured hours
        // Requirements: 3.1, 3.2, 3.5, 7.2
        if (useDatabase && requests) {
            const rateLimitMs = FAUCET_CONFIG.rateLimitHours * 60 * 60 * 1000;
            const rateLimitDate = new Date(Date.now() - rateLimitMs);
            let existing;
            
            try {
                existing = await requests.findOne({
                    address: normalizedAddress,
                    createdAt: { $gt: rateLimitDate }
                });
            } catch (queryError) {
                Logger.error('Rate limit query error', context, queryError as Error);
                // Fail open: allow request to proceed if rate limit check fails
                // This prevents blocking users due to database issues
            }

            if (existing) {
                const timeDiff = Date.now() - existing.createdAt.getTime();
                const hoursRemaining = Math.ceil((rateLimitMs - timeDiff) / (60 * 60 * 1000));
                const minutesRemaining = Math.ceil((rateLimitMs - timeDiff) / (60 * 1000)) % 60;
                const retryAfterSeconds = Math.ceil((rateLimitMs - timeDiff) / 1000);
                
                const error = createRateLimitError(
                    hoursRemaining,
                    minutesRemaining,
                    retryAfterSeconds,
                    context
                );
                return errorResponseToNextResponse(error, origin);
            }
        }

        // Create initial request record with status "pending" (if database available)
        // Requirements: 5.1, 5.4
        if (useDatabase && requests) {
            const faucetRequest = {
                address: normalizedAddress,
                network,
                amount: FAUCET_CONFIG.amount,
                symbol: 'DNR',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            try {
                const result = await requests.insertOne(faucetRequest);
                requestId = result.insertedId.toString();
                context.requestId = requestId;
                Logger.info('Request record created', context);
            } catch (insertError) {
                Logger.warn('Failed to create request record, continuing anyway', context);
                // Continue without storing the record
            }
        }

        // Call requestDNR() from RPC service after validation and rate limit checks pass
        // Requirements: 1.1, 7.3, 8.2, 8.5
        const rpcResult = await requestDNR(normalizedAddress, FAUCET_CONFIG.amount.toString(), network as NetworkType);

        // Update request record status based on RPC response
        // Requirements: 5.2, 5.3, 7.1, 7.3
        if (useDatabase && requests && requestId) {
            try {
                if (rpcResult.success) {
                    // Update status to "completed"
                    await requests.updateOne(
                        { _id: new ObjectId(requestId) },
                        { 
                            $set: { 
                                status: 'completed',
                                updatedAt: new Date(),
                                txHash: typeof rpcResult.result === 'string' ? rpcResult.result : undefined
                            } 
                        }
                    );

                    Logger.info('Faucet request completed successfully', {
                        ...context,
                        txHash: typeof rpcResult.result === 'string' ? rpcResult.result : undefined,
                    });
                } else {
                    // Update status to "failed" with error message
                    await requests.updateOne(
                        { _id: new ObjectId(requestId) },
                        { 
                            $set: { 
                                status: 'failed',
                                errorMessage: rpcResult.error,
                                updatedAt: new Date()
                            } 
                        }
                    );
                }
            } catch (updateError) {
                Logger.warn('Failed to update request record', context);
                // Continue anyway - the RPC call result is what matters
            }
        }

        // Return response based on RPC result
        if (rpcResult.success) {
            const response = NextResponse.json({
                success: true,
                message: `${FAUCET_CONFIG.amount} DNR tokens have been sent to your wallet!`,
                requestId,
                txHash: typeof rpcResult.result === 'string' ? rpcResult.result : undefined
            });
            
            return setCORSHeaders(response, origin);
        } else {
            // Determine appropriate error response based on error type
            // Requirements: 7.1, 7.3
            const errorType = determineErrorType(rpcResult.error);
            let errorResponse: ErrorResponse;

            switch (errorType) {
                case ErrorType.RPC_TIMEOUT:
                    errorResponse = createTimeoutError(context);
                    break;
                case ErrorType.NETWORK_ERROR:
                    errorResponse = createNetworkError(context);
                    break;
                default:
                    errorResponse = createRPCError(rpcResult.error, context);
            }

            return errorResponseToNextResponse(errorResponse, origin);
        }

    } catch (error) {
        const context = { address, network, requestId };
        
        // Handle JSON parsing errors
        // Requirements: 7.4, 8.4
        if (error instanceof SyntaxError) {
            const validationError = createValidationError('Invalid request format', context);
            return errorResponseToNextResponse(validationError, origin);
        }

        // Handle all other unknown errors
        // Requirements: 7.5, 8.4
        const unknownError = createUnknownError(error as Error, context);
        return errorResponseToNextResponse(unknownError, origin);
    }
}
