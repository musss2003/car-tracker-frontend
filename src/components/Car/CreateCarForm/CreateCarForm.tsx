import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import './CreateCarForm.css';
import {
  Car,
  CarFormErrors,
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

  return (
    <div className="create-car-form-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">Add New Car</h1>
            <p className="page-description">Enter details for the new car</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="close-button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <form onSubmit={handleSubmit} className="car-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Basic Information</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="manufacturer">
                  Manufacturer <span className="required">*</span>
                </Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={car.manufacturer || ''}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                  disabled={isSubmitting}
                  className={errors.manufacturer ? "error" : ""}
                  list="manufacturers"
                />
                {errors.manufacturer && (
                  <p className="error-text">{errors.manufacturer}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="model">
                  Model <span className="required">*</span>
                </Label>
                <Input
                  id="model"
                  name="model"
                  value={car.model || ''}
                  onChange={handleChange}
                  placeholder="e.g. Camry"
                  disabled={isSubmitting}
                  className={errors.model ? "error" : ""}
                />
                {errors.model && (
                  <p className="error-text">{errors.model}</p>
                )}
              </div>
            </div>

            <datalist id="manufacturers">
              {commonManufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer} />
              ))}
            </datalist>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="year">
                  Year <span className="required">*</span>
                </Label>
                <Select
                  value={car.year?.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'year', value: parseInt(value) } } as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="error-text">{errors.year}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={car.color || '#000000'}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="color-input"
                />
                {errors.color && (
                  <p className="error-text">{errors.color}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={car.transmission}
                  onValueChange={(value) => handleChange({ target: { name: 'transmission', value } } as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transmission && (
                  <p className="error-text">{errors.transmission}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={car.fuelType}
                  onValueChange={(value) => handleChange({ target: { name: 'fuelType', value } } as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fuelType && (
                  <p className="error-text">{errors.fuelType}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="seats">Number of Seats</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  value={car.seats || ''}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  disabled={isSubmitting}
                  className={errors.seats ? "error" : ""}
                />
                {errors.seats && (
                  <p className="error-text">{errors.seats}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="doors">Number of Doors</Label>
                <Input
                  id="doors"
                  name="doors"
                  type="number"
                  value={car.doors || ''}
                  onChange={handleChange}
                  min="2"
                  max="6"
                  disabled={isSubmitting}
                  className={errors.doors ? "error" : ""}
                />
                {errors.doors && (
                  <p className="error-text">{errors.doors}</p>
                )}
              </div>
            </div>
          </div>

          {/* Registration Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Registration Details</h2>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="licensePlate">
                  License Plate <span className="required">*</span>
                </Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={car.licensePlate || ''}
                  onChange={handleChange}
                  placeholder="e.g. ABC123"
                  disabled={isSubmitting}
                  className={errors.licensePlate ? "error" : ""}
                />
                {errors.licensePlate && (
                  <p className="error-text">{errors.licensePlate}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="chassisNumber">Chassis Number</Label>
                <Input
                  id="chassisNumber"
                  name="chassisNumber"
                  value={car.chassisNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. 1HGCM82633A123456"
                  disabled={isSubmitting}
                  className={errors.chassisNumber ? "error" : ""}
                />
                {errors.chassisNumber && (
                  <p className="error-text">{errors.chassisNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Pricing</h2>
            </div>

            <div className="form-grid single-column">
              <div className="form-field">
                <Label htmlFor="pricePerDay">
                  Price Per Day ($) <span className="required">*</span>
                </Label>
                <Input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  value={car.pricePerDay || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 49.99"
                  disabled={isSubmitting}
                  className={errors.pricePerDay ? "error" : ""}
                />
                {errors.pricePerDay && (
                  <p className="error-text">{errors.pricePerDay}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Additional Details</h2>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={car.mileage || ''}
                  onChange={handleChange}
                  min="0"
                  disabled={isSubmitting}
                  className={errors.mileage ? "error" : ""}
                />
                {errors.mileage && (
                  <p className="error-text">{errors.mileage}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="enginePower">Engine Power (HP)</Label>
                <Input
                  id="enginePower"
                  name="enginePower"
                  type="number"
                  value={car.enginePower || ''}
                  onChange={handleChange}
                  min="0"
                  disabled={isSubmitting}
                  className={errors.enginePower ? "error" : ""}
                />
                {errors.enginePower && (
                  <p className="error-text">{errors.enginePower}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={car.category}
                  onValueChange={(value) => handleChange({ target: { name: 'category', value } } as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="error-text">{errors.category}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input
                  id="photoUrl"
                  name="photoUrl"
                  value={car.photoUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/car-image.jpg"
                  disabled={isSubmitting}
                  className={errors.photoUrl ? "error" : ""}
                />
                {errors.photoUrl && (
                  <p className="error-text">{errors.photoUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Car</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCarForm;
