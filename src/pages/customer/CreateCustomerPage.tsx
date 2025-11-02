import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhotoUpload } from '@/components/ui/photo-upload';
import {
  User,
  FileText,
  Home,
  Camera,
  X,
  Loader2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  addCustomer,
  getCountries,
  type CountryOption,
} from '@/services/customerService';
import { uploadDocument } from '@/services/uploadService';
import { Customer } from '@/types/Customer';

// Import municipalities data
import municipalitiesDataRaw from '../../../municipalities.json';

// Extract all municipalities from the nested structure
const getAllMunicipalities = (): string[] => {
  const municipalities: string[] = [];
  const data = municipalitiesDataRaw as any;

  // Federation
  if (data['Federacija Bosne i Hercegovine']) {
    const federation = data['Federacija Bosne i Hercegovine'];
    Object.values(federation).forEach((cantonMunicipalities: any) => {
      if (Array.isArray(cantonMunicipalities)) {
        municipalities.push(...cantonMunicipalities);
      }
    });
  }

  // Republika Srpska
  if (data['Republika Srpska'] && Array.isArray(data['Republika Srpska'])) {
    municipalities.push(...data['Republika Srpska']);
  }

  // Brčko District
  if (data['Brčko distrikt'] && Array.isArray(data['Brčko distrikt'])) {
    municipalities.push(...data['Brčko distrikt']);
  }

  return municipalities.sort();
};

const municipalities = getAllMunicipalities();

const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneDialCode: '+387', // Default to Bosnia and Herzegovina
    phoneNumber: '',
    address: '',
    countryOfOrigin: '',
    fatherName: '',
    cityOfResidence: '',
    idOfPerson: '',
    driverLicenseNumber: '',
    passportNumber: '',
    drivingLicensePhotoUrl: '',
    passportPhotoUrl: '',
  });

  // UI state
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Photo file states
  const [licensePhotoFile, setLicensePhotoFile] = useState<File | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      setCountriesError(null);
      try {
        const countriesData = await getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountriesError('Greška pri učitavanju zemalja');
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ime je obavezno';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format nije valjan';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Broj telefona je obavezan';
    }

    // Address is optional - no validation needed

    if (!formData.countryOfOrigin.trim()) {
      newErrors.countryOfOrigin = 'Zemlja porijekla je obavezna';
    }

    if (!formData.driverLicenseNumber.trim()) {
      newErrors.driverLicenseNumber = 'Broj vozačke dozvole je obavezan';
    }

    if (!formData.passportNumber.trim()) {
      newErrors.passportNumber = 'Broj pasoša je obavezan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle photo file changes
  const handleLicensePhotoChange = (file: File | null) => {
    setLicensePhotoFile(file);
  };

  const handlePassportPhotoChange = (file: File | null) => {
    setPassportPhotoFile(file);
  };

  // Upload photo helper
  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      const filename = await uploadDocument(file);
      return filename;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photos if provided
      let licensePhotoFilename = formData.drivingLicensePhotoUrl;
      let passportPhotoFilename = formData.passportPhotoUrl;

      if (licensePhotoFile) {
        try {
          const uploadedFilename = await uploadPhoto(licensePhotoFile);
          if (uploadedFilename) {
            licensePhotoFilename = uploadedFilename;
          }
        } catch (error) {
          console.error('Error uploading license photo:', error);
          setSubmitError('Greška pri otpremanju slike vozačke dozvole');
          setIsSubmitting(false);
          return;
        }
      }

      if (passportPhotoFile) {
        try {
          const uploadedFilename = await uploadPhoto(passportPhotoFile);
          if (uploadedFilename) {
            passportPhotoFilename = uploadedFilename;
          }
        } catch (error) {
          console.error('Error uploading passport photo:', error);
          setSubmitError('Greška pri otpremanju slike pasoša');
          setIsSubmitting(false);
          return;
        }
      }

      // Combine dial code and phone number
      const fullPhoneNumber = formData.phoneNumber 
        ? `${formData.phoneDialCode}${formData.phoneNumber}`
        : undefined;

      const customerData: Partial<Customer> = {
        name: formData.name,
        email: formData.email || undefined,
        phoneNumber: fullPhoneNumber,
        address: formData.address || undefined,
        countryOfOrigin: formData.countryOfOrigin || undefined,
        fatherName: formData.fatherName || undefined,
        cityOfResidence: formData.cityOfResidence || undefined,
        idOfPerson: formData.idOfPerson || undefined,
        driverLicenseNumber: formData.driverLicenseNumber,
        passportNumber: formData.passportNumber,
        drivingLicensePhotoUrl: licensePhotoFilename || undefined,
        passportPhotoUrl: passportPhotoFilename || undefined,
      };

      await addCustomer(customerData);
      navigate('/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
      setSubmitError('Greška pri kreiranju kupca. Molimo pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  const isBiHCitizen = formData.countryOfOrigin === 'Bosnia and Herzegovina';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <User className="w-6 h-6" />
              Dodaj novog kupca
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unesite podatke za novog kupca
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Otkaži
          </Button>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information Section */}
          <div className="bg-background p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Lični podaci</h2>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Ime i prezime <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Unesite ime i prezime"
                disabled={isSubmitting}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email adresa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="primjer@email.com"
                  disabled={isSubmitting}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Broj telefona <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  {/* Dial Code Selector */}
                  <Select
                    value={formData.phoneDialCode}
                    onValueChange={(value) =>
                      handleInputChange('phoneDialCode', value)
                    }
                    disabled={isSubmitting || loadingCountries}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {loadingCountries ? (
                        <SelectItem value="_loading" disabled>
                          Učitavanje...
                        </SelectItem>
                      ) : countries.length > 0 ? (
                        countries.map((country) => (
                          <SelectItem key={country.code} value={country.dialCode}>
                            {country.flag} {country.dialCode}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_empty" disabled>
                          Nema podataka
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Phone Number Input */}
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange('phoneNumber', e.target.value)
                    }
                    placeholder="61 123 456"
                    disabled={isSubmitting}
                    className={errors.phoneNumber ? 'border-destructive' : ''}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Address and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Unesite adresu (opcionalno)"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryOfOrigin">
                  Zemlja porijekla <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.countryOfOrigin}
                  onValueChange={(value) =>
                    handleInputChange('countryOfOrigin', value)
                  }
                  disabled={isSubmitting || loadingCountries}
                >
                  <SelectTrigger
                    className={
                      errors.countryOfOrigin ? 'border-destructive' : ''
                    }
                  >
                    <SelectValue placeholder="Izaberite zemlju" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {loadingCountries ? (
                      <SelectItem value="_loading" disabled>
                        Učitavanje...
                      </SelectItem>
                    ) : countries.length > 0 ? (
                      countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        Nema dostupnih zemalja
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.countryOfOrigin && (
                  <p className="text-sm text-destructive">
                    {errors.countryOfOrigin}
                  </p>
                )}
                {countriesError && (
                  <p className="text-sm text-destructive">{countriesError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bosnia and Herzegovina Additional Fields */}
          {isBiHCitizen && (
            <div className="bg-background p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5" />
                <h2 className="text-lg font-semibold">
                  Dodatni podaci za državljane BiH
                </h2>
              </div>

              {/* Father's Name */}
              <div className="space-y-2">
                <Label htmlFor="fatherName">Ime oca</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) =>
                    handleInputChange('fatherName', e.target.value)
                  }
                  placeholder="Unesite ime oca"
                  disabled={isSubmitting}
                />
              </div>

              {/* City of Residence and JMBG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cityOfResidence">Grad prebivališta</Label>
                  <Select
                    value={formData.cityOfResidence}
                    onValueChange={(value) =>
                      handleInputChange('cityOfResidence', value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite grad" />
                    </SelectTrigger>
                    <SelectContent className='max-h-[300px]'>
                      {municipalities.map((municipality: string) => (
                        <SelectItem key={municipality} value={municipality}>
                          {municipality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idOfPerson">JMBG</Label>
                  <Input
                    id="idOfPerson"
                    value={formData.idOfPerson}
                    onChange={(e) =>
                      handleInputChange('idOfPerson', e.target.value)
                    }
                    placeholder="Unesite JMBG"
                    disabled={isSubmitting}
                    maxLength={13}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div className="bg-background p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Dokumenti</h2>
            </div>

            {/* License and Passport Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverLicenseNumber">
                  Broj vozačke dozvole{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="driverLicenseNumber"
                  value={formData.driverLicenseNumber}
                  onChange={(e) =>
                    handleInputChange('driverLicenseNumber', e.target.value)
                  }
                  placeholder="Unesite broj vozačke dozvole"
                  disabled={isSubmitting}
                  className={
                    errors.driverLicenseNumber ? 'border-destructive' : ''
                  }
                />
                {errors.driverLicenseNumber && (
                  <p className="text-sm text-destructive">
                    {errors.driverLicenseNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportNumber">
                  Broj pasoša <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) =>
                    handleInputChange('passportNumber', e.target.value)
                  }
                  placeholder="Unesite broj pasoša"
                  disabled={isSubmitting}
                  className={errors.passportNumber ? 'border-destructive' : ''}
                />
                {errors.passportNumber && (
                  <p className="text-sm text-destructive">
                    {errors.passportNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Photo Uploads Section */}
          <div className="bg-background p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Slike dokumenata</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver License Photo */}
              <div className="space-y-2">
                <PhotoUpload
                  value={licensePhotoFile}
                  onChange={handleLicensePhotoChange}
                  disabled={isSubmitting}
                  label="Slika vozačke dozvole"
                  existingPhotoUrl={formData.drivingLicensePhotoUrl}
                />
              </div>

              {/* Passport Photo */}
              <div className="space-y-2">
                <PhotoUpload
                  value={passportPhotoFile}
                  onChange={handlePassportPhotoChange}
                  disabled={isSubmitting}
                  label="Slika pasoša"
                  existingPhotoUrl={formData.passportPhotoUrl}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                'Sačuvaj kupca'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerPage;
