import { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { AuditLog } from '@/features/audit-logs/types/auditLog.types';
import { toast } from 'sonner';

interface AuditLogHistoryProps {
  resourceId: string;
  fetchAuditLogs: (resourceId: string) => Promise<{
    success: boolean;
    data: AuditLog[];
    pagination?: any;
  }>;
  className?: string;
}

const getActionLabel = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'Kreiran';
    case 'UPDATE':
      return 'Ažuriran';
    case 'DELETE':
      return 'Obrisan';
    case 'READ':
      return 'Pročitan';
    default:
      return action;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'text-green-600';
    case 'UPDATE':
      return 'text-blue-600';
    case 'DELETE':
      return 'text-red-600';
    case 'READ':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Da' : 'Ne';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

export function AuditLogHistory({
  resourceId,
  fetchAuditLogs,
  className = '',
}: AuditLogHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggleAuditLogs = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    // Fetch audit logs if not already loaded
    if (!loaded) {
      try {
        setLoading(true);
        const response = await fetchAuditLogs(resourceId);
        setAuditLogs(response.data);
        setLoaded(true);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Greška pri učitavanju historije');
        setExpanded(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={className}>
      {/* Toggle Button */}
      <div className="mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAuditLogs}
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
        >
          <History className="w-4 h-4" />
          <span>Historija izmjena</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </Button>
      </div>

      {/* Audit Logs Section */}
      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Učitavanje historije...
            </div>
          ) : auditLogs.length > 0 ? (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.action === 'CREATE'
                          ? 'bg-green-500'
                          : log.action === 'UPDATE'
                            ? 'bg-blue-500'
                            : log.action === 'DELETE'
                              ? 'bg-red-500'
                              : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getActionColor(log.action)}
                        >
                          {getActionLabel(log.action)}
                        </Badge>
                        {log.username && (
                          <span className="text-sm font-medium">
                            {log.username}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('bs-BA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {log.changes &&
                      (log.changes.before || log.changes.after) && (
                        <div className="mt-3 space-y-2">
                          {log.changes.before && log.changes.after && (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1 p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                                <span className="font-semibold text-red-700 dark:text-red-400 block mb-1">
                                  Prije:
                                </span>
                                {Object.entries(log.changes.before)
                                  .filter(([key]) => {
                                    // Only show fields that changed
                                    if (
                                      !log.changes?.after ||
                                      !log.changes?.before
                                    )
                                      return true;
                                    const afterValue = (
                                      log.changes.after as any
                                    )?.[key];
                                    const beforeValue = (
                                      log.changes.before as any
                                    )?.[key];
                                    return (
                                      JSON.stringify(afterValue) !==
                                      JSON.stringify(beforeValue)
                                    );
                                  })
                                  .map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="text-muted-foreground"
                                    >
                                      <span className="font-medium">
                                        {key}:
                                      </span>{' '}
                                      <span className="font-mono block text-ellipsis overflow-hidden whitespace-nowrap">
                                        {formatValue(value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                              <div className="space-y-1 p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                                <span className="font-semibold text-green-700 dark:text-green-400 block mb-1">
                                  Poslije:
                                </span>
                                {Object.entries(log.changes.after)
                                  .filter(([key]) => {
                                    // Only show fields that changed
                                    if (
                                      !log.changes?.after ||
                                      !log.changes?.before
                                    )
                                      return true;
                                    const afterValue = (
                                      log.changes.after as any
                                    )?.[key];
                                    const beforeValue = (
                                      log.changes.before as any
                                    )?.[key];
                                    return (
                                      JSON.stringify(afterValue) !==
                                      JSON.stringify(beforeValue)
                                    );
                                  })
                                  .map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="text-muted-foreground"
                                    >
                                      <span className="font-medium">
                                        {key}:
                                      </span>{' '}
                                      <span className="font-mono block text-ellipsis overflow-hidden whitespace-nowrap">
                                        {formatValue(value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          {log.changes.after && !log.changes.before && (
                            <div className="p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-xs">
                              <span className="font-semibold text-green-700 dark:text-green-400 block mb-1">
                                Kreirano:
                              </span>
                              <div className="space-y-1">
                                {Object.entries(log.changes.after).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="text-muted-foreground"
                                    >
                                      <span className="font-medium">
                                        {key}:
                                      </span>{' '}
                                      <span className="font-mono text-xs text-ellipsis">
                                        {formatValue(value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          {log.changes.before && !log.changes.after && (
                            <div className="p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs">
                              <span className="font-semibold text-red-700 dark:text-red-400 block mb-1">
                                Obrisano:
                              </span>
                              <div className="space-y-1">
                                {Object.entries(log.changes.before).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="text-muted-foreground"
                                    >
                                      <span className="font-medium">
                                        {key}:
                                      </span>{' '}
                                      <span className="font-mono text-xs">
                                        {formatValue(value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nema zabilježenih izmjena
            </div>
          )}
        </div>
      )}
    </div>
  );
}
