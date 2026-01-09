import { useEffect, useState } from 'react';
import { logError } from '@/shared/utils/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Car, CarInsurance } from '../types/car.types';
import { getCar } from '../services/carService';
import {
  addCarInsurance,
  deleteCarInsurance,
  getCarInsuranceHistory,
  updateCarInsurance,
  getInsuranceAuditLogs,
} from '../services/carInsuranceService';
import { AuditLogHistory } from '@/shared/components/audit/AuditLogHistory';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, Edit, Plus, Shield, Trash2 } from 'lucide-react';
import { DetailCard } from '@/shared/components/ui/detail-card';
import { DetailField } from '@/shared/components/ui/detail-field';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
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

export default function CarInsurancePage() {
  const navigate = useNavigate();
  const params = useParams();
  const carId = params?.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [insurances, setInsurances] = useState<CarInsurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] =
    useState<CarInsurance | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    policyNumber: '',
    provider: '',
    insuranceExpiry: '',
    price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carData, insuranceData] = await Promise.all([
          getCar(carId),
          getCarInsuranceHistory(carId),
        ]);

        if (!carData) {
          toast.error('Vozilo nije pronađeno');
          navigate('/cars/');
          return;
        }

        setCar(carData);
        setInsurances(insuranceData);
      } catch (error) {
        logError('Error fetching data:', error);
        toast.error('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    if (carId) fetchData();
  }, [carId, navigate]);

  const handleOpenDialog = (insurance?: CarInsurance) => {
    if (insurance) {
      setSelectedInsurance(insurance);
      setFormData({
        policyNumber: insurance.policyNumber || '',
        provider: insurance.provider || '',
        insuranceExpiry: insurance.insuranceExpiry.split('T')[0],
        price: insurance.price?.toString() || '',
      });
    } else {
      setSelectedInsurance(null);
      setFormData({
        policyNumber: '',
        provider: '',
        insuranceExpiry: '',
        price: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.insuranceExpiry)
      newErrors.insuranceExpiry = 'Datum isteka osiguranja je obavezan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const data: Partial<CarInsurance> = {
        carId,
        policyNumber: formData.policyNumber || undefined,
        provider: formData.provider || undefined,
        insuranceExpiry: formData.insuranceExpiry,
        price: formData.price ? Number(formData.price) : undefined,
      };

      if (selectedInsurance) {
        await updateCarInsurance(selectedInsurance.id, data);
        setInsurances((prev) =>
          prev.map((ins) =>
            ins.id === selectedInsurance.id
              ? ({ ...ins, ...data } as CarInsurance)
              : ins
          )
        );
        toast.success('Osiguranje je ažurirano');
      } else {
        const newInsurance = await addCarInsurance(data);
        setInsurances((prev) => [newInsurance, ...prev]);
        toast.success('Osiguranje je kreirano');
      }

      setDialogOpen(false);
    } catch (error) {
      logError('Error saving insurance:', error);
      toast.error('Greška pri čuvanju osiguranja');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInsurance) return;

    try {
      await deleteCarInsurance(selectedInsurance.id);
      setInsurances((prev) =>
        prev.filter((ins) => ins.id !== selectedInsurance.id)
      );
      toast('Osiguranje je obrisano');
      setDeleteDialogOpen(false);
    } catch (error) {
      logError('Error deleting insurance:', error);
      toast.error('Greška pri brisanju osiguranja');
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  if (loading) return <LoadingState />;

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <PageHeader
        title="Osiguranje vozila"
        subtitle={
          car ? `${car.manufacturer} ${car.model} - ${car.licensePlate}` : ''
        }
        onBack={() => navigate(`/cars/${carId}`)}
        actions={
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Dodaj osiguranje
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto p-6 max-w-7xl">
          {insurances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nema zapisa o osiguranju
              </h3>
              <p className="text-muted-foreground mb-4">
                Počnite sa dodavanjem informacija o osiguranju vozila
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Dodaj osiguranje
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {insurances.map((insurance) => {
                const formatDate = (dateString: string) => {
                  return new Date(dateString).toLocaleDateString('bs-BA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                };

                return (
                  <div
                    key={insurance.id}
                    className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 mb-2">
                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="font-bold text-base sm:text-lg mb-1 truncate">
                            {insurance.provider || 'Osiguranje vozila'}
                          </h4>
                          {insurance.policyNumber && (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Polisa: {insurance.policyNumber}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 items-center flex-shrink-0 self-start">
                          {isExpired(insurance.insuranceExpiry) && (
                            <Badge
                              variant="destructive"
                              className="gap-1 text-xs"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span className="hidden sm:inline">Isteklo</span>
                            </Badge>
                          )}
                          {isExpiringSoon(insurance.insuranceExpiry) &&
                            !isExpired(insurance.insuranceExpiry) && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-yellow-500 text-yellow-600 text-xs"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span className="hidden sm:inline">Uskoro</span>
                              </Badge>
                            )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(insurance)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInsurance(insurance);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 text-xs sm:text-sm">
                        <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="font-medium whitespace-nowrap">
                            Ističe: {formatDate(insurance.insuranceExpiry)}
                          </span>
                        </span>
                        {insurance.price && (
                          <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary font-bold whitespace-nowrap">
                            {Number(insurance.price).toFixed(2)} BAM
                          </span>
                        )}
                      </div>

                      <AuditLogHistory
                        resourceId={insurance.id}
                        fetchAuditLogs={getInsuranceAuditLogs}
                        className="mt-4"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedInsurance ? 'Uredi osiguranje' : 'Dodaj osiguranje'}
            </DialogTitle>
            <DialogDescription>
              {selectedInsurance
                ? 'Ažurirajte informacije o osiguranju'
                : 'Unesite detalje o osiguranju vozila'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Broj polise"
              id="policyNumber"
              error={errors.policyNumber}
            >
              <Input
                id="policyNumber"
                placeholder="npr. POL-12345"
                value={formData.policyNumber}
                onChange={(e) =>
                  setFormData({ ...formData, policyNumber: e.target.value })
                }
              />
            </FormField>

            <FormField label="Provajder" id="provider" error={errors.provider}>
              <Input
                id="provider"
                placeholder="npr. Sarajevo osiguranje"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
              />
            </FormField>

            <FormField
              label="Istek osiguranja"
              id="insuranceExpiry"
              error={errors.insuranceExpiry}
              required
            >
              <Input
                id="insuranceExpiry"
                type="date"
                value={formData.insuranceExpiry}
                onChange={(e) =>
                  setFormData({ ...formData, insuranceExpiry: e.target.value })
                }
              />
            </FormField>

            <FormField label="Cijena" id="price" error={errors.price}>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </FormField>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Otkaži
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Čuvanje...'
                  : selectedInsurance
                    ? 'Ažuriraj'
                    : 'Kreiraj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati osiguranje?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati ovaj zapis o osiguranju? Ova
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
