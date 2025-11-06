import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { toast } from 'react-toastify';
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  SearchIcon,
  FilterIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  DownloadIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,

  ViewGridIcon,
  ViewListIcon,
} from '@heroicons/react/solid';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { downloadDocument } from '@/shared/services/uploadService';
import { deleteCar, getCars } from '../services/carService';
import { Contract, getActiveContracts } from '@/features/contracts';
import { Car } from '../types/car.types';

// Define the keys that can be sorted
type SortableCarKey = keyof Pick<
  Car,
  'manufacturer' | 'model' | 'year' | 'pricePerDay' | 'licensePlate'
>;

type CarStatusFilter =
  | 'all'
  | 'available'
  | 'rented'
  | 'maintenance'
  | 'unavailable';

interface SortConfig {
  key: SortableCarKey | null;
  direction: 'asc' | 'desc';
}

const CarsPage = () => {
  const navigate = useNavigate();

  // State management
  const [cars, setCars] = useState<Car[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [carPhotos, setCarPhotos] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CarStatusFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Check if on mobile
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Load car photos
  const loadCarPhotos = async (cars: Car[]) => {
    const photoPromises = cars
      .filter((car) => car.photoUrl)
      .map(async (car) => {
        try {
          const photoBlob = await downloadDocument(car.photoUrl!);
          const photoUrl = URL.createObjectURL(photoBlob);
          return { licensePlate: car.licensePlate, photoUrl };
        } catch (error) {
          console.error(
            `Error loading photo for car ${car.licensePlate}:`,
            error
          );
          return { licensePlate: car.licensePlate, photoUrl: null };
        }
      });

    const photoResults = await Promise.all(photoPromises);
    const photoMap: Record<string, string> = {};

    photoResults.forEach((result) => {
      if (result.photoUrl) {
        photoMap[result.licensePlate] = result.photoUrl;
      }
    });

    setCarPhotos(photoMap);
  };

  // Set view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    } else {
      setViewMode('table');
    }
  }, [isMobile]);

  // Fetch cars and active contracts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsData, contracts] = await Promise.all([
          getCars(),
          getActiveContracts(),
        ]);
        setCars(carsData);
        setActiveContracts(contracts);

        // Load car photos
        await loadCarPhotos(carsData);

        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Neuspješno učitavanje podataka. Molimo pokušajte ponovo.');
        toast.error('Neuspješno učitavanje podataka');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cleanup photo URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(carPhotos).forEach((photoUrl) => {
        URL.revokeObjectURL(photoUrl);
      });
    };
  }, [carPhotos]);

  // Create a set of busy car license plates for quick lookup
  const busyCarLicensePlates = useMemo(() => {
    return new Set(
      activeContracts
        .map((contract) => {
          // Handle both possible contract structures
          if (typeof contract.car.licensePlate === 'string') {
            return contract.car.licensePlate;
          } else if (contract.car && contract.car.licensePlate) {
            return contract.car.licensePlate;
          }
          return '';
        })
        .filter((plate) => plate !== '')
    );
  }, [activeContracts]);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    // First, filter the cars
    let result = [...cars];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (car) =>
          car.manufacturer.toLowerCase().includes(lowerSearchTerm) ||
          car.model.toLowerCase().includes(lowerSearchTerm) ||
          car.licensePlate.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isBusy = statusFilter === 'rented';
      result = result.filter((car) =>
        isBusy
          ? busyCarLicensePlates.has(car.licensePlate)
          : !busyCarLicensePlates.has(car.licensePlate)
      );
    }

    // Then, sort the filtered results
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!]; // Non-null assertion is safe here
        const bValue = b[sortConfig.key!];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    return result;
  }, [cars, searchTerm, statusFilter, sortConfig, busyCarLicensePlates]);

  // Pagination logic
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCars.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCars, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCars.length / itemsPerPage);

  // Event handlers
  const handleSort = (key: SortableCarKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleEdit = (car: Car) => {
    navigate(`/cars/${car.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/cars/new');
  };

  const handleDelete = async (licensePlate: string) => {
    if (busyCarLicensePlates.has(licensePlate)) {
      toast.error('Nije moguće obrisati vozilo koje je trenutno u upotrebi');
      return;
    }

    const confirmed = window.confirm(
      'Da li ste sigurni da želite obrisati ovo vozilo?'
    );
    if (confirmed) {
      try {
        setLoading(true);
        await deleteCar(licensePlate);
        const updatedCars = await getCars();
        setCars(updatedCars);
        toast.success('Vozilo je uspješno obrisano');
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('Neuspješno brisanje vozila');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (car: Car) => {
    navigate(`/cars/${car.id}`);
  };

  const handleViewAvailability = (car: Car) => {
    navigate(`/cars/${car.id}/availability`);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  // Render table header with sort indicators
  const renderTableHeader = (
    label: string,
    key: SortableCarKey,
    className?: string
  ) => {
    const isSorted = sortConfig.key === key;
    const SortIcon =
      sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon;

    return (
      <TableHead
        className={`cursor-pointer ${className || ''}`}
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isSorted ? (
            <SortIcon className="w-4 h-4" />
          ) : (
            <SortAscendingIcon className="w-4 h-4 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Proizvođač',
      'Model',
      'Godina',
      'Boja',
      'Registarska oznaka',
      'Cijena po danu',
      'Status',
    ];
    const csvData = filteredAndSortedCars.map((car) => [
      car.manufacturer,
      car.model,
      car.year,
      car.color || 'N/A',
      car.licensePlate,
      car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A',
      busyCarLicensePlates.has(car.licensePlate) ? 'Zauzeto' : 'Dostupno',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cars.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render car card for mobile view
  const renderCarCard = (car: Car) => {
    const isBusy = busyCarLicensePlates.has(car.licensePlate);
    const carPhoto = carPhotos[car.licensePlate];

    return (
      <Card key={car.licensePlate} className="overflow-hidden">
        {/* Car Photo Header */}
        {carPhoto ? (
          <div className="relative h-48 bg-muted">
            <img
              src={carPhoto}
              alt={`${car.manufacturer} ${car.model}`}
              className="w-full h-full object-cover"
            />
            {/* Status Badge Overlay */}
            <div className="absolute top-3 right-3">
              <Badge
                variant={isBusy ? 'destructive' : 'default'}
                className="gap-1 bg-white/90 backdrop-blur-sm"
              >
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
            {/* Color Indicator */}
            {car.color && (
              <div
                className="absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: car.color }}
                title={`Color: ${car.color}`}
              />
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/50 flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
              <p className="text-sm text-muted-foreground">No Photo</p>
            </div>
            {/* Status Badge Overlay */}
            <div className="absolute top-3 right-3">
              <Badge
                variant={isBusy ? 'destructive' : 'default'}
                className="gap-1"
              >
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
        )}

        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {car.manufacturer} {car.model}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Godina</p>
                <p className="font-medium">{car.year}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Cijena/Dan</p>
                <p className="font-medium">
                  {car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TagIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">
                Registarska oznaka
              </p>
              <p className="font-medium">{car.licensePlate}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t bg-gray-50/50">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(car)}
              className="w-full"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Pregled
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewAvailability(car)}
              className="w-full"
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Kalendar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(car)}
              className="w-full"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Uredi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(car.licensePlate)}
              disabled={isBusy}
              className="w-full"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Obriši
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Table Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Vozila</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <DownloadIcon className="w-4 h-4" />
            <span className="ml-2">Izvezi CSV</span>
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span className="ml-2">Dodaj novo vozilo</span>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {!isMobile && (
            <Button
              variant="outline"
              onClick={toggleViewMode}
              aria-label={`Prebaci na ${viewMode === 'table' ? 'kartice' : 'tabelu'} pregled`}
              className="w-full sm:w-auto"
            >
              {viewMode === 'table' ? (
                <ViewGridIcon className="w-4 h-4" />
              ) : (
                <ViewListIcon className="w-4 h-4" />
              )}
              <span className="ml-2">
                {viewMode === 'table' ? 'Pregled kartica' : 'Pregled tabele'}
              </span>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži vozila..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CarStatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <FilterIcon className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtriraj po statusu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="available">Dostupno</SelectItem>
              <SelectItem value="rented">Iznajmljeno</SelectItem>
              <SelectItem value="maintenance">Servis</SelectItem>
              <SelectItem value="unavailable">Nedostupno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          <ExclamationCircleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-2 p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Učitavanje...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && cars.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <PlusCircleIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nema vozila</h3>
          <p className="text-muted-foreground mb-4">
            Počnite dodavanjem prvog vozila
          </p>
          <Button onClick={handleCreate}>
            <PlusCircleIcon className="w-4 h-4" />
            Dodaj novo vozilo
          </Button>
        </div>
      )}

      {/* Car table or card view */}
      {!loading && cars.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderTableHeader('Proizvođač', 'manufacturer')}
                    {renderTableHeader('Model', 'model', 'hide-on-md')}
                    {renderTableHeader('Godina', 'year', 'hide-on-lg')}
                    {renderTableHeader('Registracija', 'licensePlate')}
                    {renderTableHeader(
                      'Cijena/Dan',
                      'pricePerDay',
                      'hide-on-xl'
                    )}
                    <TableHead className="hide-on-sm">Status</TableHead>
                    <TableHead className="text-center">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCars.length > 0 ? (
                    paginatedCars.map((car) => {
                      const isBusy = busyCarLicensePlates.has(car.licensePlate);

                      return (
                        <TableRow key={car.licensePlate}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300"
                                style={{
                                  backgroundColor: car.color || '#6b7280',
                                }}
                                title={`Color: ${car.color || 'Default'}`}
                              />
                              <span>{car.manufacturer}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hide-on-md">
                            {car.model}
                          </TableCell>
                          <TableCell className="hide-on-lg">
                            {car.year}
                          </TableCell>
                          <TableCell>{car.licensePlate}</TableCell>
                          <TableCell className="hide-on-xl">
                            {car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A'}
                          </TableCell>
                          <TableCell className="hide-on-sm">
                            <Badge
                              variant={isBusy ? 'destructive' : 'default'}
                              className="gap-1"
                            >
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
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(car)}
                                className="h-8 w-8 p-0"
                                aria-label="Pregled"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAvailability(car)}
                                className="h-8 w-8 p-0"
                                aria-label="Dostupnost"
                              >
                                <CalendarIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(car)}
                                className="h-8 w-8 p-0"
                                aria-label="Uredi"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(car.licensePlate)}
                                className="h-8 w-8 p-0"
                                disabled={isBusy}
                                aria-label="Obriši"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm || statusFilter !== 'all'
                          ? 'Nema vozila koja odgovaraju kriterijima pretrage'
                          : 'Nema dostupnih vozila'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCars.length > 0 ? (
                paginatedCars.map((car) => renderCarCard(car))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nema vozila koja odgovaraju kriterijima pretrage'
                    : 'Nema dostupnih vozila'}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {filteredAndSortedCars.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Prikazuje se {(currentPage - 1) * itemsPerPage + 1} do{' '}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedCars.length
              )}{' '}
              od {filteredAndSortedCars.length} rezultata
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Stavki po stranici:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="ml-1">Prethodna</span>
              </Button>

              <span className="px-4 py-2 text-sm text-center">
                Stranica {currentPage} od {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-none"
              >
                <span className="mr-1">Sljedeća</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 p-0"
          aria-label="Dodaj novo vozilo"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default CarsPage;
