import { useState, useEffect } from 'react';
import { logError } from '@/shared/utils/logger';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Clock, Filter, Download, Trash2, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  AuditLog,
  AuditAction,
  AuditResource,
  AuditStatus,
  AuditLogFilters,
} from '../types/auditLog.types';
import {
  getAuditLogs,
  exportAuditLogs,
  cleanupOldLogs,
} from '../services/auditLogService';
import {
  getActionLabel,
  getResourceLabel,
  getActionColor,
  getStatusColor,
  getStatusLabel,
  formatDuration,
  formatIpAddress,
  getRelativeTime,
} from '../utils/auditLogHelpers';

const AuditLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [resourceFilter, setResourceFilter] = useState<AuditResource | ''>('');
  const [statusFilter, setStatusFilter] = useState<AuditStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters: AuditLogFilters = {
        page,
        limit,
      };

      if (actionFilter) filters.action = actionFilter as AuditAction;
      if (resourceFilter) filters.resource = resourceFilter as AuditResource;
      if (statusFilter) filters.status = statusFilter as AuditStatus;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await getAuditLogs(filters);
      setLogs(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      logError('Failed to fetch audit logs:', error);
      toast.error('Greška pri učitavanju logova');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, resourceFilter, statusFilter, startDate, endDate]);

  // Export logs
  const handleExport = async () => {
    try {
      setExporting(true);
      const filters: AuditLogFilters = {};

      if (actionFilter) filters.action = actionFilter as AuditAction;
      if (resourceFilter) filters.resource = resourceFilter as AuditResource;
      if (statusFilter) filters.status = statusFilter as AuditStatus;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      await exportAuditLogs(filters);
      toast.success('Logovi uspješno izvezeni');
    } catch (error) {
      logError('Failed to export logs:', error);
      toast.error('Greška pri izvozu logova');
    } finally {
      setExporting(false);
    }
  };

  // Cleanup old logs
  const handleCleanup = async () => {
    if (
      !confirm(
        'Da li ste sigurni da želite obrisati logove starije od 90 dana?'
      )
    ) {
      return;
    }

    try {
      setCleaning(true);
      const deletedCount = await cleanupOldLogs(90);
      toast.success(`Obrisano ${deletedCount} starih logova`);
      fetchLogs();
    } catch (error) {
      logError('Failed to cleanup logs:', error);
      toast.error('Greška pri brisanju logova');
    } finally {
      setCleaning(false);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setPage(1);
  };

  // Filter logs by search term (client-side)
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      log.username?.toLowerCase().includes(term) ||
      log.description.toLowerCase().includes(term) ||
      log.resourceId?.toLowerCase().includes(term) ||
      log.ipAddress?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen w-full bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="w-8 h-8 text-primary" />
              Audit Logovi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pregled svih aktivnosti u sistemu
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={exporting || loading}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Izvoz...' : 'Izvezi CSV'}
            </Button>

            <Button
              onClick={handleCleanup}
              disabled={cleaning || loading}
              variant="outline"
              size="sm"
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {cleaning ? 'Brisanje...' : 'Očisti stare'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filteri
          </CardTitle>
          <CardDescription>
            Filtriraj logove po akciji, resursu, statusu ili datumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Action Filter */}
            <Select
              value={actionFilter || 'all'}
              onValueChange={(value) =>
                setActionFilter(value === 'all' ? '' : (value as AuditAction))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sve akcije" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve akcije</SelectItem>
                {Object.values(AuditAction).map((action) => (
                  <SelectItem key={action} value={action}>
                    {getActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Resource Filter */}
            <Select
              value={resourceFilter || 'all'}
              onValueChange={(value) =>
                setResourceFilter(
                  value === 'all' ? '' : (value as AuditResource)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Svi resursi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi resursi</SelectItem>
                {Object.values(AuditResource).map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {getResourceLabel(resource)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) =>
                setStatusFilter(value === 'all' ? '' : (value as AuditStatus))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Svi statusi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value={AuditStatus.SUCCESS}>Uspješno</SelectItem>
                <SelectItem value={AuditStatus.FAILURE}>Neuspješno</SelectItem>
              </SelectContent>
            </Select>

            {/* Start Date */}
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Datum od"
            />

            {/* End Date */}
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Datum do"
            />

            {/* Clear Filters */}
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="md:col-span-2"
            >
              Očisti filtere
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Učitavanje logova...
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nema logova za prikaz</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vrijeme</TableHead>
                      <TableHead>Korisnik</TableHead>
                      <TableHead>Akcija</TableHead>
                      <TableHead>Resurs</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trajanje</TableHead>
                      <TableHead>IP Adresa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/audit-logs/${log.id}`)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            {getRelativeTime(log.createdAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString('bs-BA')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {log.username || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.userRole}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getResourceLabel(log.resource)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>
                            {getStatusLabel(log.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDuration(log.duration)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatIpAddress(log.ipAddress)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Prikazujem {(page - 1) * limit + 1}-
                  {Math.min(page * limit, total)} od {total}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Prethodna
                  </Button>

                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm">
                      Stranica {page} od {totalPages}
                    </span>
                  </div>

                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Sljedeća
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
