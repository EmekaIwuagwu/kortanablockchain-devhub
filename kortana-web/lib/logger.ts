/**
 * Structured logging utility for Kortana Faucet
 * Provides consistent logging with context and appropriate log levels
 * 
 * Requirements: 7.5
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogContext {
  address?: string;
  network?: string;
  requestId?: string;
  errorCode?: string | number;
  statusCode?: number;
  [key: string]: unknown;
}

/**
 * Structured log entry interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Formats a log entry as a structured JSON string
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Core logging function that outputs structured logs
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  const formattedLog = formatLogEntry(entry);

  // Output to appropriate console method based on level
  switch (level) {
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      console.log(formattedLog);
      break;
    case LogLevel.WARN:
      console.warn(formattedLog);
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(formattedLog);
      break;
  }
}

/**
 * Logger class with methods for different log levels
 */
export class Logger {
  /**
   * Log debug information (development only)
   */
  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log informational messages
   */
  static info(message: string, context?: LogContext): void {
    log(LogLevel.INFO, message, context);
  }

  /**
   * Log warnings (e.g., rate limit violations, validation failures)
   * Requirements: 7.5
   */
  static warn(message: string, context?: LogContext, error?: Error): void {
    log(LogLevel.WARN, message, context, error);
  }

  /**
   * Log errors (e.g., RPC failures, database errors)
   * Requirements: 7.5
   */
  static error(message: string, context?: LogContext, error?: Error): void {
    log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log critical errors (e.g., system-level failures, configuration errors)
   * Requirements: 7.5
   */
  static critical(message: string, context?: LogContext, error?: Error): void {
    log(LogLevel.CRITICAL, message, context, error);
  }
}
