import React, { useState, useEffect } from 'react';
import { XIcon, UserAddIcon } from '@heroicons/react/solid';
import { Card, CardHeader, Button, FormField } from '../../UI';
import CustomerPhotoFieldSupabase from '../CustomerPhotoFieldSupabase';
import { Customer } from '../../../types/Customer';
import { getCountries, CountryOption } from '../../../services/customerService';

import './CreateCustomerForm.css';
import CountryDropdown from './CountryDropdown';
import PhoneNumberField from './PhoneNumberField';

interface CreateCustomerFormProps {
  onSave: (customerData: Customer) => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string | null;
}

const CreateCustomerForm: React.FC<CreateCustomerFormProps> = ({
  onSave,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Customer>({
    id: '',
    name: '',
    driverLicenseNumber: '',
    passportNumber: '',
    email: '',
    phoneNumber: '',
    address: '',
    countryOfOrigin: '',
    drivingLicensePhotoUrl: '',
    passportPhotoUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Countries state
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        setCountriesError(null);
        const countriesData = await getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
        setCountriesError('Greška pri učitavanju zemalja');
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof Customer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle Supabase photo changes with uploaded URLs
  const handlePhotoChange = (
    field: 'drivingLicensePhotoUrl' | 'passportPhotoUrl', 
    uploadedUrl: string | null
  ) => {
    // Update form data with the uploaded URL
    handleInputChange(field, uploadedUrl || '');

    // Clear any photo-related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Ime je obavezno';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format nije valjan';
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Broj telefona je obavezan';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Adresa je obavezna';
    }

    if (!formData.countryOfOrigin?.trim()) {
      newErrors.countryOfOrigin = 'Zemlja porekla je obavezna';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a temporary ID for the customer (in real app, this would come from backend)
      const customerId = `temp_${Date.now()}`;
      
      // Create customer data with Firebase URLs
      const customerData: Customer = {
        ...formData,
        id: customerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onSave(customerData);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Greška pri čuvanju kupca. Molimo pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="edit-customer-form-overlay">
      <Card className="edit-customer-form-card" size="lg">
        <CardHeader
          title="Dodaj novog kupca"
          subtitle="Unesite podatke za novog kupca"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              leftIcon={<XIcon />}
              disabled={isSubmitting}
            >
              Zatvori
            </Button>
          }
        />

        <div className="edit-customer-form-content">
          <form onSubmit={handleSubmit} className="edit-customer-form">
            <div className="form-sections">
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="form-section__title">Lični podaci</h3>
                
                <div className="form-row form-row--single">
                  <FormField
                    label="Ime i prezime"
                    required
                    error={errors.name}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Unesite ime i prezime"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Email adresa"
                    required
                    error={errors.email}
                  >
                    <input
                      type="email"
                      className="ui-input"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Unesite email adresu"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Broj telefona"
                    required
                    error={errors.phoneNumber}
                  >
                    <PhoneNumberField
                      countries={countries}
                      value={formData.phoneNumber || ''}
                      onChange={(value) => handleInputChange('phoneNumber', value)}
                      loading={loadingCountries}
                      error={countriesError}
                      placeholder="61123456"
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Adresa"
                    error={errors.address}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Unesite adresu"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Zemlja porijekla"
                    required
                    error={errors.countryOfOrigin}
                  >
                    <CountryDropdown
                      countries={countries}
                      selectedCountry={formData.countryOfOrigin || ''}
                      onSelect={(countryName) => handleInputChange('countryOfOrigin', countryName)}
                      loading={loadingCountries}
                      error={countriesError || errors.countryOfOrigin}
                    />
                  </FormField>
                </div>
              </div>

              {/* Documents Section */}
              <div className="form-section">
                <h3 className="form-section__title">Dokumenti</h3>
                <div className="form-row">
                  <FormField
                    label="Broj vozačke dozvole"
                    error={errors.driverLicenseNumber}
                    className="form-field"
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.driverLicenseNumber}
                      onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)}
                      placeholder="Unesite broj vozačke dozvole"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Broj pasoša"
                    error={errors.passportNumber}
                    className="form-field"
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                      placeholder="Unesite broj pasoša"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <CustomerPhotoFieldSupabase
                    label="Slika vozačke dozvole"
                    value={formData.drivingLicensePhotoUrl}
                    onChange={(url) => handlePhotoChange('drivingLicensePhotoUrl', url)}
                    customerId={formData.id || 'temp'}
                    documentType="license"
                    disabled={isSubmitting}
                  />

                  <CustomerPhotoFieldSupabase
                    label="Slika pasoša"
                    value={formData.passportPhotoUrl}
                    onChange={(url) => handlePhotoChange('passportPhotoUrl', url)}
                    customerId={formData.id || 'temp'}
                    documentType="passport"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                className="form-action-btn"
              >
                Otkaži
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="form-action-btn form-action-btn-primary"
              >
                {isSubmitting ? 'Čuvanje...' : 'Sačuvaj kupca'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateCustomerForm;