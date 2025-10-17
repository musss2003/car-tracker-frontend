'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { XIcon, SaveIcon } from '@heroicons/react/solid';
import {
  Car,
  CarFormErrors,
} from '../../../types/Car';
import { Card, CardHeader, Button, FormField, FormActions } from '../../ui';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

  return (
    <div className="edit-customer-form-overlay">
      <Card className="edit-customer-form-card" size="lg">
        <CardHeader
          title={`Edit Car: ${car.manufacturer} ${car.model}`}
          subtitle="Update car details"
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
                      value={formData.manufacturer}
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
                      value={formData.model}
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
                      value={formData.year}
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
                    helpText="Select the car color"
                  >
                    <input
                      type="color"
                      className="ui-input"
                      value={formData.color}
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
                      value={formData.transmission}
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
                      value={formData.fuelType}
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

                <div className="form-row">
                  <FormField
                    label="Number of Seats"
                    error={errors.seats}
                    helpText="Number of passenger seats"
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={formData.seats}
                      onChange={handleChange}
                      name="seats"
                      min="1"
                      max="10"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Number of Doors"
                    error={errors.doors}
                    helpText="Number of doors"
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={formData.doors}
                      onChange={handleChange}
                      name="doors"
                      min="2"
                      max="6"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Mileage (km)"
                    error={errors.mileage}
                    helpText="Current mileage in kilometers"
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={formData.mileage}
                      onChange={handleChange}
                      name="mileage"
                      min="0"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Engine Power (HP)"
                    error={errors.enginePower}
                    helpText="Engine power in horsepower"
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={formData.enginePower}
                      onChange={handleChange}
                      name="enginePower"
                      min="0"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row form-row--single">
                  <FormField
                    label="Category"
                    error={errors.category}
                  >
                    <select
                      className="ui-input"
                      value={formData.category}
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
              </div>

              {/* Registration Details Section */}
              <div className="form-section">
                <h3 className="form-section__title">Registration Details</h3>

                <div className="form-row">
                  <FormField
                    label="License Plate"
                    required
                    error={errors.licensePlate}
                    helpText="Enter the license plate number"
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      name="licensePlate"
                      placeholder="e.g. ABC123"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Chassis Number"
                    error={errors.chassisNumber}
                    helpText="17-character VIN (Vehicle Identification Number)"
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.chassisNumber}
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

                <div className="form-row">
                  <FormField
                    label="Price Per Day ($)"
                    required
                    error={errors.pricePerDay}
                  >
                    <input
                      type="number"
                      className="ui-input"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      name="pricePerDay"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 49.99"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="form-row">
                  <FormField
                    label="Photo URL"
                    error={errors.photoUrl}
                    helpText="URL of the car photo"
                  >
                    <input
                      type="text"
                      className="ui-input"
                      value={formData.photoUrl}
                      onChange={handleChange}
                      name="photoUrl"
                      placeholder="https://example.com/car-image.jpg"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Form Actions */}
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
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </FormActions>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EditCarForm;
