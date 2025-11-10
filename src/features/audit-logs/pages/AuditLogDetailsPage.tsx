import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Copy, User, Clock, Activity } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { AuditLog } from '../types/auditLog.types';
import * as auditLogService from '../services/auditLogService';
import {
  getActionLabel,
  getResourceLabel,
  getActionColor,
  getStatusColor,
  getStatusLabel,
  getActionIcon,
  formatDuration,
  formatIpAddress,
  formatUserAgent,
  getRelativeTime,
} from '../utils/auditLogHelpers';

const AuditLogDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedLogs, setRelatedLogs] = useState<AuditLog[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLogDetails();
    }
  }, [id]);

  const fetchLogDetails = async () => {
    try {
      setLoading(true);
      const data = await auditLogService.getAuditLogById(id!);
      setLog(data);

      // Fetch related logs if we have a userId
      if (data.userId) {
        fetchRelatedLogs(data.userId, data.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri učitavanju detalja loga');
      navigate('/audit-logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedLogs = async (userId: string, currentLogId: string) => {
    try {
      setLoadingRelated(true);
      const data = await auditLogService.getUserRecentActivity(userId, 5);
      // Filter out current log
      setRelatedLogs(data.filter((l: AuditLog) => l.id !== currentLogId));
    } catch (error) {
      console.error('Failed to fetch related logs:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopirano u clipboard');
  };

  const renderJsonDiff = (changes: any) => {
    if (!changes) return null;

    return (
      <div className="space-y-4">
        {changes.before && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Prije:
            </h4>
            <pre className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-xs overflow-x-auto">
              {JSON.stringify(changes.before, null, 2)}
            </pre>
          </div>
        )}
        {changes.after && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Poslije:
            </h4>
            <pre className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-xs overflow-x-auto">
              {JSON.stringify(changes.after, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  if (loading || !log) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="h-10 w-64 mb-6 bg-muted animate-pulse rounded" />
        <Card>
          <CardHeader>
            <div className="h-8 w-48 mb-2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/audit-logs')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {getActionIcon(log.action)} Detalji Audit Loga
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getRelativeTime(log.createdAt)}
          </p>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Badge className={getActionColor(log.action)}>
                  {getActionLabel(log.action)}
                </Badge>
                <Badge variant="outline">
                  {getResourceLabel(log.resource)}
                </Badge>
                <Badge className={getStatusColor(log.status)}>
                  {getStatusLabel(log.status)}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>ID: {log.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(log.id)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {log.description && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Opis:
              </h3>
              <p className="text-foreground">{log.description}</p>
            </div>
          )}

          {/* Error Message */}
          {log.errorMessage && (
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                Poruka greške:
              </h3>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-900 dark:text-red-100 font-mono text-sm">
                  {log.errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Resource Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Resurs:
              </h3>
              <p className="text-foreground">
                {getResourceLabel(log.resource)}
              </p>
            </div>
            {log.resourceId && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Resurs ID:
                </h3>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {log.resourceId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.resourceId!)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Informacije o korisniku
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Korisničko ime:
            </h3>
            <p className="text-foreground">{log.username || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Uloga:
            </h3>
            <Badge variant="outline">{log.userRole || 'N/A'}</Badge>
          </div>
          {log.userId && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Korisnik ID:
              </h3>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  {log.userId}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(log.userId!)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Tehnički detalji
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                IP adresa:
              </h3>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {formatIpAddress(log.ipAddress)}
              </code>
            </div>
            {log.duration && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Trajanje:
                </h3>
                <p className="text-foreground">
                  {formatDuration(log.duration)}
                </p>
              </div>
            )}
          </div>

          {log.userAgent && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                User Agent:
              </h3>
              <p className="text-foreground text-sm">
                {formatUserAgent(log.userAgent)}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                  Prikaži puni User Agent
                </summary>
                <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                  {log.userAgent}
                </pre>
              </details>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Vrijeme:
            </h3>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">
                {new Date(log.createdAt).toLocaleString('bs-BA')}
              </span>
              <span className="text-muted-foreground">
                ({getRelativeTime(log.createdAt)})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes Card */}
      {log.changes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Promjene</CardTitle>
            <CardDescription>
              Razlike između stare i nove vrijednosti
            </CardDescription>
          </CardHeader>
          <CardContent>{renderJsonDiff(log.changes)}</CardContent>
        </Card>
      )}

      {/* Related Logs Card */}
      {log.userId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Nedavne aktivnosti ovog korisnika
            </CardTitle>
            <CardDescription>
              Posljednjih 5 aktivnosti korisnika {log.username}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRelated ? (
              <div className="space-y-2">
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
              </div>
            ) : relatedLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nema drugih aktivnosti
              </p>
            ) : (
              <div className="space-y-2">
                {relatedLogs.map((relatedLog) => (
                  <div
                    key={relatedLog.id}
                    onClick={() => navigate(`/audit-logs/${relatedLog.id}`)}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {getActionIcon(relatedLog.action)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getActionColor(relatedLog.action)}
                            variant="outline"
                          >
                            {getActionLabel(relatedLog.action)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {getResourceLabel(relatedLog.resource)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {relatedLog.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={getStatusColor(relatedLog.status)}
                        variant="outline"
                      >
                        {getStatusLabel(relatedLog.status)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getRelativeTime(relatedLog.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditLogDetailsPage;
