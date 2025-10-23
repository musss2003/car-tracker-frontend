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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { getContract, updateContract } from '@/services/contractService';
import { getCustomers } from '@/services/customerService';
import { getAvailableCarsForPeriod } from '@/services/carService';
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
    photoUrl: ''
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

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading contract...</p>
        </div>
      </div>
    );
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

  const today = new Date().toISOString().split('T')[0];
  const allCars = currentCar
    ? [currentCar, ...availableCars.filter((car) => car.id !== currentCar.id)]
    : availableCars;
  const selectedCar = allCars.find((car) => car.id === formData.carId);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Edit Contract
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contracts')}
            disabled={submitting}
            className="flex items-center gap-2 bg-transparent"
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-background border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => handleChange('customerId', value)}
                >
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customerId}
                  </p>
                )}
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-background border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rental Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={today}
                    value={formData.startDate}
                    onChange={(e) =>
                      handleDateChange('startDate', e.target.value)
                    }
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={(e) =>
                      handleDateChange('endDate', e.target.value)
                    }
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Car Selection */}
            <div className="bg-background border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Vehicle Selection
              </h2>
              <div className="space-y-2">
                <Label htmlFor="carId">Car</Label>
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
                {errors.carId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.carId}
                  </p>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Additional Notes */}
              <div className="bg-background border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Information
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional notes or special conditions..."
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleChange('additionalNotes', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="bg-background border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold">Contract Photo</h2>
                <PhotoUpload
                  value={photoFile}
                  onChange={handlePhotoChange}
                  error={errors.photoUrl}
                  disabled={submitting}
                  existingPhotoUrl={formData.photoUrl}
                />
              </div>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !isUpdated}
                size="lg"
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Update Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
