/**
 * Input validation and sanitization utilities
 * Ensures data integrity and prevents injection attacks
 */

/**
 * Validates and sanitizes a string ID (UUID or alphanumeric)
 */
export function validateId(id: string, fieldName = 'id'): string {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
  }

  const trimmed = id.trim();

  if (trimmed.length === 0) {
    throw new Error(`Invalid ${fieldName}: cannot be empty`);
  }

  if (trimmed.length > 100) {
    throw new Error(`Invalid ${fieldName}: exceeds maximum length`);
  }

  // Allow alphanumeric, hyphens, and underscores only
  if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
    throw new Error(`Invalid ${fieldName}: contains invalid characters`);
  }

  return trimmed;
}

/**
 * Validates a license plate format
 */
export function validateLicensePlate(plate: string): string {
  if (!plate || typeof plate !== 'string') {
    throw new Error('Invalid license plate: must be a non-empty string');
  }

  const trimmed = plate.trim().toUpperCase();

  if (trimmed.length < 2 || trimmed.length > 15) {
    throw new Error('Invalid license plate: invalid length');
  }

  // Allow letters, numbers, hyphens, and spaces
  if (!/^[A-Z0-9\s\-]+$/.test(trimmed)) {
    throw new Error('Invalid license plate: contains invalid characters');
  }

  return trimmed;
}

/**
 * Validates a numeric value (price, mileage, etc.)
 */
export function validateNumber(
  value: number,
  options: {
    fieldName?: string;
    min?: number;
    max?: number;
    allowZero?: boolean;
  } = {}
): number {
  const fieldName = options.fieldName || 'value';

  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }

  if (!options.allowZero && value === 0) {
    throw new Error(`Invalid ${fieldName}: cannot be zero`);
  }

  if (options.min !== undefined && value < options.min) {
    throw new Error(`Invalid ${fieldName}: must be at least ${options.min}`);
  }

  if (options.max !== undefined && value > options.max) {
    throw new Error(`Invalid ${fieldName}: must be at most ${options.max}`);
  }

  return value;
}

/**
 * Validates a date string or Date object
 */
export function validateDate(date: string | Date, fieldName = 'date'): string {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    throw new Error(`Invalid ${fieldName}: must be a string or Date`);
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid ${fieldName}: not a valid date`);
  }

  return dateObj.toISOString();
}

/**
 * Validates and sanitizes a text string
 */
export function validateText(
  text: string,
  options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
  } = {}
): string {
  const fieldName = options.fieldName || 'text';

  if (typeof text !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a string`);
  }

  const trimmed = text.trim();

  if (!options.allowEmpty && trimmed.length === 0) {
    throw new Error(`Invalid ${fieldName}: cannot be empty`);
  }

  if (options.minLength && trimmed.length < options.minLength) {
    throw new Error(
      `Invalid ${fieldName}: must be at least ${options.minLength} characters`
    );
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new Error(
      `Invalid ${fieldName}: must be at most ${options.maxLength} characters`
    );
  }

  return trimmed;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error('Invalid email address format');
  }

  if (trimmed.length > 254) {
    throw new Error('Email address is too long');
  }

  return trimmed;
}

/**
 * Validates an enum value
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName = 'value'
): T {
  if (!allowedValues.includes(value as T)) {
    throw new Error(
      `Invalid ${fieldName}: must be one of ${allowedValues.join(', ')}`
    );
  }

  return value as T;
}

/**
 * Sanitizes object by removing undefined and null values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}
