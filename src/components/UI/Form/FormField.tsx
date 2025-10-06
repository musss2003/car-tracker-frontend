import React from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = ''
}) => {
  const fieldClasses = [
    'ui-form-field',
    error && 'ui-form-field--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses}>
      <label className="ui-form-field__label">
        {label}
        {required && <span className="ui-form-field__required">*</span>}
      </label>
      <div className="ui-form-field__input-wrapper">
        {children}
      </div>
      {error && (
        <div className="ui-form-field__error">
          {error}
        </div>
      )}
      {helpText && !error && (
        <div className="ui-form-field__help">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormField;