import { cn } from '@/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ResourceItemCardProps {
  icon: LucideIcon;
  iconColor?: 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'orange';
  title: string;
  description?: string;
  badges?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const iconColorClasses = {
  green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
};

export const ResourceItemCard = ({
  icon: Icon,
  iconColor = 'blue',
  title,
  description,
  badges,
  metadata,
  actions,
  children,
  onClick,
  className = '',
}: ResourceItemCardProps) => {
  return (
    <div
      className={cn(
        'group flex gap-4 p-5 rounded-xl border-2 bg-card transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md',
        !onClick && 'hover:shadow-sm',
        className
      )}
      onClick={onClick}
    >
      {/* Icon Badge */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconColorClasses[iconColor]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header with title and badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {badges && <div className="flex gap-2 flex-shrink-0">{badges}</div>}
        </div>

        {/* Custom children content */}
        {children}

        {/* Footer with metadata */}
        {metadata && (
          <div className="flex items-center flex-wrap gap-3 text-sm border-t pt-3">
            {metadata}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex gap-2 items-center pt-2">{actions}</div>
        )}
      </div>
    </div>
  );
};
