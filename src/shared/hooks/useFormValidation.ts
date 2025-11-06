import { useState, useCallback } from 'react';

export interface ValidationRules<T> {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any, formData: T) => string | undefined;
    message?: string;
  };
}

export interface UseFormValidationReturn<T> {
  errors: Record<string, string>;
  validateField: (field: keyof T, value: any, formData: T) => boolean;
  validateForm: (formData: T) => boolean;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

/**
 * useFormValidation Hook
 *
 * A reusable hook for form validation with customizable rules.
 * Supports required fields, length validation, regex patterns, and custom validators.
 *
 * @example
 * const { errors, validateForm, validateField, clearError } = useFormValidation<FormData>({
 *   email: {
 *     required: true,
 *     pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *     message: 'Please enter a valid email'
 *   },
 *   name: {
 *     required: true,
 *     minLength: 2,
 *     message: 'Name must be at least 2 characters'
 *   },
 *   endDate: {
 *     custom: (value, formData) => {
 *       if (new Date(value) <= new Date(formData.startDate)) {
 *         return 'End date must be after start date';
 *       }
 *     }
 *   }
 * });
 */
export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: keyof T, value: any, formData: T): boolean => {
      const rule = rules[field as string];
      if (!rule) return true;

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        return false;
      }

      // Skip other validations if field is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return true;
      }

      // Min length validation
      if (
        rule.minLength &&
        typeof value === 'string' &&
        value.length < rule.minLength
      ) {
        return false;
      }

      // Max length validation
      if (
        rule.maxLength &&
        typeof value === 'string' &&
        value.length > rule.maxLength
      ) {
        return false;
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === 'string' &&
        !rule.pattern.test(value)
      ) {
        return false;
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, formData);
        if (customError) {
          return false;
        }
      }

      return true;
    },
    [rules]
  );

  const validateForm = useCallback(
    (formData: T): boolean => {
      const newErrors: Record<string, string> = {};

      Object.keys(rules).forEach((field) => {
        const rule = rules[field];
        const value = formData[field];

        // Required validation
        if (
          rule.required &&
          (!value || (typeof value === 'string' && value.trim() === ''))
        ) {
          newErrors[field] = rule.message || `${field} is required`;
          return;
        }

        // Skip other validations if field is empty and not required
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return;
        }

        // Min length validation
        if (
          rule.minLength &&
          typeof value === 'string' &&
          value.length < rule.minLength
        ) {
          newErrors[field] =
            rule.message ||
            `${field} must be at least ${rule.minLength} characters`;
          return;
        }

        // Max length validation
        if (
          rule.maxLength &&
          typeof value === 'string' &&
          value.length > rule.maxLength
        ) {
          newErrors[field] =
            rule.message ||
            `${field} must be at most ${rule.maxLength} characters`;
          return;
        }

        // Pattern validation
        if (
          rule.pattern &&
          typeof value === 'string' &&
          !rule.pattern.test(value)
        ) {
          newErrors[field] = rule.message || `${field} format is invalid`;
          return;
        }

        // Custom validation
        if (rule.custom) {
          const customError = rule.custom(value, formData);
          if (customError) {
            newErrors[field] = customError;
          }
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules]
  );

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    setError,
    clearError,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0,
  };
}
