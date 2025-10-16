'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { XIcon, ExclamationCircleIcon, SaveIcon } from '@heroicons/react/solid';
import {
  Car,
  CarFormErrors,
  RenderFieldOptions,
} from '../../../types/Car';
import { Button, FormActions } from '../../UI';
import './EditCarForm.css';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const LICENSE_PLATE_REGEX = /^[A-ZČĆĐŠŽ]{1,2}[0-9]{2,3}-[A-ZČĆĐŠŽ]-[0-9]{3}$/i;
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface EditCarFormProps {
  car: Car;
  onSave: (car: Car) => Promise<void>;
  onCancel: () => void;
  manufacturers?: string[];
}

interface CarTouchedFields {
  [key: string]: boolean;
}

const EditCarForm: React.FC<EditCarFormProps> = ({
  car,
  onSave,
  onCancel,
  manufacturers = [],
}) => {
  const initialData: Car = {
    ...car,
    id: car.id,
    manufacturer: car.manufacturer || '',
    model: car.model || '',
    year: car.year || CURRENT_YEAR,
    color: car.color || '#000000',
    licensePlate: car.licensePlate || '',
    chassisNumber: car.chassisNumber || '',
    pricePerDay: car.pricePerDay || 0,
    transmission: car.transmission || 'automatic',
    fuelType: car.fuelType || 'petrol',
    seats: car.seats || 5,
    doors: car.doors || 4,
    mileage: car.mileage || 0,
    enginePower: car.enginePower || 0,
    category: car.category || 'economy',
    status: car.status, // Keep existing status, will be calculated by backend
    photoUrl: car.photoUrl || '',
    createdAt: car.createdAt || new Date(),
    updatedAt: new Date(),
  };
  // Form state
  const [formData, setFormData] = useState<Car>(initialData);
  const [originalData, setOriginalData] = useState<Car>(initialData);

  const [errors, setErrors] = useState<CarFormErrors>({});
  const [touched, setTouched] = useState<CarTouchedFields>({});
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
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    const newValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: CarFormErrors = {};

    // Required fields
    if (!formData.manufacturer)
      newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.licensePlate)
      newErrors.licensePlate = 'License plate is required';

    // License plate format
    if (
      formData.licensePlate &&
      !LICENSE_PLATE_REGEX.test(formData.licensePlate)
    ) {
      newErrors.licensePlate = 'License plate format is invalid';
    }

    // Chassis number format (if provided)
    if (
      formData.chassisNumber &&
      !CHASSIS_NUMBER_REGEX.test(formData.chassisNumber)
    ) {
      newErrors.chassisNumber =
        'Chassis number must be 17 characters (excluding I, O, Q)';
    }

    // Price validation
    if (formData.pricePerDay !== undefined) {
      const price = Number.parseFloat(String(formData.pricePerDay));
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerDay = 'Price must be a positive number';
      }
    } else {
      newErrors.pricePerDay = 'Price per day is required';
    }

    // Seats validation
    if (formData.seats) {
      const seats = Number.parseInt(formData.seats.toString());
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = 'Seats must be between 1 and 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form has been modified
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    if (!validateForm() || !formData) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the data before saving
      const carData: Car = {
        ...formData,
        year: Number(formData.year),
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats),
        doors: Number(formData.doors),
        mileage: Number(formData.mileage),
        enginePower: Number(formData.enginePower),
        updatedAt: new Date(),
      };

      await onSave(carData);
      toast.success('Car updated successfully');
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car');
    } finally {
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

  // Validate on field change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched]);

  // Render form field with label and error message
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
            value={String(formData[name as keyof typeof formData] || '')}
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
            value={String(formData[name as keyof typeof formData] || '')}
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
            value={String(formData[name as keyof typeof formData] || '')}
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
    <div className="edit-car-form-container">
      <div className="form-header">
        <h2>
          Edit Car: {car.manufacturer} {car.model}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="edit-car-form">
        <div className="form-sections">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="form-row">
              {renderField('Manufacturer', 'manufacturer', 'text', {
                required: true,
                list: 'manufacturers',
                placeholder: 'e.g. Toyota',
              })}

              {renderField('Model', 'model', 'text', {
                required: true,
                placeholder: 'e.g. Camry',
              })}
            </div>

            <datalist id="manufacturers">
              {commonManufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer} />
              ))}
            </datalist>

            <div className="form-row">
              {renderField('Year', 'year', 'select', {
                required: true,
                options: YEARS.map((year) => ({
                  value: year,
                  label: year.toString(),
                })),
              })}

              {renderField('Color', 'color', 'color', {
                required: true,
                helpText: 'Select the car color',
              })}
            </div>

            <div className="form-row">
              {renderField('Transmission', 'transmission', 'select', {
                options: [
                  { value: 'automatic', label: 'Automatic' },
                  { value: 'manual', label: 'Manual' },
                  { value: 'semi-automatic', label: 'Semi-Automatic' },
                ],
              })}

              {renderField('Fuel Type', 'fuelType', 'select', {
                options: [
                  { value: 'petrol', label: 'Petrol' },
                  { value: 'diesel', label: 'Diesel' },
                  { value: 'electric', label: 'Electric' },
                  { value: 'hybrid', label: 'Hybrid' },
                ],
              })}
            </div>

            <div className="form-row">
              {renderField('Number of Seats', 'seats', 'number', {
                min: 1,
                max: 10,
                helpText: 'Number of passenger seats',
              })}
              
              {renderField('Number of Doors', 'doors', 'number', {
                min: 2,
                max: 6,
                helpText: 'Number of doors',
              })}
            </div>

            <div className="form-row">
              {renderField('Mileage (km)', 'mileage', 'number', {
                min: 0,
                helpText: 'Current mileage in kilometers',
              })}
              
              {renderField('Engine Power (HP)', 'enginePower', 'number', {
                min: 0,
                helpText: 'Engine power in horsepower',
              })}
            </div>

            <div className="form-row">
              {renderField('Category', 'category', 'select', {
                options: [
                  { value: 'economy', label: 'Economy' },
                  { value: 'luxury', label: 'Luxury' },
                  { value: 'suv', label: 'SUV' },
                  { value: 'van', label: 'Van' },
                  { value: 'family', label: 'Family' },
                  { value: 'business', label: 'Business' },
                ],
              })}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Registration Details</h3>

            <div className="form-row">
              {renderField('License Plate', 'licensePlate', 'text', {
                required: true,
                placeholder: 'e.g. ABC123',
                helpText: 'Enter the license plate number',
              })}

              {renderField('Chassis Number', 'chassisNumber', 'text', {
                placeholder: 'e.g. 1HGCM82633A123456',
                helpText: '17-character VIN (Vehicle Identification Number)',
              })}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Pricing</h3>

            <div className="form-row">
              {renderField('Price Per Day ($)', 'pricePerDay', 'number', {
                required: true,
                min: 0,
                step: '0.01',
                placeholder: 'e.g. 49.99',
              })}
            </div>

            <div className="form-row">
              {renderField('Photo URL', 'photoUrl', 'text', {
                placeholder: 'https://example.com/car-image.jpg',
                helpText: 'URL of the car photo',
              })}
            </div>
          </div>
        </div>

        <FormActions alignment="right" withBorder={true}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            leftIcon={!isSubmitting ? <SaveIcon /> : undefined}
            disabled={isSubmitting || !hasChanges()}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </FormActions>
      </form>
    </div>
  );
};

export default EditCarForm;
