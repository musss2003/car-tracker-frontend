import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Plus, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addCar } from '../../services/carService';
import { uploadDocument } from '../../services/uploadService';
import './CreateCarPage.css';
import {
  Car,
  CarFormErrors,
} from '../../types/Car';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const LICENSE_PLATE_REGEX = /^[A-Z0-9]{1,10}$/i;
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

const CreateCarPage: React.FC = () => {
  const navigate = useNavigate();
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

  // Photo upload state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Common car manufacturers for suggestions
  const commonManufacturers = [
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

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photoUrl: 'Molimo odaberite validnu sliku' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photoUrl: 'Slika mora biti manja od 5MB' }));
        return;
      }

      setSelectedPhoto(file);
      setErrors(prev => ({ ...prev, photoUrl: undefined }));

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
      setErrors(prev => ({ ...prev, photoUrl: undefined }));
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrors(prev => ({ ...prev, photoUrl: 'Neuspješno dodavanje fotografije. Molimo pokušajte ponovo.' }));
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove selected photo
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setCar(prev => ({ ...prev, photoUrl: '' }));
    setErrors(prev => ({ ...prev, photoUrl: undefined }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: CarFormErrors = {};

    // Required fields
    if (!car.manufacturer) newErrors.manufacturer = 'Proizvođač je obavezan';
    if (!car.model) newErrors.model = 'Model je obavezan';
    if (!car.year) newErrors.year = 'Godina je obavezna';
    if (!car.licensePlate)
      newErrors.licensePlate = 'Registarska oznaka je obavezna';

    // License plate format
    if (car.licensePlate && !LICENSE_PLATE_REGEX.test(car.licensePlate)) {
      newErrors.licensePlate = 'Format registarske oznake je neispravna';
    }

    // Chassis number format (if provided)
    if (car.chassisNumber && !CHASSIS_NUMBER_REGEX.test(car.chassisNumber)) {
      newErrors.chassisNumber =
        'Broj šasije mora imati 17 karaktera (isključuje I, O, Q)';
    }

    // Price validation
    if (car.pricePerDay !== undefined) {
      const price = Number.parseFloat(String(car.pricePerDay));
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerDay = 'Cijena mora biti pozitivan broj';
      }
    } else {
      newErrors.pricePerDay = 'Cijena po danu je obavezna';
    }

    // Seats validation
    if (car.seats) {
      const seats = Number.parseInt(String(car.seats));
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = 'Broj sjedala mora biti između 1 i 10';
      }
    }

    // Doors validation
    if (car.doors) {
      const doors = Number.parseInt(String(car.doors));
      if (isNaN(doors) || doors < 2 || doors > 6) {
        newErrors.doors = 'Broj vrata mora biti između 2 i 6';
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
      toast.error('Molimo ispravite greške u formi');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload photo first if selected
      let photoFilename = car.photoUrl;
      if (selectedPhoto) {
        const uploadedFilename = await uploadPhoto();
        if (!uploadedFilename) {
          // Photo upload failed, don't proceed
          return;
        }
        photoFilename = uploadedFilename;
      }

      // Format the data before saving
      const carData = {
        ...car,
        photoUrl: photoFilename,
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

      await addCar(carData);
      toast.success('Vozilo je uspješno kreirano');
      navigate('/cars');
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('Neuspješno kreiranje vozila');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    // Check if form has been modified or photo selected
    const hasFormChanges = Object.keys(touched).length > 0;
    const hasPhotoChanges = selectedPhoto !== null;
    const hasChanges = hasFormChanges || hasPhotoChanges;

    if (hasChanges) {
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
  }, [car, touched]);

  return (
    <div className="create-car-form-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">Dodaj novo vozilo</h1>
            <p className="page-description">Unesite detalje za novo vozilo</p>
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
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={car.manufacturer || ''}
                  onChange={handleChange}
                  placeholder="npr. Toyota"
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
                  placeholder="npr. Camry"
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
                  Godina <span className="required">*</span>
                </Label>
                <Select
                  value={car.year?.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'year', value: parseInt(value) } } as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite godinu" />
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
                <Label htmlFor="color">Boja</Label>
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
                      disabled={isSubmitting || isUploadingPhoto}
                      className="hidden-file-input"
                    />
                    {!photoPreview ? (
                      <label htmlFor="photo" className="upload-area-clickable">
                        <div className="upload-content">
                          <Upload className="upload-icon" />
                          <div className="upload-text">
                            <span className="upload-primary-text">Kliknite da biste dodali fotografiju</span>
                            <span className="upload-secondary-text">PNG, JPG, JPEG do 5MB</span>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="photo-preview-container">
                        <div className="photo-preview-wrapper">
                          <img
                            src={photoPreview}
                            alt="Car preview"
                            className="photo-preview-image"
                          />
                          <div className="photo-overlay">
                            <div className="photo-actions">
                              <label htmlFor="photo" className="change-photo-button">
                                <Upload className="h-4 w-4" />
                                Promijeni
                              </label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removePhoto}
                                disabled={isSubmitting || isUploadingPhoto}
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
                      <span className="progress-text">Dodavanje fotografije...</span>
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
                  value={car.transmission}
                  onValueChange={(value) => handleChange({ target: { name: 'transmission', value } } as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite menjač" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatski</SelectItem>
                    <SelectItem value="manual">Ručni</SelectItem>
                    <SelectItem value="semi-automatic">Poluautomatski</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transmission && (
                  <p className="error-text">{errors.transmission}</p>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="fuelType">Tip goriva</Label>
                <Select
                  value={car.fuelType}
                  onValueChange={(value) => handleChange({ target: { name: 'fuelType', value } } as any)}
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
                <Label htmlFor="doors">Broj vrata</Label>
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
                  value={car.licensePlate || ''}
                  onChange={handleChange}
                  placeholder="npr. ABC123"
                  disabled={isSubmitting}
                  className={errors.licensePlate ? "error" : ""}
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
                  value={car.chassisNumber || ''}
                  onChange={handleChange}
                  placeholder="npr. 1HGCM82633A123456"
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
                  value={car.pricePerDay || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="npr. 49.99"
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
              <h2 className="section-title">Dodatni detalji</h2>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="mileage">Kilometraža (km)</Label>
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
                <Label htmlFor="enginePower">Snaga motora (KS)</Label>
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
                <Label htmlFor="category">Kategorija</Label>
                <Select
                  value={car.category}
                  onValueChange={(value) => handleChange({ target: { name: 'category', value } } as any)}
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

            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Kreiranje...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Kreiraj vozilo</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCarPage;
