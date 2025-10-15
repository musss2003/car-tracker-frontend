import React, { useState, useEffect } from 'react';
import { XIcon, SaveIcon } from '@heroicons/react/solid';
import { Card, CardHeader, Button, FormField, FormActions } from '../../UI';
import CustomerPhotoField from '../shared/CustomerPhotoField';
import CountryDropdown from '../shared/CountryDropdown';
import PhoneNumberField from '../shared/PhoneNumberField';
import MunicipalityDropdown from '../shared/MunicipalityDropdown';
import { Customer } from '../../../types/Customer';
import { getCountries, CountryOption } from '../../../services/customerService';
import './EditCustomerForm.css';

interface EditCustomerFormProps {
  customer: Customer;
  onSave: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string | null;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({
  customer,
  onSave,
  onCancel,
}) => {
  // Form state - initialize with customer data
  const [formData, setFormData] = useState<Customer>({
    ...customer,
    // Ensure backward compatibility
    name: customer.name || (customer as any).name || '',
    email: customer.email || (customer as any).email || '',
    phoneNumber: customer.phoneNumber || (customer as any).phone_number || '',
    address: customer.address || (customer as any).address || '',
    driverLicenseNumber: customer.driverLicenseNumber || (customer as any).driver_license_number || '',
    passportNumber: customer.passportNumber || (customer as any).passport_number || '',
    countryOfOrigin: customer.countryOfOrigin || (customer as any).country_of_origin || '',
    drivingLicensePhotoUrl: customer.drivingLicensePhotoUrl || (customer as any).driving_license_photo_url || '',
    passportPhotoUrl: customer.passportPhotoUrl || (customer as any).passport_photo_url || '',
    fatherName: customer.fatherName || (customer as any).father_name || '',
    cityOfResidence: customer.cityOfResidence || (customer as any).city_of_residence || '',
    idOfPerson: customer.idOfPerson || (customer as any).id_of_person || '',
  });

  // Track which fields have been modified
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

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
    
    // Track modified fields
    setModifiedFields(prev => new Set(prev).add(field));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };


  const handlePhotoChange = (field: 'drivingLicensePhotoUrl' | 'passportPhotoUrl', uploadedUrl: string | null) => {
    handleInputChange(field, uploadedUrl || '');
  };

  // Check if form has been modified
  const hasChanges = modifiedFields.size > 0;

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Ime je obavezno';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
      // Update the updatedAt timestamp
      const updatedCustomer = {
        ...formData,
        updatedAt: new Date(),
      };
      
      await onSave(updatedCustomer);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-customer-form-overlay">
      <Card className="edit-customer-form-card" size="lg">
        <CardHeader
          title="Uredi korisnika"
          subtitle={`Izmjeni podatke za: ${formData.name || 'N/A'}`}
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

        <div className="edit-customer-form-content">
          {!hasChanges && (
            <div className="no-changes-notice">
              <p>Napravite izmjene u poljima ispod da bi se omogućilo čuvanje.</p>
            </div>
          )}

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
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Unesite ime i prezime"
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
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="example@email.com"
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
                      value={formData.address || ''}
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

              {/* Bosnia and Herzegovina Additional Fields */}
              {formData.countryOfOrigin === 'Bosnia and Herzegovina' && (
                <div className="form-section">
                  <h3 className="form-section__title">Dodatni podaci za državljane BiH</h3>
                  
                  <div className="form-row form-row--single">
                    <FormField
                      label="Ime oca"
                      error={errors.fatherName}
                    >
                      <input
                        type="text"
                        className="ui-input"
                        value={formData.fatherName || ''}
                        onChange={(e) => handleInputChange('fatherName', e.target.value)}
                        placeholder="Unesite ime oca"
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField
                      label="Grad prebivališta"
                      error={errors.cityOfResidence}
                    >
                      <MunicipalityDropdown
                        selectedMunicipality={formData.cityOfResidence || ''}
                        onSelect={(municipalityName) => handleInputChange('cityOfResidence', municipalityName)}
                        placeholder="Izaberite grad prebivališta"
                        disabled={isSubmitting}
                      />
                    </FormField>

                    <FormField
                      label="JMBG"
                      error={errors.idOfPerson}
                    >
                      <input
                        type="text"
                        className="ui-input"
                        value={formData.idOfPerson || ''}
                        onChange={(e) => handleInputChange('idOfPerson', e.target.value)}
                        placeholder="Unesite JMBG"
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Documents Section */}
              <div className="form-section">
                <h3 className="form-section__title">Dokumenti</h3>
                
                <div className="form-row">
                  <FormField
                    label="Broj vozačke dozvole"
                    error={errors.driverLicenseNumber}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.driverLicenseNumber || ''}
                      onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)}
                      placeholder="Unesite broj vozačke dozvole"
                    />
                  </FormField>

                  <FormField
                    label="Broj pasoša"
                    error={errors.passportNumber}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.passportNumber || ''}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                      placeholder="Unesite broj pasoša"
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <CustomerPhotoField
                    label="Slika vozačke dozvole"
                    value={formData.drivingLicensePhotoUrl}
                    onChange={(url) => handlePhotoChange('drivingLicensePhotoUrl', url)}
                    customerId={customer.id}
                    documentType="license"
                    disabled={isSubmitting}
                  />

                  <CustomerPhotoField
                    label="Slika pasoša"
                    value={formData.passportPhotoUrl}
                    onChange={(url) => handlePhotoChange('passportPhotoUrl', url)}
                    customerId={customer.id}
                    documentType="passport"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <FormActions alignment="right" withBorder={true}>
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
                disabled={!hasChanges}
                leftIcon={<SaveIcon />}
              >
                {isSubmitting ? 'Čuvanje...' : 'Sačuvaj izmjene'}
              </Button>
            </FormActions>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EditCustomerForm;