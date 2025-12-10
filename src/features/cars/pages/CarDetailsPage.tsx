import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Wrench,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Gauge,
  Droplet,
  Settings,
  Car,
  AlertTriangle,
  CalendarCheck,
  Tag,
  DollarSign,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import { CarWithStatus } from '../types/car.types';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
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
import { downloadDocument } from '@/shared/services/uploadService';
import { deleteCar, getCar } from '../services/carService';
import { KPIGauge } from '../components/kpi-gauge';
import { getRegistrationDaysRemaining } from '../services/carRegistrationService';
import { getServiceRemainingKm } from '../services/carServiceHistory';
import { PageHeader } from '@/shared/components/ui/page-header';
import { getActiveIssueReportsCount } from '../services/carIssueReportService';
import {
  MaintenanceStatusList,
  MaintenanceStatus,
} from '../components/MaintenanceStatusList';
import {
  LogServiceModal,
  ReportIssueModal,
  UpdateMileageModal,
} from '../components/modals';

function SpecItem({
  label,
  value,
  className,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-semibold text-right ${className || ''}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}

function NavTile({
  title,
  Icon,
  onClick,
}: {
  title: string;
  Icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className="h-auto py-4 px-6 flex-1 min-w-[200px] flex flex-col items-center justify-center gap-3 bg-background hover:bg-muted/50 border-2 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
    >
      <Icon className="w-6 h-6 text-primary" />
      <span className="font-medium text-center text-sm">{title}</span>
    </Button>
  );
}

const SERVICE_INTERVAL = 10000;
const REGISTRATION_INTERVAL_DAYS = 365;
const MOCK_ISSUES_COUNT = 1;

export default function CarDetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id as string;

  const [car, setCar] = useState<CarWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [carPhoto, setCarPhoto] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [registrationDaysRemaining, setRegistrationDaysRemaining] = useState<
    number | null
  >(null);
  const [serviceKilometersRemaining, setServiceKilometersRemaining] = useState<
    number | null
  >(null);
  const [activeIssueReports, setActiveIssueReports] = useState<number | null>(
    null
  );

  // Modal states
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showUpdateMileageModal, setShowUpdateMileageModal] = useState(false);

  const loadPhoto = useCallback(async (photoUrl: string) => {
    try {
      setLoadingPhoto(true);
      if (
        !photoUrl ||
        photoUrl.startsWith('http://example.com') ||
        photoUrl.startsWith('https://example.com')
      ) {
        setCarPhoto(null);
        setLoadingPhoto(false);
        return;
      }
      const photoBlob = await downloadDocument(photoUrl);
      const photoUrlObject = URL.createObjectURL(photoBlob);
      setCarPhoto(photoUrlObject);
    } catch (error) {
      console.error('Error loading photo:', error);
      toast.error('Učitavanje fotografije nije uspjelo');
      setCarPhoto(null);
    } finally {
      setLoadingPhoto(false);
    }
  }, []);

  useEffect(() => {
    const fetchActiveIssueReports = async (carId: string) => {
      try {
        const count = await getActiveIssueReportsCount(carId);
        setActiveIssueReports(count);
      } catch (error) {
        console.error('Error fetching active issue reports:', error);
        setActiveIssueReports(null);
      }
    };

    const fetchServiceKmRemaining = async (carId: string) => {
      try {
        const data = await getServiceRemainingKm(carId);
        setServiceKilometersRemaining(data);
      } catch (error) {
        console.error('Error fetching service km remaining:', error);
        setServiceKilometersRemaining(null);
      }
    };

    const fetchRegistrationDaysRemaining = async (carId: string) => {
      try {
        // getRegistrationDaysRemaining returns a Promise<number> (or an object), so await it directly.
        const data = await getRegistrationDaysRemaining(carId);

        setRegistrationDaysRemaining(data);
      } catch (error) {
        console.error('Error fetching registration days remaining:', error);
        setRegistrationDaysRemaining(null);
      }
    };

    const fetchCarAndRelatedData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const fetchedCar = await getCar(id);
        if (!fetchedCar) {
          setError('Vozilo nije pronađeno');
          toast.error('Vozilo nije pronađeno');
          navigate('/cars');
          return;
        }
        setCar({ ...fetchedCar, isBusy: false });
        setError(null);

        if (fetchedCar.photoUrl && fetchedCar.photoUrl.trim() !== '') {
          loadPhoto(fetchedCar.photoUrl);
        }

        // Fetch related data
        fetchRegistrationDaysRemaining(id);
        fetchServiceKmRemaining(id);
        fetchActiveIssueReports(id);
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Greška pri učitavanju vozila');
        toast.error('Greška pri učitavanju vozila');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarAndRelatedData();
    }
  }, [id, navigate, loadPhoto]);

  useEffect(() => {
    return () => {
      if (carPhoto) URL.revokeObjectURL(carPhoto);
    };
  }, [carPhoto]);

  const handleDelete = useCallback(async () => {
    if (!car) return;
    try {
      setDeleting(true);
      await deleteCar(car.id.toString());
      toast.success('Vozilo je uspješno obrisano');
      navigate('/cars');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Greška pri brisanju vozila');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [car, navigate]);

  const refreshMaintenanceData = useCallback(async () => {
    if (!id) return;
    try {
      const [carData, regDays, serviceKm, issueCount] = await Promise.all([
        getCar(id),
        getRegistrationDaysRemaining(id),
        getServiceRemainingKm(id),
        getActiveIssueReportsCount(id),
      ]);
      if (carData) setCar({ ...carData, isBusy: false });
      setRegistrationDaysRemaining(regDays);
      setServiceKilometersRemaining(serviceKm);
      setActiveIssueReports(issueCount);
    } catch (error) {
      console.error('Error refreshing maintenance data:', error);
    }
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !car) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <p className="text-lg font-medium">
            {error || 'Vozilo nije pronađeno'}
          </p>
          <Button onClick={() => navigate('/cars')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nazad na vozila
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <PageHeader
        title={`Detalji o vozilu`}
        subtitle={`${car.manufacturer} ${car.model} ${car.licensePlate}`}
        onBack={() => navigate('/cars')}
        actions={
          <>
            <Badge
              variant={car.isBusy ? 'destructive' : 'default'}
              className={`gap-2 px-3 py-1 ${car.isBusy ? '' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {car.isBusy ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Zauzeto
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Dostupno
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/cars/${car.id}/edit`)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Uredi
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Obriši
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Hero Section */}
          <Card className="overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-0">
              {/* Left: Image - Narrower */}
              <div className="bg-muted/30 p-6 flex items-center justify-center lg:w-[350px] flex-shrink-0">
                <div className="w-full aspect-[4/3] bg-background rounded-lg overflow-hidden flex items-center justify-center border-2 border-border shadow-lg">
                  {loadingPhoto ? (
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : carPhoto ? (
                    <img
                      src={carPhoto}
                      alt={`${car.manufacturer} ${car.model}`}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div className="text-center space-y-2 p-4">
                      <Car className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground text-xs">
                        Nema fotografije
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Info & Price - Takes remaining space */}
              <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between">
                {/* Title & Basic Info */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      {car.year || 'N/A'}
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                      {car.manufacturer} {car.model}
                    </h2>
                  </div>

                  {/* Quick Specs Grid - More columns to use space */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Godina</p>
                        <p className="font-semibold text-sm truncate">
                          {car.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Droplet className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Gorivo</p>
                        <p className="font-semibold text-sm truncate">
                          {car.fuelType || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Settings className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Transmisija
                        </p>
                        <p className="font-semibold text-sm truncate">
                          {car.transmission || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Gauge className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Kilometraža
                        </p>
                        <p className="font-semibold text-sm truncate">
                          {car.mileage ? `${car.mileage} km` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Tag className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Kategorija
                        </p>
                        <p className="font-semibold text-sm truncate">
                          {car.category || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Droplet className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Boja</p>
                        <p className="font-semibold text-sm truncate">
                          {car.color || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Settings className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Broj vrata
                        </p>
                        <p className="font-semibold text-sm truncate">
                          {car.doors || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Lokacija
                        </p>
                        <p className="font-semibold text-sm truncate">
                          {car.currentLocation || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price - Bottom */}
                <div className="pt-6 border-t mt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Dnevna cijena iznajmljivanja
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-extrabold text-foreground">
                      {car.pricePerDay
                        ? `${Number(car.pricePerDay).toFixed(0)}`
                        : 'N/A'}
                    </span>
                    <span className="text-xl lg:text-2xl font-bold text-primary">
                      BAM
                    </span>
                    <span className="text-base lg:text-lg text-muted-foreground">
                      / dan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Maintenance Status - Compact View */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Status održavanja</h3>
            <MaintenanceStatusList
              items={[
                {
                  id: 'service',
                  title: 'Sljedeći servis',
                  icon: Wrench,
                  currentValue: serviceKilometersRemaining,
                  maxValue: SERVICE_INTERVAL,
                  unit: 'km preostalo',
                  urgency:
                    serviceKilometersRemaining === null
                      ? 'ok'
                      : serviceKilometersRemaining < 500
                        ? 'critical'
                        : serviceKilometersRemaining < 2000
                          ? 'warning'
                          : 'ok',
                  actionLabel:
                    serviceKilometersRemaining !== null &&
                    serviceKilometersRemaining < 2000
                      ? 'Zakaži servis'
                      : undefined,
                  onAction:
                    serviceKilometersRemaining !== null &&
                    serviceKilometersRemaining < 2000
                      ? () => navigate(`/cars/${car.id}/service-history`)
                      : undefined,
                },
                {
                  id: 'registration',
                  title: 'Registracija ističe',
                  icon: CalendarCheck,
                  currentValue: registrationDaysRemaining,
                  maxValue: REGISTRATION_INTERVAL_DAYS,
                  unit: 'dana preostalo',
                  urgency:
                    registrationDaysRemaining === null
                      ? 'ok'
                      : registrationDaysRemaining < 7
                        ? 'critical'
                        : registrationDaysRemaining < 30
                          ? 'warning'
                          : 'ok',
                  actionLabel:
                    registrationDaysRemaining !== null &&
                    registrationDaysRemaining < 30
                      ? 'Produlji'
                      : undefined,
                  onAction:
                    registrationDaysRemaining !== null &&
                    registrationDaysRemaining < 30
                      ? () => navigate(`/cars/${car.id}/registration`)
                      : undefined,
                },
                {
                  id: 'issues',
                  title: 'Aktivni kvarovi',
                  icon: AlertTriangle,
                  currentValue: activeIssueReports,
                  maxValue: MOCK_ISSUES_COUNT,
                  unit: activeIssueReports === 1 ? 'kvar' : 'kvarova',
                  urgency:
                    activeIssueReports === null || activeIssueReports === 0
                      ? 'ok'
                      : activeIssueReports >= 3
                        ? 'critical'
                        : 'warning',
                  actionLabel:
                    activeIssueReports !== null && activeIssueReports > 0
                      ? 'Prikaži kvarove'
                      : undefined,
                  onAction:
                    activeIssueReports !== null && activeIssueReports > 0
                      ? () => navigate(`/cars/${car.id}/issues`)
                      : undefined,
                },
              ]}
            />
          </div>

          {/* Quick Maintenance Actions */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Brze akcije održavanja</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowLogServiceModal(true)}
                className="h-auto py-6 px-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border-2 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
              >
                <Wrench className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-base">
                    ⚡ Zabilježi servis
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Brzo dodaj novi servis
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowReportIssueModal(true)}
                className="h-auto py-6 px-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/40 border-2 transition-all duration-200 hover:border-orange-500/50 hover:shadow-lg"
              >
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div className="text-center">
                  <div className="font-semibold text-base">⚡ Prijavi kvar</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Brzo prijavi problem
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowUpdateMileageModal(true)}
                className="h-auto py-6 px-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/40 border-2 transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg"
              >
                <Gauge className="w-8 h-8 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold text-base">⚡ Ažuriraj km</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Trenutno: {car.mileage?.toLocaleString() || 'N/A'} km
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Navigation Tiles */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Navigacija</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <NavTile
                title="Kalendar dostupnosti"
                Icon={Calendar}
                onClick={() => navigate(`/cars/${car.id}/availability`)}
              />
              <NavTile
                title="Servisna historija"
                Icon={Wrench}
                onClick={() => navigate(`/cars/${car.id}/service-history`)}
              />
              <NavTile
                title="Detalji registracije"
                Icon={FileText}
                onClick={() => navigate(`/cars/${car.id}/registration`)}
              />
              <NavTile
                title="Polisa osiguranja"
                Icon={Shield}
                onClick={() => navigate(`/cars/${car.id}/insurance`)}
              />
              <NavTile
                title="Kvarovi na autu"
                Icon={AlertTriangle}
                onClick={() => navigate(`/cars/${car.id}/issues`)}
              />
            </div>
          </div>

          {/* Detailed Specifications */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Detaljne specifikacije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Basic Info */}
              <Card className="p-6">
                <h4 className="font-bold text-lg border-b pb-3 mb-4 text-primary">
                  Osnovne informacije
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Registarska oznaka"
                    value={car.licensePlate}
                    icon={Tag}
                  />
                  <SpecItem
                    label="Kategorija"
                    value={car.category}
                    icon={Tag}
                  />
                  <SpecItem label="Boja" value={car.color} icon={Droplet} />
                  <SpecItem
                    label="Broj vrata"
                    value={car.doors}
                    icon={Settings}
                  />
                  <SpecItem
                    label="Status vozila"
                    value={car.status}
                    icon={CheckCircle}
                  />
                  <SpecItem
                    label="Trenutna lokacija"
                    value={car.currentLocation}
                    icon={MapPin}
                  />
                </div>
              </Card>

              {/* 2. Technical Info */}
              <Card className="p-6">
                <h4 className="font-bold text-lg border-b pb-3 mb-4 text-primary">
                  Tehnički podaci
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Snaga motora"
                    value={
                      car.enginePower ? `${car.enginePower} KS` : undefined
                    }
                    icon={Wrench}
                  />
                  <SpecItem
                    label="Tip goriva"
                    value={car.fuelType}
                    icon={Droplet}
                  />
                  <SpecItem
                    label="Transmisija"
                    value={car.transmission}
                    icon={Settings}
                  />
                  <SpecItem
                    label="Godina proizvodnje"
                    value={car.year}
                    icon={Calendar}
                  />
                </div>
              </Card>

              {/* 3. Pricing & Costs */}
              <Card className="p-6">
                <h4 className="font-bold text-lg border-b pb-3 mb-4 text-primary">
                  Cijena i kalkulacije
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Dnevna cijena"
                    value={
                      car.pricePerDay
                        ? `${Number(car.pricePerDay).toFixed(2)} BAM`
                        : undefined
                    }
                    icon={DollarSign}
                  />
                  <SpecItem
                    label="Sedmična (7 dana)"
                    value={
                      car.pricePerDay
                        ? `${(Number(car.pricePerDay) * 7).toFixed(2)} BAM`
                        : undefined
                    }
                    icon={DollarSign}
                  />
                  <SpecItem
                    label="Mjesečna (30 dana)"
                    value={
                      car.pricePerDay
                        ? `${(Number(car.pricePerDay) * 30).toFixed(2)} BAM`
                        : undefined
                    }
                    icon={DollarSign}
                  />
                </div>
              </Card>

              {/* 4. Key Features & Notes */}
              <Card className="p-6">
                <h4 className="font-bold text-lg border-b pb-3 mb-4 text-primary">
                  Dodatne informacije
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Broj šasije (VIN)"
                    value={car.chassisNumber}
                    icon={FileText}
                    className="break-all"
                  />
                  <SpecItem
                    label="Klima uređaj"
                    value="Automatski"
                    icon={ClipboardList}
                  />
                  <SpecItem
                    label="Navigacija"
                    value="Da"
                    icon={ClipboardList}
                  />
                  <SpecItem
                    label="Max putnika"
                    value="5"
                    icon={ClipboardList}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati vozilo?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati ovo vozilo? Ova akcija se ne
              može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Action Modals */}
      <LogServiceModal
        open={showLogServiceModal}
        onOpenChange={setShowLogServiceModal}
        carId={car.id}
        currentMileage={car.mileage}
        onSuccess={refreshMaintenanceData}
      />

      <ReportIssueModal
        open={showReportIssueModal}
        onOpenChange={setShowReportIssueModal}
        carId={car.id}
        onSuccess={refreshMaintenanceData}
      />

      <UpdateMileageModal
        open={showUpdateMileageModal}
        onOpenChange={setShowUpdateMileageModal}
        carId={car.id}
        currentMileage={car.mileage}
        onSuccess={refreshMaintenanceData}
      />
    </div>
  );
}
