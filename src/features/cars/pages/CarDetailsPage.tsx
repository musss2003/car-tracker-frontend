import { useState, useEffect, useCallback } from 'react';

import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CogIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhotographIcon,
} from '@heroicons/react/solid';
import { CarWithStatus } from '../types/car.types';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Badge } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { PhotoCard } from '@/shared/components/ui/photo-card';
import { DetailCard } from '@/shared/components/ui/detail-card';
import { DetailField } from '@/shared/components/ui/detail-field';
import { PhotoModal } from '@/shared/components/ui/photo-modal';
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

  // Photo states
  const [carPhoto, setCarPhoto] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Open photo modal
  const openPhotoModal = useCallback((src: string, title: string) => {
    setModalPhoto({ src, title });
    setModalOpen(true);
  }, []);

  // Close photo modal
  const closePhotoModal = useCallback(() => {
    setModalOpen(false);
    const timer = setTimeout(() => setModalPhoto(null), 300);
    return () => clearTimeout(timer);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closePhotoModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalOpen, closePhotoModal]);

  // Load photo
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
  }, [id, navigate, loadPhoto]);

  // Cleanup photo URL
  useEffect(() => {
    return () => {
      if (carPhoto) URL.revokeObjectURL(carPhoto);
    };
  }, [carPhoto]);

  // Helper functions
  const getValue = useCallback((value: unknown, defaultValue = 'N/A') => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      return defaultValue;
    }
    return String(value);
  }, []);

  const formatCurrency = useCallback((amount: number | null | undefined) => {
    if (amount === undefined || amount === null || isNaN(Number(amount)))
      return 'N/A';
    return `${Number(amount).toFixed(2)} BAM`;
  }, []);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!car) return;

    try {
      setDeleting(true);
      await deleteCar(car.id);
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Učitavanje...</span>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <ExclamationCircleIcon className="w-16 h-16 text-destructive" />
            <p className="text-lg font-medium">
              {error || 'Vozilo nije pronađeno'}
            </p>
            <Button onClick={() => navigate('/cars')}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Nazad na vozila
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cars')}
              className="gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Nazad
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-primary" />
                {car.manufacturer} {car.model}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {car.licensePlate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              className={`${car.isBusy ? 'bg-red-500' : 'bg-green-500'} text-white gap-2 px-3 py-1`}
            >
              {car.isBusy ? (
                <>
                  <ExclamationCircleIcon className="w-4 h-4" />
                  Zauzeto
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
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
              <PencilIcon className="w-4 h-4" />
              Uredi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/cars/${car.id}/availability`)}
              className="gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Kalendar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Obriši
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto p-6">
          <div className="space-y-6">
            {/* Car Photo - Full Width at Top */}
            {carPhoto && (
              <div className="w-full">
                <Card className="overflow-hidden">
                  <div className="h-1 w-full bg-purple-500" />
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-purple-700 dark:text-purple-400">
                      <PhotographIcon className="w-5 h-5" />
                      Fotografija vozila
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-center">
                      <div className="w-full max-w-3xl">
                        <PhotoCard
                          src={carPhoto}
                          alt={`${car.manufacturer} ${car.model}`}
                          label="Slika vozila"
                          loading={loadingPhoto}
                          onZoom={() =>
                            openPhotoModal(
                              carPhoto,
                              `${car.manufacturer} ${car.model}`
                            )
                          }
                          className="h-[400px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <DetailCard
                title="Osnovne informacije"
                icon={<TagIcon className="w-5 h-5" />}
                borderColor="border-l-green-500"
                gradientColor="from-green-500/10"
                textColor="text-green-700 dark:text-green-400"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailField
                    label="Proizvođač"
                    value={getValue(car.manufacturer)}
                  />
                  <DetailField label="Model" value={getValue(car.model)} />
                  <DetailField label="Godina" value={getValue(car.year)} />
                  <DetailField
                    label="Registarska oznaka"
                    value={getValue(car.licensePlate)}
                    valueClassName="font-medium text-sm font-mono"
                  />
                  <DetailField
                    label="Boja"
                    value={
                      <div className="flex items-center gap-2">
                        {car.color && (
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: car.color }}
                          />
                        )}
                        <span className="font-medium text-sm">
                          {car.color || 'Nedefinirano'}
                        </span>
                      </div>
                    }
                  />
                  <DetailField
                    label="Kategorija"
                    value={getValue(car.category, 'Nedefinirano')}
                  />
                </div>
              </DetailCard>

              {/* Technical Details */}
              <DetailCard
                title="Tehnički podaci"
                icon={<CogIcon className="w-5 h-5" />}
                borderColor="border-l-blue-500"
                gradientColor="from-blue-500/10"
                textColor="text-blue-700 dark:text-blue-400"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailField
                    label="Broj šasije"
                    value={getValue(car.chassisNumber, 'Nedefinirano')}
                    valueClassName="font-medium text-sm break-all"
                  />
                  <DetailField
                    label="Gorivo"
                    value={getValue(car.fuelType, 'Nedefinirano')}
                  />
                  <DetailField
                    label="Transmisija"
                    value={getValue(car.transmission, 'Nedefinirano')}
                  />
                  <DetailField
                    label="Broj vrata"
                    value={getValue(car.doors, 'Nedefinirano')}
                  />
                  <DetailField
                    label="Kilometraža"
                    value={car.mileage ? `${car.mileage} km` : 'Nedefinirano'}
                  />
                  <DetailField
                    label="Snaga motora"
                    value={
                      car.enginePower ? `${car.enginePower} KS` : 'Nedefinirano'
                    }
                  />
                  <DetailField
                    label="Status"
                    value={getValue(car.status, 'Nedefinirano')}
                  />
                  <DetailField
                    label="Trenutna lokacija"
                    value={getValue(car.currentLocation, 'Nedefinirano')}
                  />
                </div>
              </DetailCard>

              {/* Pricing Information */}
              <DetailCard
                title="Cijena"
                icon={<CurrencyDollarIcon className="w-5 h-5" />}
                borderColor="border-l-orange-500"
                gradientColor="from-orange-500/10"
                textColor="text-orange-700 dark:text-orange-400"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Cijena po danu
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(car.pricePerDay)}
                    </p>
                  </div>
                  {car.pricePerDay && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Mjesečno (30 dana)
                      </p>
                      <p className="text-lg font-semibold text-muted-foreground">
                        {formatCurrency(
                          Number.parseFloat(String(car.pricePerDay)) * 30
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </DetailCard>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      <PhotoModal
        isOpen={modalOpen}
        photo={modalPhoto}
        onClose={closePhotoModal}
      />

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
