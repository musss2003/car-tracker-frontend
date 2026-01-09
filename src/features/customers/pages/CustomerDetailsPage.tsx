import React, { useState, useEffect } from 'react';
import { logError } from '@/shared/utils/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  IdentificationIcon,
  XIcon,
  ZoomInIcon,
} from '@heroicons/react/solid';
import { Customer } from '../types/customer.types';
import { downloadDocument } from '@/shared/services/uploadService';
import { getCustomer } from '../services/customerService';
import CustomerContractsList from '../components/CustomerContractsList';

const CustomerDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Photo states
  const [drivingLicensePhoto, setDrivingLicensePhoto] = useState<string | null>(
    null
  );
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [loadingLicensePhoto, setLoadingLicensePhoto] = useState(false);
  const [loadingPassportPhoto, setLoadingPassportPhoto] = useState(false);

  // Modal state for photo preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Open modal with photo
  const openPhotoModal = (src: string, title: string) => {
    setModalPhoto({ src, title });
    setModalOpen(true);
  };

  // Close modal
  const closePhotoModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalPhoto(null), 300); // Clear after animation
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closePhotoModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  // Load customer photos
  const loadPhoto = async (
    photoUrl: string,
    setPhoto: React.Dispatch<React.SetStateAction<string | null>>,
    setLoadingPhoto: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      setLoadingPhoto(true);
      const photoBlob = await downloadDocument(photoUrl);
      const photoUrlObject = URL.createObjectURL(photoBlob);
      setPhoto(photoUrlObject);
    } catch (error) {
      logError('Error loading photo:', error);
      setPhoto(null);
    } finally {
      setLoadingPhoto(false);
    }
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const fetchedCustomer = await getCustomer(id!);

        if (!fetchedCustomer) {
          setError('Kupac nije pronađen');
          toast.error('Kupac nije pronađen');
          navigate('/customers');
          return;
        }

        setCustomer(fetchedCustomer);

        // Load photos if available
        if (fetchedCustomer.drivingLicensePhotoUrl) {
          loadPhoto(
            fetchedCustomer.drivingLicensePhotoUrl,
            setDrivingLicensePhoto,
            setLoadingLicensePhoto
          );
        }
        if (fetchedCustomer.passportPhotoUrl) {
          loadPhoto(
            fetchedCustomer.passportPhotoUrl,
            setPassportPhoto,
            setLoadingPassportPhoto
          );
        }
      } catch (error) {
        logError('Error fetching customer:', error);
        setError('Neuspješno učitavanje kupca');
        toast.error('Neuspješno učitavanje kupca');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id, navigate]);

  // Cleanup photo URLs on unmount
  useEffect(() => {
    return () => {
      if (drivingLicensePhoto) {
        URL.revokeObjectURL(drivingLicensePhoto);
      }
      if (passportPhoto) {
        URL.revokeObjectURL(passportPhoto);
      }
    };
  }, [drivingLicensePhoto, passportPhoto]);

  const handleEdit = () => {
    navigate(`/customers/${id}/edit`);
  };

  const handleClose = () => {
    navigate('/customers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Učitavanje...</span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Greška</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || 'Kupac nije pronađen'}
            </p>
            <Button onClick={() => navigate('/customers')} className="w-full">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Nazad na kupce
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBiHCitizen = customer.countryOfOrigin === 'Bosnia and Herzegovina';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header with improved styling */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2 hover:bg-white/50"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Nazad</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center text-white text-2xl font-bold shadow-lg">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {customer.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {customer.email && (
                    <div className="flex items-center gap-1.5">
                      <MailIcon className="w-4 h-4 text-gray-400" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.phoneNumber && (
                    <div className="flex items-center gap-1.5">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                  )}
                  {customer.countryOfOrigin && (
                    <Badge variant="secondary" className="gap-1.5">
                      <GlobeAltIcon className="w-3 h-3" />
                      {customer.countryOfOrigin}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleEdit}
              className="flex items-center gap-2 w-full sm:w-auto shadow-sm"
              size="lg"
            >
              <PencilIcon className="w-4 h-4" />
              Uredi kupca
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Document Photos - Enhanced */}
          <div className="md:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
            {/* Driving License Photo */}
            <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-blue-600" />
                  Vozačka dozvola
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div
                  className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-200 group cursor-pointer"
                  onClick={() =>
                    drivingLicensePhoto &&
                    openPhotoModal(drivingLicensePhoto, 'Vozačka dozvola')
                  }
                >
                  {loadingLicensePhoto ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        <span className="text-xs text-gray-600">
                          Učitavanje...
                        </span>
                      </div>
                    </div>
                  ) : drivingLicensePhoto ? (
                    <>
                      <img
                        src={drivingLicensePhoto}
                        alt="Vozačka dozvola"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                          <ZoomInIcon className="w-8 h-8 text-white" />
                          <span className="text-white text-sm font-medium">
                            Klikni za uvećanje
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                        <DocumentTextIcon className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        Nema fotografije
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Passport Photo */}
            <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                  Pasoš
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div
                  className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-200 group cursor-pointer"
                  onClick={() =>
                    passportPhoto && openPhotoModal(passportPhoto, 'Pasoš')
                  }
                >
                  {loadingPassportPhoto ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        <span className="text-xs text-gray-600">
                          Učitavanje...
                        </span>
                      </div>
                    </div>
                  ) : passportPhoto ? (
                    <>
                      <img
                        src={passportPhoto}
                        alt="Pasoš"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                          <ZoomInIcon className="w-8 h-8 text-white" />
                          <span className="text-white text-sm font-medium">
                            Klikni za uvećanje
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                        <DocumentTextIcon className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        Nema fotografije
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Details - Enhanced */}
          <div className="md:col-span-2 lg:col-span-2 xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Information */}
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-green-100/50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <UserIcon className="w-5 h-5 text-green-600" />
                    Lični podaci
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Ime i prezime
                        </p>
                        <p className="font-semibold text-gray-900">
                          {customer.name}
                        </p>
                      </div>
                    </div>

                    {customer.email && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <MailIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Email adresa
                          </p>
                          <p className="font-medium text-gray-900 truncate">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {customer.phoneNumber && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Broj telefona
                          </p>
                          <p className="font-medium text-gray-900">
                            {customer.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {customer.address && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <LocationMarkerIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Adresa
                          </p>
                          <p className="font-medium text-gray-900">
                            {customer.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {customer.countryOfOrigin && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <GlobeAltIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Zemlja porijekla
                          </p>
                          <p className="font-medium text-gray-900">
                            {customer.countryOfOrigin}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Document Information */}
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                    Dokumenti
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                      <IdentificationIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                          Broj vozačke dozvole
                        </p>
                        <p className="font-bold text-blue-900 break-all">
                          {customer.driverLicenseNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200">
                      <DocumentTextIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-1">
                          Broj pasoša
                        </p>
                        <p className="font-bold text-purple-900 break-all">
                          {customer.passportNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BiH Specific Information - Full Width */}
            {isBiHCitizen &&
              (customer.fatherName ||
                customer.cityOfResidence ||
                customer.idOfPerson) && (
                <Card className="lg:col-span-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <GlobeAltIcon className="w-5 h-5 text-indigo-600" />
                      Dodatni podaci za državljane BiH
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customer.fatherName && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Ime oca
                            </p>
                            <p className="font-medium text-gray-900">
                              {customer.fatherName}
                            </p>
                          </div>
                        </div>
                      )}
                      {customer.cityOfResidence && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <LocationMarkerIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Grad prebivališta
                            </p>
                            <p className="font-medium text-gray-900">
                              {customer.cityOfResidence}
                            </p>
                          </div>
                        </div>
                      )}
                      {customer.idOfPerson && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200">
                          <IdentificationIcon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">
                              JMBG
                            </p>
                            <p className="font-bold text-indigo-900">
                              {customer.idOfPerson}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Customer Contracts Section */}
            <div className="lg:col-span-2">
              {customer && (
                <CustomerContractsList
                  customerId={customer.id}
                  customerName={customer.name}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal/Lightbox */}
      {modalOpen && modalPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closePhotoModal}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6" />
                {modalPhoto.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closePhotoModal}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <XIcon className="w-6 h-6" />
              </Button>
            </div>

            {/* Photo Container */}
            <div
              className="flex-1 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalPhoto.src}
                alt={modalPhoto.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              />
            </div>

            {/* Close Hint */}
            <div className="text-center mt-4 text-white/70 text-sm">
              Klikni bilo gdje ili pritisni ESC za zatvaranje
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsPage;
