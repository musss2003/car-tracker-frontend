import { cn } from '@/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetadataItem {
  icon: LucideIcon;
  label: string | number;
  variant?: 'default' | 'badge' | 'muted';
  color?: string;
  className?: string;
}

interface MetadataRowProps {
  items: MetadataItem[];
  className?: string;
}

export const MetadataRow = ({ items, className }: MetadataRowProps) => {
  return (
    <div
      className={cn(
        'flex items-center flex-wrap gap-3 text-sm',
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        if (item.variant === 'badge') {
          return (
            <span
              key={index}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full',
                item.color || 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                item.className
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </span>
          );
        }

        if (item.variant === 'muted') {
          return (
            <span
              key={index}
              className={cn(
                'flex items-center gap-1.5 text-muted-foreground',
                item.className
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </span>
          );
        }

        return (
          <span
            key={index}
            className={cn(
              'flex items-center gap-1.5 text-muted-foreground',
              item.className
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-foreground">{item.label}</span>
          </span>
        );
      })}
    </div>
  );
};
