/**
 * Faucet RPC Service Module
 * Handles JSON-RPC communication with Kortana blockchain for faucet token requests
 * 
 * Requirements: 1.1, 8.1, 8.2, 8.3, 8.4
 */

import { NETWORK, FAUCET_CONFIG } from './rpc';
import { Logger } from './logger';
import { parseRPCError } from './errorHandler';

/**
 * JSON-RPC 2.0 Request Interface
 * Represents a standard JSON-RPC request to the blockchain
 */
export interface RPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: 'eth_requestDNR';
  params: [string, string]; // [address, amount]
}

/**
 * JSON-RPC 2.0 Response Interface
 * Represents a standard JSON-RPC response from the blockchain
 */
export interface RPCResponse {
  jsonrpc: '2.0';
  id: number;
  result?: boolean | string;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Network type for RPC endpoint selection
 */
export type NetworkType = 'testnet' | 'devnet';

/**
 * Default timeout for RPC requests in milliseconds
 * Requirements: 8.2
 */
const RPC_TIMEOUT_MS = FAUCET_CONFIG.rpcTimeoutMs;

/**
 * Returns the appropriate RPC endpoint URL based on network selection
 * 
 * @param network - The network type ('testnet' or 'devnet')
 * @returns The RPC endpoint URL for the specified network
 * 
 * Requirements: 8.1
 */
export function getRPCEndpoint(network: NetworkType): string {
  return NETWORK[network].rpcUrl;
}

/**
 * Constructs a JSON-RPC 2.0 compliant request for requesting DNR tokens
 * 
 * @param address - The wallet address to receive tokens
 * @param amount - The amount of tokens to request (as string)
 * @returns A properly formatted RPCRequest object
 * 
 * Requirements: 1.1, 8.3
 */
export function buildRPCRequest(address: string, amount: string): RPCRequest {
  return {
    jsonrpc: '2.0',
    id: Date.now(), // Use timestamp as unique request ID
    method: 'eth_requestDNR',
    params: [address, amount],
  };
}

/**
 * Validates the structure of an RPC response
 * Ensures the response conforms to JSON-RPC 2.0 specification
 * 
 * @param response - The response object to validate
 * @returns true if the response structure is valid, false otherwise
 * 
 * Requirements: 8.4
 */
export function isValidRPCResponse(response: any): response is RPCResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Must have jsonrpc field with value "2.0"
  if (response.jsonrpc !== '2.0') {
    return false;
  }

  // Must have an id field
  if (response.id === undefined) {
    return false;
  }

  // Must have either result or error, but not both
  const hasResult = response.result !== undefined;
  const hasError = response.error !== undefined;

  if (!hasResult && !hasError) {
    return false;
  }

  // If error exists, validate its structure
  if (hasError) {
    if (typeof response.error !== 'object' || 
        typeof response.error.code !== 'number' || 
        typeof response.error.message !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Parses an RPC response and extracts the result or error
 * 
 * @param response - The RPC response object to parse
 * @returns An object containing success status and either result or error message
 * 
 * Requirements: 7.1, 8.4
 */
export function parseRPCResponse(response: RPCResponse): {
  success: boolean;
  result?: boolean | string;
  error?: string;
} {
  // Check if response contains an error
  if (response.error) {
    const errorMessage = parseRPCError(response.error);
    Logger.warn('RPC response contains error', {
      errorCode: response.error.code,
      errorMessage,
    });
    return {
      success: false,
      error: errorMessage,
    };
  }

  // Check if response contains a result
  if (response.result !== undefined) {
    return {
      success: true,
      result: response.result,
    };
  }

  // Invalid response structure
  Logger.error('Invalid RPC response structure', {
    response: JSON.stringify(response),
  });
  return {
    success: false,
    error: 'Invalid RPC response structure',
  };
}

/**
 * Main function that orchestrates the RPC call with timeout
 * Sends a faucet request to the blockchain and handles the response
 * 
 * @param address - The wallet address to receive tokens
 * @param amount - The amount of tokens to request (default: "500")
 * @param network - The network to use ('testnet' or 'devnet', default: 'testnet')
 * @returns A promise that resolves with the parsed RPC response
 * @throws Error if the request times out or network fails
 * 
 * Requirements: 1.1, 7.3, 8.1, 8.2
 */
export async function requestDNR(
  address: string,
  amount: string = '500',
  network: NetworkType = 'testnet'
): Promise<{
  success: boolean;
  result?: boolean | string;
  error?: string;
}> {
  const endpoint = getRPCEndpoint(network);
  const rpcRequest = buildRPCRequest(address, amount);

  const context = {
    address,
    network,
    amount,
    endpoint,
  };

  Logger.info('Initiating RPC request', context);

  // Create an AbortController for timeout handling
  // Requirements: 8.2
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if the HTTP response is OK
    if (!response.ok) {
      const errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
      Logger.error('RPC HTTP error', {
        ...context,
        statusCode: response.status,
        statusText: response.statusText,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Parse the JSON response
    const rpcResponse: RPCResponse = await response.json();

    // Validate response structure before processing
    // Requirements: 8.4
    if (!isValidRPCResponse(rpcResponse)) {
      Logger.error('Invalid RPC response structure', {
        ...context,
        response: JSON.stringify(rpcResponse),
      });
      return {
        success: false,
        error: 'Invalid response from blockchain',
      };
    }

    // Validate JSON-RPC version
    // Requirements: 8.4
    if (rpcResponse.jsonrpc !== '2.0') {
      Logger.error('Invalid JSON-RPC response format', {
        ...context,
        receivedVersion: rpcResponse.jsonrpc,
      });
      return {
        success: false,
        error: 'Invalid JSON-RPC response format',
      };
    }

    // Parse and return the result
    const result = parseRPCResponse(rpcResponse);
    
    if (result.success) {
      Logger.info('RPC request successful', {
        ...context,
        result: result.result,
      });
    }
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout errors
    // Requirements: 7.3, 8.2
    if (error instanceof Error && error.name === 'AbortError') {
      Logger.error('RPC request timeout', {
        ...context,
        timeoutMs: RPC_TIMEOUT_MS,
      });
      return {
        success: false,
        error: 'Request timed out after 30 seconds',
      };
    }

    // Handle network errors
    // Requirements: 7.3
    if (error instanceof TypeError) {
      Logger.error('Network connection error', context, error);
      return {
        success: false,
        error: 'Network error: Unable to connect to RPC endpoint',
      };
    }

    // Handle other errors
    // Requirements: 7.5
    Logger.error('Unknown RPC error', context, error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
