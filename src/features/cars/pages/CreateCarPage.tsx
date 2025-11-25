import type React from 'react';

import { useEffect, useState } from 'react';
import {
  Camera,
  X,
  Loader2,
  PlusCircle,
  AlertCircle,
  Settings,
  CarIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '@/shared/services/uploadService';
import { toast } from 'sonner';
import { addCar, fetchCarBrands } from '../services/carService';
import { Car, CarBrand, CarCategory, FuelType, TransmissionType } from '../types/car.types';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Button } from '@/shared/components/ui/button';
import { FormSection } from '@/shared/components/ui/form-section';
import { FormField } from '@/shared/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const LICENSE_PLATE_REGEX = /^[A-Z0-9]{1,10}$/i;
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface CarFormData extends Omit<Car, 'id'> {
  manufacturer: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  chassisNumber?: string;
  pricePerDay: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  doors: number;
  mileage: number;
  enginePower: number;
  category: CarCategory;
  photoUrl?: string;
}

interface CarFormErrors {
  [key: string]: string | undefined;
}

export default function CreateCarPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<CarFormData>>({
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

  const [errors, setErrors] = useState<CarFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);

  useEffect(() => {
    fetchCarBrands()
      .then((brands) => {
        setCarBrands(brands);
      })
      .catch((error) => {
        console.error('Error fetching car brands:', error);
      });
  }, []);

  // Car brands from JSON file
  const popularBrands = carBrands
    .filter((brand) => brand.popular)
    .map((brand) => brand.name);
  const allBrands = carBrands.map((brand) => brand.name);

  const handleChange = (field: keyof CarFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleClose = () => {
    navigate('/cars');
  };

  const validateForm = (): boolean => {
    const newErrors: CarFormErrors = {};

    // Required fields
    if (!formData.manufacturer)
      newErrors.manufacturer = 'Proizvođač je obavezan';
    if (!formData.model) newErrors.model = 'Model je obavezan';
    if (!formData.year) newErrors.year = 'Godina je obavezna';
    if (!formData.licensePlate)
      newErrors.licensePlate = 'Registarska oznaka je obavezna';

    // License plate format
    if (
      formData.licensePlate &&
      !LICENSE_PLATE_REGEX.test(formData.licensePlate)
    ) {
      newErrors.licensePlate = 'Format registarske oznake je neispravna';
    }

    // Chassis number format (if provided)
    if (
      formData.chassisNumber &&
      !CHASSIS_NUMBER_REGEX.test(formData.chassisNumber)
    ) {
      newErrors.chassisNumber =
        'Broj šasije mora imati 17 karaktera (isključuje I, O, Q)';
    }

    // Price validation
    if (formData.pricePerDay !== undefined) {
      const price = Number.parseFloat(String(formData.pricePerDay));
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerDay = 'Cijena mora biti pozitivan broj';
      }
    } else {
      newErrors.pricePerDay = 'Cijena po danu je obavezna';
    }

    // Seats validation
    if (formData.seats) {
      const seats = Number.parseInt(String(formData.seats));
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = 'Broj sjedala mora biti između 1 i 10';
      }
    }

    // Doors validation
    if (formData.doors) {
      const doors = Number.parseInt(String(formData.doors));
      if (isNaN(doors) || doors < 2 || doors > 6) {
        newErrors.doors = 'Broj vrata mora biti između 2 i 6';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    try {
      const filename = await uploadDocument(photoFile);
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Neuspješno dodavanje fotografije');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload photo first if selected
      let photoFilename = formData.photoUrl;
      if (photoFile) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          setIsSubmitting(false);
          return;
        }
        photoFilename = uploadedFilename;
      }

      // Format the data before saving
      const carData: Partial<Car> = {
        ...formData,
        photoUrl: photoFilename,
        year: formData.year || CURRENT_YEAR,
        pricePerDay:
          formData.pricePerDay !== undefined
            ? Number.parseFloat(String(formData.pricePerDay))
            : 0,
        seats:
          formData.seats !== undefined
            ? Number.parseInt(String(formData.seats))
            : 5,
        doors:
          formData.doors !== undefined
            ? Number.parseInt(String(formData.doors))
            : 4,
        mileage:
          formData.mileage !== undefined
            ? Number.parseInt(String(formData.mileage))
            : 0,
        manufacturer: formData.manufacturer || '',
        model: formData.model || '',
        licensePlate: formData.licensePlate || '',
      };

      await addCar(carData as Car);

      toast.success('Vozilo je uspješno kreirano');
      handleClose();
    } catch (error) {
      console.error('Error creating car:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Kreiranje vozila nije uspjelo. Molimo pokušajte ponovo.',
      }));
      toast.error('Neuspješno kreiranje vozila');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.photoUrl;
      return newErrors;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dodaj novo vozilo"
        subtitle="Popunite detalje kako biste kreirali novo vozilo"
        onBack={handleClose}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Otkaži
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.manufacturer ||
                !formData.model ||
                !formData.licensePlate
              }
              form="car-form"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kreiranje...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Kreiraj vozilo
                </>
              )}
            </Button>
          </>
        }
      />

      {/* Form Section */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="w-full p-6">
          <form id="car-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="w-full">
              <FormSection
                title="Osnovne informacije"
                icon={<CarIcon className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Proizvođač"
                    id="manufacturer"
                    error={errors.manufacturer}
                    required
                  >
                    <Select
                      value={formData.manufacturer || ''}
                      onValueChange={(value) =>
                        handleChange('manufacturer', value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite proizvođača" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {popularBrands.map((manufacturer: string) => (
                          <SelectItem key={manufacturer} value={manufacturer}>
                            {manufacturer}
                          </SelectItem>
                        ))}
                        {allBrands
                          .filter(
                            (brand: string) => !popularBrands.includes(brand)
                          )
                          .map((manufacturer: string) => (
                            <SelectItem key={manufacturer} value={manufacturer}>
                              {manufacturer}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Model"
                    id="model"
                    error={errors.model}
                    required
                  >
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => handleChange('model', e.target.value)}
                      placeholder="npr. Camry"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Godina"
                    id="year"
                    error={errors.year}
                    required
                  >
                    <Select
                      value={formData.year?.toString()}
                      onValueChange={(value) =>
                        handleChange('year', Number.parseInt(value))
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite godinu" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Boja" id="color" error={errors.color}>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color || '#000000'}
                      onChange={(e) => handleChange('color', e.target.value)}
                      disabled={isSubmitting}
                      className="h-10"
                    />
                  </FormField>

                  <FormField
                    label="Registarska oznaka"
                    id="licensePlate"
                    error={errors.licensePlate}
                    required
                  >
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate || ''}
                      onChange={(e) =>
                        handleChange('licensePlate', e.target.value)
                      }
                      placeholder="npr. ABC123"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Broj šasije"
                    id="chassisNumber"
                    error={errors.chassisNumber}
                  >
                    <Input
                      id="chassisNumber"
                      value={formData.chassisNumber || ''}
                      onChange={(e) =>
                        handleChange('chassisNumber', e.target.value)
                      }
                      placeholder="npr. 1HGCM82633A123456"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Cijena po danu (BAM)"
                    id="pricePerDay"
                    error={errors.pricePerDay}
                    required
                  >
                    <Input
                      id="pricePerDay"
                      type="number"
                      value={formData.pricePerDay || ''}
                      onChange={(e) =>
                        handleChange(
                          'pricePerDay',
                          Number.parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="npr. 49.99"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Kategorija"
                    id="category"
                    error={errors.category}
                  >
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite kategoriju" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Ekonomska</SelectItem>
                        <SelectItem value="luxury">Luksuzna</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="van">Kombi</SelectItem>
                        <SelectItem value="family">Obiteljska</SelectItem>
                        <SelectItem value="business">Poslovna</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormSection>
            </div>

            {/* Technical Specifications */}
            <div className="w-full">
              <FormSection
                title="Tehničke specifikacije"
                icon={<Settings className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Menjač"
                    id="transmission"
                    error={errors.transmission}
                  >
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) =>
                        handleChange('transmission', value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite menjač" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatski</SelectItem>
                        <SelectItem value="manual">Ručni</SelectItem>
                        <SelectItem value="semi-automatic">
                          Poluautomatski
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Tip goriva"
                    id="fuelType"
                    error={errors.fuelType}
                  >
                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) => handleChange('fuelType', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite tip goriva" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Benzin</SelectItem>
                        <SelectItem value="diesel">Dizel</SelectItem>
                        <SelectItem value="electric">Električni</SelectItem>
                        <SelectItem value="hybrid">Hibridni</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Broj sjedala"
                    id="seats"
                    error={errors.seats}
                  >
                    <Input
                      id="seats"
                      type="number"
                      value={formData.seats || ''}
                      onChange={(e) =>
                        handleChange('seats', Number.parseInt(e.target.value))
                      }
                      min="1"
                      max="10"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Broj vrata" id="doors" error={errors.doors}>
                    <Input
                      id="doors"
                      type="number"
                      value={formData.doors || ''}
                      onChange={(e) =>
                        handleChange('doors', Number.parseInt(e.target.value))
                      }
                      min="2"
                      max="6"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Kilometraža (km)"
                    id="mileage"
                    error={errors.mileage}
                  >
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage || ''}
                      onChange={(e) =>
                        handleChange('mileage', Number.parseInt(e.target.value))
                      }
                      min="0"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Snaga motora (KS)"
                    id="enginePower"
                    error={errors.enginePower}
                  >
                    <Input
                      id="enginePower"
                      type="number"
                      value={formData.enginePower || ''}
                      onChange={(e) =>
                        handleChange(
                          'enginePower',
                          Number.parseInt(e.target.value)
                        )
                      }
                      min="0"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
              </FormSection>
            </div>

            {/* Photo Section */}
            <div className="w-full">
              <FormSection
                title="Slika vozila"
                icon={<Camera className="w-5 h-5" />}
              >
                <PhotoUpload
                  value={photoFile}
                  onChange={(file) => handlePhotoChange(file)}
                  error={errors.photoUrl}
                  disabled={isSubmitting}
                />
              </FormSection>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
