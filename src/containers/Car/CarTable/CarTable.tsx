import type React from 'react';
import { useMediaQuery } from '@mui/material';
import {
  useState,
  useEffect,
  useMemo,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { getActiveContracts } from '../../../services/contractService';
import {
  updateCar,
  getCars,
  deleteCar,
  addCar,
} from '../../../services/carService';
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
  XIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  ColorSwatchIcon,
  ViewGridIcon,
  ViewListIcon,
} from '@heroicons/react/solid';
import './CarTable.css';
import type { Car } from '../../../types/Car';
import type { Contract } from '../../../types/Contract';
import EditCarForm from '../../../components/Car/EditCarForm/EditCarForm';
import CreateCarForm from '../../../components/Car/CreateCarForm/CreateCarForm';
import CarAvailabilityCalendar from '../../../components/Car/CarAvailabilityCalendar/CarAvailabilityCalendar';
import CarDetails from '../../../components/Car/CarDetails/CarDetails';

interface CarTableProps {
  cars: Car[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
}

interface ActionButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  icon: ReactNode;
  label: string;
  className?: string;
  disabled?: boolean;
}

// Define the keys that can be sorted
type SortableCarKey = keyof Pick<
  Car,
  'manufacturer' | 'model' | 'year' | 'price_per_day'
>;

type CarStatus = 'all' | 'available' | 'busy';

interface SortConfig {
  key: SortableCarKey | null;
  direction: 'asc' | 'desc';
}

const CarTable: React.FC<CarTableProps> = ({
  cars: initialCars,
  setCars: setParentCars,
}) => {
  // State management
  const [cars, setCars] = useState<Car[]>(initialCars || []);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [editCar, setEditCar] = useState<Car | undefined>(undefined);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>(undefined);
  const [isCreatingCar, setIsCreatingCar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] =
    useState<boolean>(false);
  const [selectedCarForCalendar, setSelectedCarForCalendar] = useState<
    Car | undefined
  >(undefined);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CarStatus>('all');
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

  // Fetch active contracts
  useEffect(() => {
    const fetchActiveContracts = async () => {
      try {
        setIsLoading(true);
        const contracts = await getActiveContracts();
        setActiveContracts(contracts);
        setError(null);
      } catch (error) {
        console.error('Error fetching active contracts:', error);
        setError('Failed to load contract data. Please try again later.');
        toast.error('Failed to load contract data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveContracts();
  }, []);

  // Update local cars state when parent cars change
  useEffect(() => {
    if (initialCars) {
      setCars(initialCars);
    }
  }, [initialCars]);

  // Create a set of busy car license plates for quick lookup
  const busyCarLicensePlates = useMemo(() => {
    return new Set(
      activeContracts
        .map((contract) => {
          // Handle both possible contract structures
          if (typeof contract.car.license_plate === 'string') {
            return contract.car.license_plate;
          } else if (contract.car && contract.car.license_plate) {
            return contract.car.license_plate;
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
          car.license_plate.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isBusy = statusFilter === 'busy';
      result = result.filter((car) =>
        isBusy
          ? busyCarLicensePlates.has(car.license_plate)
          : !busyCarLicensePlates.has(car.license_plate)
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

  const handleSave = async (updatedCar: Car) => {
    try {
      setIsLoading(true);
      await updateCar(updatedCar.license_plate, updatedCar);
      const updatedCars = await getCars();
      setCars(updatedCars);
      setParentCars(updatedCars);
      setEditCar(undefined);
      toast.success('Car updated successfully');
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error('Failed to update car');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (newCar: Car) => {
    try {
      setIsLoading(true);
      await addCar(newCar);
      const updatedCars = await getCars();
      setCars(updatedCars);
      setParentCars(updatedCars);
      setIsCreatingCar(false);
      toast.success('Car added successfully');
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('Failed to add car');
    } finally {
      setIsLoading(false);
    }
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
        setIsLoading(true);
        await deleteCar(licensePlate);
        const updatedCars = await getCars();
        setCars(updatedCars);
        setParentCars(updatedCars);
        toast.success('Car deleted successfully');
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('Failed to delete car');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewDetails = (car: Car) => {
    setSelectedCar(car);
  };

  const handleCloseDetails = () => {
    setSelectedCar(undefined);
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
      <th
        className="table-header table-header-sortable"
        onClick={() => handleSort(key)}
      >
        <div className="table-header-content">
          <span>{label}</span>
          {isSorted ? (
            <SortIcon className="sort-icon sort-icon-active" />
          ) : (
            <SortAscendingIcon className="sort-icon sort-icon-inactive" />
          )}
        </div>
      </th>
    );
  };

  // Render action buttons
  const ActionButton: React.FC<ActionButtonProps> = ({
    onClick,
    icon,
    label,
    className = '',
    disabled = false,
  }) => (
    <button
      onClick={onClick}
      className={`action-button ${className} ${disabled ? 'action-button-disabled' : ''}`}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {icon}
      <span className="action-label">{label}</span>
    </button>
  );

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
      car.license_plate,
      car.price_per_day ? `$${car.price_per_day}` : 'N/A',
      busyCarLicensePlates.has(car.license_plate) ? 'Busy' : 'Available',
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
    const isBusy = busyCarLicensePlates.has(car.license_plate);

    return (
      <div key={car.license_plate} className="car-card">
        <div className="car-card-header">
          <div className="car-card-title">
            <h3>
              {car.manufacturer} {car.model}
            </h3>
            <span
              className={`car-card-status ${isBusy ? 'status-busy' : 'status-available'}`}
            >
              {isBusy ? (
                <>
                  <ExclamationCircleIcon className="status-icon" />
                  <span>Busy</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="status-icon" />
                  <span>Available</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="car-card-content">
          <div className="car-card-detail">
            <CalendarIcon className="car-card-icon" />
            <span className="car-card-label">Year:</span>
            <span className="car-card-value">{car.year}</span>
          </div>

          <div className="car-card-detail">
            <TagIcon className="car-card-icon" />
            <span className="car-card-label">License:</span>
            <span className="car-card-value">{car.license_plate}</span>
          </div>

          <div className="car-card-detail">
            <ColorSwatchIcon className="car-card-icon" />
            <span className="car-card-label">Color:</span>
            <div className="car-card-color">
              {car.color && (
                <div
                  className="color-dot"
                  style={{ backgroundColor: car.color }}
                ></div>
              )}
              <span>{car.color || 'N/A'}</span>
            </div>
          </div>

          <div className="car-card-detail">
            <CurrencyDollarIcon className="car-card-icon" />
            <span className="car-card-label">Price/Day:</span>
            <span className="car-card-value">
              {car.price_per_day ? `$${car.price_per_day}` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="car-card-actions">
          <ActionButton
            onClick={() => handleViewDetails(car)}
            icon={<EyeIcon className="action-icon" />}
            label="View"
            className="action-view"
          />
          <ActionButton
            onClick={() => handleViewAvailability(car)}
            icon={<CalendarIcon className="action-icon" />}
            label="Availability"
            className="action-calendar"
          />
          <ActionButton
            onClick={() => setEditCar(car)}
            icon={<PencilIcon className="action-icon" />}
            label="Edit"
            className="action-edit"
          />
          <ActionButton
            onClick={() => handleDelete(car.license_plate)}
            icon={<TrashIcon className="action-icon" />}
            label="Delete"
            className="action-delete"
            disabled={isBusy}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="car-table-container">
      {/* Modals */}
      {editCar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setEditCar(undefined)}
            >
              <XIcon className="modal-close-icon" />
            </button>
            <EditCarForm
              car={editCar}
              onSave={handleSave}
              onCancel={() => setEditCar(undefined)}
            />
          </div>
        </div>
      )}

      {isCreatingCar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setIsCreatingCar(false)}
            >
              <XIcon className="modal-close-icon" />
            </button>
            <CreateCarForm
              onSave={handleCreate}
              onClose={() => setIsCreatingCar(false)}
            />
          </div>
        </div>
      )}

      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseDetails}>
              <XIcon className="modal-close-icon" />
            </button>
            <CarDetails
              car={selectedCar}
              isBusy={busyCarLicensePlates.has(selectedCar.license_plate)}
              onEdit={() => {
                setEditCar(selectedCar);
                setSelectedCar(undefined);
              }}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}

      {showAvailabilityCalendar && selectedCarForCalendar && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-large">
            <CarAvailabilityCalendar
              car={selectedCarForCalendar}
              onClose={handleCloseAvailabilityCalendar}
            />
          </div>
        </div>
      )}

      {/* Table controls */}
      <div className="table-controls">
        <div className="left-controls">
          <button className="create-btn" onClick={() => setIsCreatingCar(true)}>
            <PlusCircleIcon className="btn-icon" />
            <span className="btn-text">Add New Car</span>
          </button>

          <button className="export-btn" onClick={exportToCSV}>
            <DownloadIcon className="btn-icon" />
            <span className="btn-text">Export</span>
          </button>

          {!isMobile && (
            <button
              className="view-toggle-btn"
              onClick={toggleViewMode}
              aria-label={`Switch to ${viewMode === 'table' ? 'card' : 'table'} view`}
            >
              {viewMode === 'table' ? (
                <>
                  <ViewGridIcon className="btn-icon" />
                  <span className="btn-text">Card View</span>
                </>
              ) : (
                <>
                  <ViewListIcon className="btn-icon" />
                  <span className="btn-text">Table View</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="right-controls">
          <div className="search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <XIcon className="clear-search-icon" />
              </button>
            )}
          </div>

          <div className="filter-container">
            <FilterIcon className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CarStatus)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          <ExclamationCircleIcon className="error-icon" />
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {/* Car table or card view */}
      {!isLoading && (
        <>
          {viewMode === 'table' ? (
            <div className="table-wrapper">
              <table className="car-table">
                <thead>
                  <tr>
                    {renderTableHeader('Manufacturer', 'manufacturer')}
                    {renderTableHeader('Model', 'model')}
                    {renderTableHeader('Year', 'year')}
                    <th className="table-header hide-on-small">Color</th>
                    <th className="table-header hide-on-small">
                      License Plate
                    </th>
                    {renderTableHeader('Price/Day', 'price_per_day')}
                    <th className="table-header">Status</th>
                    <th className="table-header table-header-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCars.length > 0 ? (
                    paginatedCars.map((car) => {
                      const isBusy = busyCarLicensePlates.has(
                        car.license_plate
                      );

                      return (
                        <tr key={car.license_plate} className="table-row">
                          <td className="table-cell">
                            <div className="manufacturer-cell">
                              <div className="car-icon-placeholder"></div>
                              <div className="manufacturer-name">
                                <div className="manufacturer-text">
                                  {car.manufacturer}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">{car.model}</td>
                          <td className="table-cell">{car.year}</td>
                          <td className="table-cell hide-on-small">
                            <div className="color-cell">
                              {car.color && (
                                <div
                                  className="color-dot"
                                  style={{ backgroundColor: car.color }}
                                ></div>
                              )}
                              <span>{car.color || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="table-cell hide-on-small">
                            {car.license_plate}
                          </td>
                          <td className="table-cell">
                            {car.price_per_day
                              ? `$${car.price_per_day}`
                              : 'N/A'}
                          </td>
                          <td className="table-cell">
                            <span
                              className={`status-badge ${isBusy ? 'status-busy' : 'status-available'}`}
                            >
                              {isBusy ? (
                                <>
                                  <ExclamationCircleIcon className="status-icon" />
                                  <span>Busy</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="status-icon" />
                                  <span>Available</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="table-cell table-cell-center">
                            <div className="action-buttons">
                              <ActionButton
                                onClick={() => handleViewDetails(car)}
                                icon={<EyeIcon className="action-icon" />}
                                label="View"
                                className="action-view"
                              />
                              <ActionButton
                                onClick={() => handleViewAvailability(car)}
                                icon={<CalendarIcon className="action-icon" />}
                                label="Availability"
                                className="action-calendar"
                              />
                              <ActionButton
                                onClick={() => setEditCar(car)}
                                icon={<PencilIcon className="action-icon" />}
                                label="Edit"
                                className="action-edit"
                              />
                              <ActionButton
                                onClick={() => handleDelete(car.license_plate)}
                                icon={<TrashIcon className="action-icon" />}
                                label="Delete"
                                className="action-delete"
                                disabled={isBusy}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="empty-table-message">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No cars match your search criteria'
                          : 'No cars available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="car-cards-container">
              {paginatedCars.length > 0 ? (
                paginatedCars.map((car) => renderCarCard(car))
              ) : (
                <div className="empty-message">
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
        <div className="pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedCars.length)}{' '}
            of {filteredAndSortedCars.length} cars
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="pagination-icon" />
            </button>

            <span className="pagination-page">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="pagination-button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="pagination-icon" />
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>

          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Items per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="items-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarTable;
