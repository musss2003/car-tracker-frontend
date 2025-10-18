import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCars } from '../../services/carService';
import { getActiveContracts } from '../../services/contractService';
import { downloadDocument } from '../../services/uploadService';
import { Car } from '../../types/Car';
import { Contract } from '../../types/Contract';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftIcon, 
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  TagIcon,
  CogIcon,
  CalendarIcon
} from '@heroicons/react/solid';

const CarDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [carPhoto, setCarPhoto] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  // Load car photo
  const loadCarPhoto = async (photoUrl: string) => {
    try {
      setLoadingPhoto(true);
      const photoBlob = await downloadDocument(photoUrl);
      const photoUrlObject = URL.createObjectURL(photoBlob);
      setCarPhoto(photoUrlObject);
    } catch (error) {
      console.error('Error loading car photo:', error);
      setCarPhoto(null);
    } finally {
      setLoadingPhoto(false);
    }
  };

  useEffect(() => {
    const fetchCarAndContracts = async () => {
      try {
        setLoading(true);
        const [cars, activeContracts] = await Promise.all([
          getCars(),
          getActiveContracts()
        ]);
        
        const foundCar = cars.find((c: Car) => c.id === id);
        
        if (!foundCar) {
          setError('Vozilo nije pronađeno');
          toast.error('Vozilo nije pronađeno');
          navigate('/cars');
          return;
        }
        
        // Check if car is busy (has active contract)
        const busyCarLicensePlates = new Set(
          activeContracts.map((contract: Contract) => contract.car.licensePlate)
        );
        setIsBusy(busyCarLicensePlates.has(foundCar.licensePlate));
        
        setCar(foundCar);
        
        // Load car photo if available
        if (foundCar.photoUrl) {
          loadCarPhoto(foundCar.photoUrl);
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Neuspješno učitavanje vozila');
        toast.error('Neuspješno učitavanje vozila');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarAndContracts();
    }
  }, [id, navigate]);

  // Cleanup photo URL on unmount
  useEffect(() => {
    return () => {
      if (carPhoto) {
        URL.revokeObjectURL(carPhoto);
      }
    };
  }, [carPhoto]);

  const handleEdit = () => {
    navigate(`/cars/${id}/edit`);
  };

  const handleClose = () => {
    navigate('/cars');
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

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Greška</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Vozilo nije pronađeno'}</p>
            <Button onClick={() => navigate('/cars')} className="w-full">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Nazad na vozila
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex items-center gap-2 w-fit"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Nazad</span>
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">
                {car.manufacturer} {car.model}
              </h1>
              <Badge variant={isBusy ? "destructive" : "default"} className="gap-1 w-fit">
                {isBusy ? (
                  <>
                    <ExclamationCircleIcon className="w-3 h-3" />
                    <span>Zauzeto</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-3 h-3" />
                    <span>Dostupno</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleEdit} className="flex items-center gap-2 w-full sm:w-auto">
              <PencilIcon className="w-4 h-4" />
              Uredi vozilo
            </Button>
            <Button 
              onClick={() => navigate(`/cars/${car.id}/availability`)} 
              variant="outline" 
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <CalendarIcon className="w-4 h-4" />
              Kalendar dostupnosti
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Car Photo */}
          <Card className="xl:col-span-1">
            <CardContent className="p-0">
              <div className="aspect-video xl:aspect-square relative bg-muted rounded-lg overflow-hidden">
                {loadingPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : carPhoto ? (
                  <img
                    src={carPhoto}
                    alt={`${car.manufacturer} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-full bg-white/50 flex items-center justify-center">
                      <span className="text-xl xl:text-2xl">🚗</span>
                    </div>
                    <p className="text-xs xl:text-sm text-muted-foreground">Nema fotografije</p>
                  </div>
                )}
                
                {/* Color indicator overlay */}
                {car.color && (
                  <div className="absolute top-3 left-3 xl:top-4 xl:left-4">
                    <div 
                      className="w-6 h-6 xl:w-8 xl:h-8 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: car.color }}
                      title={`Boja: ${car.color}`}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Car Details */}
          <div className="xl:col-span-3 space-y-4 lg:space-y-6">
            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Basic Information */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TagIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    Osnovne informacije
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Proizvođač</p>
                      <p className="font-medium text-sm">{car.manufacturer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Model</p>
                      <p className="font-medium text-sm">{car.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Godina</p>
                      <p className="font-medium text-sm">{car.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Registarska oznaka</p>
                      <p className="font-medium text-sm">{car.licensePlate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Boja</p>
                      <div className="flex items-center gap-2">
                        {car.color && (
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: car.color }}
                          />
                        )}
                        <span className="font-medium text-sm">{car.color || 'Nedefinirano'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Kategorija</p>
                      <p className="font-medium text-sm">{car.category || 'Nedefinirano'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CogIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    Tehnički podaci
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Broj šasije</p>
                      <p className="font-medium text-sm break-all">{car.chassisNumber || 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Gorivo</p>
                      <p className="font-medium text-sm">{car.fuelType || 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Transmisija</p>
                      <p className="font-medium text-sm">{car.transmission || 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Broj vrata</p>
                      <p className="font-medium text-sm">{car.doors || 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Kilometraža</p>
                      <p className="font-medium text-sm">{car.mileage ? `${car.mileage} km` : 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Snaga motora</p>
                      <p className="font-medium text-sm">{car.enginePower ? `${car.enginePower} KS` : 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium text-sm">{car.status || 'Nedefinirano'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Trenutna lokacija</p>
                      <p className="font-medium text-sm">{car.currentLocation || 'Nedefinirano'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing - Full Width */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CurrencyDollarIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  Cijena
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Cijena po danu</p>
                    <p className="text-xl lg:text-2xl font-bold">
                      {car.pricePerDay ? `${car.pricePerDay} BAM` : 'Nedefinirano'}
                    </p>
                  </div>
                  {car.pricePerDay && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Mjesečno (30 dana)</p>
                      <p className="text-lg font-semibold text-muted-foreground">
                        {(parseFloat(String(car.pricePerDay)) * 30).toFixed(2)} BAM
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;
