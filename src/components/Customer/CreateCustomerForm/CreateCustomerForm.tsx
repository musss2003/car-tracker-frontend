'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import {
  XIcon,
  UserAddIcon,
  ExclamationCircleIcon,
  PhotographIcon,
} from '@heroicons/react/solid';
import './CreateCustomerForm.css';
import { Customer } from '../../../types/Customer';
import { getCountries, CountryOption } from '../../../services/customerService';

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
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        setCountriesError(null);
        const countryList = await getCountries();
        setCountries(countryList);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load countries';
        console.error('Failed to load countries:', errorMessage);
        setCountriesError(errorMessage);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown')) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search term
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (countryName: string) => {
    setFormData((prev) => ({ ...prev, countryOfOrigin: countryName }));
    setIsDropdownOpen(false);
    setSearchTerm('');

    if (errors.countryOfOrigin) {
      setErrors((prev) => ({ ...prev, countryOfOrigin: null }));
    }
  };

  // Handle form field changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Required driver license number
    if (!formData.driverLicenseNumber?.trim()) {
      newErrors.driverLicenseNumber = 'Driver license number is required';
    }

    // Required passport number
    if (!formData.passportNumber?.trim()) {
      newErrors.passportNumber = 'Passport number is required';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (
      formData.phoneNumber &&
      !/^\+?[0-9\s-()]{7,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error creating customer:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to create customer. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-customer-form-container">
        <div className="form-header">
          <h2>Add New Customer</h2>
          <button type="button" className="close-button" onClick={onCancel}>
            <XIcon className="icon" />
          </button>
        </div>

        {errors.submit && (
          <div className="global-error">
            <ExclamationCircleIcon className="error-icon" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-customer-form">
          <div className="form-sections">
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-row">
                <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="name">
                    Full Name <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer's full name"
                  />
                  {errors.name && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="countryOfOrigin">Country of Origin</label>
                  <div className="custom-dropdown" style={{ position: 'relative' }}>
                    <div
                      className="dropdown-trigger"
                      onClick={() => !loadingCountries && !countriesError && setIsDropdownOpen(!isDropdownOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: loadingCountries ? '#f5f5f5' : '#fff',
                        cursor: loadingCountries || countriesError ? 'not-allowed' : 'pointer',
                        minHeight: '44px',
                        fontSize: '14px'
                      }}
                    >
                      {loadingCountries ? (
                        <span style={{ color: '#666' }}>Loading countries...</span>
                      ) : countriesError ? (
                        <span style={{ color: '#dc3545' }}>Error loading countries</span>
                      ) : formData.countryOfOrigin ? (
                        <>
                          <img
                            src={`https://flagcdn.com/w20/${countries.find(c => c.name === formData.countryOfOrigin)?.code.toLowerCase()}.png`}
                            alt=""
                            style={{
                              width: '20px',
                              height: '15px',
                              marginRight: '8px'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <span>{formData.countryOfOrigin}</span>
                        </>
                      ) : (
                        <span style={{ color: '#999' }}>Select country</span>
                      )}
                      <span style={{ marginLeft: 'auto', color: '#666' }}>▼</span>
                    </div>

                    {isDropdownOpen && !loadingCountries && !countriesError && (
                      <div
                        className="dropdown-menu"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <div style={{ padding: '8px' }}>
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredCountries.map((country) => (
                          <div
                            key={country.code}
                            className="dropdown-option"
                            onClick={() => handleCountrySelect(country.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <img
                              src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                              alt={`${country.name} flag`}
                              style={{
                                width: '20px',
                                height: '15px',
                                marginRight: '8px'
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <span>{country.name}</span>
                          </div>
                        ))}
                        {filteredCountries.length === 0 && searchTerm && (
                          <div style={{ 
                            padding: '12px', 
                            color: '#666', 
                            textAlign: 'center' 
                          }}>
                            No countries found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {countriesError && (
                    <div
                      className="error-message"
                      style={{
                        fontSize: '12px',
                        color: '#dc3545',
                        marginTop: '4px',
                      }}
                    >
                      ⚠️ {countriesError}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          const fetchCountries = async () => {
                            try {
                              setLoadingCountries(true);
                              setCountriesError(null);
                              const countryList = await getCountries();
                              setCountries(countryList);
                            } catch (error) {
                              const errorMessage =
                                error instanceof Error
                                  ? error.message
                                  : 'Failed to load countries';
                              setCountriesError(errorMessage);
                            } finally {
                              setLoadingCountries(false);
                            }
                          };
                          fetchCountries();
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '0',
                          marginLeft: '4px',
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div
                  className={`form-field ${
                    errors.driverLicenseNumber ? 'has-error' : ''
                  }`}
                >
                  <label htmlFor="driverLicenseNumber">
                    Driver License Number{' '}
                    <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="driverLicenseNumber"
                    name="driverLicenseNumber"
                    value={formData.driverLicenseNumber}
                    onChange={handleChange}
                    placeholder="Enter driver license number"
                  />
                  {errors.driverLicenseNumber && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors.driverLicenseNumber}</span>
                    </div>
                  )}
                </div>

                <div
                  className={`form-field ${
                    errors.passportNumber ? 'has-error' : ''
                  }`}
                >
                  <label htmlFor="passportNumber">
                    Passport Number <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    placeholder="Enter passport number"
                  />
                  {errors.passportNumber && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors.passportNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="form-row">
                <div
                  className={`form-field ${errors.email ? 'has-error' : ''}`}
                >
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div
                  className={`form-field ${errors.phoneNumber ? 'has-error' : ''}`}
                >
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter customer's address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Document Photos (Optional)</h3>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="drivingLicensePhotoUrl">
                    Driver License Photo URL
                  </label>
                  <input
                    type="url"
                    id="drivingLicensePhotoUrl"
                    name="drivingLicensePhotoUrl"
                    value={formData.drivingLicensePhotoUrl}
                    onChange={handleChange}
                    placeholder="Enter URL for driver license photo"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="passportPhotoUrl">Passport Photo URL</label>
                  <input
                    type="url"
                    id="passportPhotoUrl"
                    name="passportPhotoUrl"
                    value={formData.passportPhotoUrl}
                    onChange={handleChange}
                    placeholder="Enter URL for passport photo"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-small"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserAddIcon className="button-icon" />
                  Create Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
};

export default CreateCustomerForm;
