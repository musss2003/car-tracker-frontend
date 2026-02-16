import type React from 'react';
import { Label } from '@/shared/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  helperText?: string;
}

/**
 * FormField Component
 *
 * A reusable form field wrapper that includes:
 * - Label with optional required indicator
 * - Error message display with icon
 * - Optional helper text
 * - Consistent spacing and styling
 *
 * @example
 * <FormField
 *   label="Email"
 *   id="email"
 *   error={errors.email}
 *   required
 *   helperText="We'll never share your email"
 * >
 *   <Input
 *     id="email"
 *     type="email"
 *     value={formData.email}
 *     onChange={handleChange}
 *   />
 * </FormField>
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  required,
  children,
  className,
  helperText,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-1 text-red-500">*</span>
        )}
      </Label>
      {children}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};
