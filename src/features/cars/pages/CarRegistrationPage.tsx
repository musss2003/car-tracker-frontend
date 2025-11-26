import type React from 'react';

import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Car, CarRegistration } from '../types/car.types';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Button } from '@/shared/components/ui/button';
import { DetailCard } from '@/shared/components/ui/detail-card';
import { DetailField } from '@/shared/components/ui/detail-field';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
import { FormField } from '@/shared/components/ui/form-field';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { getCar } from '../services/carService';
import {
  addCarRegistration,
  deleteCarRegistration,
  getCarRegistrations,
  updateCarRegistration,
} from '../services/carRegistrationService';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const params = useParams();
  const carId = params?.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [registrations, setRegistrations] = useState<CarRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<CarRegistration | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    registrationExpiry: '',
    renewalDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carData, registrationData] = await Promise.all([
          getCar(carId),
          getCarRegistrations(carId),
        ]);

        if (!carData) {
          toast.error('Vozilo nije pronađeno');
          navigate('/cars');
          return;
        }

        setCar(carData);
        setRegistrations(registrationData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    if (carId) fetchData();
  }, [carId, navigate, toast]);

  const handleOpenDialog = (registration?: CarRegistration) => {
    if (registration) {
      setSelectedRegistration(registration);
      setFormData({
        registrationExpiry: registration.registrationExpiry.split('T')[0],
        renewalDate: registration.renewalDate.split('T')[0],
        notes: registration.notes || '',
      });
    } else {
      setSelectedRegistration(null);
      setFormData({
        registrationExpiry: '',
        renewalDate: '',
        notes: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.registrationExpiry)
      newErrors.registrationExpiry = 'Datum isteka registracije je obavezan';
    if (!formData.renewalDate)
      newErrors.renewalDate = 'Datum obnove je obavezan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const data: Partial<CarRegistration> = {
        carId,
        registrationExpiry: formData.registrationExpiry,
        renewalDate: formData.renewalDate,
        notes: formData.notes || undefined,
      };

      if (selectedRegistration) {
        await updateCarRegistration(selectedRegistration.id, data);
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === selectedRegistration.id
              ? ({ ...reg, ...data } as CarRegistration)
              : reg
          )
        );
        toast.success('Registracija je ažurirana');
      } else {
        const newRegistration = await addCarRegistration(data);
        setRegistrations((prev) => [newRegistration, ...prev]);
        toast.success('Registracija je kreirana');
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving registration:', error);
      toast.error('Greška pri čuvanju registracije');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRegistration) return;

    try {
      await deleteCarRegistration(selectedRegistration.id);
      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== selectedRegistration.id)
      );
      toast.success('Registracija je obrisana');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast.error('Greška pri brisanju registracije');
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
        title="Registracija vozila"
        subtitle={
          car ? `${car.manufacturer} ${car.model} - ${car.licensePlate}` : ''
        }
        onBack={() => navigate(`/cars/${carId}`)}
        actions={
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Dodaj registraciju
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto p-6 max-w-7xl">
          {registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nema zapisa o registraciji
              </h3>
              <p className="text-muted-foreground mb-4">
                Počnite sa dodavanjem informacija o registraciji vozila
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Dodaj registraciju
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((registration) => (
                <DetailCard
                  key={registration.id}
                  title="Registracija"
                  icon={<FileText className="w-5 h-5" />}
                  borderColor="border-l-green-500"
                  gradientColor="from-green-500/10"
                  textColor="text-green-700 dark:text-green-400"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <DetailField
                        label="Istek registracije"
                        value={new Date(
                          registration.registrationExpiry
                        ).toLocaleDateString('hr-HR')}
                      />
                      {isExpired(registration.registrationExpiry) && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Isteklo
                        </Badge>
                      )}
                      {isExpiringSoon(registration.registrationExpiry) &&
                        !isExpired(registration.registrationExpiry) && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-yellow-500 text-yellow-600"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Uskoro
                          </Badge>
                        )}
                    </div>

                    <DetailField
                      label="Datum obnove"
                      value={new Date(
                        registration.renewalDate
                      ).toLocaleDateString('hr-HR')}
                    />

                    {registration.notes && (
                      <DetailField
                        label="Napomene"
                        value={registration.notes}
                      />
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(registration)}
                        className="gap-2"
                      >
                        <Edit className="w-3 h-3" />
                        Uredi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRegistration(registration);
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
          <AlertDialogHeader>
            <DialogTitle>
              {selectedRegistration
                ? 'Uredi registraciju'
                : 'Dodaj registraciju'}
            </DialogTitle>
            <DialogDescription>
              {selectedRegistration
                ? 'Ažurirajte informacije o registraciji'
                : 'Unesite detalje o registraciji vozila'}
            </DialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Istek registracije"
              id="registrationExpiry"
              error={errors.registrationExpiry}
              required
            >
              <Input
                id="registrationExpiry"
                type="date"
                value={formData.registrationExpiry}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationExpiry: e.target.value,
                  })
                }
              />
            </FormField>

            <FormField
              label="Datum obnove"
              id="renewalDate"
              error={errors.renewalDate}
              required
            >
              <Input
                id="renewalDate"
                type="date"
                value={formData.renewalDate}
                onChange={(e) =>
                  setFormData({ ...formData, renewalDate: e.target.value })
                }
              />
            </FormField>

            <FormField label="Napomene" id="notes" error={errors.notes}>
              <Textarea
                id="notes"
                placeholder="Dodatne napomene..."
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
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
                  : selectedRegistration
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
            <AlertDialogTitle>Obrisati registraciju?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati ovaj zapis o registraciji?
              Ova akcija se ne može poništiti.
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
