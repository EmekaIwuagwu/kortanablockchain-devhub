/**
 * Validation utility module for Kortana Faucet
 * Provides functions for validating and sanitizing user inputs
 */

/**
 * Validates if a string is a valid EVM address format
 * Valid format: 0x followed by exactly 40 hexadecimal characters
 * 
 * @param address - The address string to validate
 * @returns true if the address is valid, false otherwise
 * 
 * Requirements: 2.1
 */
export function isValidEVMAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if address starts with 0x and has exactly 42 characters total (0x + 40 hex chars)
  if (!address.startsWith('0x') || address.length !== 42) {
    return false;
  }

  // Check if the remaining 40 characters are valid hexadecimal
  const hexPart = address.slice(2);
  const hexRegex = /^[0-9a-fA-F]{40}$/;
  
  return hexRegex.test(hexPart);
}

/**
 * Normalizes an EVM address to lowercase format
 * This ensures consistent address comparison and storage
 * 
 * @param address - The address string to normalize
 * @returns The normalized address in lowercase
 * 
 * Requirements: 2.1
 */
export function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return '';
  }

  return address.toLowerCase().trim();
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 * and trimming whitespace
 * 
 * @param input - The input string to sanitize
 * @returns The sanitized input string
 * 
 * Requirements: 2.1, 2.3, 8.4
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove any characters that are not alphanumeric, 0x prefix, or basic punctuation
  // This prevents injection attacks while allowing valid address formats
  return input
    .trim()
    .replace(/[^\w\s0x-]/gi, '');
}

/**
 * Sanitizes error messages to prevent exposure of internal system details
 * Removes sensitive information like file paths, stack traces, and internal IDs
 * 
 * @param errorMessage - The error message to sanitize
 * @returns A sanitized error message safe for user display
 * 
 * Requirements: 8.4
 */
export function sanitizeErrorMessage(errorMessage: string): string {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'An error occurred';
  }

  // Remove file paths (e.g., /path/to/file.js, C:\path\to\file.js)
  let sanitized = errorMessage.replace(/[A-Za-z]:\\[\w\\.-]+/g, '[path]');
  sanitized = sanitized.replace(/\/[\w\/.-]+\.(js|ts|jsx|tsx|json)/g, '[path]');
  
  // Remove stack trace lines
  sanitized = sanitized.replace(/at\s+[\w.<>]+\s+\([^)]+\)/g, '');
  sanitized = sanitized.replace(/^\s*at\s+.*/gm, '');
  
  // Remove MongoDB ObjectIds and similar internal IDs
  sanitized = sanitized.replace(/[0-9a-f]{24}/gi, '[id]');
  
  // Remove IP addresses
  sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]');
  
  // Remove port numbers in URLs
  sanitized = sanitized.replace(/:(\d{4,5})\b/g, ':[port]');
  
  // Clean up multiple spaces and newlines
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized || 'An error occurred';
}
