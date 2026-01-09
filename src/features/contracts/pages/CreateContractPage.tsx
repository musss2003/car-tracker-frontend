'use client';
import { logError } from '@/shared/utils/logger';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { FormSection } from '@/shared/components/ui/form-section';
import { FormField } from '@/shared/components/ui/form-field';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { CustomerSearchSelect } from '@/shared/components/ui/customer-search-select';
import { DateRangeValidator } from '@/shared/components/ui/date-range-validator';
import { CarAvailabilitySelect } from '@/shared/components/ui/car-availability-select';
import {
  FileText,
  User,
  Camera,
  X,
  Loader2,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ContractFormData } from '../types/contract.types';
import { Customer, getCustomers } from '@/features/customers';
import { usePhotoUpload } from '@/shared/hooks/usePhotoUpload';
import { createAndDownloadContract } from '../services/contractService';
import { PhotoUpload } from '@/shared/components/ui/photo-upload';

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
  const [hasInvalidDateRange, setHasInvalidDateRange] = useState(false);

  // Use the custom hooks
  const {
    photoFile,
    setPhotoFile,
    uploadPhoto,
    error: photoError,
  } = usePhotoUpload();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        logError('Error fetching customers:', error);
        toast.error('Učitavanje kupaca nije uspjelo');
      }
    };

    fetchCustomers();
  }, []); // Remove unnecessary dependencies

  // Validate date range (start date must not be after end date, but can be same day)
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      setHasInvalidDateRange(end < start);
    } else {
      setHasInvalidDateRange(false);
    }
  }, [formData.startDate, formData.endDate]);

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
    handleChange(field, value);
  };

  const handleCreateContract = async (
    newContractData: ContractFormData
  ): Promise<boolean> => {
    try {
      const contract = await createAndDownloadContract(newContractData);
      if (!contract) {
        toast.error('Neuspješno kreiranje ugovora');
        return false;
      }
      return true;
    } catch (error) {
      logError('Error creating contract:', error);
      toast.error('Neuspješno kreiranje ugovora');
      return false;
    }
  };

  const handleClose = () => {
    navigate('/contracts');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Kupac je obavezan';
    }

    if (!formData.carId) {
      newErrors.carId = 'Automobil je obavezan';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Datum početka je obavezan';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Datum završetka je obavezan';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        newErrors.endDate = 'Datum završetka mora biti nakon datuma početka';
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
          setIsSubmitting(false);
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

      const result = await handleCreateContract(contractData);

      // Only navigate if contract was created successfully
      if (result !== false) {
        toast.success('Ugovor uspješno kreiran');
        handleClose();
      }
    } catch (error) {
      logError('Error creating contract:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Kreiranje ugovora nije uspjelo. Molimo pokušajte ponovo.',
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Kreiraj ugovor"
        subtitle="Popunite detalje kako biste kreirali novi ugovor o iznajmljivanju"
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
              Otkaži
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.customerId ||
                !formData.carId ||
                hasInvalidDateRange
              }
              form="contract-form"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kreiranje...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Kreiraj ugovor
                </>
              )}
            </Button>
          </>
        }
      />

      {/* Form Section */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="w-full p-6">
          <form
            id="contract-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="w-full">
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
                    disabled={isSubmitting}
                  />
                </FormField>
              </FormSection>
            </div>

            <div className="w-full">
              <DateRangeValidator
                startDate={formData.startDate}
                endDate={formData.endDate}
                onStartDateChange={(date) =>
                  handleDateChange('startDate', date)
                }
                onEndDateChange={(date) => handleDateChange('endDate', date)}
                startDateError={errors.startDate}
                endDateError={errors.endDate}
                disabled={isSubmitting}
              />
            </div>

            <div className="w-full">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <div className="w-full">
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
                      rows={12}
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        handleChange('additionalNotes', e.target.value)
                      }
                    />
                  </FormField>
                </FormSection>
              </div>

              <div className="w-full">
                <FormSection
                  title="Slika ugovora"
                  icon={<Camera className="w-5 h-5" />}
                >
                  <PhotoUpload
                    value={photoFile}
                    onChange={(file) => handlePhotoChange(file)}
                    error={errors.photoUrl}
                    disabled={isSubmitting}
                  />
                </FormSection>
              </div>
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
