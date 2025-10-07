import React, { useState, useEffect } from 'react';
import { XIcon, UserAddIcon } from '@heroicons/react/solid';
import { Card, CardHeader, Button, FormField } from '../../UI';
import { CustomerPhotoField } from '../shared';
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
        const countriesData = await getCountries();
        setCountries(countriesData);
        setCountriesError(null);
      } catch (error) {
        console.error('Error loading countries:', error);
        setCountriesError('Greška pri učitavanju lista zemalja');
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Handle input changes
  const handleInputChange = (field: keyof Customer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle photo changes
  const handlePhotoChange = (field: 'drivingLicensePhotoUrl' | 'passportPhotoUrl', file: File | null) => {
    if (file) {
      // In real app, you would upload the file and get URL
      const fakeUrl = URL.createObjectURL(file);
      handleInputChange(field, fakeUrl);
    } else {
      handleInputChange(field, '');
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

    if (!formData.countryOfOrigin?.trim()) {
      newErrors.countryOfOrigin = 'Zemlja porijekla je obavezna';
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
      await onSave(formData);
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-customer-form-overlay">
      <Card className="create-customer-form-card" size="lg">
        <CardHeader
          title="Dodaj novog korisnika"
          subtitle="Unesite podatke o novom korisniku"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              leftIcon={<XIcon />}
            >
              Zatvori
            </Button>
          }
        />

        <div className="create-customer-form-content">
          <form onSubmit={handleSubmit} className="create-customer-form">
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
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Email adresa"
                    error={errors.email}
                  >
                    <input
                      type="email"
                      className="ui-input"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="example@email.com"
                    />
                  </FormField>

                  <FormField
                    label="Broj telefona"
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
                      onSelect={(country: string) => handleInputChange('countryOfOrigin', country)}
                      loading={loadingCountries}
                      error={countriesError}
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
                    required
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.driverLicenseNumber}
                      onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)}
                      placeholder="Unesite broj vozačke dozvole"
                    />
                  </FormField>

                  <FormField
                    label="Broj pasoša"
                    error={errors.passportNumber}
                    required
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                      placeholder="Unesite broj pasoša"
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <CustomerPhotoField
                    label="Slika vozačke dozvole"
                    photoUrl={formData.drivingLicensePhotoUrl}
                    onFileChange={(file) => handlePhotoChange('drivingLicensePhotoUrl', file)}
                    error={errors.drivingLicensePhotoUrl}
                  />

                  <CustomerPhotoField
                    label="Slika pasoša"
                    photoUrl={formData.passportPhotoUrl}
                    onFileChange={(file) => handlePhotoChange('passportPhotoUrl', file)}
                    error={errors.passportPhotoUrl}
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
              >
                Otkaži
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<UserAddIcon />}
              >
                {isSubmitting ? 'Čuvanje...' : 'Sačuvaj korisnika'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateCustomerForm;