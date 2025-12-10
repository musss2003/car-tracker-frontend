import { useMemo } from 'react';
import {
  Calendar,
  Wrench,
  FileText,
  Shield,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface TimelineEvent {
  id: string;
  type: 'service' | 'registration' | 'insurance' | 'issue';
  date: Date;
  title: string;
  description: string;
  cost?: number;
  status: 'completed' | 'active' | 'upcoming' | 'overdue';
  urgency?: 'critical' | 'warning' | 'ok';
  metadata?: Record<string, any>;
}

export interface TimelineViewProps {
  events: TimelineEvent[];
  groupBy?: 'none' | 'month' | 'year' | 'type';
  showConnectors?: boolean;
  compact?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

interface GroupedEvents {
  [key: string]: TimelineEvent[];
}

/**
 * Enhanced Timeline View Component
 * Displays maintenance events in a chronological timeline with grouping and visual connectors
 */
export function TimelineView({
  events,
  groupBy = 'month',
  showConnectors = true,
  compact = false,
  onEventClick,
}: TimelineViewProps) {
  // Group events based on groupBy prop
  const groupedEvents = useMemo(() => {
    if (groupBy === 'none') {
      return { all: events };
    }

    const groups: GroupedEvents = {};

    events.forEach((event) => {
      let key: string;

      switch (groupBy) {
        case 'month':
          key = event.date.toLocaleDateString('bs-BA', {
            year: 'numeric',
            month: 'long',
          });
          break;
        case 'year':
          key = event.date.getFullYear().toString();
          break;
        case 'type':
          key = getTypeLabel(event.type);
          break;
        default:
          key = 'all';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });

    // Sort events within each group by date (newest first)
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    return groups;
  }, [events, groupBy]);

  // Sort group keys chronologically
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => {
      if (groupBy === 'type') return 0; // Keep original order for type grouping

      // Get first event from each group for comparison
      const aFirstEvent = groupedEvents[a][0];
      const bFirstEvent = groupedEvents[b][0];

      return bFirstEvent.date.getTime() - aFirstEvent.date.getTime();
    });
  }, [groupedEvents, groupBy]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nema događaja za prikaz</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {sortedGroupKeys.map((groupKey) => (
        <div key={groupKey}>
          {/* Group Header */}
          {groupBy !== 'none' && (
            <div className="flex items-center gap-2 sm:gap-3 mb-6">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-muted rounded-full">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <h3 className="font-bold text-base sm:text-lg truncate">{groupKey}</h3>
              </div>
              <div className="flex-1 h-px bg-border" />
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {groupedEvents[groupKey].length}
              </Badge>
            </div>
          )}

          {/* Timeline Events */}
          <div className="relative pl-6 sm:pl-8">
            {/* Vertical connector line */}
            {showConnectors && groupedEvents[groupKey].length > 1 && (
              <div className="absolute left-[15px] sm:left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
            )}

            <div className="space-y-6">
              {groupedEvents[groupKey].map((event, index) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  compact={compact}
                  showConnector={
                    showConnectors && index < groupedEvents[groupKey].length - 1
                  }
                  onClick={onEventClick}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Individual Timeline Event Card
 */
interface TimelineEventCardProps {
  event: TimelineEvent;
  compact?: boolean;
  showConnector?: boolean;
  onClick?: (event: TimelineEvent) => void;
}

function TimelineEventCard({
  event,
  compact,
  showConnector,
  onClick,
}: TimelineEventCardProps) {
  const Icon = getEventIcon(event.type);
  const iconColorMap = {
    service:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300',
    registration:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300',
    insurance:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300',
    issue:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300',
  };

  return (
    <div className="relative group">
      {/* Timeline dot/icon */}
      <div
        className={cn(
          'absolute -left-8 top-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shadow-lg z-10 transition-transform group-hover:scale-110',
          iconColorMap[event.type]
        )}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Event Card */}
      <div
        className={cn(
          'rounded-xl border-2 bg-card transition-all duration-200',
          onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-lg',
          compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'
        )}
        onClick={() => onClick?.(event)}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 mb-3">
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={cn(
                  'font-bold truncate flex-1',
                  compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                )}
              >
                {event.title}
              </h4>
              {onClick && (
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
            </div>
            {!compact && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            {getStatusBadge(event.status)}
            {event.urgency && event.urgency !== 'ok' && (
              <Badge
                variant={
                  event.urgency === 'critical' ? 'destructive' : 'secondary'
                }
                className="text-xs"
              >
                {event.urgency === 'critical' ? (
                  <>
                    🔴 <span className="hidden sm:inline">Hitno</span>
                  </>
                ) : (
                  <>
                    🟡 <span className="hidden sm:inline">Važno</span>
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
          <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {event.date.toLocaleDateString('bs-BA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </span>

          {event.cost && (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary font-bold whitespace-nowrap">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              {Number(event.cost).toFixed(2)} BAM
            </span>
          )}

          <Badge variant="outline" className="capitalize text-xs">
            {getTypeLabel(event.type)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */

function getEventIcon(type: TimelineEvent['type']) {
  const iconMap = {
    service: Wrench,
    registration: FileText,
    insurance: Shield,
    issue: AlertTriangle,
  };
  return iconMap[type];
}

function getStatusBadge(status: TimelineEvent['status']) {
  const statusConfig = {
    completed: { label: 'Završeno', variant: 'default' as const },
    active: { label: 'Aktivan', variant: 'secondary' as const },
    upcoming: { label: 'Nadolazeći', variant: 'outline' as const },
    overdue: { label: 'Isteklo', variant: 'destructive' as const },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getTypeLabel(type: TimelineEvent['type']): string {
  const labels = {
    service: 'Servis',
    registration: 'Registracija',
    insurance: 'Osiguranje',
    issue: 'Kvar',
  };
  return labels[type];
}
