import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Car, CarInsurance } from '../types/car.types';
import { getCar } from '../services/carService';
import {
  addCarInsurance,
  deleteCarInsurance,
  getCarInsuranceHistory,
  updateCarInsurance,
} from '../services/carInsuranceService';
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
          navigate('/cars');
          return;
        }

        setCar(carData);
        setInsurances(insuranceData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    if (carId) fetchData();
  }, [carId, navigate, toast]);

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
      console.error('Error saving insurance:', error);
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
      console.error('Error deleting insurance:', error);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insurances.map((insurance) => (
                <DetailCard
                  key={insurance.id}
                  title={insurance.provider || 'Osiguranje'}
                  icon={<Shield className="w-5 h-5" />}
                  borderColor="border-l-purple-500"
                  gradientColor="from-purple-500/10"
                  textColor="text-purple-700 dark:text-purple-400"
                >
                  <div className="space-y-3">
                    {insurance.policyNumber && (
                      <DetailField
                        label="Broj polise"
                        value={insurance.policyNumber}
                      />
                    )}
                    {insurance.provider && (
                      <DetailField
                        label="Provajder"
                        value={insurance.provider}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <DetailField
                        label="Istek osiguranja"
                        value={new Date(
                          insurance.insuranceExpiry
                        ).toLocaleDateString('hr-HR')}
                      />
                      {isExpired(insurance.insuranceExpiry) && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Isteklo
                        </Badge>
                      )}
                      {isExpiringSoon(insurance.insuranceExpiry) &&
                        !isExpired(insurance.insuranceExpiry) && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-yellow-500 text-yellow-600"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Uskoro
                          </Badge>
                        )}
                    </div>

                    {insurance.price && (
                      <DetailField
                        label="Cijena"
                        value={`${insurance.price.toFixed(2)} BAM`}
                      />
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(insurance)}
                        className="gap-2"
                      >
                        <Edit className="w-3 h-3" />
                        Uredi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInsurance(insurance);
                          setDeleteDialogOpen(true);
                        }}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                        Obriši
                      </Button>
                    </div>
                  </div>
                </DetailCard>
              ))}
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
