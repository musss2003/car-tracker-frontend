'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
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
import { Car } from '../../../types/Car';
import { Contract } from '../../../types/Contract';
import EditCarForm from '../../../components/Car/EditCarForm/EditCarForm';
import CreateCarForm from '../../../components/Car/CreateCarForm/CreateCarForm';
import CarAvailabilityCalendar from '../../../components/Car/CarAvailabilityCalendar/CarAvailabilityCalendar';
import CarDetails from '../../../components/Car/CarDetails/CarDetails';
import {
  TableContainer,
  TableActions,
  SearchFilter,
  Pagination
} from '../../../components/UI';

interface ActionButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  icon: React.ReactNode;
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

const CarTable = () => {
  // State management
  const [cars, setCars] = useState<Car[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [editCar, setEditCar] = useState<Car | undefined>(undefined);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>(undefined);
  const [isCreating, setIsCreating] = useState<boolean>(false);
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
      setLoading(true);
      await updateCar(updatedCar.license_plate, updatedCar);
      const updatedCars = await getCars();
      setCars(updatedCars);
      setEditCar(undefined);
      toast.success('Car updated successfully');
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error('Failed to update car');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newCar: Car) => {
    try {
      setLoading(true);
      await addCar(newCar);
      const updatedCars = await getCars();
      setCars(updatedCars);
      setIsCreating(false);
      toast.success('Car added successfully');
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('Failed to add car');
    } finally {
      setLoading(false);
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
        className="table-heading"
        onClick={() => handleSort(key)}
      >
        <div className="header-content">
          <span>{label}</span>
          {isSorted ? (
            <SortIcon className="sort-icon active" />
          ) : (
            <SortAscendingIcon className="sort-icon" />
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
    <TableContainer>
      {/* Modals */}
      {editCar && (
        <div className="car-modal-overlay">
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

      {isCreating && (
        <div className="car-modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setIsCreating(false)}
            >
              <XIcon className="modal-close-icon" />
            </button>
            <CreateCarForm
              onSave={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}

      {selectedCar && (
        <div className="car-modal-overlay">
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
        <div className="car-modal-overlay">
          <div className="modal-content modal-content-large">
            <CarAvailabilityCalendar
              car={selectedCarForCalendar}
              onClose={handleCloseAvailabilityCalendar}
            />
          </div>
        </div>
      )}

      <TableActions
        onCreateClick={() => setIsCreating(true)}
        onExportExcel={exportToCSV}
        createLabel="Add New Car"
        createIcon="plus"
        loading={loading}
        showExport={true}
      />

      <div className="car-table-custom-controls">
        <div className="car-left-controls">
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

        <div className="car-right-controls">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search cars..."
          />

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
        <div className="car-error-message">
          <ExclamationCircleIcon className="car-error-icon" />
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="car-loading-indicator">
          <div className="car-spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && cars.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-container">
            <PlusCircleIcon className="empty-icon" />
          </div>
          <h3>No cars found</h3>
          <p>Start by adding your first car</p>
          <button className="create-btn" onClick={() => setIsCreating(true)}>
            Add New Car
          </button>
        </div>
      )}

      {/* Car table or card view */}
      {!loading && cars.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <div className="table-wrapper">
              <table className="car-table">
                <thead className="car-table thead">
                  <tr>
                    {renderTableHeader('Manufacturer', 'manufacturer')}
                    {renderTableHeader('Model', 'model')}
                    {renderTableHeader('Year', 'year')}
                    <th className="table-heading hide-on-small">Color</th>
                    <th className="table-heading hide-on-small">
                      License Plate
                    </th>
                    {renderTableHeader('Price/Day', 'price_per_day')}
                    <th className="table-heading">Status</th>
                    <th className="table-heading table-header-center">
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
                        <tr key={car.license_plate} className="car-table-row">
                          <td className="car-table-cell">
                            <div className="manufacturer-cell">
                              <div className="car-icon-placeholder"></div>
                              <div className="manufacturer-name">
                                <div className="manufacturer-text">
                                  {car.manufacturer}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="car-table-cell">{car.model}</td>
                          <td className="car-table-cell">{car.year}</td>
                          <td className="car-table-cell hide-on-small">
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
                          <td className="car-table-cell hide-on-small">
                            {car.license_plate}
                          </td>
                          <td className="car-table-cell">
                            {car.price_per_day
                              ? `$${car.price_per_day}`
                              : 'N/A'}
                          </td>
                          <td className="car-table-cell">
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
                          <td className="car-table-cell actions-cell">
                            <div className="car-action-buttons">
                              <button
                                onClick={() => handleViewDetails(car)}
                                className="car-action-btn view"
                                title="View"
                              >
                                <EyeIcon className="car-action-icon" />
                              </button>
                              <button
                                onClick={() => handleViewAvailability(car)}
                                className="car-action-btn view"
                                title="Availability"
                              >
                                <CalendarIcon className="car-action-icon" />
                              </button>
                              <button
                                onClick={() => setEditCar(car)}
                                className="car-action-btn edit"
                                title="Edit"
                              >
                                <PencilIcon className="car-action-icon" />
                              </button>
                              <button
                                onClick={() => handleDelete(car.license_plate)}
                                className="car-action-btn delete"
                                title="Delete"
                                disabled={isBusy}
                              >
                                <TrashIcon className="car-action-icon" />
                              </button>
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAndSortedCars.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
        />
      )}
    </TableContainer>
  );
};

export default CarTable;
