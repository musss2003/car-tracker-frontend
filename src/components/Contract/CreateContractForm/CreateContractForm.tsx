'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  PlusCircle,
  Truck,
  User,
  X,
  DollarSign,
} from 'lucide-react';
import { Customer } from '@/types/Customer';
import { Car } from '@/types/Car';
import { getAvailableCarsForPeriod } from '@/services/carService';
import { ContractFormData } from '@/types/Contract';
import { getCustomers } from '@/services/customerService';
import { createAndDownloadContract } from '@/services/contractService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadDocument } from '@/services/uploadService';

const CreateContractForm = ({}) => {
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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

    const fetchAvailableCars = async () => {
      // Only fetch if both dates are selected
      if (!formData.startDate || !formData.endDate) {
        setCars([]);
        return;
      }

      const availableCars = await getAvailableCarsForPeriod(
        formData.startDate,
        formData.endDate
      );
      setCars(availableCars);

      if (formData.carId) {
        const selectedCar = availableCars.find(
          (car) => car.id === formData.carId
        );
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
    };

    fetchAvailableCars();
  }, [formData.startDate, formData.endDate, formData.carId]);

  const handleChange = (field: keyof ContractFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };

    // Validate dates
    if (newFormData.startDate && newFormData.endDate) {
      const start = new Date(newFormData.startDate);
      const end = new Date(newFormData.endDate);

      if (end < start) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'End date must be after start date',
        }));
        return;
      }
    }

    handleChange(field, value);
  };

  const handleCreateContract = async (newContractData: ContractFormData) => {
    try {
      await createAndDownloadContract(newContractData);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract');
    }
  };

  const handleClose = () => {
    navigate('/contracts');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.carId) {
      newErrors.carId = 'Car is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload photo first if selected

      let photoFilename = formData.photoUrl;

      if (photoFile) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          // Photo upload failed, don't proceed
          return;
        }
        photoFilename = uploadedFilename;
      }

      const contractData: ContractFormData = {
        ...formData,
        photoUrl: photoFilename,
        customerId: formData.customerId || '',
        carId: formData.carId || '',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        dailyRate:
          formData.dailyRate !== undefined
            ? parseFloat(String(formData.dailyRate))
            : 0,
        totalAmount:
          formData.totalAmount !== undefined
            ? parseFloat(String(formData.totalAmount))
            : 0,
        additionalNotes: formData.additionalNotes || '',
      };

      await handleCreateContract(contractData);

    } catch (error) {
      console.error('Error creating contract:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to create contract. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.photoUrl;
      return newErrors;
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BAM',
    }).format(amount);
  };

  // Upload photo to server
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    try {
      const filename = await uploadDocument(photoFile);
      // Clear any previous photo upload errors
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
        photoUrl: 'Neuspješno dodavanje fotografije. Molimo pokušajte ponovo.',
      }));
      return null;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedCar = cars.find((car) => car.id === formData.carId);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="w-5 h-5" /> Create Contract
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Customer
              </Label>
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

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Start Date
                </Label>
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
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  min={formData.startDate || today}
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Car Selection */}
            <div className="space-y-2">
              <Label htmlFor="carId" className="flex items-center gap-2">
                <Truck className="w-4 h-4" /> Car
              </Label>
              <Select
                value={formData.carId}
                onValueChange={(value) => handleChange('carId', value)}
              >
                <SelectTrigger id="carId">
                  <SelectValue placeholder="Select a car" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.manufacturer} {car.model} ({car.year}) -{' '}
                      {formatCurrency(car.pricePerDay)}/day
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
              <div className="p-4 bg-muted rounded-lg space-y-2">
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

            {/* Photo Upload */}
            <PhotoUpload
              value={photoFile}
              onChange={(file) => handlePhotoChange(file)}
              error={errors.photoUrl}
              disabled={isSubmitting}
            />

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="additionalNotes"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Additional Notes (Optional)
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

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" /> Create Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateContractForm;
