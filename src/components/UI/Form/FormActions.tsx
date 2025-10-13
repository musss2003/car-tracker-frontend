import React from 'react';
import './FormActions.css';

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  withBorder?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  className = '',
  alignment = 'right',
  size = 'md',
  orientation = 'horizontal',
  withBorder = true
}) => {
  const baseClass = 'ui-form-actions';
  const alignmentClass = `ui-form-actions--${alignment}`;
  const sizeClass = `ui-form-actions--${size}`;
  const orientationClass = `ui-form-actions--${orientation}`;
  const borderClass = withBorder ? 'ui-form-actions--with-border' : '';

  return (
    <div
      className={`${baseClass} ${alignmentClass} ${sizeClass} ${orientationClass} ${borderClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default FormActions;