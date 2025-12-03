import type React from 'react';

import { useState, useEffect } from 'react';
import { Car, CarServiceHistory } from '../types/car.types';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Button } from '@/shared/components/ui/button';
import { Edit, Plus, Trash2, Wrench } from 'lucide-react';
import { DetailCard } from '@/shared/components/ui/detail-card';
import { DetailField } from '@/shared/components/ui/detail-field';
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
import { Textarea } from '@/shared/components/ui/textarea';
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
  addCarServiceRecord,
  deleteCarServiceRecord,
  getCarServiceHistory,
  updateServiceRecord,
  getServiceHistoryAuditLogs,
} from '../services/carServiceHistory';
import { getCar } from '../services/carService';
import { AuditLogHistory } from '@/shared/components/audit/AuditLogHistory';

export default function CarServiceHistoryPage() {
  const navigate = useNavigate();
  const params = useParams();
  const carId = params?.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [serviceHistory, setServiceHistory] = useState<CarServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<CarServiceHistory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    serviceDate: '',
    mileage: '',
    serviceType: '',
    description: '',
    nextServiceKm: '',
    nextServiceDate: '',
    cost: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carData, historyData] = await Promise.all([
          getCar(carId),
          getCarServiceHistory(carId),
        ]);

        if (!carData) {
          toast.error('Vozilo nije pronađeno');
          navigate('/cars');
          return;
        }

        setCar(carData);
        // Sort by service date descending (most recent first)
        const sortedHistory = historyData.sort(
          (a, b) =>
            new Date(b.serviceDate).getTime() -
            new Date(a.serviceDate).getTime()
        );
        setServiceHistory(sortedHistory);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    if (carId) fetchData();
  }, [carId, navigate]);

  const formatDateForInput = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleOpenDialog = (record?: CarServiceHistory) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        serviceDate: formatDateForInput(record.serviceDate),
        mileage: record.mileage?.toString() || '',
        serviceType: record.serviceType,
        description: record.description || '',
        nextServiceKm: record.nextServiceKm?.toString() || '',
        nextServiceDate: record.nextServiceDate
          ? formatDateForInput(record.nextServiceDate)
          : '',
        cost: record.cost?.toString() || '',
      });
    } else {
      setSelectedRecord(null);
      setFormData({
        serviceDate: '',
        mileage: '',
        serviceType: '',
        description: '',
        nextServiceKm: '',
        nextServiceDate: '',
        cost: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceDate)
      newErrors.serviceDate = 'Datum servisa je obavezan';
    if (!formData.serviceType)
      newErrors.serviceType = 'Tip servisa je obavezan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const data: Partial<CarServiceHistory> = {
        carId,
        serviceDate: formData.serviceDate,
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        serviceType: formData.serviceType,
        description: formData.description || undefined,
        nextServiceKm: formData.nextServiceKm
          ? Number(formData.nextServiceKm)
          : undefined,
        nextServiceDate: formData.nextServiceDate || undefined,
        cost: formData.cost ? Number(formData.cost) : undefined,
      };

      if (selectedRecord) {
        const updatedRecord = await updateServiceRecord(selectedRecord.id, data);
        setServiceHistory((prev) =>
          prev
            .map((record) =>
              record.id === selectedRecord.id ? updatedRecord : record
            )
            .sort(
              (a, b) =>
                new Date(b.serviceDate).getTime() -
                new Date(a.serviceDate).getTime()
            )
        );
        toast.success('Servisni zapis je ažuriran');
      } else {
        const newRecord = await addCarServiceRecord(data);
        setServiceHistory((prev) =>
          [newRecord, ...prev].sort(
            (a, b) =>
              new Date(b.serviceDate).getTime() -
              new Date(a.serviceDate).getTime()
          )
        );
        toast.success('Servisni zapis je kreiran');
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving service record:', error);
      toast.error('Greška pri čuvanju servisnog zapisa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      await deleteCarServiceRecord(selectedRecord.id);
      setServiceHistory((prev) =>
        prev.filter((record) => record.id !== selectedRecord.id)
      );
      toast.success('Servisni zapis je obrisan');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting service record:', error);
      toast.error('Greška pri brisanju servisnog zapisa');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <PageHeader
        title="Servisna historija"
        subtitle={
          car ? `${car.manufacturer} ${car.model} - ${car.licensePlate}` : ''
        }
        onBack={() => navigate(`/cars/${carId}`)}
        actions={
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Dodaj servis
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto p-6">
          {serviceHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nema servisnih zapisa
              </h3>
              <p className="text-muted-foreground mb-4">
                Počnite sa dodavanjem servisne historije za ovo vozilo
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Dodaj prvi servis
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {serviceHistory.map((record) => {
                const formatDate = (dateString: string | Date) => {
                  const date = new Date(dateString);
                  if (isNaN(date.getTime())) return 'N/A';
                  return date.toLocaleDateString('hr-HR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                };

                const truncateText = (text: string, maxLength: number = 50) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength) + '...';
                };

                return (
                  <div key={record.id} className="flex">
                    <DetailCard
                      title={truncateText(record.serviceType, 40)}
                      icon={<Wrench className="w-5 h-5" />}
                      borderColor="border-l-blue-500"
                      gradientColor="from-blue-500/10"
                      textColor="text-blue-700 dark:text-blue-400"
                      className="w-full flex flex-col"
                    >
                      <div className="flex flex-col flex-1 min-h-0">
                        <div className="space-y-3 flex-1">
                          <DetailField
                            label="Datum servisa"
                            value={formatDate(record.serviceDate)}
                          />
                          {record.mileage && (
                            <DetailField
                              label="Kilometraža"
                              value={`${record.mileage.toLocaleString('hr-HR')} km`}
                            />
                          )}
                          {record.description && (
                            <DetailField
                              label="Opis"
                              value={truncateText(record.description, 50)}
                            />
                          )}
                          {record.nextServiceKm && (
                            <DetailField
                              label="Sljedeći servis (km)"
                              value={`${record.nextServiceKm.toLocaleString('hr-HR')} km`}
                            />
                          )}
                          {record.nextServiceDate && (
                            <DetailField
                              label="Sljedeći servis (datum)"
                              value={formatDate(record.nextServiceDate)}
                            />
                          )}
                          {record.cost && (
                            <DetailField
                              label="Cijena"
                              value={`${Number(record.cost).toFixed(2)} BAM`}
                            />
                          )}
                        </div>

                        <AuditLogHistory
                          resourceId={record.id}
                          fetchAuditLogs={getServiceHistoryAuditLogs}
                          title="Historija izmjena"
                          className="mt-4"
                        />

                        <div className="flex gap-2 pt-4 mt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(record)}
                            className="gap-2 flex-1"
                          >
                            <Edit className="w-3 h-3" />
                            Uredi
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-2 flex-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                            Obriši
                          </Button>
                        </div>
                      </div>
                    </DetailCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? 'Uredi servisni zapis' : 'Dodaj servisni zapis'}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord
                ? 'Ažurirajte informacije o servisu'
                : 'Unesite detalje o servisu vozila'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Datum servisa"
                id="serviceDate"
                error={errors.serviceDate}
                required
              >
                <Input
                  id="serviceDate"
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceDate: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Kilometraža"
                id="mileage"
                error={errors.mileage}
              >
                <Input
                  id="mileage"
                  type="number"
                  placeholder="Unesite kilometražu"
                  value={formData.mileage}
                  onChange={(e) =>
                    setFormData({ ...formData, mileage: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Tip servisa"
                id="serviceType"
                error={errors.serviceType}
                required
                className="md:col-span-2"
              >
                <Input
                  id="serviceType"
                  placeholder="npr. Redovni servis, Popravka kočnica"
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Opis"
                id="description"
                error={errors.description}
                className="md:col-span-2"
              >
                <Textarea
                  id="description"
                  placeholder="Detaljan opis servisa..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Sljedeći servis (km)"
                id="nextServiceKm"
                error={errors.nextServiceKm}
              >
                <Input
                  id="nextServiceKm"
                  type="number"
                  placeholder="npr. 50000"
                  value={formData.nextServiceKm}
                  onChange={(e) =>
                    setFormData({ ...formData, nextServiceKm: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Sljedeći servis (datum)"
                id="nextServiceDate"
                error={errors.nextServiceDate}
              >
                <Input
                  id="nextServiceDate"
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nextServiceDate: e.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Cijena" id="cost" error={errors.cost}>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                />
              </FormField>
            </div>

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
                  : selectedRecord
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
            <AlertDialogTitle>Obrisati servisni zapis?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati ovaj servisni zapis? Ova
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
