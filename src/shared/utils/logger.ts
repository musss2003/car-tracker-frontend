/**
 * Secure logging utility
 * Prevents sensitive data exposure in logs while maintaining debugging capabilities
 */

/**
 * Safely extracts error information without exposing sensitive data
 * @param error - The error object to sanitize
 * @returns A safe error message string
 */
const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // Only log the message, not the full error object which may contain
    // sensitive request/response data, headers, tokens, etc.
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  // For unknown error types, return a generic message
  return 'An unknown error occurred';
};

/**
 * Securely log errors without exposing sensitive information
 * @param message - Context message for the error
 * @param error - The error to log
 */
export const logError = (message: string, error?: unknown): void => {
  if (error) {
    const safeMessage = sanitizeError(error);
    console.error(`${message}: ${safeMessage}`);
  } else {
    console.error(message);
  }
};

/**
 * Securely log warnings without exposing sensitive information
 * @param message - Context message for the warning
 * @param data - Optional data to log (will be sanitized)
 */
export const logWarning = (message: string, data?: unknown): void => {
  if (data) {
    const safeMessage = typeof data === 'string' ? data : String(data);
    console.warn(`${message}: ${safeMessage}`);
  } else {
    console.warn(message);
  }
};

/**
 * Log info messages (use sparingly in production)
 * @param message - The message to log
 */
export const logInfo = (message: string): void => {
  console.log(message);
};
