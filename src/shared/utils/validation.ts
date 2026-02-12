/**
 * Input validation and sanitization utilities
 * Provides defense-in-depth security by validating inputs before API calls
 * Note: Backend validation is PRIMARY - this is supplementary client-side protection
 */

/**
 * Validate UUID format
 * @param value - The value to validate
 * @returns true if valid UUID, false otherwise
 */
export const isValidUUID = (value: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validate and sanitize text input
 * Removes potentially dangerous characters while preserving valid content
 * @param value - The value to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export const sanitizeTextInput = (
  value: string,
  maxLength: number = 1000
): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Remove null bytes and control characters (except newlines/tabs)
  let sanitized = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Validate cancellation reason
 * @param reason - The cancellation reason to validate
 * @returns Validation result
 */
export const validateCancellationReason = (
  reason: string
): { valid: boolean; error?: string; sanitized?: string } => {
  const sanitized = sanitizeTextInput(reason, 500);

  if (!sanitized) {
    return {
      valid: false,
      error: 'Cancellation reason is required',
    };
  }

  if (sanitized.length < 10) {
    return {
      valid: false,
      error: 'Cancellation reason must be at least 10 characters',
    };
  }

  if (sanitized.length > 500) {
    return {
      valid: false,
      error: 'Cancellation reason must not exceed 500 characters',
    };
  }

  return {
    valid: true,
    sanitized,
  };
};

/**
 * Validate numeric input (for cost filters)
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validation result
 */
export const validateNumericInput = (
  value: string,
  min: number = 0,
  max: number = 1000000
): { valid: boolean; error?: string; value?: number } => {
  if (!value || value.trim() === '') {
    return { valid: true, value: undefined };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      valid: false,
      error: 'Invalid number format',
    };
  }

  if (numValue < min) {
    return {
      valid: false,
      error: `Value must be at least ${min}`,
    };
  }

  if (numValue > max) {
    return {
      valid: false,
      error: `Value must not exceed ${max}`,
    };
  }

  return {
    valid: true,
    value: numValue,
  };
};

/**
 * Validate date input
 * @param value - The date string to validate
 * @returns Validation result
 */
export const validateDateInput = (
  value: string
): { valid: boolean; error?: string; date?: Date } => {
  if (!value || value.trim() === '') {
    return { valid: true, date: undefined };
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format',
    };
  }

  // Check if date is within reasonable range (not too far in past/future)
  const minDate = new Date('1900-01-01');
  const maxDate = new Date('2100-12-31');

  if (date < minDate || date > maxDate) {
    return {
      valid: false,
      error: 'Date must be between 1900 and 2100',
    };
  }

  return {
    valid: true,
    date,
  };
};

/**
 * Sanitize search query
 * Removes SQL injection attempts and special characters
 * @param query - The search query to sanitize
 * @returns Sanitized query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove SQL injection patterns
  let sanitized = query.replace(
    /('|--|;|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union)/gi,
    ''
  );

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, 200);

  return sanitized;
};
