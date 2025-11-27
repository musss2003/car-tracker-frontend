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

  // Load photo
  const loadPhoto = useCallback(
    async (photoUrl: string) => {
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
    },
    [toast]
  );

  // Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
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

        // Load car photo if available
        if (fetchedCar.photoUrl && fetchedCar.photoUrl.trim() !== '') {
          loadPhoto(fetchedCar.photoUrl);
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Greška pri učitavanju vozila');
        toast.error('Greška pri učitavanju vozila');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCar();
    }
  }, [id, navigate, loadPhoto, toast]);

  // Cleanup photo URL
  useEffect(() => {
    return () => {
      if (carPhoto) URL.revokeObjectURL(carPhoto);
    };
  }, [carPhoto]);

  // Handle delete
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
  }, [car, navigate, toast]);

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
      <div className="flex-none px-6 py-4 bg-gradient-to-r from-background via-muted/20 to-background border-b sticky top-0 z-10 backdrop-blur-sm">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cars')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Nazad
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {car.manufacturer} {car.model}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                {car.licensePlate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section with Car Image */}
          <div className="relative bg-[hsl(var(--accent-foreground))] from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-background-white/[0.02]" />

            <div className="relative px-6 py-16 lg:py-24">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Car Image */}
                <div className="flex-1 w-full flex justify-center">
                  {loadingPhoto ? (
                    <div className="w-full max-w-2xl aspect-video flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  ) : carPhoto ? (
                    <div className="w-full max-w-2xl">
                      <img
                        src={carPhoto || '/placeholder.svg'}
                        alt={`${car.manufacturer} ${car.model}`}
                        className="w-full h-auto object-contain drop-shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl aspect-video flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Nema fotografije
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Car Info Highlight */}
                <div className="flex-1 w-full space-y-6 text-white">
                  <div className="space-y-2">
                    <h2 className="text-5xl lg:text-6xl font-bold tracking-tight">
                      {car.manufacturer}
                    </h2>
                    <p className="text-3xl lg:text-4xl text-slate-300 font-light">
                      {car.model}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {car.pricePerDay
                        ? `${Number(car.pricePerDay).toFixed(0)}`
                        : 'N/A'}
                    </span>
                    <span className="text-2xl text-slate-400">BAM / dan</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400 uppercase tracking-wide">
                        Godina
                      </p>
                      <p className="text-2xl font-semibold">
                        {car.year || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400 uppercase tracking-wide">
                        Gorivo
                      </p>
                      <p className="text-2xl font-semibold">
                        {car.fuelType || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400 uppercase tracking-wide">
                        Transmisija
                      </p>
                      <p className="text-2xl font-semibold">
                        {car.transmission || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400 uppercase tracking-wide">
                        Kilometraža
                      </p>
                      <p className="text-2xl font-semibold">
                        {car.mileage ? `${car.mileage} km` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/cars/${car.id}/availability`)}
                className="h-auto py-6 flex-col gap-2 bg-background hover:bg-muted"
              >
                <Calendar className="w-8 h-8" />
                <span className="font-semibold">Kalendar dostupnosti</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/cars/${car.id}/service-history`)}
                className="h-auto py-6 flex-col gap-2 bg-background hover:bg-muted"
              >
                <Wrench className="w-8 h-8" />
                <span className="font-semibold">Servisna istorija</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/cars/${car.id}/registration`)}
                className="h-auto py-6 flex-col gap-2 bg-background hover:bg-muted"
              >
                <FileText className="w-8 h-8" />
                <span className="font-semibold">Registracija</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/cars/${car.id}/insurance`)}
                className="h-auto py-6 flex-col gap-2 bg-background hover:bg-muted"
              >
                <Shield className="w-8 h-8" />
                <span className="font-semibold">Osiguranje</span>
              </Button>
            </div>
          </div>

          <div className="px-6 py-8 space-y-6">
            <h3 className="text-2xl font-bold">Specifikacije</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <Card className="p-6 space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Osnovne informacije
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Registarska oznaka"
                    value={car.licensePlate}
                  />
                  <SpecItem label="Kategorija" value={car.category} />
                  <SpecItem label="Boja" value={car.color} />
                  <SpecItem label="Broj vrata" value={car.doors} />
                  <SpecItem label="Status" value={car.status} />
                </div>
              </Card>

              {/* Technical Info */}
              <Card className="p-6 space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Tehnički podaci
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Broj šasije"
                    value={car.chassisNumber}
                    className="break-all"
                  />
                  <SpecItem
                    label="Snaga motora"
                    value={
                      car.enginePower ? `${car.enginePower} KS` : undefined
                    }
                  />
                  <SpecItem
                    label="Trenutna lokacija"
                    value={car.currentLocation}
                  />
                </div>
              </Card>

              {/* Pricing */}
              <Card className="p-6 space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Cijena i troškovi
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    label="Dnevna cijena"
                    value={
                      car.pricePerDay
                        ? `${Number(car.pricePerDay).toFixed(2)} BAM`
                        : undefined
                    }
                  />
                  <SpecItem
                    label="Sedmična (7 dana)"
                    value={
                      car.pricePerDay
                        ? `${(Number(car.pricePerDay) * 7).toFixed(2)} BAM`
                        : undefined
                    }
                  />
                  <SpecItem
                    label="Mjesečna (30 dana)"
                    value={
                      car.pricePerDay
                        ? `${(Number(car.pricePerDay) * 30).toFixed(2)} BAM`
                        : undefined
                    }
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}

function SpecItem({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-right ${className || ''}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}
