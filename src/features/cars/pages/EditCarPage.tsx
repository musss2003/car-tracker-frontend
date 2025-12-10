import type React from 'react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Car,
  CarBrand,
  CarCategory,
  CarFormErrors,
  CarStatus,
  FuelType,
  TransmissionType,
} from '../types/car.types';

import { uploadDocument } from '@/shared/services/uploadService';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  AlertCircle,
  CarIcon,
  FileTextIcon,
  Loader2,
  Save,
  TagIcon,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/ui/page-header';
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
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
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
import {
  deleteCar,
  fetchCarBrands,
  getCar,
  updateCar,
} from '../services/carService';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface CarFormData {
  manufacturer: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  chassisNumber: string;
  pricePerDay: number;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  mileage: number;
  enginePower: number;
  category: string;
  status: string;
  photoUrl: string;
}

export default function EditCarPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CarFormData>({
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
    status: 'available',
    photoUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [isUpdated, setIsUpdated] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);

  useEffect(() => {
    fetchCarBrands().then(setCarBrands).catch(console.error);
  }, []);

  // Car brands from JSON file
  const popularBrands = carBrands
    .filter((brand) => brand.popular)
    .map((brand) => brand.name);
  const allBrands = carBrands.map((brand) => brand.name);

  // Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const carData = await getCar(id);

        setFormData({
          manufacturer: carData.manufacturer || '',
          model: carData.model || '',
          year: carData.year || CURRENT_YEAR,
          color: carData.color || '#000000',
          licensePlate: carData.licensePlate || '',
          chassisNumber: carData.chassisNumber || '',
          pricePerDay: carData.pricePerDay || 0,
          transmission: carData.transmission || 'automatic',
          fuelType: carData.fuelType || 'petrol',
          seats: carData.seats || 5,
          doors: carData.doors || 4,
          mileage: carData.mileage || 0,
          enginePower: carData.enginePower || 0,
          category: carData.category || 'economy',
          status: carData.status || 'available',
          photoUrl: carData.photoUrl || '',
        });
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Učitavanje vozila nije uspjelo. Molimo pokušajte ponovo.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCar();
    }
  }, [id]);

  const handleChange = (field: keyof CarFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsUpdated(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handlePhotoChange = (file: File | null) => {
    setSelectedPhoto(file);
    setIsUpdated(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.photoUrl;
      return newErrors;
    });
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

  const validateForm = (): boolean => {
    const newErrors = {} as CarFormErrors;

    if (!formData.manufacturer)
      newErrors.manufacturer = 'Proizvođač je obavezan';
    if (!formData.model) newErrors.model = 'Model je obavezan';
    if (!formData.year) newErrors.year = 'Godina je obavezna';
    if (!formData.licensePlate)
      newErrors.licensePlate = 'Registarska oznaka je obavezna';

    if (
      formData.chassisNumber &&
      !CHASSIS_NUMBER_REGEX.test(formData.chassisNumber)
    ) {
      newErrors.chassisNumber =
        'Broj šasije mora imati 17 karaktera (isključuje I, O, Q)';
    }

    const price = Number.parseFloat(String(formData.pricePerDay));
    if (isNaN(price) || price <= 0) {
      newErrors.pricePerDay = 'Cijena mora biti pozitivan broj';
    }

    const seats = Number.parseInt(formData.seats.toString());
    if (isNaN(seats) || seats < 1 || seats > 10) {
      newErrors.seats = 'Broj sjedala mora biti između 1 i 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Molimo ispravite greške u formi');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let photoUrl = formData.photoUrl;

      if (selectedPhoto) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          return;
        }
        photoUrl = uploadedFilename;
      }

      const carData: Omit<Car, 'createdAt'> = {
        licensePlate: formData.licensePlate,
        manufacturer: formData.manufacturer,
        model: formData.model,
        year: Number(formData.year),
        color: formData.color,
        chassisNumber: formData.chassisNumber,
        pricePerDay: Number(formData.pricePerDay),
        transmission: formData.transmission as TransmissionType,
        fuelType: formData.fuelType as FuelType,
        seats: Number(formData.seats),
        doors: Number(formData.doors),
        mileage: Number(formData.mileage),
        enginePower: Number(formData.enginePower),
        category: formData.category as CarCategory,
        status: formData.status as CarStatus,
        photoUrl: photoUrl,
        updatedAt: new Date(),
        id,
      };
      await updateCar(formData.licensePlate, carData);
      toast.success('Vozilo je uspješno ažurirano');
      navigate('/cars');
    } catch (err) {
      console.error('Error updating car:', err);
      setError('Ažuriranje vozila nije uspjelo. Molimo pokušajte ponovo.');
      toast.error('Ažuriranje vozila nije uspjelo. Molimo pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteCar(id);
      toast.success('Vozilo je uspješno obrisano');
      navigate('/cars');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Neuspješno brisanje vozila');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState text="Učitavanje vozila..." />;
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-semibold">Greška</h1>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/cars')}>
                Nazad na vozila
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Uredi vozilo"
        subtitle="Ažurirajte detalje vozila"
        onBack={() => navigate('/cars')}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/cars/${id}`)}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Otkaži
            </Button>
            <Button
              type="submit"
              disabled={submitting || !isUpdated}
              form="edit-car-form"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sačuvaj promjene
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="w-full p-6">
          <form
            id="edit-car-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="w-full">
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
                        handleChange('manufacturer', value)
                      }
                      disabled={submitting}
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
                      value={formData.model || ''}
                      onChange={(e) => handleChange('model', e.target.value)}
                      placeholder="npr. Camry"
                      disabled={submitting}
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
                        handleChange('year', Number.parseInt(value))
                      }
                      disabled={submitting}
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
                      disabled={submitting}
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
                        handleChange('transmission', value)
                      }
                      disabled={submitting}
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
                      disabled={submitting}
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
                      disabled={submitting}
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
                      disabled={submitting}
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
                      onValueChange={(value) => handleChange('category', value)}
                      disabled={submitting}
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
            </div>

            <div className="w-full">
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
                      value={formData.licensePlate || ''}
                      onChange={(e) =>
                        handleChange('licensePlate', e.target.value)
                      }
                      placeholder="npr. ABC-123"
                      disabled={submitting}
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
                      placeholder="17 karaktera"
                      maxLength={17}
                      disabled={submitting}
                    />
                  </FormField>

                  <FormField
                    label="Kilometraža"
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
                      placeholder="npr. 50000"
                      min="0"
                      disabled={submitting}
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
                      placeholder="npr. 150"
                      min="0"
                      disabled={submitting}
                    />
                  </FormField>

                  <FormField
                    label="Cijena po danu (BAM)"
                    id="pricePerDay"
                    required
                    error={errors.pricePerDay}
                    className="md:col-span-2"
                  >
                    <Input
                      id="pricePerDay"
                      type="number"
                      step="0.01"
                      value={formData.pricePerDay || ''}
                      onChange={(e) =>
                        handleChange(
                          'pricePerDay',
                          Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder="npr. 50.00"
                      min="0"
                      disabled={submitting}
                    />
                  </FormField>
                </div>
              </FormSection>
            </div>

            <div className="w-full">
              <FormSection
                title="Fotografija vozila"
                icon={<FileTextIcon className="w-5 h-5" />}
              >
                <PhotoUpload
                  value={selectedPhoto}
                  onChange={handlePhotoChange}
                  error={errors.photoUrl}
                  disabled={submitting}
                  existingPhotoUrl={formData.photoUrl}
                />
              </FormSection>
            </div>

            {(errors as any).submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{(errors as any).submit}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={submitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Obriši vozilo
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija ne može biti poništena. Ovo će trajno obrisati vozilo
              iz baze podataka.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
