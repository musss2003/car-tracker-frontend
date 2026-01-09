import { useEffect, useState, useMemo } from 'react';
import { logError } from '@/shared/utils/logger';
import { toast } from 'react-toastify';
import {
  FilterIcon,
  DocumentDownloadIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  CalendarIcon,
} from '@heroicons/react/solid';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// shadcn/ui imports
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import Skeleton from '@/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { useNavigate } from 'react-router-dom';

import { getActiveContracts } from '@/features/contracts';
import type { CarWithStatus } from '../types/car.types';
import { deleteCar, getCars } from '../services/carService';
import { CarCard, EmptyCarState } from '../components';
import { useCarPhotos } from '../hooks';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const CarsPage = () => {
  const navigate = useNavigate();

  // State management
  const [cars, setCars] = useState<CarWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [carToDelete, setCarToDelete] = useState<CarWithStatus | null>(null);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'manufacturer',
    direction: 'asc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Load car photos using custom hook
  const photoUrls = useCarPhotos(cars);

  // Fetch cars data
  const fetchCars = async () => {
    try {
      setLoading(true);
      const [carsData, activeContracts] = await Promise.all([
        getCars(),
        getActiveContracts(),
      ]);

      // Store busy cars
      const busyPlates = new Set(
        activeContracts
          .map((contract) => contract.car?.licensePlate)
          .filter((plate) => plate)
      );

      // Attach busy status to cars
      const carsWithStatus: CarWithStatus[] = carsData.map((car) => ({
        ...car,
        isBusy: busyPlates.has(car.licensePlate),
      }));

      setCars(carsWithStatus);
      setError(null);
    } catch (err) {
      logError('Failed to fetch cars:', err);
      setError('Failed to load cars. Please try again later.');
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    let result = [...cars];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (car) =>
          car.manufacturer?.toLowerCase().includes(lowerSearchTerm) ||
          car.model?.toLowerCase().includes(lowerSearchTerm) ||
          car.licensePlate?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'available') {
        result = result.filter((car) => !car.isBusy);
      } else if (filterStatus === 'rented') {
        result = result.filter((car) => car.isBusy);
      }
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: string | number | Date = '';
        let bValue: string | number | Date = '';

        const key = sortConfig.key as keyof CarWithStatus;
        const aVal = a[key];
        const bVal = b[key];

        aValue =
          typeof aVal === 'string' ||
          typeof aVal === 'number' ||
          aVal instanceof Date
            ? aVal
            : '';
        bValue =
          typeof bVal === 'string' ||
          typeof bVal === 'number' ||
          bVal instanceof Date
            ? bVal
            : '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [cars, searchTerm, filterStatus, sortConfig]);

  // Pagination logic
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCars.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCars, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCars.length / itemsPerPage);

  // Event handlers
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleDeleteCar = async (car: CarWithStatus) => {
    try {
      setLoading(true);
      if (car.licensePlate) {
        await deleteCar(car.licensePlate);
        await fetchCars();
        toast.success('Vozilo uspješno obrisano');
        setShowDeleteDialog(false);
        setCarToDelete(null);
      } else {
        toast.error('Registarska oznaka nije pronađena.');
      }
    } catch (error) {
      logError('Error deleting car:', error);
      toast.error('Brisanje vozila nije uspjelo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/cars/new');
  };

  const handleViewDetails = (car: CarWithStatus) => {
    navigate(`/cars/${car.id}`);
  };

  const handleEdit = (car: CarWithStatus) => {
    navigate(`/cars/${car.id}/edit`);
  };

  const handleViewAvailability = (car: CarWithStatus) => {
    navigate(`/cars/${car.id}/availability`);
  };

  // Export functions
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Cars List', 20, 10);

      const tableColumn = [
        'Proizvođač',
        'Model',
        'Godina',
        'Registarska oznaka',
        'Kilometraža',
        'Cijena po danu',
        'Status',
      ];
      const tableRows = filteredAndSortedCars.map((car) => [
        car.manufacturer || 'N/A',
        car.model || 'N/A',
        car.year?.toString() || 'N/A',
        car.licensePlate || 'N/A',
        car.mileage ? `${car.mileage} km` : 'N/A',
        car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A',
        car.isBusy ? 'Zauzeto' : 'Dostupno',
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 135, 245] },
      });

      doc.save('vozila.pdf');
      toast.success('PDF uspješno izvezen');
    } catch (error) {
      logError('Error exporting to PDF:', error);
      toast.error('Izvoz PDF-a nije uspio');
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheetData = filteredAndSortedCars.map((car) => ({
        Proizvođač: car.manufacturer || 'N/A',
        Model: car.model || 'N/A',
        Godina: car.year?.toString() || 'N/A',
        'Registarska oznaka': car.licensePlate || 'N/A',
        Kilometraža: car.mileage ? `${car.mileage} km` : 'N/A',
        'Cijena po danu': car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A',
        Status: car.isBusy ? 'Zauzeto' : 'Dostupno',
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cars');
      XLSX.writeFile(workbook, 'vozila.xlsx');
      toast.success('Excel uspješno izvezen');
    } catch (error) {
      logError('Error exporting to Excel:', error);
      toast.error('Izvoz Excel-a nije uspio');
    }
  };

  const renderTableHeader = (label: string, key: string) => {
    const isSorted = sortConfig.key === key;

    return (
      <TableHead
        className="cursor-pointer select-none"
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isSorted ? (
            sortConfig.direction === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )
          ) : (
            <ChevronUpIcon className="w-4 h-4 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  };

  const renderStatusBadge = (isBusy: boolean) => {
    return (
      <Badge
        variant={isBusy ? 'destructive' : 'default'}
        className="flex items-center gap-1"
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
    );
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Upravljanje vozilima
            </h1>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <DocumentDownloadIcon className="w-4 h-4 mr-2" />
                    Izvoz
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background-100/80 dark:bg-background-100/80 backdrop-blur-sm rounded-md shadow-md">
                  <DropdownMenuItem onClick={exportToPDF}>
                    Izvezi kao PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    Izvezi kao Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleCreate} disabled={loading}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Dodaj vozilo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-6 py-4 border-b bg-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Pretraži po proizvođaču, modelu ili registarskoj oznaci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtriraj po statusu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="available">Dostupno</SelectItem>
                <SelectItem value="rented">Zauzeto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {paginatedCars.length > 0 ? (
                paginatedCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    photoUrl={photoUrls[car.id]}
                    onViewDetails={handleViewDetails}
                    onViewAvailability={handleViewAvailability}
                    onEdit={handleEdit}
                    onDelete={(car) => {
                      if (car.isBusy) {
                        toast.error(
                          'Nije moguće obrisati vozilo koje je trenutno u upotrebi'
                        );
                      } else {
                        setCarToDelete(car);
                        setShowDeleteDialog(true);
                      }
                    }}
                  />
                ))
              ) : (
                <EmptyCarState
                  hasFilters={searchTerm !== '' || filterStatus !== 'all'}
                />
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Manufacturer */}
                    {renderTableHeader('Proizvođač', 'manufacturer')}

                    {/* Model */}
                    <TableHead
                      className="hidden min-[900px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('model')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Model</span>
                        {sortConfig.key === 'model' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronUpIcon className="w-4 h-4 opacity-30" />
                        )}
                      </div>
                    </TableHead>

                    {/* Year */}
                    <TableHead
                      className="hidden min-[1100px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('year')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Godina</span>
                        {sortConfig.key === 'year' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronUpIcon className="w-4 h-4 opacity-30" />
                        )}
                      </div>
                    </TableHead>

                    {/* Plate */}
                    {renderTableHeader('Registarska oznaka', 'licensePlate')}

                    {/* Mileage */}
                    <TableHead className="hidden min-[1300px]:table-cell">
                      Kilometraža
                    </TableHead>

                    {/* Price */}
                    <TableHead
                      className="hidden min-[1300px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('pricePerDay')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Cijena/Dan</span>
                        {sortConfig.key === 'pricePerDay' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronUpIcon className="w-4 h-4 opacity-30" />
                        )}
                      </div>
                    </TableHead>

                    {/* Status */}
                    <TableHead className="hidden min-[800px]:table-cell">
                      Status
                    </TableHead>

                    {/* Actions */}
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedCars.length > 0 ? (
                    paginatedCars.map((car, index) => (
                      <TableRow key={car.id || index}>
                        {/* Manufacturer + Color */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {car.color && (
                              <div
                                className="w-4 h-4 rounded-full border-2 border-border"
                                style={{ backgroundColor: car.color }}
                              />
                            )}
                            <span className="font-medium">
                              {car.manufacturer || 'N/A'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Model */}
                        <TableCell className="hidden min-[900px]:table-cell">
                          {car.model || 'N/A'}
                        </TableCell>

                        {/* Year */}
                        <TableCell className="hidden min-[1100px]:table-cell">
                          {car.year || 'N/A'}
                        </TableCell>

                        {/* Plate */}
                        <TableCell>{car.licensePlate || 'N/A'}</TableCell>

                        {/* Mileage */}
                        <TableCell className="hidden min-[1300px]:table-cell">
                          {car.mileage ? `${car.mileage} km` : 'N/A'}
                        </TableCell>

                        {/* Price */}
                        <TableCell className="hidden min-[1300px]:table-cell">
                          {car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A'}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden min-[800px]:table-cell">
                          {renderStatusBadge(car.isBusy)}
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(car)}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewAvailability(car)}
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(car)}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={car.isBusy}
                              onClick={() => {
                                if (car.isBusy) {
                                  toast.error(
                                    'Nije moguće obrisati vozilo koje je trenutno u upotrebi'
                                  );
                                } else {
                                  setCarToDelete(car);
                                  setShowDeleteDialog(true);
                                }
                              }}
                            >
                              <TrashIcon className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm || filterStatus !== 'all'
                          ? 'Nema vozila koja odgovaraju vašim kriterijima pretrage'
                          : 'Nema dostupnih vozila'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Prikazujem {paginatedCars.length} od{' '}
                {filteredAndSortedCars.length} vozila
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / stranica</SelectItem>
                    <SelectItem value="10">10 / stranica</SelectItem>
                    <SelectItem value="20">20 / stranica</SelectItem>
                    <SelectItem value="50">50 / stranica</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Prethodna
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sljedeća
                  </Button>
                </div>

                <span className="text-sm text-muted-foreground">
                  Stranica {currentPage} od {totalPages}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija se ne može poništiti. Ovo će trajno obrisati vozilo
              {carToDelete && (
                <span className="font-medium">
                  {' '}
                  {carToDelete.manufacturer} {carToDelete.model} (
                  {carToDelete.licensePlate})
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCarToDelete(null);
              }}
            >
              Otkaži
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="bg-red-500 text-white"
              onClick={() => {
                if (carToDelete) {
                  handleDeleteCar(carToDelete);
                }
              }}
              disabled={!carToDelete}
            >
              Obriši
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CarsPage;
