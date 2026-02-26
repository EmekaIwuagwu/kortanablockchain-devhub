/**
 * Error handling utility for Kortana Faucet
 * Provides user-friendly error messages and error parsing
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { Logger, LogContext } from './logger';

/**
 * Error types for categorizing different error scenarios
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  RPC_TIMEOUT = 'RPC_TIMEOUT',
  RPC_ERROR = 'RPC_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errorType: ErrorType;
  statusCode: number;
  retryAfter?: number; // seconds until retry allowed (for rate limiting)
  context?: LogContext;
}

/**
 * Parse RPC error responses and extract meaningful error messages
 * Requirements: 7.1
 */
export function parseRPCError(error: unknown): string {
  if (!error) {
    return 'Unknown RPC error';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle error objects with message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    // Check for RPC error structure
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }

    // Check for nested error
    if (errorObj.error && typeof errorObj.error === 'object') {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (nestedError.message && typeof nestedError.message === 'string') {
        return nestedError.message;
      }
    }
  }

  return 'Unknown RPC error';
}

/**
 * Create a validation error response
 * Requirements: 7.2, 7.4
 */
export function createValidationError(
  message: string,
  context?: LogContext
): ErrorResponse {
  Logger.warn('Validation error', { ...context, errorType: ErrorType.VALIDATION });
  
  return {
    success: false,
    message,
    errorType: ErrorType.VALIDATION,
    statusCode: 400,
    context,
  };
}

/**
 * Create a rate limit error response with retry-after information
 * Requirements: 7.2
 */
export function createRateLimitError(
  hoursRemaining: number,
  minutesRemaining: number,
  retryAfterSeconds: number,
  context?: LogContext
): ErrorResponse {
  const message = `Rate limit exceeded. You can request tokens again in ${hoursRemaining}h ${minutesRemaining}m.`;
  
  Logger.warn('Rate limit exceeded', {
    ...context,
    errorType: ErrorType.RATE_LIMIT,
    retryAfterSeconds,
  });
  
  return {
    success: false,
    message,
    errorType: ErrorType.RATE_LIMIT,
    statusCode: 429,
    retryAfter: retryAfterSeconds,
    context,
  };
}

/**
 * Create an RPC timeout error response
 * Requirements: 7.3, 8.2
 */
export function createTimeoutError(context?: LogContext): ErrorResponse {
  const message = 'Request to blockchain timed out. Please try again.';
  
  Logger.error('RPC request timeout', {
    ...context,
    errorType: ErrorType.RPC_TIMEOUT,
  });
  
  return {
    success: false,
    message,
    errorType: ErrorType.RPC_TIMEOUT,
    statusCode: 504,
    context,
  };
}

/**
 * Create an RPC error response with parsed error message
 * Requirements: 7.1, 7.3
 */
export function createRPCError(
  rpcError: unknown,
  context?: LogContext
): ErrorResponse {
  const parsedMessage = parseRPCError(rpcError);
  const message = `Blockchain error: ${parsedMessage}`;
  
  Logger.error('RPC error', {
    ...context,
    errorType: ErrorType.RPC_ERROR,
    rpcError: parsedMessage,
  });
  
  return {
    success: false,
    message,
    errorType: ErrorType.RPC_ERROR,
    statusCode: 502,
    context,
  };
}

/**
 * Create a network error response
 * Requirements: 7.3
 */
export function createNetworkError(context?: LogContext): ErrorResponse {
  const message = 'Unable to connect to blockchain. Please try again later.';
  
  Logger.error('Network connection error', {
    ...context,
    errorType: ErrorType.NETWORK_ERROR,
  });
  
  return {
    success: false,
    message,
    errorType: ErrorType.NETWORK_ERROR,
    statusCode: 503,
    context,
  };
}

/**
 * Create a database error response
 * Requirements: 7.3
 */
export function createDatabaseError(
  operation: string,
  error: Error,
  context?: LogContext
): ErrorResponse {
  const message = operation === 'connection'
    ? 'Database temporarily unavailable'
    : 'Failed to record request. Please try again.';
  
  Logger.error(`Database ${operation} error`, context, error);
  
  return {
    success: false,
    message,
    errorType: ErrorType.DATABASE_ERROR,
    statusCode: operation === 'connection' ? 503 : 500,
    context,
  };
}

/**
 * Create an invalid response error
 * Requirements: 7.1, 8.4
 */
export function createInvalidResponseError(context?: LogContext): ErrorResponse {
  const message = 'Received invalid response from blockchain';
  
  Logger.error('Invalid RPC response structure', {
    ...context,
    errorType: ErrorType.INVALID_RESPONSE,
  });
  
  return {
    success: false,
    message,
    errorType: ErrorType.INVALID_RESPONSE,
    statusCode: 502,
    context,
  };
}

/**
 * Create a generic unknown error response
 * Requirements: 7.5
 */
export function createUnknownError(
  error: Error,
  context?: LogContext
): ErrorResponse {
  const message = 'An unexpected error occurred. Please try again.';
  
  Logger.error('Unknown error', context, error);
  
  return {
    success: false,
    message,
    errorType: ErrorType.UNKNOWN,
    statusCode: 500,
    context,
  };
}

/**
 * Determine error type from error message or error object
 */
export function determineErrorType(error: unknown): ErrorType {
  if (!error) {
    return ErrorType.UNKNOWN;
  }

  const errorString = typeof error === 'string' 
    ? error 
    : (error as Error).message || '';

  if (errorString.includes('timed out') || errorString.includes('timeout')) {
    return ErrorType.RPC_TIMEOUT;
  }

  if (errorString.includes('Network error') || errorString.includes('Unable to connect')) {
    return ErrorType.NETWORK_ERROR;
  }

  if (errorString.includes('Invalid') && errorString.includes('response')) {
    return ErrorType.INVALID_RESPONSE;
  }

  if (errorString.includes('RPC') || errorString.includes('blockchain')) {
    return ErrorType.RPC_ERROR;
  }

  return ErrorType.UNKNOWN;
}
