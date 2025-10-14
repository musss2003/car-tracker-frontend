import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const buttonClasses = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    isLoading && 'ui-button--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <div className="ui-button__spinner" />}
      {!isLoading && leftIcon && (
        <span className="ui-button__icon ui-button__icon--left">
          {leftIcon}
        </span>
      )}
      <span className="ui-button__text">{children}</span>
      {!isLoading && rightIcon && (
        <span className="ui-button__icon ui-button__icon--right">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;