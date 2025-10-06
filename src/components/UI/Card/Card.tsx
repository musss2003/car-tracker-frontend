import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'flat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md'
}) => {
  const cardClasses = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;