import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  ArrowLeft,
  Download,
  Filter,
  LayoutList,
  LayoutGrid,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/page-header';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { TimelineView, TimelineEvent } from '../components/TimelineView';
import { getCar } from '../services/carService';
import { getCarServiceHistory } from '../services/carServiceHistory';
import { getCarRegistrations } from '../services/carRegistrationService';
import { getCarInsuranceHistory } from '../services/carInsuranceService';
import { getCarIssueReportsForCar } from '../services/carIssueReportService';
import { Car } from '../types/car.types';

export default function TimelinePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'month' | 'year' | 'type'>(
    'month'
  );
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [typeFilter, setTypeFilter] = useState<'all' | TimelineEvent['type']>(
    'all'
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | TimelineEvent['status']
  >('all');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          carData,
          serviceHistory,
          registrationHistory,
          insuranceHistory,
          issueReports,
        ] = await Promise.all([
          getCar(id),
          getCarServiceHistory(id),
          getCarRegistrations(id),
          getCarInsuranceHistory(id),
          getCarIssueReportsForCar(id),
        ]);

        setCar(carData);

        // Convert all data to unified events
        const allEvents: TimelineEvent[] = [];

        // Service events
        serviceHistory.forEach((service) => {
          allEvents.push({
            id: `service-${service.id}`,
            type: 'service',
            date: new Date(service.serviceDate),
            title: service.serviceType,
            description: service.description || 'Redovni servis',
            cost: service.cost,
            status: 'completed',
          });
        });

        // Registration events
        registrationHistory.forEach((registration) => {
          const expiryDate = new Date(registration.registrationExpiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          let status: TimelineEvent['status'] = 'completed';
          let urgency: TimelineEvent['urgency'] = 'ok';

          if (daysUntilExpiry < 0) {
            status = 'overdue';
            urgency = 'critical';
          } else if (daysUntilExpiry < 30) {
            status = 'upcoming';
            urgency = 'warning';
          }

          allEvents.push({
            id: `registration-${registration.id}`,
            type: 'registration',
            date: expiryDate,
            title: 'Registracija',
            description: registration.notes || 'Registracija vozila',
            status,
            urgency,
          });
        });

        // Insurance events
        insuranceHistory.forEach((insurance) => {
          const expiryDate = new Date(insurance.insuranceExpiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          let status: TimelineEvent['status'] = 'completed';
          let urgency: TimelineEvent['urgency'] = 'ok';

          if (daysUntilExpiry < 0) {
            status = 'overdue';
            urgency = 'critical';
          } else if (daysUntilExpiry < 30) {
            status = 'upcoming';
            urgency = 'warning';
          }

          allEvents.push({
            id: `insurance-${insurance.id}`,
            type: 'insurance',
            date: expiryDate,
            title: `Osiguranje${insurance.provider ? ` - ${insurance.provider}` : ''}`,
            description: insurance.policyNumber
              ? `Polisa: ${insurance.policyNumber}`
              : 'Polisa osiguranja',
            cost: insurance.price,
            status,
            urgency,
          });
        });

        // Issue events
        issueReports.forEach((issue) => {
          const statusMap: Record<string, TimelineEvent['status']> = {
            open: 'active',
            in_progress: 'active',
            resolved: 'completed',
          };

          const urgencyMap: Record<string, TimelineEvent['urgency']> = {
            low: 'ok',
            medium: 'warning',
            high: 'critical',
          };

          allEvents.push({
            id: `issue-${issue.id}`,
            type: 'issue',
            date: new Date(issue.reportedAt),
            title: `Kvar - ${issue.severity || 'nepoznat'}`,
            description: issue.description,
            status: statusMap[issue.status] || 'active',
            urgency: urgencyMap[issue.severity || 'low'] || 'ok',
          });
        });

        // Sort events by date (newest first)
        allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

        setEvents(allEvents);
        setFilteredEvents(allEvents);
      } catch (error) {
        console.error('Error loading timeline data:', error);
        toast.error('Greška pri učitavanju timeline podataka');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter events based on search, type, and status
  useEffect(() => {
    let filtered = events;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((e) => e.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  }, [events, typeFilter, statusFilter, searchTerm]);

  const handleExport = () => {
    if (!car) return;

    try {
      const csvContent = generateCSVExport(filteredEvents, car);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `timeline-${car.licensePlate}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Timeline uspješno izvezen');
    } catch (error) {
      console.error('Error exporting timeline:', error);
      toast.error('Greška pri izvozu timeline');
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    // Navigate to specific page based on event type
    const routes = {
      service: `/cars/${id}/service-history`,
      registration: `/cars/${id}/registration`,
      insurance: `/cars/${id}/insurance`,
      issue: `/cars/${id}/issues`,
    };
    navigate(routes[event.type]);
  };

  if (loading) {
    return <LoadingState text="Učitavanje timeline..." />;
  }

  if (!car) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Vozilo nije pronađeno</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <PageHeader
        title="Timeline događaja"
        subtitle={`${car.manufacturer} ${car.model} • ${car.licensePlate} • Kronološki pregled održavanja`}
        onBack={() => navigate(`/cars/${id}`)}
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Izvezi CSV
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ukupno događaja
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {events.filter((e) => e.type === 'service').length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Servisi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {events.filter((e) => e.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Aktivni</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {events.filter((e) => e.urgency === 'critical').length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Hitni</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Pretraži događaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as typeof typeFilter)
              }
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Tip događaja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="service">Servisi</SelectItem>
                <SelectItem value="registration">Registracije</SelectItem>
                <SelectItem value="insurance">Osiguranja</SelectItem>
                <SelectItem value="issue">Kvarovi</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as typeof statusFilter)
              }
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="completed">Završeno</SelectItem>
                <SelectItem value="active">Aktivno</SelectItem>
                <SelectItem value="upcoming">Nadolazeći</SelectItem>
                <SelectItem value="overdue">Isteklo</SelectItem>
              </SelectContent>
            </Select>

            {/* Group By */}
            <Select
              value={groupBy}
              onValueChange={(value) => setGroupBy(value as typeof groupBy)}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Grupiši po" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mjesec</SelectItem>
                <SelectItem value="year">Godina</SelectItem>
                <SelectItem value="type">Tip</SelectItem>
                <SelectItem value="none">Bez grupiranja</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('timeline')}
              >
                <Clock className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(typeFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
            <div className="flex items-center gap-2 mt-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Aktivni filteri:
              </span>
              {typeFilter !== 'all' && (
                <Badge variant="secondary">{typeFilter}</Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary">{statusFilter}</Badge>
              )}
              {searchTerm && <Badge variant="secondary">"{searchTerm}"</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Obriši sve
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardContent className="pt-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nema događaja koji odgovaraju filterima</p>
            </div>
          ) : (
            <TimelineView
              events={filteredEvents}
              groupBy={viewMode === 'timeline' ? groupBy : 'none'}
              showConnectors={viewMode === 'timeline'}
              compact={viewMode === 'list'}
              onEventClick={handleEventClick}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generate CSV export from timeline events
 */
function generateCSVExport(events: TimelineEvent[], car: Car): string {
  const lines: string[] = [];

  // Header
  lines.push(`Timeline - ${car.manufacturer} ${car.model}`);
  lines.push(`Registarska oznaka: ${car.licensePlate}`);
  lines.push(`Datum izvještaja: ${new Date().toLocaleDateString('bs-BA')}`);
  lines.push('');

  // Data
  lines.push('Datum,Tip,Naslov,Opis,Status,Hitnost,Trošak (BAM)');
  events.forEach((event) => {
    lines.push(
      `${event.date.toLocaleDateString('bs-BA')},${event.type},${event.title},"${event.description}",${event.status},${event.urgency || 'ok'},${event.cost ? Number(event.cost).toFixed(2) : '0'}`
    );
  });

  return lines.join('\n');
}
