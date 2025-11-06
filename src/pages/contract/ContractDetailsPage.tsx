import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getContract, deleteContract } from '../../services/contractService';
import { downloadDocument } from '../../services/uploadService';
import { Contract } from '../../types/Contract';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  TruckIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PhotographIcon,
  XIcon,
  ZoomInIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid';
import { calculateDuration } from '../../utils/contractUtils';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ContractDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Photo states
  const [drivingLicensePhoto, setDrivingLicensePhoto] = useState<string | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [contractPhoto, setContractPhoto] = useState<string | null>(null);
  const [loadingLicensePhoto, setLoadingLicensePhoto] = useState(false);
  const [loadingPassportPhoto, setLoadingPassportPhoto] = useState(false);
  const [loadingContractPhoto, setLoadingContractPhoto] = useState(false);

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
    setTimeout(() => setModalPhoto(null), 300);
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

  // Load photos
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
      console.error('Error loading photo:', error);
      setPhoto(null);
    } finally {
      setLoadingPhoto(false);
    }
  };

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const fetchedContract = await getContract(id!);

        if (!fetchedContract) {
          setError('Ugovor nije pronađen');
          toast.error('Ugovor nije pronađen');
          navigate('/contracts');
          return;
        }

        console.log(fetchedContract);
        setContract(fetchedContract);

        // Load photos if they exist and are not empty/null
        if (
          fetchedContract.customer?.drivingLicensePhotoUrl &&
          fetchedContract.customer.drivingLicensePhotoUrl.trim() !== ''
        ) {
          loadPhoto(
            fetchedContract.customer.drivingLicensePhotoUrl,
            setDrivingLicensePhoto,
            setLoadingLicensePhoto
          );
        }

        if (
          fetchedContract.customer?.passportPhotoUrl &&
          fetchedContract.customer.passportPhotoUrl.trim() !== ''
        ) {
          loadPhoto(
            fetchedContract.customer.passportPhotoUrl,
            setPassportPhoto,
            setLoadingPassportPhoto
          );
        }

        if (fetchedContract.photoUrl && fetchedContract.photoUrl.trim() !== '') {
          loadPhoto(
            fetchedContract.photoUrl,
            setContractPhoto,
            setLoadingContractPhoto
          );
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        setError('Greška pri učitavanju ugovora');
        toast.error('Greška pri učitavanju ugovora');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContract();
    }
  }, [id, navigate]);

  // Cleanup photo URLs
  useEffect(() => {
    return () => {
      if (drivingLicensePhoto) URL.revokeObjectURL(drivingLicensePhoto);
      if (passportPhoto) URL.revokeObjectURL(passportPhoto);
      if (contractPhoto) URL.revokeObjectURL(contractPhoto);
    };
  }, [drivingLicensePhoto, passportPhoto, contractPhoto]);

  // Helper functions
  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return 'N/A';
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('bs-BA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) return 'N/A';
    return `${Number(amount).toFixed(2)} KM`;
  };

  const getValue = (value: unknown, defaultValue: string = 'N/A') => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      return defaultValue;
    }
    return String(value);
  };

  // Calculate contract status
  const getContractStatus = () => {
    if (!contract?.startDate || !contract?.endDate) {
      return {
        status: 'Nepoznato',
        className: 'bg-gray-500',
        icon: <ExclamationCircleIcon className="w-4 h-4" />,
      };
    }

    const now = new Date();
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);

    if (now < startDate) {
      return {
        status: 'Potvrđen',
        className: 'bg-blue-500',
        icon: <ClockIcon className="w-4 h-4" />,
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        status: 'Aktivan',
        className: 'bg-green-500',
        icon: <CheckCircleIcon className="w-4 h-4" />,
      };
    } else {
      return {
        status: 'Završen',
        className: 'bg-gray-600',
        icon: <CheckCircleIcon className="w-4 h-4" />,
      };
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!contract) return;

    try {
      setDeleting(true);
      await deleteContract(contract.id);
      toast.success('Ugovor je uspješno obrisan');
      navigate('/contracts');
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Greška pri brisanju ugovora');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !contract) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <ExclamationCircleIcon className="w-16 h-16 text-destructive" />
              <p className="text-lg font-medium">{error || 'Ugovor nije pronađen'}</p>
              <Button onClick={() => navigate('/contracts')}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Nazad na ugovore
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { status, className, icon } = getContractStatus();

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex-none px-6 py-6 bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/contracts')}
              className="gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Nazad
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-primary" />
                Detalji ugovora
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {contract.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={`${className} text-white gap-2 px-3 py-1`}>
              {icon}
              {status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/contracts/${contract.id}/edit`)}
              className="gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Uredi
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Obriši
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <UserIcon className="w-5 h-5" />
                  Informacije o kupcu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ime i prezime</p>
                  <p className="text-base font-semibold">{getValue(contract.customer?.name)}</p>
                </div>
                {contract.customer?.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{contract.customer.email}</p>
                  </div>
                )}
                {contract.customer?.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                    <p className="text-base">{contract.customer.phoneNumber}</p>
                  </div>
                )}
                {contract.customer?.address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Adresa</p>
                    <p className="text-base">{contract.customer.address}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Broj pasoša</p>
                  <p className="text-base font-mono">{getValue(contract.customer?.passportNumber)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Broj vozačke</p>
                  <p className="text-base font-mono">{getValue(contract.customer?.driverLicenseNumber)}</p>
                </div>
                {contract.customer?.countryOfOrigin && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Zemlja porijekla</p>
                    <p className="text-base">{contract.customer.countryOfOrigin}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TruckIcon className="w-5 h-5" />
                  Informacije o vozilu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-base font-semibold">{getValue(contract.car?.model)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registarska oznaka</p>
                  <p className="text-base font-mono font-bold">{getValue(contract.car?.licensePlate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proizvođač</p>
                  <p className="text-base">{getValue(contract.car?.manufacturer)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Godina</p>
                  <p className="text-base">{getValue(contract.car?.year)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Rental Period */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <CalendarIcon className="w-5 h-5" />
                  Period najma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Datum početka</p>
                  <p className="text-base font-semibold">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Datum završetka</p>
                  <p className="text-base font-semibold">{formatDate(contract.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trajanje</p>
                  <p className="text-base font-semibold">
                    {calculateDuration(
                      contract.startDate,
                      contract.endDate
                    ) > 0
                      ? `${calculateDuration(
                          contract.startDate,
                          contract.endDate
                        )} dana`
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <CreditCardIcon className="w-5 h-5" />
                  Informacije o cijeni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dnevna cijena</p>
                  <p className="text-base font-semibold">{formatCurrency(contract.dailyRate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ukupan iznos</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(contract.totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {contract.additionalNotes && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-gray-500 md:col-span-2 lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-gray-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                    <DocumentTextIcon className="w-5 h-5" />
                    Dodatne napomene
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-base whitespace-pre-wrap">{contract.additionalNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Customer Documents Photos */}
            {(drivingLicensePhoto || passportPhoto) && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-500 md:col-span-2 lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
                    <PhotographIcon className="w-5 h-5" />
                    Dokumenti kupca
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drivingLicensePhoto && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Vozačka dozvola</p>
                        <div
                          className="relative group/photo rounded-lg overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors"
                          onClick={() => openPhotoModal(drivingLicensePhoto, 'Vozačka dozvola')}
                        >
                          <img
                            src={drivingLicensePhoto}
                            alt="Vozačka dozvola"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomInIcon className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    {passportPhoto && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Pasoš</p>
                        <div
                          className="relative group/photo rounded-lg overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors"
                          onClick={() => openPhotoModal(passportPhoto, 'Pasoš')}
                        >
                          <img
                            src={passportPhoto}
                            alt="Pasoš"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomInIcon className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contract Photo */}
            {contractPhoto && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500 md:col-span-2 lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-teal-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                    <PhotographIcon className="w-5 h-5" />
                    Slika ugovora
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div
                    className="relative group/photo rounded-lg overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors max-w-2xl mx-auto"
                    onClick={() => openPhotoModal(contractPhoto, 'Ugovor')}
                  >
                    <img
                      src={contractPhoto}
                      alt="Ugovor"
                      className="w-full h-96 object-contain bg-muted"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomInIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contract Metadata */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-slate-500 md:col-span-2 lg:col-span-3">
              <CardHeader className="bg-gradient-to-r from-slate-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-400">
                  <DocumentTextIcon className="w-5 h-5" />
                  Informacije o ugovoru
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kreirao</p>
                    <p className="text-base font-semibold">
                      {contract.createdBy?.username || contract.createdBy?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Datum kreiranja</p>
                    <p className="text-base">{formatDate(contract.createdAt)}</p>
                  </div>
                  {contract.updatedBy && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ažurirao</p>
                        <p className="text-base font-semibold">
                          {contract.updatedBy.username || contract.updatedBy.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Datum ažuriranja</p>
                        <p className="text-base">{formatDate(contract.updatedAt)}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {modalOpen && modalPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closePhotoModal}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <XIcon className="w-6 h-6 text-white" />
            </button>
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-4">{modalPhoto.title}</h3>
              <img
                src={modalPhoto.src}
                alt={modalPhoto.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati ugovor?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati ovaj ugovor? Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractDetailsPage;
