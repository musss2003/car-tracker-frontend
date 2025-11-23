import type React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  TagIcon,
  CarIcon,
  FileTextIcon,
  Trash2,
} from 'lucide-react';

import { uploadDocument } from '@/shared/services/uploadService';
import carBrands from '@/assets/car_brands.json';

import { getCar, updateCar, deleteCar } from '../services/carService';
import { useNavigate, useParams } from 'react-router-dom';
import { Car, CarFormErrors } from '../types/car.types';
import { Button } from '@/shared/components/ui/button';
import { FormSection } from '@/shared/components/ui/form-section';
import { FormField } from '@/shared/components/ui/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
import { FormActions } from '@/shared/components/ui/form-actions';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface CarTouchedFields {
  [key: string]: boolean;
}

export default function EditCarPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCar = async () => {
      if (!id) {
        toast.error('ID vozila je obavezan');
        navigate('/cars');
        return;
      }

      try {
        const carData = await getCar(id);
        setCar(carData);
      } catch (error) {
        console.error('Error loading car:', error);
        toast.error('Neuspješno učitavanje podataka o vozilu');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Učitavanje...</span>
        </div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

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
    status: car.status,
    photoUrl: car.photoUrl || '',
    createdAt: car.createdAt || new Date(),
    updatedAt: new Date(),
  };

  return <EditCarFormContent car={initialData} />;
}

function EditCarFormContent({ car: initialData }: { car: Car }) {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<Car>(initialData);
  const [originalData] = useState<Car>(initialData);

  const [errors, setErrors] = useState<CarFormErrors>({});
  const [touched, setTouched] = useState<CarTouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  // Car brands from JSON file
  const popularBrands = carBrands
    .filter((brand) => brand.popular)
    .map((brand) => brand.name);
  const allBrands = carBrands.map((brand) => brand.name);

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

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handlePhotoChange = (file: File | null) => {
    setSelectedPhoto(file);
    if (file) {
      setErrors((prev) => ({ ...prev, photoUrl: undefined }));
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!selectedPhoto) return null;

    try {
      const filename = await uploadDocument(selectedPhoto);
      setErrors((prev) => ({ ...prev, photoUrl: undefined }));
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrors((prev) => ({
        ...prev,
        photoUrl: 'Neuspješno dodavanje fotografije. Molimo pokušajte ponovo.',
      }));
      return null;
    }
  };

  const validateForm = () => {
    const newErrors: CarFormErrors = {};

    // Required fields
    if (!formData.manufacturer)
      newErrors.manufacturer = 'Proizvođač je obavezan';
    if (!formData.model) newErrors.model = 'Model je obavezan';
    if (!formData.year) newErrors.year = 'Godina je obavezna';
    if (!formData.licensePlate)
      newErrors.licensePlate = 'Registarska oznaka je obavezna';

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
      const seats = Number.parseInt(formData.seats.toString());
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = 'Broj sjedala mora biti između 1 i 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    const photoChanged = selectedPhoto !== null;

    return formChanged || photoChanged;
  };

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
      toast.error('Molimo ispravite greške u formi');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload photo first if selected
      let photoUrl = formData.photoUrl;
      if (selectedPhoto) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          return;
        }
        photoUrl = uploadedFilename;
      }

      // Format the data before saving
      const carData: Car = {
        ...formData,
        photoUrl: photoUrl,
        year: Number(formData.year),
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats),
        doors: Number(formData.doors),
        mileage: Number(formData.mileage),
        enginePower: Number(formData.enginePower),
        updatedAt: new Date(),
      };

      await updateCar(carData.licensePlate, carData);
      toast.success('Vozilo je uspješno ažurirano');
      navigate('/cars');
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Neuspješno ažuriranje vozila');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteCar(formData.licensePlate);
      toast.success('Vozilo je uspješno obrisano');
      navigate('/cars');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Neuspješno brisanje vozila');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelDialog(true);
    } else {
      navigate('/cars');
    }
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched]);

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Nazad
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-primary" />
                Uredi vozilo: {formData.manufacturer} {formData.model}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ažuriraj detalje vozila
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-muted/30 pb-24">
        <div className="mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <FormSection
              title="Osnovne informacije"
              icon={<TagIcon className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Proizvođač"
                  id="manufacturer"
                  required
                  error={errors.manufacturer}
                >
                  <Select
                    value={formData.manufacturer || ''}
                    onValueChange={(value) =>
                      handleSelectChange('manufacturer', value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberite proizvođača" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {popularBrands.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                      {allBrands
                        .filter((brand) => !popularBrands.includes(brand))
                        .map((manufacturer) => (
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
                  required
                  error={errors.model}
                >
                  <Input
                    id="model"
                    name="model"
                    value={formData.model || ''}
                    onChange={handleChange}
                    placeholder="npr. Camry"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Godina"
                  id="year"
                  required
                  error={errors.year}
                >
                  <Select
                    value={formData.year?.toString()}
                    onValueChange={(value) =>
                      handleSelectChange('year', Number.parseInt(value))
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
                    name="color"
                    type="color"
                    value={formData.color || '#000000'}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-10"
                  />
                </FormField>

                <FormField
                  label="Menjač"
                  id="transmission"
                  error={errors.transmission}
                >
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) =>
                      handleSelectChange('transmission', value)
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
                    onValueChange={(value) =>
                      handleSelectChange('fuelType', value)
                    }
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

                <FormField label="Broj sjedala" id="seats" error={errors.seats}>
                  <Input
                    id="seats"
                    name="seats"
                    type="number"
                    value={formData.seats || ''}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Broj vrata" id="doors" error={errors.doors}>
                  <Input
                    id="doors"
                    name="doors"
                    type="number"
                    value={formData.doors || ''}
                    onChange={handleChange}
                    min="2"
                    max="6"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Kategorija"
                  id="category"
                  error={errors.category}
                  className="md:col-span-2"
                >
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange('category', value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberite kategoriju" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </FormSection>

            {/* Vehicle Details Section */}
            <FormSection
              title="Detalji vozila"
              icon={<CarIcon className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Registarska oznaka"
                  id="licensePlate"
                  required
                  error={errors.licensePlate}
                >
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate || ''}
                    onChange={handleChange}
                    placeholder="npr. ABC-123"
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
                    name="chassisNumber"
                    value={formData.chassisNumber || ''}
                    onChange={handleChange}
                    placeholder="17 karaktera"
                    maxLength={17}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Kilometraža"
                  id="mileage"
                  error={errors.mileage}
                >
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    value={formData.mileage || ''}
                    onChange={handleChange}
                    placeholder="npr. 50000"
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
                    name="enginePower"
                    type="number"
                    value={formData.enginePower || ''}
                    onChange={handleChange}
                    placeholder="npr. 150"
                    min="0"
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Cijena po danu (€)"
                  id="pricePerDay"
                  required
                  error={errors.pricePerDay}
                  className="md:col-span-2"
                >
                  <Input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    step="0.01"
                    value={formData.pricePerDay || ''}
                    onChange={handleChange}
                    placeholder="npr. 50.00"
                    min="0"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Photo Section */}
            <FormSection
              title="Fotografija vozila"
              icon={<FileTextIcon className="w-5 h-5" />}
            >
              <PhotoUpload
                label="Fotografija vozila"
                value={selectedPhoto}
                onChange={handlePhotoChange}
                existingPhotoUrl={formData.photoUrl}
                error={errors.photoUrl}
                disabled={isSubmitting}
                maxSizeMB={5}
              />
            </FormSection>
          </form>
        </div>
      </div>

      {/* Actions Footer */}
      <FormActions
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        additionalActions={
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Obriši
          </Button>
        }
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Niste sačuvali promjene</AlertDialogTitle>
            <AlertDialogDescription>
              Imate nesačuvane promjene. Da li ste sigurni da želite da
              napustite stranicu?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/cars')}>
              Napusti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši vozilo</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete vozilo{' '}
              {formData.manufacturer} {formData.model}? Ova akcija se ne može
              poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
