"use client";

import { ChangeEvent, useState } from "react";
import {
  XIcon,
  UserAddIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/solid";
import "./CreateCustomerForm.css";
import { Customer } from "../../../types/Customer";

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
    name: "",
    driver_license_number: "",
    passport_number: "",
    email: "",
    phone_number: "",
    address: "",
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
      newErrors.name = "Name is required";
    }

    // At least one identification
    if (
      !formData.driver_license_number?.trim() &&
      !formData.passport_number?.trim()
    ) {
      newErrors.driver_license_number =
        "Either driver license or passport number is required";
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (
      formData.phone_number &&
      !/^\+?[0-9\s-()]{7,}$/.test(formData.phone_number)
    ) {
      newErrors.phone_number = "Please enter a valid phone number";
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
      console.error("Error creating customer:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create customer. Please try again.",
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
              <div className={`form-field ${errors.name ? "has-error" : ""}`}>
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
                  errors.driver_license_number ? "has-error" : ""
                }`}
              >
                <label htmlFor="driver_license_number">
                  Driver License Number
                </label>
                <input
                  type="text"
                  id="driver_license_number"
                  name="driver_license_number"
                  value={formData.driver_license_number}
                  onChange={handleChange}
                  placeholder="Enter driver license number"
                />
                {errors.driver_license_number && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors.driver_license_number}</span>
                  </div>
                )}
              </div>

              <div
                className={`form-field ${
                  errors.passport_number ? "has-error" : ""
                }`}
              >
                <label htmlFor="passport_number">Passport Number</label>
                <input
                  type="text"
                  id="passport_number"
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  placeholder="Enter passport number"
                />
                {errors.passport_number && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors.passport_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="form-row">
              <div className={`form-field ${errors.email ? "has-error" : ""}`}>
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

              <div className={`form-field ${errors.phone ? "has-error" : ""}`}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors.phone}</span>
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
