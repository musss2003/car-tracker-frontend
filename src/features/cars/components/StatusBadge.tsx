import { Badge } from '@/shared/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type StatusType =
  | 'expired'
  | 'expiring-soon'
  | 'active'
  | 'resolved'
  | 'open'
  | 'in-progress'
  | 'pending'
  | 'completed';

interface StatusBadgeProps {
  status: StatusType;
  icon?: LucideIcon;
  label?: string;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
    icon: LucideIcon;
    label: string;
    className: string;
  }
> = {
  expired: {
    variant: 'destructive',
    icon: AlertTriangle,
    label: 'Isteklo',
    className: 'bg-red-500 text-white',
  },
  'expiring-soon': {
    variant: 'outline',
    icon: AlertTriangle,
    label: 'Uskoro ističe',
    className: 'border-yellow-500 text-yellow-600 dark:text-yellow-500',
  },
  active: {
    variant: 'default',
    icon: CheckCircle,
    label: 'Aktivno',
    className: 'bg-green-500 text-white',
  },
  resolved: {
    variant: 'default',
    icon: CheckCircle,
    label: 'Riješeno',
    className: 'bg-green-500 text-white',
  },
  open: {
    variant: 'destructive',
    icon: XCircle,
    label: 'Otvoreno',
    className: 'bg-red-500 text-white',
  },
  'in-progress': {
    variant: 'outline',
    icon: Clock,
    label: 'U toku',
    className: 'border-blue-500 text-blue-600 dark:text-blue-400',
  },
  pending: {
    variant: 'outline',
    icon: Clock,
    label: 'Na čekanju',
    className: 'border-orange-500 text-orange-600 dark:text-orange-400',
  },
  completed: {
    variant: 'default',
    icon: CheckCircle,
    label: 'Završeno',
    className: 'bg-green-500 text-white',
  },
};

export const StatusBadge = ({
  status,
  icon,
  label,
  className,
}: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = icon || config.icon;
  const displayLabel = label || config.label;

  return (
    <Badge
      variant={config.variant}
      className={cn('gap-1', config.className, className)}
    >
      <Icon className="w-3 h-3" />
      {displayLabel}
    </Badge>
  );
};
