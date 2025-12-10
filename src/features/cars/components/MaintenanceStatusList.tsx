import { LucideIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

export interface MaintenanceStatus {
  id: string;
  title: string;
  icon: LucideIcon;
  currentValue: number | null;
  maxValue: number;
  unit: string;
  urgency: 'critical' | 'warning' | 'ok';
  actionLabel?: string;
  onAction?: () => void;
}

interface MaintenanceStatusListProps {
  items: MaintenanceStatus[];
  className?: string;
}

const getUrgencyConfig = (urgency: 'critical' | 'warning' | 'ok') => {
  switch (urgency) {
    case 'critical':
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        progressColor: 'bg-red-600',
        badge: '🔴',
        label: 'KRITIČNO',
      };
    case 'warning':
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        progressColor: 'bg-yellow-600',
        badge: '🟡',
        label: 'UPOZORENJE',
      };
    case 'ok':
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        progressColor: 'bg-green-600',
        badge: '🟢',
        label: 'OK',
      };
  }
};

const calculatePercentage = (current: number | null, max: number): number => {
  if (current === null || current < 0) return 0;
  const percentage = (current / max) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

export function MaintenanceStatusList({
  items,
  className,
}: MaintenanceStatusListProps) {
  if (items.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-muted-foreground">
          <p>Nema podataka o održavanju</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('divide-y', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const urgencyConfig = getUrgencyConfig(item.urgency);
        const percentage = calculatePercentage(
          item.currentValue,
          item.maxValue
        );

        return (
          <div
            key={item.id}
            className={cn(
              'p-4 transition-colors hover:bg-muted/30',
              urgencyConfig.bgColor
            )}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                  item.urgency === 'critical'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : item.urgency === 'warning'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                )}
              >
                <Icon className={cn('w-5 h-5', urgencyConfig.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium">
                      {urgencyConfig.badge}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold uppercase',
                        urgencyConfig.color
                      )}
                    >
                      {urgencyConfig.label}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500 rounded-full',
                        urgencyConfig.progressColor
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Value Display */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    {item.currentValue !== null ? (
                      <>
                        <span className="font-bold text-foreground">
                          {item.currentValue.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {item.unit}
                        </span>
                        {item.urgency === 'critical' && (
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Nema podataka
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  {item.actionLabel && item.onAction && (
                    <Button
                      variant={
                        item.urgency === 'critical' ? 'destructive' : 'outline'
                      }
                      size="sm"
                      onClick={item.onAction}
                      className="flex-shrink-0"
                    >
                      {item.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
