'use client';

import { ChangeEvent, useState } from 'react';
import {
  XIcon,
  UserAddIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid';
import './CreateCustomerForm.css';
import { Customer } from '../../../types/Customer';

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

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
              <div
                className={`form-field ${
                  errors.driverLicenseNumber ? 'has-error' : ''
                }`}
              >
                <label htmlFor="driverLicenseNumber">
                  Driver License Number <span className="required-mark">*</span>
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
                <label htmlFor="passportNumber">Passport Number <span className="required-mark">*</span></label>
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

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="countryOfOrigin">Country of Origin</label>
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
