'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  X,
  Save,
  Calendar,
  User,
  Truck,
  FileText,
  DollarSign,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toast } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { CustomerSearchSelect } from '@/components/ui/customer-search-select';
import { FormSection } from '@/components/ui/form-section';
import { FormField } from '@/components/ui/form-field';
import { LoadingState } from '@/components/ui/loading-state';
import { PageHeader } from '@/components/ui/page-header';
import { getContract, updateContract } from '@/services/contractService';
import { getCustomers } from '@/services/customerService';
import { getAvailableCarsForPeriod, getCarAvailability } from '@/services/carService';
import { uploadDocument } from '@/services/uploadService';
import { getCar } from '@/services/carService';
import type { ContractFormData } from '@/types/Contract';
import type { Customer } from '@/types/Customer';
import type { Car } from '@/types/Car';
import formatCurrency from '@/utils/formatCurrency';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [carBookings, setCarBookings] = useState<any[]>([]);
  const [hasDateConflict, setHasDateConflict] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
        setError('Failed to load contract. Please try again.');
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

  // Fetch available cars when dates change
  useEffect(() => {
    const fetchAvailableCars = async () => {
      if (!formData.startDate || !formData.endDate) {
        setAvailableCars([]);
        return;
      }

      try {
        const availableCars = await getAvailableCarsForPeriod(
          formData.startDate,
          formData.endDate
        );

        setAvailableCars(availableCars);

        if (formData.carId) {
          const selectedCar =
            availableCars.find((car) => car.id === formData.carId) ||
            currentCar;
          if (selectedCar) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const days = Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
            const total = days * selectedCar.pricePerDay;

            setFormData((prev) => ({
              ...prev,
              dailyRate: selectedCar.pricePerDay,
              totalAmount: total > 0 ? total : 0,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    fetchAvailableCars();
  }, [formData.startDate, formData.endDate, formData.carId, currentCar]);

  // Fetch car bookings when car is selected
  useEffect(() => {
    const fetchCarBookings = async () => {
      if (!formData.carId) {
        setCarBookings([]);
        return;
      }

      try {
        const car = availableCars.find(c => c.id === formData.carId) || currentCar;
        if (car?.licensePlate) {
          const bookings = await getCarAvailability(car.licensePlate);
          setCarBookings(bookings);
        }
      } catch (error) {
        console.error('Error fetching car bookings:', error);
      }
    };

    fetchCarBookings();
  }, [formData.carId, availableCars, currentCar]);

  // Validate dates against car bookings
  useEffect(() => {
    if (!formData.carId || !formData.startDate || !formData.endDate || carBookings.length === 0) {
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
  }, [formData.startDate, formData.endDate, formData.carId, carBookings, contractId]);

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
          [field]: 'End date must be after start date',
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
          setToastMessage('Cannot select these dates - car is already booked');
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

    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.carId) newErrors.carId = 'Car is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Check for date conflicts
    if (hasDateConflict) {
      newErrors.dates = 'The selected dates conflict with existing bookings';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    try {
      const filename = await uploadDocument(photoFile);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photoUrl;
        return newErrors;
      });
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrors((prev) => ({
        ...prev,
        photoUrl: 'Failed to upload photo. Please try again.',
      }));
      return null;
    }
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
      setError('Failed to update contract. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading contract..." />;
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-semibold">Error</h1>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/contracts')}>
                Back to Contracts
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allCars = currentCar
    ? [currentCar, ...availableCars.filter((car) => car.id !== currentCar.id)]
    : availableCars;
  const selectedCar = allCars.find((car) => car.id === formData.carId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Edit Contract"
        subtitle="Update the contract details"
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !isUpdated || hasDateConflict}
              form="edit-contract-form"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="mx-auto p-6">
          <form id="edit-contract-form" onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Customer Information" icon={<User className="w-5 h-5" />}>
              <FormField
                label="Customer"
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

            <FormSection title="Rental Period" icon={<Calendar className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Start Date"
                  id="startDate"
                  error={errors.startDate}
                  required
                >
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleDateChange('startDate', e.target.value)
                    }
                  />
                </FormField>

                <FormField
                  label="End Date"
                  id="endDate"
                  error={errors.endDate}
                  required
                >
                  <Input
                    id="endDate"
                    type="date"
                    min={formData.startDate}
                    value={formData.endDate}
                    onChange={(e) =>
                      handleDateChange('endDate', e.target.value)
                    }
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Vehicle Selection" icon={<Truck className="w-5 h-5" />}>
              <FormField
                label="Car"
                id="carId"
                error={errors.carId}
                required
              >
                <Select
                  value={formData.carId}
                  onValueChange={(value) => handleChange('carId', value)}
                >
                  <SelectTrigger id="carId">
                    <SelectValue placeholder="Select a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.manufacturer} {car.model} ({car.year}) -{' '}
                        {formatCurrency(car.pricePerDay)}/day
                        {car.id === currentCar?.id &&
                          !availableCars.find((c) => c.id === car.id) && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Current)
                            </span>
                          )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Pricing Summary */}
              {selectedCar && formData.startDate && formData.endDate && (
                <div className="p-4 bg-muted rounded-lg space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Daily Rate:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(formData.dailyRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duration:
                    </span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(formData.endDate).getTime() -
                          new Date(formData.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold">
                      {formatCurrency(formData.totalAmount)}
                    </span>
                  </div>
                </div>
              )}
            </FormSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSection title="Additional Information" icon={<FileText className="w-5 h-5" />}>
                <FormField
                  label="Additional Notes"
                  id="additionalNotes"
                  helperText="Any additional notes or special conditions"
                >
                  <Textarea
                    id="additionalNotes"
                    placeholder="Enter any additional notes..."
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleChange('additionalNotes', e.target.value)
                    }
                  />
                </FormField>
              </FormSection>

              <FormSection title="Contract Photo" icon={<Camera className="w-5 h-5" />}>
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
