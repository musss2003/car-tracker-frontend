import { useState, useEffect } from 'react';
import { logError } from '@/shared/utils/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  Wrench,
  FileText,
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/page-header';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Card } from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { MaintenanceAlertBanner } from '../components/MaintenanceAlertBanner';
import { getCar } from '../services/carService';
import { getCarServiceHistory } from '../services/carServiceHistory';
import {
  getCarRegistrations,
  getRegistrationDaysRemaining,
} from '../services/carRegistrationService';
import { getCarInsuranceHistory } from '../services/carInsuranceService';
import { getCarIssueReportsForCar } from '../services/carIssueReportService';
import { getServiceRemainingKm } from '../services/carServiceHistory';
import { getActiveIssueReportsCount } from '../services/carIssueReportService';
import {
  getMaintenanceAlerts,
  MaintenanceAlert,
} from '../services/maintenanceNotificationService';
import {
  Car,
  CarServiceHistory,
  CarRegistration,
  CarInsurance,
  CarIssueReport,
} from '../types/car.types';

// Combined maintenance event type
interface MaintenanceEvent {
  id: string;
  type: 'service' | 'registration' | 'insurance' | 'issue';
  date: Date;
  title: string;
  description: string;
  cost?: number;
  status: 'completed' | 'active' | 'upcoming' | 'overdue';
  urgency?: 'critical' | 'warning' | 'ok';
  data: any; // Original data object
}

const SERVICE_INTERVAL = 10000;
const REGISTRATION_INTERVAL_DAYS = 365;

export default function MaintenanceHubPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MaintenanceEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<
    MaintenanceAlert[]
  >([]);

  // KPI states
  const [registrationDaysRemaining, setRegistrationDaysRemaining] = useState<
    number | null
  >(null);
  const [serviceKmRemaining, setServiceKmRemaining] = useState<number | null>(
    null
  );
  const [activeIssueCount, setActiveIssueCount] = useState<number | null>(null);

  // Cost statistics
  const [totalCost, setTotalCost] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [yearlyCost, setYearlyCost] = useState(0);

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
          regDays,
          serviceKm,
          issueCount,
        ] = await Promise.all([
          getCar(id),
          getCarServiceHistory(id),
          getCarRegistrations(id),
          getCarInsuranceHistory(id),
          getCarIssueReportsForCar(id),
          getRegistrationDaysRemaining(id),
          getServiceRemainingKm(id),
          getActiveIssueReportsCount(id),
        ]);

        setCar(carData);
        setRegistrationDaysRemaining(regDays);
        setServiceKmRemaining(serviceKm);
        setActiveIssueCount(issueCount);

        // Convert all data to unified events
        const allEvents: MaintenanceEvent[] = [];

        // Service events
        serviceHistory.forEach((service: CarServiceHistory) => {
          allEvents.push({
            id: `service-${service.id}`,
            type: 'service',
            date: new Date(service.serviceDate),
            title: service.serviceType,
            description: service.description || 'Redovni servis',
            cost: service.cost,
            status: 'completed',
            data: service,
          });
        });

        // Registration events
        registrationHistory.forEach((registration: CarRegistration) => {
          const expiryDate = new Date(registration.registrationExpiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          allEvents.push({
            id: `registration-${registration.id}`,
            type: 'registration',
            date: new Date(registration.renewalDate),
            title: 'Registracija vozila',
            description: `Ističe ${expiryDate.toLocaleDateString('bs-BA')}`,
            status:
              daysUntilExpiry < 0
                ? 'overdue'
                : daysUntilExpiry < 30
                  ? 'upcoming'
                  : 'completed',
            urgency:
              daysUntilExpiry < 7
                ? 'critical'
                : daysUntilExpiry < 30
                  ? 'warning'
                  : 'ok',
            data: registration,
          });
        });

        // Insurance events
        insuranceHistory.forEach((insurance: CarInsurance) => {
          const expiryDate = new Date(insurance.insuranceExpiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          allEvents.push({
            id: `insurance-${insurance.id}`,
            type: 'insurance',
            date: expiryDate,
            title: `Osiguranje - ${insurance.provider || 'N/A'}`,
            description: `Polisa: ${insurance.policyNumber || 'N/A'}`,
            cost: insurance.price,
            status:
              daysUntilExpiry < 0
                ? 'overdue'
                : daysUntilExpiry < 30
                  ? 'upcoming'
                  : 'active',
            urgency:
              daysUntilExpiry < 7
                ? 'critical'
                : daysUntilExpiry < 30
                  ? 'warning'
                  : 'ok',
            data: insurance,
          });
        });

        // Issue events
        issueReports.forEach((issue: CarIssueReport) => {
          allEvents.push({
            id: `issue-${issue.id}`,
            type: 'issue',
            date: new Date(issue.reportedAt),
            title: `Kvar - ${issue.severity || 'medium'}`,
            description: issue.description,
            status: issue.status === 'resolved' ? 'completed' : 'active',
            urgency:
              issue.severity === 'high'
                ? 'critical'
                : issue.severity === 'medium'
                  ? 'warning'
                  : 'ok',
            data: issue,
          });
        });

        // Sort by date (most recent first)
        allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

        setEvents(allEvents);
        setFilteredEvents(allEvents);

        // Calculate costs
        const costs = allEvents
          .filter((e) => e.cost)
          .map((e) => Number(e.cost) || 0);
        const total = costs.reduce((sum, cost) => sum + cost, 0);
        setTotalCost(Number(total));

        // Monthly cost (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCosts = allEvents
          .filter((e) => e.cost && e.date >= thirtyDaysAgo)
          .map((e) => Number(e.cost) || 0);
        setMonthlyCost(
          Number(recentCosts.reduce((sum, cost) => sum + cost, 0))
        );

        // Yearly cost (last 365 days)
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        const yearCosts = allEvents
          .filter((e) => e.cost && e.date >= oneYearAgo)
          .map((e) => Number(e.cost) || 0);
        setYearlyCost(Number(yearCosts.reduce((sum, cost) => sum + cost, 0)));

        // Generate alerts (now using backend API)
        const alerts = await getMaintenanceAlerts(id);
        setMaintenanceAlerts(alerts);
      } catch (error) {
        logError('Error fetching maintenance data:', error);
        toast.error('Greška pri učitavanju podataka o održavanju');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter events based on tab and search
  useEffect(() => {
    let filtered = events;

    // Filter by type (tab)
    if (selectedTab !== 'all') {
      filtered = filtered.filter((e) => e.type === selectedTab);
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
  }, [selectedTab, searchTerm, events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'service':
        return Wrench;
      case 'registration':
        return FileText;
      case 'insurance':
        return Shield;
      case 'issue':
        return AlertTriangle;
      default:
        return Calendar;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Završeno</Badge>;
      case 'active':
        return <Badge className="bg-blue-600">Aktivno</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-600">Uskoro</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Isteklo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Datum', 'Tip', 'Naziv', 'Opis', 'Cijena (BAM)', 'Status'],
      ...filteredEvents.map((e) => [
        e.date.toLocaleDateString('bs-BA'),
        e.type,
        e.title,
        e.description,
        e.cost?.toFixed(2) || '',
        e.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-${car?.licensePlate}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Izvoz uspješan');
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!car) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Vozilo nije pronađeno</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <PageHeader
        title="Centar održavanja"
        subtitle={`${car.manufacturer} ${car.model} • ${car.licensePlate}`}
        onBack={() => navigate(`/cars/${id}`)}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/cars/${id}/cost-analytics`)}
              className="gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Analitika troškova</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Izvezi CSV</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Alerts */}
          {!alertsDismissed && maintenanceAlerts.length > 0 && (
            <MaintenanceAlertBanner
              alerts={maintenanceAlerts}
              onDismiss={() => setAlertsDismissed(true)}
            />
          )}

          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Ukupno potrošeno
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
                    {Number(totalCost || 0).toFixed(2)}{' '}
                    <span className="text-base sm:text-lg">BAM</span>
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Posljednjih 30 dana
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
                    {Number(monthlyCost || 0).toFixed(2)}{' '}
                    <span className="text-base sm:text-lg">BAM</span>
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Godišnje (365 dana)
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
                    {Number(yearlyCost || 0).toFixed(2)}{' '}
                    <span className="text-base sm:text-lg">BAM</span>
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Timeline */}
          <Card>
            <div className="p-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="overflow-x-auto w-full sm:w-auto">
                    <TabsList className="w-max">
                      <TabsTrigger value="all" className="text-xs sm:text-sm">
                        Sve ({events.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="service"
                        className="text-xs sm:text-sm"
                      >
                        <Wrench className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Servisi </span>(
                        {events.filter((e) => e.type === 'service').length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="registration"
                        className="text-xs sm:text-sm"
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Registracije </span>(
                        {events.filter((e) => e.type === 'registration').length}
                        )
                      </TabsTrigger>
                      <TabsTrigger
                        value="insurance"
                        className="text-xs sm:text-sm"
                      >
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Osiguranja </span>(
                        {events.filter((e) => e.type === 'insurance').length})
                      </TabsTrigger>
                      <TabsTrigger value="issue" className="text-xs sm:text-sm">
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Kvarovi </span>(
                        {events.filter((e) => e.type === 'issue').length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Pretraži događaje..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <TabsContent value={selectedTab} className="mt-0">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nema događaja za prikaz</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEvents.map((event) => {
                        const Icon = getEventIcon(event.type);
                        const iconColorMap = {
                          service:
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                          registration:
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                          insurance:
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                          issue:
                            'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                        };
                        const truncatedDescription =
                          event.description.length > 100
                            ? event.description.substring(0, 100) + '...'
                            : event.description;
                        return (
                          <div
                            key={event.id}
                            className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${iconColorMap[event.type]}`}
                              >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 mb-2">
                                <div className="flex-1 min-w-0 w-full">
                                  <h4 className="font-bold text-base sm:text-lg mb-1 truncate">
                                    {event.title}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    {event.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 self-start">
                                  {getStatusBadge(event.status)}
                                  {event.urgency && event.urgency !== 'ok' && (
                                    <Badge
                                      variant={
                                        event.urgency === 'critical'
                                          ? 'destructive'
                                          : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {event.urgency === 'critical'
                                        ? '🔴'
                                        : '🟡'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 text-xs sm:text-sm">
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
                                    {Number(event.cost).toFixed(2)} BAM
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
