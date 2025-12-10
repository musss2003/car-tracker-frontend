import { Button } from '@/shared/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyResourceStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyResourceState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyResourceStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Icon className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
