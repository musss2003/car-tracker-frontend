import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  XIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/solid';
import { Card, CardHeader, Button, FormField, FormActions } from '../../UI';
import './CreateCarForm.css';
import {
  Car,
  CarFormErrors,
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
  const [car, setCar] = useState<Partial<Car>>({
    manufacturer: '',
    model: '',
    year: CURRENT_YEAR,
    color: '#000000',
    licensePlate: '',
    chassisNumber: '',
    pricePerDay: 0,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    doors: 4,
    mileage: 0,
    enginePower: 0,
    category: 'economy',
    currentLocation: '',
    photoUrl: '',
  });

  // Validation state
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Validate the form
  const validateForm = () => {
    const newErrors: CarFormErrors = {};

    // Required fields
    if (!car.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
    if (!car.model) newErrors.model = 'Model is required';
    if (!car.year) newErrors.year = 'Year is required';
    if (!car.licensePlate)
      newErrors.licensePlate = 'License plate is required';

    // License plate format
    if (car.licensePlate && !LICENSE_PLATE_REGEX.test(car.licensePlate)) {
      newErrors.licensePlate = 'License plate format is invalid';
    }

    // Chassis number format (if provided)
    if (car.chassisNumber && !CHASSIS_NUMBER_REGEX.test(car.chassisNumber)) {
      newErrors.chassisNumber =
        'Chassis number must be 17 characters (excluding I, O, Q)';
    }

    // Price validation
    if (car.pricePerDay !== undefined) {
      const price = Number.parseFloat(String(car.pricePerDay));
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerDay = 'Price must be a positive number';
      }
    } else {
      newErrors.pricePerDay = 'Price per day is required';
    }

    // Seats validation
    if (car.seats) {
      const seats = Number.parseInt(String(car.seats));
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = 'Seats must be between 1 and 10';
      }
    }

    // Doors validation
    if (car.doors) {
      const doors = Number.parseInt(String(car.doors));
      if (isNaN(doors) || doors < 2 || doors > 6) {
        newErrors.doors = 'Doors must be between 2 and 6';
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
      licensePlate: true,
      chassisNumber: true,
      pricePerDay: true,
      seats: true,
      doors: true,
      fuelType: true,
      transmission: true,
      category: true,
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
        id: car.id || '', // Provide default empty string
        year: car.year !== undefined ? parseInt(car.year.toString(), 10) : CURRENT_YEAR,
        pricePerDay:
          car.pricePerDay !== undefined
            ? parseFloat(String(car.pricePerDay))
            : 0,
        seats: car.seats !== undefined ? parseInt(car.seats.toString(), 10) : 5,
        doors: car.doors !== undefined ? parseInt(car.doors.toString(), 10) : 4,
        mileage: car.mileage !== undefined ? parseInt(car.mileage.toString(), 10) : 0,
        enginePower: car.enginePower !== undefined ? parseInt(car.enginePower.toString(), 10) : 0,
        fuelType: car.fuelType || 'petrol',
        transmission: car.transmission || 'automatic',
        category: car.category || 'economy',
        status: 'available', // Default status when creating a car
        licensePlate: car.licensePlate || '',
        manufacturer: car.manufacturer || '',
        model: car.model || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Car;

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

  // Generic field rendering function
  const renderField = (
    label: string,
    name: keyof CarFormErrors,
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
            value={String(car[name as keyof typeof car] || '')}
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
            value={String(car[name as keyof typeof car] || '')}
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
            value={String(car[name as keyof typeof car] || '')}
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
                    error={errors.fuelType}
                  >
                    <select
                      className="ui-input"
                      value={car.fuelType}
                      onChange={handleChange}
                      name="fuelType"
                      disabled={isSubmitting}
                    >
                      <option value="petrol">Petrol</option>
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
                    error={errors.licensePlate}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.licensePlate}
                      onChange={handleChange}
                      name="licensePlate"
                      placeholder="e.g. ABC123"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Chassis Number"
                    error={errors.chassisNumber}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.chassisNumber}
                      onChange={handleChange}
                      name="chassisNumber"
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
                    error={errors.pricePerDay}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={car.pricePerDay}
                      onChange={handleChange}
                      name="pricePerDay"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 49.99"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="form-section">
                <h3 className="form-section__title">Additional Details</h3>

                <div className="form-row">
                  <FormField
                    label="Number of Doors"
                    error={errors.doors}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={car.doors}
                      onChange={handleChange}
                      name="doors"
                      min="2"
                      max="6"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Mileage (km)"
                    error={errors.mileage}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={car.mileage}
                      onChange={handleChange}
                      name="mileage"
                      min="0"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Engine Power (HP)"
                    error={errors.enginePower}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={car.enginePower}
                      onChange={handleChange}
                      name="enginePower"
                      min="0"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Category"
                    error={errors.category}
                  >
                    <select
                      className="ui-input"
                      value={car.category}
                      onChange={handleChange}
                      name="category"
                      disabled={isSubmitting}
                    >
                      <option value="economy">Economy</option>
                      <option value="luxury">Luxury</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="family">Family</option>
                      <option value="business">Business</option>
                    </select>
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Current Location"
                    error={errors.currentLocation}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.currentLocation}
                      onChange={handleChange}
                      name="currentLocation"
                      placeholder="e.g. Main Office"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row form-row--single">
                  <FormField
                    label="Photo URL"
                    error={errors.photoUrl}
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={car.photoUrl}
                      onChange={handleChange}
                      name="photoUrl"
                      placeholder="https://example.com/car-image.jpg"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <FormActions alignment="right" withBorder={true}>
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
            </FormActions>
      </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateCarForm;
