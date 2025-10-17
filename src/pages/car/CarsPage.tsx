'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { getActiveContracts } from '../../services/contractService';
import { getCars, deleteCar } from '../../services/carService';
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
  ColorSwatchIcon,
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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from '@/types/Car';
import { Contract } from '@/types/Contract';
import CarAvailabilityCalendar from '@/components/Car/CarAvailabilityCalendar/CarAvailabilityCalendar';

// Define the keys that can be sorted
type SortableCarKey = keyof Pick<
  Car,
  'manufacturer' | 'model' | 'year' | 'pricePerDay'
>;

type CarStatusFilter = 'all' | 'available' | 'rented' | 'maintenance' | 'unavailable';

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
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] =
    useState<boolean>(false);
  const [selectedCarForCalendar, setSelectedCarForCalendar] = useState<
    Car | undefined
  >(undefined);

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
          getActiveContracts()
        ]);
        setCars(carsData);
        setActiveContracts(contracts);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      toast.error('Cannot delete a car that is currently in use');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this car?'
    );
    if (confirmed) {
      try {
        setLoading(true);
        await deleteCar(licensePlate);
        const updatedCars = await getCars();
        setCars(updatedCars);
        toast.success('Car deleted successfully');
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('Failed to delete car');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (car: Car) => {
    navigate(`/cars/${car.id}`);
  };

  const handleViewAvailability = (car: Car) => {
    setSelectedCarForCalendar(car);
    setShowAvailabilityCalendar(true);
  };

  const handleCloseAvailabilityCalendar = () => {
    setShowAvailabilityCalendar(false);
    setSelectedCarForCalendar(undefined);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  // Render table header with sort indicators
  const renderTableHeader = (label: string, key: SortableCarKey) => {
    const isSorted = sortConfig.key === key;
    const SortIcon =
      sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon;

    return (
      <TableHead
        className="cursor-pointer"
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
      'Manufacturer',
      'Model',
      'Year',
      'Color',
      'License Plate',
      'Price per Day',
      'Status',
    ];
    const csvData = filteredAndSortedCars.map((car) => [
      car.manufacturer,
      car.model,
      car.year,
      car.color || 'N/A',
      car.licensePlate,
      car.pricePerDay ? `$${car.pricePerDay}` : 'N/A',
      busyCarLicensePlates.has(car.licensePlate) ? 'Busy' : 'Available',
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

    return (
      <Card key={car.licensePlate} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-lg">🚗</span>
              </div>
              <CardTitle className="text-lg">
                {car.manufacturer} {car.model}
              </CardTitle>
            </div>
            <Badge variant={isBusy ? "destructive" : "default"} className="gap-1 shrink-0">
              {isBusy ? (
                <>
                  <ExclamationCircleIcon className="w-3 h-3" />
                  <span>Busy</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-3 h-3" />
                  <span>Available</span>
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          <div className="flex items-center gap-3 text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground min-w-[80px]">Year:</span>
            <span className="font-medium">{car.year}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <TagIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground min-w-[80px]">License:</span>
            <span className="font-medium">{car.licensePlate}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <ColorSwatchIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground min-w-[80px]">Color:</span>
            <div className="flex items-center gap-2">
              {car.color && (
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: car.color }}
                />
              )}
              <span className="font-medium">{car.color || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground min-w-[80px]">Price/Day:</span>
            <span className="font-medium">
              {car.pricePerDay ? `$${car.pricePerDay}` : 'N/A'}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(car)}
            className="flex-1 min-w-[120px]"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewAvailability(car)}
            className="flex-1 min-w-[120px]"
          >
            <CalendarIcon className="w-4 h-4" />
            Availability
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(car)}
            className="flex-1 min-w-[120px]"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(car.licensePlate)}
            disabled={isBusy}
            className="flex-1 min-w-[120px]"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Availability Calendar Modal (keep this one as it's a utility, not CRUD) */}
      {showAvailabilityCalendar && selectedCarForCalendar && (
        <div className="car-modal-overlay">
          <div className="modal-content modal-content-large">
            <CarAvailabilityCalendar
              car={selectedCarForCalendar}
              onClose={handleCloseAvailabilityCalendar}
            />
          </div>
        </div>
      )}

      {/* Table Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cars</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <DownloadIcon className="w-4 h-4" />
            <span className="ml-2">Export CSV</span>
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span className="ml-2">Add New Car</span>
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
              aria-label={`Switch to ${viewMode === 'table' ? 'card' : 'table'} view`}
              className="w-full sm:w-auto"
            >
              {viewMode === 'table' ? <ViewGridIcon className="w-4 h-4" /> : <ViewListIcon className="w-4 h-4" />}
              <span className="ml-2">{viewMode === 'table' ? 'Card View' : 'Table View'}</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CarStatusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <FilterIcon className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
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
          <span>Loading...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && cars.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <PlusCircleIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No cars found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first car</p>
          <Button onClick={handleCreate}>
            <PlusCircleIcon className="w-4 h-4" />
            Add New Car
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
                    {renderTableHeader('Manufacturer', 'manufacturer')}
                    {renderTableHeader('Model', 'model')}
                    {renderTableHeader('Year', 'year')}
                    <TableHead className="hide-on-small">Color</TableHead>
                    <TableHead className="hide-on-small">
                      License Plate
                    </TableHead>
                    {renderTableHeader('Price/Day', 'pricePerDay')}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCars.length > 0 ? (
                    paginatedCars.map((car) => {
                      const isBusy = busyCarLicensePlates.has(
                        car.licensePlate
                      );

                      return (
                        <TableRow key={car.licensePlate}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs">🚗</span>
                              </div>
                              <span>{car.manufacturer}</span>
                            </div>
                          </TableCell>
                          <TableCell>{car.model}</TableCell>
                          <TableCell>{car.year}</TableCell>
                          <TableCell className="hide-on-small">
                            <div className="flex items-center gap-2">
                              {car.color && (
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: car.color }}
                                ></div>
                              )}
                              <span>{car.color || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hide-on-small">
                            {car.licensePlate}
                          </TableCell>
                          <TableCell>
                            {car.pricePerDay
                              ? `$${car.pricePerDay}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isBusy ? "destructive" : "default"} className="gap-1">
                              {isBusy ? (
                                <>
                                  <ExclamationCircleIcon className="w-3 h-3" />
                                  <span>Busy</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span>Available</span>
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
                                aria-label="View"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAvailability(car)}
                                className="h-8 w-8 p-0"
                                aria-label="Availability"
                              >
                                <CalendarIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(car)}
                                className="h-8 w-8 p-0"
                                aria-label="Edit"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(car.licensePlate)}
                                className="h-8 w-8 p-0"
                                disabled={isBusy}
                                aria-label="Delete"
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
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No cars match your search criteria'
                          : 'No cars available'}
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
                    ? 'No cars match your search criteria'
                    : 'No cars available'}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCars.length)} of {filteredAndSortedCars.length} results
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="ml-1">Previous</span>
              </Button>
              
              <span className="px-4 py-2 text-sm text-center">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-none"
              >
                <span className="mr-1">Next</span>
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
          aria-label="Add New Car"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default CarsPage;
