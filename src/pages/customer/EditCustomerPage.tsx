'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Save } from 'lucide-react';
import { Customer } from '../../types/Customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Camera,
  Globe,
} from 'lucide-react';
import {
  getCustomer,
  updateCustomer,
  getCountries,
  type CountryOption,
} from '@/services/customerService';
import { uploadDocument, downloadDocument } from '@/services/uploadService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

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

interface CustomerFormData {
  name: string;
  email: string;
  phoneDialCode: string;
  phoneNumber: string;
  address: string;
  countryOfOrigin: string;
  fatherName: string;
  cityOfResidence: string;
  idOfPerson: string;
  driverLicenseNumber: string;
  passportNumber: string;
  drivingLicensePhotoUrl: string;
  passportPhotoUrl: string;
}

interface CustomerFormErrors {
  [key: string]: string | undefined;
}

interface CustomerTouchedFields {
  [key: string]: boolean;
}

const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) {
        toast.error('ID kupca je obavezan');
        navigate('/customers');
        return;
      }

      try {
        const customerData = await getCustomer(id);
        setCustomer(customerData);
      } catch (error) {
        console.error('Error loading customer:', error);
        toast.error('Neuspješno učitavanje podataka o kupcu');
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return null;
  }

  // Parse phone number to extract dial code and number
  const parsePhoneNumber = (fullPhone: string | undefined): { dialCode: string; number: string } => {
    if (!fullPhone) return { dialCode: '+387', number: '' };
    
    // Try to extract dial code (starts with +, followed by 1-4 digits)
    const match = fullPhone.match(/^(\+\d{1,4})(.*)$/);
    if (match) {
      return {
        dialCode: match[1],
        number: match[2].trim(),
      };
    }
    
    // Default if no match
    return { dialCode: '+387', number: fullPhone };
  };

  const { dialCode, number } = parsePhoneNumber(customer.phoneNumber);

  const initialData: CustomerFormData = {
    name: customer.name || '',
    email: customer.email || '',
    phoneDialCode: dialCode,
    phoneNumber: number,
    address: customer.address || '',
    countryOfOrigin: customer.countryOfOrigin || '',
    fatherName: customer.fatherName || '',
    cityOfResidence: customer.cityOfResidence || '',
    idOfPerson: customer.idOfPerson || '',
    driverLicenseNumber: customer.driverLicenseNumber || '',
    passportNumber: customer.passportNumber || '',
    drivingLicensePhotoUrl: customer.drivingLicensePhotoUrl || '',
    passportPhotoUrl: customer.passportPhotoUrl || '',
  };

  return <EditCustomerFormContent customerId={id!} initialData={initialData} />;
};

// Separate component for the form content
const EditCustomerFormContent: React.FC<{
  customerId: string;
  initialData: CustomerFormData;
}> = ({ customerId, initialData }) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>(initialData);
  const [originalData, setOriginalData] = useState<CustomerFormData>(initialData);

  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [touched, setTouched] = useState<CustomerTouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countries state
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  // Photo upload state for license
  const [selectedLicensePhoto, setSelectedLicensePhoto] = useState<File | null>(null);
  const [licensePhotoPreview, setLicensePhotoPreview] = useState<string | null>(null);
  const [existingLicensePhotoUrl, setExistingLicensePhotoUrl] = useState<string | null>(null);
  const [isLoadingLicensePhoto, setIsLoadingLicensePhoto] = useState(false);

  // Photo upload state for passport
  const [selectedPassportPhoto, setSelectedPassportPhoto] = useState<File | null>(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>(null);
  const [existingPassportPhotoUrl, setExistingPassportPhotoUrl] = useState<string | null>(null);
  const [isLoadingPassportPhoto, setIsLoadingPassportPhoto] = useState(false);

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

  // Load existing photos from backend
  const loadExistingPhoto = async (
    photoUrl: string,
    setPhotoUrl: (url: string) => void,
    setIsLoading: (loading: boolean) => void,
    photoType: string
  ) => {
    if (!photoUrl) return;

    setIsLoading(true);
    try {
      const photoBlob = await downloadDocument(photoUrl);
      const photoObjectUrl = URL.createObjectURL(photoBlob);
      setPhotoUrl(photoObjectUrl);
    } catch (error) {
      console.error(`Error loading existing ${photoType} photo:`, error);
      setErrors((prev) => ({
        ...prev,
        [`${photoType}PhotoUrl`]: `Neuspješno učitavanje postojeće fotografije. Možete unijeti novu.`,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing photos when component mounts
  useEffect(() => {
    if (formData.drivingLicensePhotoUrl) {
      loadExistingPhoto(
        formData.drivingLicensePhotoUrl,
        setExistingLicensePhotoUrl,
        setIsLoadingLicensePhoto,
        'license'
      );
    }
  }, [formData.drivingLicensePhotoUrl]);

  useEffect(() => {
    if (formData.passportPhotoUrl) {
      loadExistingPhoto(
        formData.passportPhotoUrl,
        setExistingPassportPhotoUrl,
        setIsLoadingPassportPhoto,
        'passport'
      );
    }
  }, [formData.passportPhotoUrl]);

  // Cleanup photo URLs when component unmounts
  useEffect(() => {
    return () => {
      if (existingLicensePhotoUrl) {
        URL.revokeObjectURL(existingLicensePhotoUrl);
      }
      if (licensePhotoPreview) {
        URL.revokeObjectURL(licensePhotoPreview);
      }
      if (existingPassportPhotoUrl) {
        URL.revokeObjectURL(existingPassportPhotoUrl);
      }
      if (passportPhotoPreview) {
        URL.revokeObjectURL(passportPhotoPreview);
      }
    };
  }, [existingLicensePhotoUrl, licensePhotoPreview, existingPassportPhotoUrl, passportPhotoPreview]);

  // Handle form field changes
  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle license photo file changes
  const handleLicensePhotoChange = (file: File | null) => {
    setSelectedLicensePhoto(file);
  };

  // Handle passport photo file changes
  const handlePassportPhotoChange = (file: File | null) => {
    setSelectedPassportPhoto(file);
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

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: CustomerFormErrors = {};

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

  // Check if form has been modified
  const hasChanges = () => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    const photoChanged = selectedLicensePhoto !== null || selectedPassportPhoto !== null;
    return formChanged || photoChanged;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      phoneNumber: true,
      countryOfOrigin: true,
      driverLicenseNumber: true,
      passportNumber: true,
    });

    if (!validateForm()) {
      toast.error('Molimo ispravite greške u formi');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload photos if selected
      let licensePhotoFilename = formData.drivingLicensePhotoUrl;
      let passportPhotoFilename = formData.passportPhotoUrl;

      if (selectedLicensePhoto) {
        try {
          const uploadedFilename = await uploadPhoto(selectedLicensePhoto);
          if (uploadedFilename) {
            licensePhotoFilename = uploadedFilename;
          }
        } catch (error) {
          console.error('Error uploading license photo:', error);
          toast.error('Greška pri otpremanju slike vozačke dozvole');
          setIsSubmitting(false);
          return;
        }
      }

      if (selectedPassportPhoto) {
        try {
          const uploadedFilename = await uploadPhoto(selectedPassportPhoto);
          if (uploadedFilename) {
            passportPhotoFilename = uploadedFilename;
          }
        } catch (error) {
          console.error('Error uploading passport photo:', error);
          toast.error('Greška pri otpremanju slike pasoša');
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

      await updateCustomer(customerId, customerData);
      toast.success('Kupac je uspješno ažuriran');
      navigate('/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Neuspješno ažuriranje kupca');
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
        navigate('/customers');
      }
    } else {
      navigate('/customers');
    }
  };

  // Validate on field change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched]);

  const isBiHCitizen = formData.countryOfOrigin === 'Bosnia and Herzegovina';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <User className="w-6 h-6" />
              Uredi kupca: {formData.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ažuriraj podatke kupca
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
        <div className="max-w-4xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-background border rounded-lg p-6 space-y-4">
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
                {touched.name && errors.name && (
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
                  {touched.email && errors.email && (
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
                            <SelectItem
                              key={country.code}
                              value={country.dialCode}
                            >
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
                  {touched.phoneNumber && errors.phoneNumber && (
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
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
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
                  {touched.countryOfOrigin && errors.countryOfOrigin && (
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
              <div className="bg-background border rounded-lg p-6 space-y-4">
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
                      <SelectContent className="max-h-[300px]">
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
            <div className="bg-background border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Dokumenti</h2>
              </div>

              {/* License and Passport Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverLicenseNumber">
                    Broj vozačke dozvole <span className="text-destructive">*</span>
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
                  {touched.driverLicenseNumber && errors.driverLicenseNumber && (
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
                  {touched.passportNumber && errors.passportNumber && (
                    <p className="text-sm text-destructive">
                      {errors.passportNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Uploads Section */}
            <div className="bg-background border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Slike dokumenata</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver License Photo */}
                <div className="space-y-2">
                  <Label>Slika vozačke dozvole</Label>
                  <PhotoUpload
                    value={selectedLicensePhoto}
                    onChange={handleLicensePhotoChange}
                    disabled={isSubmitting}
                    label="Slika vozačke dozvole"
                    existingPhotoUrl={formData.drivingLicensePhotoUrl}
                  />
                </div>

                {/* Passport Photo */}
                <div className="space-y-2">
                  <Label>Slika pasoša</Label>
                  <PhotoUpload
                    value={selectedPassportPhoto}
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
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Čuvanje...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sačuvaj izmjene
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerPage;
