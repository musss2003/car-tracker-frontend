import React from 'react';
import './CardHeader.css';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'gradient';
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  actions,
  variant = 'gradient',
  className = ''
}) => {
  const headerClasses = [
    'ui-card-header',
    `ui-card-header--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <div className="ui-card-header__content">
        <h2 className="ui-card-header__title">{title}</h2>
        {subtitle && (
          <p className="ui-card-header__subtitle">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="ui-card-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default CardHeader;