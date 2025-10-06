'use client';

import { useState, useEffect } from 'react';
import {
  XIcon,
  SaveIcon,
  ExclamationCircleIcon,
  PhotographIcon,
  UserIcon,
  MailIcon,
  LocationMarkerIcon,
  IdentificationIcon,
} from '@heroicons/react/solid';
import './EditCustomerForm.css';
import { Customer } from '../../../types/Customer';

interface EditCarFormProps {
  customer: Customer;
  onSave: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

const EditCustomerForm: React.FC<EditCarFormProps> = ({
  customer,
  onSave,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Customer>({
    id: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    driverLicenseNumber: '',
    passportNumber: '',
    countryOfOrigin: '',
    drivingLicensePhotoUrl: '',
    passportPhotoUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({});

  // UI state
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLicensePreview, setShowLicensePreview] = useState(false);
  const [showPassportPreview, setShowPassportPreview] = useState(false);

  // Initialize form data from customer prop
  useEffect(() => {
    if (customer) {
      const initialData: Customer = {
        id: customer.id || '',
        name: customer.name || '',
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        address: customer.address || '',
        driverLicenseNumber: customer.driverLicenseNumber || '',
        passportNumber: customer.passportNumber || '',
        countryOfOrigin: customer.countryOfOrigin || '',
        drivingLicensePhotoUrl: customer.drivingLicensePhotoUrl || '',
        passportPhotoUrl: customer.passportPhotoUrl || '',
        createdAt: customer.createdAt || new Date(),
        updatedAt: customer.updatedAt || new Date(),
      };

      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [customer]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
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

    // URL validation for photos
    if (
      formData.drivingLicensePhotoUrl &&
      !isValidUrl(formData.drivingLicensePhotoUrl)
    ) {
      newErrors.drivingLicensePhotoUrl = 'Please enter a valid URL';
    }

    if (formData.passportPhotoUrl && !isValidUrl(formData.passportPhotoUrl)) {
      newErrors.passportPhotoUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if URL is valid
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Check if form has been modified
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
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
      console.error('Error saving customer:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to save customer. Please try again.',
      }));
      setIsSubmitting(false);
    }
  };

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    if (hasChanges()) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to cancel?'
        )
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // Toggle image previews
  const toggleLicensePreview = () => setShowLicensePreview(!showLicensePreview);
  const togglePassportPreview = () =>
    setShowPassportPreview(!showPassportPreview);

  return (
    <div className="edit-customer-form-container">
      <div className="form-header">
        <h2>Edit Customer</h2>
        <button type="button" className="close-button" onClick={handleCancel}>
          <XIcon className="icon" />
        </button>
      </div>

      {errors.submit && (
        <div className="global-error">
          <ExclamationCircleIcon className="error-icon" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-customer-form">
        <div className="form-sections">
          <div className="form-section">
            <h3 className="section-title">
              <UserIcon className="section-icon" />
              Basic Information
            </h3>
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
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <IdentificationIcon className="section-icon" />
              Identification
            </h3>
            <div className="form-row">
              <div
                className={`form-field ${
                  errors.driverLicenseNumber ? 'has-error' : ''
                }`}
              >
                <label htmlFor="driverLicenseNumber">
                  Driver License Number
                  {!formData.passportNumber && (
                    <span className="required-mark">*</span>
                  )}
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
                  Passport Number
                  {!formData.driverLicenseNumber && (
                    <span className="required-mark">*</span>
                  )}
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
            <h3 className="section-title">
              <MailIcon className="section-icon" />
              Contact Information
            </h3>
            <div className="form-row">
              <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
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

              <div className={`form-field ${errors.phoneNumber ? 'has-error' : ''}`}>
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
                <label htmlFor="address">
                  <LocationMarkerIcon className="field-icon" />
                  Address
                </label>
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

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="countryOfOrigin">
                  <LocationMarkerIcon className="field-icon" />
                  Country of Origin
                </label>
                <input
                  type="text"
                  id="countryOfOrigin"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleChange}
                  placeholder="Enter country of origin"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <PhotographIcon className="section-icon" />
              Document Photos
            </h3>
            <div className="form-row">
              <div
                className={`form-field ${
                  errors.drivingLicensePhotoUrl ? 'has-error' : ''
                }`}
              >
                <label htmlFor="drivingLicensePhotoUrl">
                  Driver License Photo URL
                </label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="drivingLicensePhotoUrl"
                    name="drivingLicensePhotoUrl"
                    value={formData.drivingLicensePhotoUrl}
                    onChange={handleChange}
                    placeholder="Enter URL for driver license photo"
                  />
                  {formData.drivingLicensePhotoUrl && (
                    <button
                      type="button"
                      className="preview-button"
                      onClick={toggleLicensePreview}
                      title={
                        showLicensePreview ? 'Hide preview' : 'Show preview'
                      }
                    >
                      <PhotographIcon className="button-icon" />
                    </button>
                  )}
                </div>
                {errors.drivingLicensePhotoUrl && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors.drivingLicensePhotoUrl}</span>
                  </div>
                )}
                {showLicensePreview && formData.drivingLicensePhotoUrl && (
                  <div className="image-preview">
                    <img
                      src={
                        formData.drivingLicensePhotoUrl || '/placeholder.svg'
                      }
                      alt="Driver License"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder.svg';
                        target.classList.add('error-image');
                      }}
                    />
                  </div>
                )}
              </div>

              <div
                className={`form-field ${
                  errors.passportPhotoUrl ? 'has-error' : ''
                }`}
              >
                <label htmlFor="passportPhotoUrl">Passport Photo URL</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="passportPhotoUrl"
                    name="passportPhotoUrl"
                    value={formData.passportPhotoUrl}
                    onChange={handleChange}
                    placeholder="Enter URL for passport photo"
                  />
                  {formData.passportPhotoUrl && (
                    <button
                      type="button"
                      className="preview-button"
                      onClick={togglePassportPreview}
                      title={
                        showPassportPreview ? 'Hide preview' : 'Show preview'
                      }
                    >
                      <PhotographIcon className="button-icon" />
                    </button>
                  )}
                </div>
                {errors.passportPhotoUrl && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors.passportPhotoUrl}</span>
                  </div>
                )}
                {showPassportPreview && formData.passportPhotoUrl && (
                  <div className="image-preview">
                    <img
                      src={formData.passportPhotoUrl || '/placeholder.svg'}
                      alt="Passport"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder.svg';
                        target.classList.add('error-image');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <XIcon className="button-icon" />
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={isSubmitting || !hasChanges()}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <SaveIcon className="button-icon" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomerForm;
