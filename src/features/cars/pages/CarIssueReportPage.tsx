import { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit,
  Filter,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { LoadingState } from '@/shared/components/ui/loading-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  Car,
  CarIssueReport,
  CreateCarIssueReportPayload,
} from '../types/car.types';
import {
  createCarIssueReport,
  deleteCarIssueReport,
  getCarIssueReportsForCar,
  updateCarIssueReportStatus,
  getIssueReportAuditLogs,
} from '../services/carIssueReportService';
import { PageHeader } from '@/shared/components/ui/page-header';
import { getCar } from '../services/carService';
import { AuditLogHistory } from '@/shared/components/audit/AuditLogHistory';

// Utility functions for styling
const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'high':
      return 'bg-orange-600 hover:bg-orange-700 text-white';
    case 'medium':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    case 'low':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'in_progress':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'open':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

const getSeverityIcon = (severity?: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return AlertTriangle;
    case 'medium':
      return AlertCircle;
    case 'low':
      return AlertCircle;
    default:
      return AlertCircle;
  }
};

export default function CarIssuesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<CarIssueReport[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<CarIssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<CarIssueReport | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [car, setCar] = useState<Car | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCarIssueReportPayload>({
    carId: id || '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    diagnosticPdfUrl: '',
  });

  // Fetch issues
  useEffect(() => {
    fetchIssues();
    fetchCar();
  }, [id]);

  // Apply filters
  useEffect(() => {
    let filtered = [...issues];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.severity === severityFilter);
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );

    setFilteredIssues(filtered);
  }, [issues, statusFilter, severityFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const data = await getCarIssueReportsForCar(id!);

      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Greška pri učitavanju problema');
    } finally {
      setLoading(false);
    }
  };

  const fetchCar = async () => {
    try {
      setLoading(true);

      const selectedCar = await getCar(id!);

      setCar(selectedCar);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Greška pri učitavanju problema');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await createCarIssueReport(formData);

      toast.success('Problem je uspješno prijavljen');
      setShowCreateDialog(false);
      setFormData({
        carId: id || '',
        description: '',
        severity: 'medium',
        diagnosticPdfUrl: '',
      });
      fetchIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Greška pri prijavljivanju problema');
    }
  };

  const handleUpdate = async () => {
    if (!selectedIssue) return;

    try {
      const response = await updateCarIssueReportStatus(
        selectedIssue.id,
        formData
      );

      toast.success('Problem je uspješno ažuriran');
      setShowEditDialog(false);
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Greška pri ažuriranju problema');
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const response = await updateCarIssueReportStatus(issueId, {
        status: newStatus as 'open' | 'in_progress' | 'resolved',
      });

      toast.success('Status je uspješno ažuriran');
      fetchIssues();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Greška pri ažuriranju statusa');
    }
  };

  const handleDelete = async () => {
    if (!issueToDelete) return;

    try {
      const response = await deleteCarIssueReport(issueToDelete);

      toast.success('Problem je uspješno obrisan');
      setShowDeleteDialog(false);
      setIssueToDelete(null);
      fetchIssues();
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Greška pri brisanju problema');
    }
  };

  const openEditDialog = (issue: CarIssueReport) => {
    setSelectedIssue(issue);
    setFormData({
      carId: issue.id,
      description: issue.description,
      severity: issue.severity || 'medium',
      diagnosticPdfUrl: issue.diagnosticPdfUrl || '',
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}

      <PageHeader
        title="Kvarovi na automobilu"
        subtitle={
          car ? `${car.manufacturer} ${car.model} - ${car.licensePlate}` : ''
        }
        onBack={() => navigate(`/cars/${id}`)}
        actions={
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Dodaj kvar
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex-none px-4 sm:px-6 py-4 border-b bg-card/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filteri:</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="open">Otvoreno</SelectItem>
              <SelectItem value="in_progress">U toku</SelectItem>
              <SelectItem value="resolved">Riješeno</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ozbiljnost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve ozbiljnosti</SelectItem>
              <SelectItem value="low">Niska</SelectItem>
              <SelectItem value="medium">Srednja</SelectItem>
              <SelectItem value="high">Visoka</SelectItem>
              <SelectItem value="critical">Kritična</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">
            Ukupno: {filteredIssues.length} problema
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredIssues.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto" />
              <p className="text-lg font-medium">Nema prijavljenih problema</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'Pokušajte promijeniti filtere'
                  : 'Kliknite "Prijavi problem" da dodate novi'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto space-y-4">
            {filteredIssues.map((issue) => {
              const SeverityIcon = getSeverityIcon(issue.severity);
              const iconColorMap = {
                critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
              };
              const iconColor = iconColorMap[issue.severity as keyof typeof iconColorMap] || iconColorMap.medium;

              return (
                <div
                  key={issue.id}
                  className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
                      <SeverityIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge
                            className={`${getSeverityColor(issue.severity)} text-xs`}
                          >
                            {issue.severity?.toUpperCase() || 'N/A'}
                          </Badge>
                          <Badge className={`${getStatusColor(issue.status)} text-xs`}>
                            {issue.status === 'open' && 'Otvoreno'}
                            {issue.status === 'in_progress' && 'U toku'}
                            {issue.status === 'resolved' && 'Riješeno'}
                          </Badge>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-foreground line-clamp-3">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {issue.reportedBy && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>Prijavio: {issue.reportedBy.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(issue.reportedAt).toLocaleDateString(
                              'bs-BA',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                        {issue.resolvedAt && issue.resolvedBy && (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Riješio: {issue.resolvedBy.firstName}{' '}
                              {issue.resolvedBy.lastName}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 text-xs sm:text-sm border-t pt-3">
                      {issue.reportedBy && (
                        <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="font-medium truncate max-w-[150px] sm:max-w-none">{issue.reportedBy.name}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">
                          {new Date(issue.reportedAt).toLocaleDateString(
                            'bs-BA',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </span>
                      {issue.resolvedAt && issue.resolvedBy && (
                        <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium whitespace-nowrap">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Riješio: </span>{issue.resolvedBy.firstName}
                        </span>
                      )}
                      <div className="ml-auto flex gap-2">
                        <Select
                          value={issue.status}
                          onValueChange={(value) =>
                            handleStatusChange(issue.id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Otvoreno</SelectItem>
                            <SelectItem value="in_progress">U toku</SelectItem>
                            <SelectItem value="resolved">Riješeno</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(issue)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIssueToDelete(issue.id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <AuditLogHistory
                      key={`${issue.id}-${issue.updatedAt || Date.now()}`}
                      resourceId={issue.id}
                      fetchAuditLogs={getIssueReportAuditLogs}
                      className="mt-4"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prijavi novi problem</DialogTitle>
            <DialogDescription>
              Unesite detalje o problemu ili grešci na vozilu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Opis problema *</Label>
              <Textarea
                id="description"
                placeholder="Detaljno opišite problem..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Ozbiljnost</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niska</SelectItem>
                    <SelectItem value="medium">Srednja</SelectItem>
                    <SelectItem value="high">Visoka</SelectItem>
                    <SelectItem value="critical">Kritična</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosticPdf">
                  URL dijagnostike (opcionalno)
                </Label>
                <Input
                  id="diagnosticPdf"
                  placeholder="https://..."
                  value={formData.diagnosticPdfUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diagnosticPdfUrl: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Otkaži
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.description?.trim()}
            >
              Prijavi problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uredi problem</DialogTitle>
            <DialogDescription>Ažurirajte detalje problema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Opis problema *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-severity">Ozbiljnost</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niska</SelectItem>
                    <SelectItem value="medium">Srednja</SelectItem>
                    <SelectItem value="high">Visoka</SelectItem>
                    <SelectItem value="critical">Kritična</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-diagnosticPdf">URL dijagnostike</Label>
                <Input
                  id="edit-diagnosticPdf"
                  value={formData.diagnosticPdfUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diagnosticPdfUrl: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Otkaži
            </Button>
            <Button onClick={handleUpdate}>Sačuvaj izmjene</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati problem?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati ovaj prijavljeni problem? Ova
              akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Obriši</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
