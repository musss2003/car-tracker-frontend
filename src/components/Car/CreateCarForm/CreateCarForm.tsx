import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="create-car-form-container">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Add New Car</CardTitle>
              <p className="text-muted-foreground mt-1">Enter details for the new car</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">
                    Manufacturer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={car.manufacturer || ''}
                    onChange={handleChange}
                    placeholder="e.g. Toyota"
                    disabled={isSubmitting}
                    className={errors.manufacturer ? "border-destructive" : ""}
                    list="manufacturers"
                  />
                  {errors.manufacturer && (
                    <p className="text-sm text-destructive">{errors.manufacturer}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">
                    Model <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="model"
                    name="model"
                    value={car.model || ''}
                    onChange={handleChange}
                    placeholder="e.g. Camry"
                    disabled={isSubmitting}
                    className={errors.model ? "border-destructive" : ""}
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive">{errors.model}</p>
                  )}
                </div>
              </div>

              <datalist id="manufacturers">
                {commonManufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer} />
                ))}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year">
                    Year <span className="text-destructive">*</span>
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
                    <p className="text-sm text-destructive">{errors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={car.color || '#000000'}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-10 w-full"
                  />
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
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
                    <p className="text-sm text-destructive">{errors.transmission}</p>
                  )}
                </div>

                <div className="space-y-2">
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
                    <p className="text-sm text-destructive">{errors.fuelType}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
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
                    className={errors.seats ? "border-destructive" : ""}
                  />
                  {errors.seats && (
                    <p className="text-sm text-destructive">{errors.seats}</p>
                  )}
                </div>

                <div className="space-y-2">
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
                    className={errors.doors ? "border-destructive" : ""}
                  />
                  {errors.doors && (
                    <p className="text-sm text-destructive">{errors.doors}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Details Section */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-foreground">Registration Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">
                    License Plate <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={car.licensePlate || ''}
                    onChange={handleChange}
                    placeholder="e.g. ABC123"
                    disabled={isSubmitting}
                    className={errors.licensePlate ? "border-destructive" : ""}
                  />
                  {errors.licensePlate && (
                    <p className="text-sm text-destructive">{errors.licensePlate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chassisNumber">Chassis Number</Label>
                  <Input
                    id="chassisNumber"
                    name="chassisNumber"
                    value={car.chassisNumber || ''}
                    onChange={handleChange}
                    placeholder="e.g. 1HGCM82633A123456"
                    disabled={isSubmitting}
                    className={errors.chassisNumber ? "border-destructive" : ""}
                  />
                  {errors.chassisNumber && (
                    <p className="text-sm text-destructive">{errors.chassisNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-foreground">Pricing</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">
                    Price Per Day ($) <span className="text-destructive">*</span>
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
                    className={errors.pricePerDay ? "border-destructive" : ""}
                  />
                  {errors.pricePerDay && (
                    <p className="text-sm text-destructive">{errors.pricePerDay}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-foreground">Additional Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    value={car.mileage || ''}
                    onChange={handleChange}
                    min="0"
                    disabled={isSubmitting}
                    className={errors.mileage ? "border-destructive" : ""}
                  />
                  {errors.mileage && (
                    <p className="text-sm text-destructive">{errors.mileage}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enginePower">Engine Power (HP)</Label>
                  <Input
                    id="enginePower"
                    name="enginePower"
                    type="number"
                    value={car.enginePower || ''}
                    onChange={handleChange}
                    min="0"
                    disabled={isSubmitting}
                    className={errors.enginePower ? "border-destructive" : ""}
                  />
                  {errors.enginePower && (
                    <p className="text-sm text-destructive">{errors.enginePower}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
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
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    value={car.photoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/car-image.jpg"
                    disabled={isSubmitting}
                    className={errors.photoUrl ? "border-destructive" : ""}
                  />
                  {errors.photoUrl && (
                    <p className="text-sm text-destructive">{errors.photoUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCarForm;
