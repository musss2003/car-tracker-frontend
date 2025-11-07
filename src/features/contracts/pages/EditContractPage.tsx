'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  X,
  Save,
  User,
  FileText,
  Camera,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Toast } from '@/shared/components/ui/toast';
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
import { CustomerSearchSelect } from '@/shared/components/ui/customer-search-select';
import { DateRangeValidator } from '@/shared/components/ui/date-range-validator';
import { CarAvailabilitySelect } from '@/shared/components/ui/car-availability-select';
import { FormSection } from '@/shared/components/ui/form-section';
import { FormField } from '@/shared/components/ui/form-field';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { useNavigate, useParams } from 'react-router-dom';
import { ContractFormData } from '../types/contract.types';
import { Customer, getCustomers } from '@/features/customers';
import { Car, getCar, getCarAvailability } from '@/features/cars';
import { getContract, updateContract } from '../services/contractService';
import { usePhotoUpload } from '@/shared/hooks/usePhotoUpload';

export default function EditContractPage() {
  const params = useParams();
  const navigate = useNavigate();
  const contractId = params.id as string;

  const [formData, setFormData] = useState<ContractFormData>({
    customerId: '',
    carId: '',
    startDate: '',
    endDate: '',
    dailyRate: 0,
    totalAmount: 0,
    additionalNotes: '',
    photoUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [carBookings, setCarBookings] = useState<any[]>([]);
  const [hasDateConflict, setHasDateConflict] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Use the custom hook
  const {
    photoFile,
    setPhotoFile,
    uploadPhoto,
    error: photoError,
  } = usePhotoUpload();

  // Fetch contract data
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const data = await getContract(contractId);

        setFormData({
          customerId: data.customerId,
          carId: data.carId,
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          endDate: new Date(data.endDate).toISOString().split('T')[0],
          dailyRate: data.dailyRate,
          totalAmount: data.totalAmount,
          additionalNotes: data.additionalNotes || '',
          photoUrl: data.photoUrl,
        });

        if (data.carId) {
          try {
            const carData = await getCar(data.carId);
            setCurrentCar(carData);
          } catch (err) {
            console.error('Error fetching car:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('Učitavanje ugovora nije uspjelo. Molimo pokušajte ponovo.');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch car bookings when car is selected
  useEffect(() => {
    const fetchCarBookings = async () => {
      if (!formData.carId) {
        setCarBookings([]);
        return;
      }

      try {
        const car = await getCar(formData.carId);
        if (car?.licensePlate) {
          const bookings = await getCarAvailability(car.licensePlate);
          setCarBookings(bookings);
        }
      } catch (error) {
        console.error('Error fetching car bookings:', error);
      }
    };

    fetchCarBookings();
  }, [formData.carId]);

  // Validate dates against car bookings
  useEffect(() => {
    if (
      !formData.carId ||
      !formData.startDate ||
      !formData.endDate ||
      carBookings.length === 0
    ) {
      setHasDateConflict(false);
      return;
    }

    const selectedStart = new Date(formData.startDate);
    const selectedEnd = new Date(formData.endDate);

    // Check for conflicts with existing bookings (excluding current contract)
    const hasConflict = carBookings.some((booking) => {
      // Skip the current contract being edited
      if (booking.contractId === contractId) {
        return false;
      }

      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);

      // Check if dates overlap
      return (
        (selectedStart >= bookingStart && selectedStart < bookingEnd) ||
        (selectedEnd > bookingStart && selectedEnd <= bookingEnd) ||
        (selectedStart <= bookingStart && selectedEnd >= bookingEnd)
      );
    });

    setHasDateConflict(hasConflict);
  }, [
    formData.startDate,
    formData.endDate,
    formData.carId,
    carBookings,
    contractId,
  ]);

  const handleChange = (
    field: keyof ContractFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsUpdated(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };

    if (newFormData.startDate && newFormData.endDate) {
      const start = new Date(newFormData.startDate);
      const end = new Date(newFormData.endDate);

      if (end <= start) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'Datum završetka mora biti nakon datuma početka',
        }));
        return;
      }

      // Check if the new date range conflicts with existing bookings
      if (formData.carId && carBookings.length > 0) {
        const selectedStart = start;
        const selectedEnd = end;

        const wouldConflict = carBookings.some((booking) => {
          if (booking.contractId === contractId) {
            return false;
          }

          const bookingStart = new Date(booking.start);
          const bookingEnd = new Date(booking.end);

          return (
            (selectedStart >= bookingStart && selectedStart < bookingEnd) ||
            (selectedEnd > bookingStart && selectedEnd <= bookingEnd) ||
            (selectedStart <= bookingStart && selectedEnd >= bookingEnd)
          );
        });

        if (wouldConflict) {
          // Don't update the date if it would cause a conflict
          setToastMessage('Ne mogu se odabrati ovi datumi - automobil je već rezervisan');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          return;
        }
      }
    }

    handleChange(field, value);
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setIsUpdated(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.photoUrl;
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = 'Kupac je obavezan';
    if (!formData.carId) newErrors.carId = 'Automobil je obavezan';
    if (!formData.startDate) newErrors.startDate = 'Datum početka je obavezan';
    if (!formData.endDate) newErrors.endDate = 'Datum završetka je obavezan';

    // Check for date conflicts
    if (hasDateConflict) {
      newErrors.dates = 'Odabrani datumi se sukobljavaju sa postojećim rezervacijama';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let photoFilename = formData.photoUrl;

      if (photoFile) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          return;
        }
        photoFilename = uploadedFilename;
      }

      const updatedContract = {
        customerId: formData.customerId,
        carId: formData.carId,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        dailyRate: Number(formData.dailyRate),
        totalAmount: Number(formData.totalAmount),
        additionalNotes: formData.additionalNotes || undefined,
        photoUrl: photoFilename,
      };

      await updateContract(contractId, updatedContract);
      navigate('/contracts');
    } catch (err) {
      console.error('Error updating contract:', err);
      setError('Ažuriranje ugovora nije uspjelo. Molimo pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState text="Učitavanje ugovora..." />;
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-semibold">Greška</h1>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/contracts')}>
                Nazad na ugovore
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Uredi ugovor"
        subtitle="Ažurirajte detalje ugovora"
        onBack={() => navigate('/contracts')}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contracts')}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Otkaži
            </Button>
            <Button
              type="submit"
              disabled={submitting || !isUpdated || hasDateConflict}
              form="edit-contract-form"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sačuvaj promjene
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="mx-auto p-6">
          <form
            id="edit-contract-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <FormSection
              title="Informacije o kupcu"
              icon={<User className="w-5 h-5" />}
            >
              <FormField
                label="Kupac"
                id="customerId"
                error={errors.customerId}
                required
              >
                <CustomerSearchSelect
                  value={formData.customerId}
                  onChange={(value) => handleChange('customerId', value)}
                  customers={customers}
                  disabled={submitting}
                />
              </FormField>
            </FormSection>

            <DateRangeValidator
              startDate={formData.startDate}
              endDate={formData.endDate}
              onStartDateChange={(date) => handleDateChange('startDate', date)}
              onEndDateChange={(date) => handleDateChange('endDate', date)}
              startDateError={errors.startDate}
              endDateError={errors.endDate}
              disabled={submitting}
              checkConflicts
              existingBookings={carBookings}
              currentBookingId={contractId}
              onConflictDetected={(hasConflict, message) => {
                setHasDateConflict(hasConflict);
                if (hasConflict && message) {
                  setToastMessage(message);
                  setShowToast(true);
                }
              }}
            />

            <CarAvailabilitySelect
              value={formData.carId}
              onChange={(carId) => handleChange('carId', carId)}
              startDate={formData.startDate}
              endDate={formData.endDate}
              currentCar={currentCar}
              error={errors.carId}
              required
              onPriceCalculated={(dailyRate, totalAmount) => {
                setFormData((prev) => ({ ...prev, dailyRate, totalAmount }));
              }}
              showPricingSummary
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSection
                title="Dodatne informacije"
                icon={<FileText className="w-5 h-5" />}
              >
                <FormField
                  label="Dodatne napomene"
                  id="additionalNotes"
                  helperText="Bilo kakve dodatne napomene ili posebni uslovi"
                >
                  <Textarea
                    id="additionalNotes"
                    placeholder="Unesite dodatne napomene..."
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleChange('additionalNotes', e.target.value)
                    }
                  />
                </FormField>
              </FormSection>

              <FormSection
                title="Slika ugovora"
                icon={<Camera className="w-5 h-5" />}
              >
                <PhotoUpload
                  value={photoFile}
                  onChange={handlePhotoChange}
                  error={errors.photoUrl}
                  disabled={submitting}
                  existingPhotoUrl={formData.photoUrl}
                />
              </FormSection>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast variant="destructive" onClose={() => setShowToast(false)}>
          {toastMessage}
        </Toast>
      )}
    </div>
  );
}
