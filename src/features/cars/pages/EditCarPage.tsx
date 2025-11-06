'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Save, Upload, Image } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  uploadDocument,
  downloadDocument,
} from '@/shared/services/uploadService';
import carBrands from '@/assets/car_brands.json';

import './EditCarPage.css';
import LoadingSpinner from '@/shared/components/feedback/LoadingSpinner/LoadingSpinner';
import { Car, CarFormErrors } from '../types/car.types';
import { getCar, updateCar } from '../services/carService';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface CarTouchedFields {
  [key: string]: boolean;
}

const EditCarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  // Load car data
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
    return <LoadingSpinner />;
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
    status: car.status, // Keep existing status, will be calculated by backend
    photoUrl: car.photoUrl || '',
    createdAt: car.createdAt || new Date(),
    updatedAt: new Date(),
  };

  console.log(initialData);

  return <EditCarFormContent car={initialData} />;
};

// Separate component for the form content
const EditCarFormContent: React.FC<{ car: Car }> = ({ car: initialData }) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<Car>(initialData);
  const [originalData, setOriginalData] = useState<Car>(initialData);

  const [errors, setErrors] = useState<CarFormErrors>({});
  const [touched, setTouched] = useState<CarTouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo upload state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  // Car brands from JSON file
  const popularBrands = carBrands
    .filter((brand) => brand.popular)
    .map((brand) => brand.name);
  const allBrands = carBrands.map((brand) => brand.name);

  // Common car manufacturers for suggestions (popular Bosnian market brands)
  const commonManufacturers = popularBrands;

  // Load existing photo from backend
  const loadExistingPhoto = async (photoUrl: string) => {
    if (!photoUrl) return;

    setIsLoadingPhoto(true);
    try {
      const photoBlob = await downloadDocument(photoUrl);
      const photoObjectUrl = URL.createObjectURL(photoBlob);
      setExistingPhotoUrl(photoObjectUrl);
    } catch (error) {
      console.error('Error loading existing photo:', error);
      // Show user-friendly error message
      setErrors((prev) => ({
        ...prev,
        photoUrl: `Neuspješno učitavanje postojeće fotografije. Možete unijeti novu.`,
      }));
      // Clear the photo URL from form data since it failed to load
      setFormData((prev) => ({ ...prev, photoUrl: '' }));
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  // Load existing photo when component mounts
  useEffect(() => {
    if (formData.photoUrl) {
      loadExistingPhoto(formData.photoUrl);
    }
  }, [formData.photoUrl]);

  // Cleanup photo URLs when component unmounts
  useEffect(() => {
    return () => {
      if (existingPhotoUrl) {
        URL.revokeObjectURL(existingPhotoUrl);
      }
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [existingPhotoUrl, photoPreview]);

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

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          photoUrl: 'Molimo odaberite validnu sliku',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photoUrl: 'Slika mora biti manja od 5MB',
        }));
        return;
      }

      setSelectedPhoto(file);
      setErrors((prev) => ({ ...prev, photoUrl: undefined }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload photo to server
  const uploadPhoto = async (): Promise<string | null> => {
    if (!selectedPhoto) return null;

    setIsUploadingPhoto(true);
    try {
      const filename = await uploadDocument(selectedPhoto);
      // Clear any previous photo upload errors
      setErrors((prev) => ({ ...prev, photoUrl: undefined }));
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrors((prev) => ({
        ...prev,
        photoUrl: 'Neuspješno dodavanje fotografije. Molimo pokušajte ponovo.',
      }));
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove selected photo
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    setErrors((prev) => ({ ...prev, photoUrl: undefined }));

    // Clean up existing photo URL
    if (existingPhotoUrl) {
      URL.revokeObjectURL(existingPhotoUrl);
      setExistingPhotoUrl(null);
    }
  };

  // Validate the form
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

  // Check if form has been modified
  const hasChanges = () => {
    // Check if form data has changed
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);

    // Check if a new photo has been selected
    const photoChanged = selectedPhoto !== null;

    return formChanged || photoChanged;
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
          // Photo upload failed, don't proceed
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

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    if (hasChanges()) {
      if (
        window.confirm(
          'Imate nesačuvane promjene. Da li ste sigurni da želite otkazati?'
        )
      ) {
        navigate('/cars');
      }
    } else {
      navigate('/cars');
    }
  };

  // Validate on field change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched]);

  return (
    <div className="edit-car-form-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">
              Uredi vozilo: {formData.manufacturer} {formData.model}
            </h1>
            <p className="page-description">Ažuriraj detalje vozila</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
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
              <h2 className="section-title">Osnovne informacije</h2>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="manufacturer">
                  Proizvođač <span className="required">*</span>
                </Label>
                <Select
                  value={formData.manufacturer || ''}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'manufacturer', value },
                    } as any)
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
                  value={formData.model || ''}
                  onChange={handleChange}
                  placeholder="npr. Camry"
                  disabled={isSubmitting}
                  className={errors.model ? 'error' : ''}
                />
                {errors.model && <p className="error-text">{errors.model}</p>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="year">
                  Godina <span className="required">*</span>
                </Label>
                <Select
                  value={formData.year?.toString()}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'year', value: parseInt(value) },
                    } as any)
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
                {errors.year && <p className="error-text">{errors.year}</p>}
              </div>

              <div className="form-field">
                <Label htmlFor="color">Boja</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color || '#000000'}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="color-input"
                />
                {errors.color && <p className="error-text">{errors.color}</p>}
              </div>
            </div>

            {/* Car Photo - Full width for better presentation */}
            <div className="form-grid single-column">
              <div className="form-field">
                <Label htmlFor="photo">Fotografija vozila</Label>
                <div className="photo-upload-container">
                  <div className="upload-wrapper">
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={
                        isSubmitting || isUploadingPhoto || isLoadingPhoto
                      }
                      className="hidden-file-input"
                    />
                    {isLoadingPhoto ? (
                      // Show loading state when loading existing photo
                      <div className="upload-area-loading">
                        <div className="upload-content">
                          <div className="progress-spinner large"></div>
                          <div className="upload-text">
                            <span className="upload-primary-text">
                              Učitavanje postojeće fotografije...
                            </span>
                            <span className="upload-secondary-text">
                              Molimo sačekajte
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : !photoPreview && !existingPhotoUrl ? (
                      <label htmlFor="photo" className="upload-area-clickable">
                        <div className="upload-content">
                          <Upload className="upload-icon" />
                          <div className="upload-text">
                            <span className="upload-primary-text">
                              Kliknite da biste dodali fotografiju
                            </span>
                            <span className="upload-secondary-text">
                              PNG, JPG, JPEG do 5MB
                            </span>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="photo-preview-container">
                        <div className="photo-preview-wrapper">
                          <img
                            src={photoPreview || existingPhotoUrl || ''}
                            alt="Car preview"
                            className="photo-preview-image"
                          />
                          <div className="photo-overlay">
                            <div className="photo-actions">
                              <label
                                htmlFor="photo"
                                className="change-photo-button"
                              >
                                <Upload className="h-4 w-4" />
                                Promijeni
                              </label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removePhoto}
                                disabled={
                                  isSubmitting ||
                                  isUploadingPhoto ||
                                  isLoadingPhoto
                                }
                                className="remove-photo-button"
                              >
                                <X className="h-4 w-4" />
                                Ukloni
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {isUploadingPhoto && (
                    <div className="upload-progress">
                      <div className="progress-spinner"></div>
                      <span className="progress-text">
                        Dodavanje fotografije...
                      </span>
                    </div>
                  )}
                </div>
                {errors.photoUrl && (
                  <p className="error-text">{errors.photoUrl}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="transmission">Menjač</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'transmission', value },
                    } as any)
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
                {errors.transmission && (
                  <p className="error-text">{errors.transmission}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="fuelType">Tip goriva</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value) =>
                    handleChange({ target: { name: 'fuelType', value } } as any)
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
                {errors.fuelType && (
                  <p className="error-text">{errors.fuelType}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="seats">Broj sjedala</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  value={formData.seats || ''}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  disabled={isSubmitting}
                  className={errors.seats ? 'error' : ''}
                />
                {errors.seats && <p className="error-text">{errors.seats}</p>}
              </div>

              <div className="form-field">
                <Label htmlFor="doors">Broj vrata</Label>
                <Input
                  id="doors"
                  name="doors"
                  type="number"
                  value={formData.doors || ''}
                  onChange={handleChange}
                  min="2"
                  max="6"
                  disabled={isSubmitting}
                  className={errors.doors ? 'error' : ''}
                />
                {errors.doors && <p className="error-text">{errors.doors}</p>}
              </div>
            </div>
          </div>

          {/* Registration Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Registarski detalji</h2>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="licensePlate">
                  Registarska oznaka <span className="required">*</span>
                </Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate || ''}
                  onChange={handleChange}
                  placeholder="npr. ABC123"
                  disabled={isSubmitting}
                  className={errors.licensePlate ? 'error' : ''}
                />
                {errors.licensePlate && (
                  <p className="error-text">{errors.licensePlate}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="chassisNumber">Broj šasije</Label>
                <Input
                  id="chassisNumber"
                  name="chassisNumber"
                  value={formData.chassisNumber || ''}
                  onChange={handleChange}
                  placeholder="npr. 1HGCM82633A123456"
                  disabled={isSubmitting}
                  className={errors.chassisNumber ? 'error' : ''}
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
              <h2 className="section-title">Cijena</h2>
            </div>

            <div className="form-grid single-column">
              <div className="form-field">
                <Label htmlFor="pricePerDay">
                  Cijena po danu ($) <span className="required">*</span>
                </Label>
                <Input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  value={formData.pricePerDay || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="npr. 49.99"
                  disabled={isSubmitting}
                  className={errors.pricePerDay ? 'error' : ''}
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
              <h2 className="section-title">Dodatni detalji</h2>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="mileage">Kilometraža (km)</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={formData.mileage || ''}
                  onChange={handleChange}
                  min="0"
                  disabled={isSubmitting}
                  className={errors.mileage ? 'error' : ''}
                />
                {errors.mileage && (
                  <p className="error-text">{errors.mileage}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="enginePower">Snaga motora (KS)</Label>
                <Input
                  id="enginePower"
                  name="enginePower"
                  type="number"
                  value={formData.enginePower || ''}
                  onChange={handleChange}
                  min="0"
                  disabled={isSubmitting}
                  className={errors.enginePower ? 'error' : ''}
                />
                {errors.enginePower && (
                  <p className="error-text">{errors.enginePower}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="category">Kategorija</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleChange({ target: { name: 'category', value } } as any)
                  }
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
                {errors.category && (
                  <p className="error-text">{errors.category}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Otkaži
            </Button>

            <Button type="submit" disabled={isSubmitting || !hasChanges()}>
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Snimanje...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Snimi promjene</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCarPage;
