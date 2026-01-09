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

/**
 * Get user-friendly error message based on HTTP status code
 */
export function getHttpErrorMessage(
  status: number,
  resource: string,
  operation: string
): string {
  const messages: Record<number, string> = {
    400: `Invalid ${resource} data provided`,
    401: 'Unauthorized. Please log in again',
    403: `You do not have permission to ${operation} this ${resource}`,
    404: `${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`,
    409: `${resource.charAt(0).toUpperCase() + resource.slice(1)} already exists`,
    422: `Invalid ${resource} data. Please check your input`,
    429: 'Too many requests. Please try again later',
    500: 'Server error. Please try again later',
    502: 'Service temporarily unavailable',
    503: 'Service temporarily unavailable',
  };

  return (
    messages[status] || `Failed to ${operation} ${resource} (Status: ${status})`
  );
}

/**
 * Enhanced fetch wrapper with automatic error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit,
  context: {
    operation: string;
    resource: string;
    resourceId?: string;
  }
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorData: { message?: string; error?: string } | null = null;

      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch {
        // JSON parsing failed, continue
      }

      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        getHttpErrorMessage(
          response.status,
          context.resource,
          context.operation
        );

      const error = new Error(errorMessage) as Error & {
        status: number;
        resourceId?: string;
        context: typeof context;
      };
      error.status = response.status;
      error.resourceId = context.resourceId;
      error.context = context;

      throw error;
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    // If it's already our custom error with status, rethrow it
    if (error instanceof Error && (error as any).status) {
      console.error(
        `Error ${context.operation} ${context.resource}${context.resourceId ? ` (${context.resourceId})` : ''}:`,
        error.message
      );
      throw error;
    }

    // Network or parsing error
    const networkError = new Error(
      `Unable to ${context.operation} ${context.resource}. Please check your connection and try again.`
    ) as Error & { originalError: unknown; resourceId?: string };
    networkError.originalError = error;
    networkError.resourceId = context.resourceId;

    console.error(
      `Network error ${context.operation} ${context.resource}:`,
      error
    );
    throw networkError;
  }
}
