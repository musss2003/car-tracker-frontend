'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Save } from 'lucide-react';
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
import { PhotoUpload } from '@/shared/components/ui/photo-upload';
import { User, FileText, Camera, Globe } from 'lucide-react';

// Import municipalities data
import municipalitiesDataRaw from '@/assets/municipalities.json';
import { Customer } from '../types/customer.types';
import {
  CountryOption,
  getCountries,
  getCustomer,
  updateCustomer,
} from '../services/customerService';
import LoadingSpinner from '@/shared/components/feedback/LoadingSpinner/LoadingSpinner';
import {
  downloadDocument,
  uploadDocument,
} from '@/shared/services/uploadService';

// Type for municipality with region info
interface MunicipalityOption {
  name: string;
  region: string;
  uniqueKey: string;
}

// Extract all municipalities from the nested structure with region info
const getAllMunicipalities = (): MunicipalityOption[] => {
  const municipalities: MunicipalityOption[] = [];
  const data = municipalitiesDataRaw as any;

  // Federation
  if (data['Federacija Bosne i Hercegovine']) {
    const federation = data['Federacija Bosne i Hercegovine'];
    Object.entries(federation).forEach(
      ([canton, cantonMunicipalities]: [string, any]) => {
        if (Array.isArray(cantonMunicipalities)) {
          cantonMunicipalities.forEach((name: string) => {
            municipalities.push({
              name,
              region: 'FBiH',
              uniqueKey: `fbih-${name.toLowerCase().replace(/\s/g, '-')}`,
            });
          });
        }
      }
    );
  }

  // Republika Srpska
  if (data['Republika Srpska'] && Array.isArray(data['Republika Srpska'])) {
    data['Republika Srpska'].forEach((name: string) => {
      municipalities.push({
        name,
        region: 'RS',
        uniqueKey: `rs-${name.toLowerCase().replace(/\s/g, '-')}`,
      });
    });
  }

  // Brčko District
  if (data['Brčko distrikt'] && Array.isArray(data['Brčko distrikt'])) {
    data['Brčko distrikt'].forEach((name: string) => {
      municipalities.push({
        name,
        region: 'BD',
        uniqueKey: `bd-${name.toLowerCase().replace(/\s/g, '-')}`,
      });
    });
  }

  return municipalities.sort((a, b) => a.name.localeCompare(b.name));
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
  const parsePhoneNumber = (
    fullPhone: string | undefined
  ): { dialCode: string; number: string } => {
    if (!fullPhone) return { dialCode: '+387', number: '' };

    // Smart parsing: Find where the dial code ends by looking for common phone number patterns
    // Most local phone numbers start with 6-9 (mobile) or 1-5 (landline)
    // This regex matches: + followed by 1-3 digits, then a digit 0-9 that starts the local number
    const match = fullPhone.match(/^(\+\d{1,3})([0-9].*)$/);
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
  const [originalData, setOriginalData] =
    useState<CustomerFormData>(initialData);

  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [touched, setTouched] = useState<CustomerTouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countries state
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  // Photo upload state for license
  const [selectedLicensePhoto, setSelectedLicensePhoto] = useState<File | null>(
    null
  );
  const [licensePhotoPreview, setLicensePhotoPreview] = useState<string | null>(
    null
  );
  const [existingLicensePhotoUrl, setExistingLicensePhotoUrl] = useState<
    string | null
  >(null);
  const [isLoadingLicensePhoto, setIsLoadingLicensePhoto] = useState(false);

  // Photo upload state for passport
  const [selectedPassportPhoto, setSelectedPassportPhoto] =
    useState<File | null>(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<
    string | null
  >(null);
  const [existingPassportPhotoUrl, setExistingPassportPhotoUrl] = useState<
    string | null
  >(null);
  const [isLoadingPassportPhoto, setIsLoadingPassportPhoto] = useState(false);

  // Track if photos were explicitly removed
  const [licensePhotoRemoved, setLicensePhotoRemoved] = useState(false);
  const [passportPhotoRemoved, setPassportPhotoRemoved] = useState(false);

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
    
    // Check if it's a placeholder/invalid URL
    if (photoUrl.startsWith('http://example.com') || photoUrl.startsWith('https://example.com')) {
      setPhotoUrl('');
      return;
    }

    setIsLoading(true);
    try {
      const photoBlob = await downloadDocument(photoUrl);
      const photoObjectUrl = URL.createObjectURL(photoBlob);
      setPhotoUrl(photoObjectUrl);
    } catch (error) {
      console.error(`Error loading existing ${photoType} photo:`, error);
      console.error(`${photoType} photo URL that failed:`, photoUrl);
      // Don't set error in UI - just log it and let user upload new photo if needed
      // setErrors((prev) => ({
      //   ...prev,
      //   [`${photoType}PhotoUrl`]: `Neuspješno učitavanje postojeće fotografije. Možete unijeti novu.`,
      // }));
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
  }, [
    existingLicensePhotoUrl,
    licensePhotoPreview,
    existingPassportPhotoUrl,
    passportPhotoPreview,
  ]);

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

    if (file === null) {
      // Photo was removed
      setLicensePhotoRemoved(true);
      // Clear from formData and existing photo URL
      setFormData((prev) => ({
        ...prev,
        drivingLicensePhotoUrl: '',
      }));
      setExistingLicensePhotoUrl(null);
    } else {
      // New photo selected
      setLicensePhotoRemoved(false);
    }
  };

  // Handle passport photo file changes
  const handlePassportPhotoChange = (file: File | null) => {
    setSelectedPassportPhoto(file);

    if (file === null) {
      // Photo was removed
      setPassportPhotoRemoved(true);
      // Clear from formData and existing photo URL
      setFormData((prev) => ({
        ...prev,
        passportPhotoUrl: '',
      }));
      setExistingPassportPhotoUrl(null);
    } else {
      // New photo selected
      setPassportPhotoRemoved(false);
    }
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

    // Email is optional, but if provided, must be valid
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format nije valjan';
    }

    // Phone number is optional - no validation needed

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
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    const photoChanged =
      selectedLicensePhoto !== null || selectedPassportPhoto !== null;
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

      // Handle photo uploads and removals
      let licensePhotoFilename: string | undefined =
        formData.drivingLicensePhotoUrl;
      let passportPhotoFilename: string | undefined = formData.passportPhotoUrl;

      // Handle driving license photo
      if (licensePhotoRemoved) {
        // Photo was explicitly removed - set to null to clear it
        licensePhotoFilename = null as any;
      } else if (selectedLicensePhoto) {
        // New photo was selected - upload it
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
      // If neither removed nor selected, keep existing photo (licensePhotoFilename unchanged)

      // Handle passport photo
      if (passportPhotoRemoved) {
        // Photo was explicitly removed - set to null to clear it
        passportPhotoFilename = null as any;
      } else if (selectedPassportPhoto) {
        // New photo was selected - upload it
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
      // If neither removed nor selected, keep existing photo (passportPhotoFilename unchanged)

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
        drivingLicensePhotoUrl:
          licensePhotoFilename === null
            ? null
            : licensePhotoFilename || undefined,
        passportPhotoUrl:
          passportPhotoFilename === null
            ? null
            : passportPhotoFilename || undefined,
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
      <div className="flex-none px-6 py-4 bg-background">
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
        <div className="mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                {touched.name && errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email adresa</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="primjer@email.com (opcionalno)"
                    disabled={isSubmitting}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Broj telefona</Label>
                  <div className="flex gap-2">
                    {/* Dial Code Selector */}
                    <Select
                      value={`${formData.phoneDialCode}|||${countries.find((c) => c.dialCode === formData.phoneDialCode)?.code || ''}`}
                      onValueChange={(value) => {
                        const dialCode = value.split('|||')[0];
                        // Only update if dialCode is not empty
                        if (dialCode) {
                          handleInputChange('phoneDialCode', dialCode);
                        }
                      }}
                      disabled={isSubmitting || loadingCountries}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          {loadingCountries ? (
                            formData.phoneDialCode
                          ) : (
                            <>
                              {countries.find(
                                (c) => c.dialCode === formData.phoneDialCode
                              )?.flag || ''}{' '}
                              {formData.phoneDialCode}
                            </>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {loadingCountries ? (
                          <SelectItem value="_loading" disabled>
                            Učitavanje...
                          </SelectItem>
                        ) : countries.length > 0 ? (
                          countries.map((country, index) => {
                            const uniqueValue = `${country.dialCode}|||${country.code}`;
                            return (
                              <SelectItem key={uniqueValue} value={uniqueValue}>
                                {country.flag} {country.dialCode}
                              </SelectItem>
                            );
                          })
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
                      placeholder="61 123 456 (opcionalno)"
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
                        countries.map((country, index) => (
                          <SelectItem
                            key={`country-${country.name.replace(/\s/g, '_')}`}
                            value={country.name}
                          >
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
                      value={
                        municipalities.find(
                          (m) => m.name === formData.cityOfResidence
                        )?.uniqueKey || formData.cityOfResidence
                      }
                      onValueChange={(uniqueKey) => {
                        // Find municipality by uniqueKey and store the name
                        const municipality = municipalities.find(
                          (m) => m.uniqueKey === uniqueKey
                        );
                        if (municipality) {
                          handleInputChange(
                            'cityOfResidence',
                            municipality.name
                          );
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite grad" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {municipalities.map((municipality) => (
                          <SelectItem
                            key={municipality.uniqueKey}
                            value={municipality.uniqueKey}
                          >
                            {municipality.name}
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
                  {touched.driverLicenseNumber &&
                    errors.driverLicenseNumber && (
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
                    className={
                      errors.passportNumber ? 'border-destructive' : ''
                    }
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
            <div className="bg-background p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Slike dokumenata</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver License Photo */}
                <div className="space-y-2">
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
