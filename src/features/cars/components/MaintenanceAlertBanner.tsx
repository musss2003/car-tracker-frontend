import { AlertTriangle, Bell, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { MaintenanceAlert } from '../services/maintenanceNotificationService';
import { useNavigate } from 'react-router-dom';

interface MaintenanceAlertBannerProps {
  alerts: MaintenanceAlert[];
  onDismiss?: () => void;
  className?: string;
}

export function MaintenanceAlertBanner({
  alerts,
  onDismiss,
  className,
}: MaintenanceAlertBannerProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) return null;

  const criticalAlerts = alerts.filter((a) => a.urgency === 'critical');
  const warningAlerts = alerts.filter((a) => a.urgency === 'warning');

  const getUrgencyStyles = (urgency: 'critical' | 'warning' | 'ok') => {
    switch (urgency) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-600 text-white',
          button: 'hover:bg-red-100 dark:hover:bg-red-900/30',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-600 text-white',
          button: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
        };
      default:
        return {
          bg: 'bg-muted',
          icon: 'text-muted-foreground',
          badge: 'bg-muted',
          button: 'hover:bg-muted',
        };
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card
          className={cn(
            'border-2',
            getUrgencyStyles('critical').bg,
            'animate-in fade-in slide-in-from-top-2 duration-500'
          )}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle
                    className={cn('w-5 h-5', getUrgencyStyles('critical').icon)}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-red-900 dark:text-red-100">
                    🔴 Kritično - Zahtijeva hitnu pažnju
                  </h3>
                  <Badge
                    className={getUrgencyStyles('critical').badge}
                    variant="secondary"
                  >
                    {criticalAlerts.length}
                  </Badge>
                </div>
                <div className="space-y-2 mt-3">
                  {criticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {alert.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => navigate(alert.actionUrl)}
                        className="flex-shrink-0"
                      >
                        {alert.actionLabel}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className={cn(
                    'flex-shrink-0',
                    getUrgencyStyles('critical').button
                  )}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Card
          className={cn(
            'border-2',
            getUrgencyStyles('warning').bg,
            'animate-in fade-in slide-in-from-top-2 duration-500'
          )}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Bell
                    className={cn('w-5 h-5', getUrgencyStyles('warning').icon)}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-yellow-900 dark:text-yellow-100">
                    🟡 Upozorenje - Potrebna pažnja uskoro
                  </h3>
                  <Badge
                    className={getUrgencyStyles('warning').badge}
                    variant="secondary"
                  >
                    {warningAlerts.length}
                  </Badge>
                </div>
                <div className="space-y-2 mt-3">
                  {warningAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {alert.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(alert.actionUrl)}
                        className="flex-shrink-0"
                      >
                        {alert.actionLabel}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className={cn(
                    'flex-shrink-0',
                    getUrgencyStyles('warning').button
                  )}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
