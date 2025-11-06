'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/ui/form-section';
import { FormField } from '@/components/ui/form-field';
import { LoadingState } from '@/components/ui/loading-state';
import { PageHeader } from '@/components/ui/page-header';
import { CustomerSearchSelect } from '@/components/ui/customer-search-select';
import { DateRangeValidator } from '@/components/ui/date-range-validator';
import { CarAvailabilitySelect } from '@/components/ui/car-availability-select';
import {
  FileText,
  User,
  Camera,
  X,
  Loader2,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import type { Customer } from '@/types/Customer';
import type { ContractFormData } from '@/types/Contract';
import { getCustomers } from '@/services/customerService';
import { createAndDownloadContract } from '@/services/contractService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

const CreateContractPage = ({}) => {
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Use the custom hooks
  const { photoFile, setPhotoFile, uploadPhoto, error: photoError } = usePhotoUpload();

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
            ? Number.parseFloat(String(formData.dailyRate))
            : 0,
        totalAmount:
          formData.totalAmount !== undefined
            ? Number.parseFloat(String(formData.totalAmount))
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
      handleClose();
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Create Contract"
        subtitle="Fill in the details to create a new rental contract"
        onBack={handleClose}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.customerId || !formData.carId}
              form="contract-form"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Contract
                </>
              )}
            </Button>
          </>
        }
      />

      {/* Form Section */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="mx-auto p-4">
          <form id="contract-form" onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            />

            <CarAvailabilitySelect
              value={formData.carId}
              onChange={(carId) => handleChange('carId', carId)}
              startDate={formData.startDate}
              endDate={formData.endDate}
              error={errors.carId}
              required
              onPriceCalculated={(dailyRate, totalAmount) => {
                setFormData((prev) => ({ ...prev, dailyRate, totalAmount }));
              }}
              showPricingSummary
            />

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
                    rows={12}
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
                  onChange={(file) => handlePhotoChange(file)}
                  error={errors.photoUrl}
                  disabled={isSubmitting}
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
    </div>
  );
};

export default CreateContractPage;
