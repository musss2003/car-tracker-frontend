import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  XIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/solid';
import { Card, CardHeader, Button, FormField } from '../../UI';
import './CreateCarForm.css';
import {
  Car,
  CarFormErrors,
  commonFeatures,
  Feature,
  RenderFieldOptions,
} from '../../../types/Car';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const LICENSE_PLATE_REGEX = /^[A-Z0-9]{1,10}$/i;
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface CreateCarFormProps {
  onSave: (car: Car) => Promise<void>;
  onCancel: () => void;
  manufacturers?: string[];
}

const CreateCarForm: React.FC<CreateCarFormProps> = ({
  onSave,
  onCancel,
  manufacturers = [],
}) => {
  // Form state
  const [car, setCar] = useState<Car>({
    id: '', //
    manufacturer: '',
    model: '',
    year: CURRENT_YEAR,
    color: '#000000',
    license_plate: '',
    chassis_number: '',
    price_per_day: '',
    description: '',
    features: [],
    transmission: 'automatic',
    fuel_type: 'gasoline',
    seats: 5,
    image: '',
  });

  // Validation state
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  // Common car manufacturers for suggestions
  const commonManufacturers =
    manufacturers.length > 0
      ? manufacturers
      : [
          'Toyota',
          'Honda',
          'Ford',
          'Chevrolet',
          'BMW',
          'Mercedes-Benz',
          'Audi',
          'Volkswagen',
          'Nissan',
          'Hyundai',
        ];

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    const newValue =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked // 👈 cast only here
        : value;

    setCar((prev) => ({ ...prev, [name]: newValue }));

    // Mark field as touched
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  // Add a new feature to the car
  const handleAddFeature = () => {
    const trimmed = newFeature.trim();

    // Check if it's a valid Feature
    if (trimmed && commonFeatures.includes(trimmed as Feature)) {
      const validFeature = trimmed as Feature;

      setCar((prev) => {
        const features = prev.features ?? [];
        if (!features.includes(validFeature)) {
          return {
            ...prev,
            features: [...features, validFeature],
          };
        }
        return prev; // no change if already exists
      });

      setNewFeature('');
    } else {
      toast.warning('Invalid feature entered.');
    }
  };

  // Add a common feature to the car
  const handleAddCommonFeature = (feature: Feature) => {
    setCar((prev) => {
      const features = prev.features ?? []; // fallback to [] if undefined

      if (!features.includes(feature)) {
        return {
          ...prev,
          features: [...features, feature],
        };
      }
      return prev; // no change needed
    });
  };

  const handleRemoveFeature = (feature: Feature) => {
    setCar((prev) => {
      const features = prev.features ?? []; // fallback to [] if undefined

      return {
        ...prev,
        features: features.filter((f) => f !== feature),
      };
    });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: CarFormErrors = {};

    // Required fields
    if (!car.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
    if (!car.model) newErrors.model = 'Model is required';
    if (!car.year) newErrors.year = 'Year is required';
    if (!car.license_plate)
      newErrors.license_plate = 'License plate is required';

    // License plate format
    if (car.license_plate && !LICENSE_PLATE_REGEX.test(car.license_plate)) {
      newErrors.license_plate = 'License plate format is invalid';
    }

    // Chassis number format (if provided)
    if (car.chassis_number && !CHASSIS_NUMBER_REGEX.test(car.chassis_number)) {
      newErrors.chassis_number =
        'Chassis number must be 17 characters (excluding I, O, Q)';
    }

    // Price validation
    if (car.price_per_day) {
      const price = Number.parseFloat(String(car.price_per_day));
      if (isNaN(price) || price <= 0) {
        newErrors.price_per_day = 'Price must be a positive number';
      }
    } else {
      newErrors.price_per_day = 'Price per day is required';
    }

    // Seats validation
    if (car.seats) {
      const seats = Number.parseInt(String(car.seats));
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = 'Seats must be between 1 and 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    setTouched({
      manufacturer: true,
      model: true,
      year: true,
      color: true,
      license_plate: true,
      chassis_number: true,
      price_per_day: true,
      seats: true,
    });

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the data before saving
      const carData = {
        ...car,
        year: car.year !== undefined ? parseInt(car.year.toString(), 10) : 0,
        price_per_day:
          car.price_per_day !== undefined
            ? parseFloat(String(car.price_per_day))
            : 0,
        seats: car.seats !== undefined ? parseInt(car.seats.toString(), 10) : 5,
      };

      await onSave(carData);
      toast.success('Car created successfully');
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('Failed to create car');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    // Check if form has been modified
    const hasChanges = Object.keys(touched).length > 0;

    if (hasChanges) {
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

  // Validate on field change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [car, touched]);

  // Render form field with label and error message
  const renderField = (
    label: string,
    name: keyof Car,
    type: string = 'text',
    options: RenderFieldOptions = {}
  ) => {
    const {
      placeholder = '',
      min,
      max,
      step,
      list,
      autoComplete = 'off',
      required = false,
    } = options;

    const hasError = !!errors[name];

    return (
      <div className={`form-field ${hasError ? 'has-error' : ''}`}>
        <label htmlFor={name}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>

        {type === 'select' ? (
          <select
            id={name}
            name={name}
            value={car[name] || ''}
            onChange={handleChange}
            className={hasError ? 'error' : ''}
            required={required}
          >
            {options.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={car[name] || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={hasError ? 'error' : ''}
            rows={options.rows || 3}
            required={required}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={car[name] || ''}
            onChange={handleChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            list={list}
            autoComplete={autoComplete}
            className={hasError ? 'error' : ''}
            required={required}
          />
        )}

        {hasError && (
          <div className="error-message">
            <ExclamationCircleIcon className="error-icon" />
            {errors[name]}
          </div>
        )}

        {options.helpText && !hasError && (
          <div className="help-text">{options.helpText}</div>
        )}
      </div>
    );
  };

  return (
    <div className="edit-customer-form-overlay">
      <Card className="edit-customer-form-card" size="lg">
        <CardHeader
          title="Add New Car"
          subtitle="Enter details for the new car"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              leftIcon={<XIcon />}
              disabled={isSubmitting}
            >
              Close
            </Button>
          }
        />

        <div className="edit-customer-form-content">
          <form onSubmit={handleSubmit} className="edit-customer-form">
            <div className="form-sections">
              {/* Basic Information Section */}
              <div className="form-section">
                <h3 className="form-section__title">Basic Information</h3>
                
                <div className="form-row">
                  <FormField
                    label="Manufacturer"
                    required
                    error={errors.manufacturer}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.manufacturer}
                      onChange={handleChange}
                      name="manufacturer"
                      list="manufacturers"
                      placeholder="e.g. Toyota"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Model"
                    required
                    error={errors.model}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.model}
                      onChange={handleChange}
                      name="model"
                      placeholder="e.g. Camry"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <datalist id="manufacturers">
                  {commonManufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer} />
                  ))}
                </datalist>

                <div className="form-row">
                  <FormField
                    label="Year"
                    required
                    error={errors.year}
                  >
                    <select
                      className="ui-input"
                      value={car.year}
                      onChange={handleChange}
                      name="year"
                      disabled={isSubmitting}
                    >
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Color"
                    required
                    error={errors.color}
                  >
                    <input
                      type="color"
                      className="ui-input"
                      value={car.color}
                      onChange={handleChange}
                      name="color"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Transmission"
                    error={errors.transmission}
                  >
                    <select
                      className="ui-input"
                      value={car.transmission}
                      onChange={handleChange}
                      name="transmission"
                      disabled={isSubmitting}
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="semi-automatic">Semi-Automatic</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Fuel Type"
                    error={errors.fuel_type}
                  >
                    <select
                      className="ui-input"
                      value={car.fuel_type}
                      onChange={handleChange}
                      name="fuel_type"
                      disabled={isSubmitting}
                    >
                      <option value="gasoline">Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </FormField>
                </div>

                <div className="form-row form-row--single">
                  <FormField
                    label="Number of Seats"
                    error={errors.seats}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={car.seats}
                      onChange={handleChange}
                      name="seats"
                      min="1"
                      max="10"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>

              {/* Registration Details Section */}
              <div className="form-section">
                <h3 className="form-section__title">Registration Details</h3>

                <div className="form-row">
                  <FormField
                    label="License Plate"
                    required
                    error={errors.license_plate}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.license_plate}
                      onChange={handleChange}
                      name="license_plate"
                      placeholder="e.g. ABC123"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Chassis Number"
                    error={errors.chassis_number}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.chassis_number}
                      onChange={handleChange}
                      name="chassis_number"
                      placeholder="e.g. 1HGCM82633A123456"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="form-section">
                <h3 className="form-section__title">Pricing</h3>

                <div className="form-row form-row--single">
                  <FormField
                    label="Price Per Day ($)"
                    required
                    error={errors.price_per_day}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={car.price_per_day}
                      onChange={handleChange}
                      name="price_per_day"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 49.99"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>

              {/* Features Section */}
              <div className="form-section">
                <h3 className="form-section__title">Features</h3>

            <div className="features-container">
              <div className="features-input">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), handleAddFeature())
                  }
                />
                <button
                  type="button"
                  className="add-feature-button"
                  onClick={handleAddFeature}
                >
                  Add
                </button>
              </div>

              <div className="common-features">
                <p className="common-features-label">Common features:</p>
                <div className="common-features-list">
                  {commonFeatures.map((feature) => {
                    const isSelected = (car.features ?? []).includes(feature); // fallback to []
                    return (
                      <button
                        key={feature}
                        type="button"
                        className={`common-feature ${
                          isSelected ? 'selected' : ''
                        }`}
                        onClick={() =>
                          isSelected
                            ? handleRemoveFeature(feature)
                            : handleAddCommonFeature(feature)
                        }
                      >
                        {feature} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(car.features ?? []).length > 0 && (
                <div className="selected-features">
                  <p className="selected-features-label">Selected features:</p>
                  <div className="features-list">
                    {(car.features ?? []).map(
                      (
                        feature: Feature // fallback to []
                      ) => (
                        <div key={feature} className="feature-tag">
                          <span>{feature}</span>
                          <button
                            type="button"
                            className="remove-feature"
                            onClick={() =>
                              handleRemoveFeature(feature as Feature)
                            }
                          >
                            <XIcon className="icon" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="form-section">
                <h3 className="form-section__title">Additional Information</h3>

                <div className="form-row form-row--single">
                  <FormField
                    label="Description"
                    error={errors.description}
                  >
                    <textarea
                      className="ui-input"
                      value={car.description}
                      onChange={handleChange}
                      name="description"
                      rows={3}
                      placeholder="Enter a description of the car..."
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row form-row--single">
                  <FormField
                    label="Image URL"
                    error={errors.image}
                  >
                    <input
                      type="url"
                      className="ui-input"
                      value={car.image}
                      onChange={handleChange}
                      name="image"
                      placeholder="https://example.com/car-image.jpg"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                leftIcon={isSubmitting ? undefined : <PlusCircleIcon />}
              >
                {isSubmitting ? 'Creating...' : 'Create Car'}
              </Button>
        </div>
      </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateCarForm;
