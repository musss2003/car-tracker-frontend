/**
 * Enhanced error handling utility with contextual information
 * Provides meaningful error messages without exposing sensitive data
 */

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Sanitizes error messages to prevent sensitive data leakage
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive patterns
  return message
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/token[=:]\s*[A-Za-z0-9\-._~+/]+=*/gi, 'token=[REDACTED]')
    .replace(/password[=:]\s*[^\s&]*/gi, 'password=[REDACTED]')
    .replace(/api[_-]?key[=:]\s*[^\s&]*/gi, 'api_key=[REDACTED]');
}

/**
 * Enhanced error handler for fetch responses
 */
export async function handleServiceError(
  response: Response,
  context: {
    operation: string;
    resource: string;
    resourceId?: string;
  }
): Promise<never> {
  let errorData: { message?: string; error?: string; code?: string } | null =
    null;

  try {
    const text = await response.text();
    if (text) {
      errorData = JSON.parse(text);
    }
  } catch {
    // JSON parsing failed, continue with null errorData
  }

  const errorMessage =
    errorData?.message ||
    errorData?.error ||
    response.statusText ||
    'Request failed';

  const errorCode = `${context.operation}_${response.status}`;

  // Log error securely (without sensitive data)
  if (import.meta.env.DEV) {
    console.error(`Service Error [${errorCode}]`, {
      operation: context.operation,
      resource: context.resource,
      resourceId: context.resourceId,
      status: response.status,
      message: sanitizeErrorMessage(errorMessage),
    });
  }

  throw new ServiceError(
    `Failed to ${context.operation} ${context.resource}${context.resourceId ? ` (${context.resourceId})` : ''}: ${sanitizeErrorMessage(errorMessage)}`,
    errorCode,
    {
      operation: context.operation,
      resource: context.resource,
      status: response.status,
    }
  );
}

/**
 * Handles network errors with proper context
 */
export function handleNetworkError(
  error: Error,
  context: {
    operation: string;
    resource: string;
    resourceId?: string;
  }
): never {
  const sanitizedMessage = sanitizeErrorMessage(error.message);

  // Log network error securely
  if (import.meta.env.DEV) {
    console.error(`Network Error [${context.operation}]`, {
      operation: context.operation,
      resource: context.resource,
      resourceId: context.resourceId,
      message: sanitizedMessage,
    });
  }

  throw new ServiceError(
    `Network error while ${context.operation} ${context.resource}: ${sanitizedMessage}`,
    `${context.operation}_NETWORK_ERROR`,
    {
      operation: context.operation,
      resource: context.resource,
    },
    error
  );
}

/**
 * Logs errors securely without exposing sensitive information
 */
export function logError(
  error: Error | ServiceError,
  context?: Record<string, unknown>
): void {
  const sanitizedMessage = sanitizeErrorMessage(error.message);

  if (import.meta.env.DEV) {
    console.error('Application Error:', {
      name: error.name,
      message: sanitizedMessage,
      context: context || {},
      ...(error instanceof ServiceError && {
        code: error.code,
        serviceContext: error.context,
      }),
    });
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Ensure no sensitive data is included
    console.error(`Error: ${sanitizedMessage}`);
  }
}
