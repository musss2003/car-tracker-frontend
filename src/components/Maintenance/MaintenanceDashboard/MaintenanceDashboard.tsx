import { useState, useEffect, useMemo, type FC, JSX } from 'react';
import {
  PlusIcon,
  FilterIcon,
  SearchIcon,
  AdjustmentsIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid';
import {
  MaintenanceRecord,
  MaintenanceRecordWithCar,
} from '../../../types/Maintenance';
import { Car } from '../../../types/Car';
import maintenanceService from '../../../services/maintenanceService';
import { getCars } from '../../../services/carService';
import './MaintenanceDashboard.css';
import MaintenanceForm from '../MaintenanceForm/MaintenanceForm';

const MaintenanceDashboard: FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecordWithCar[]
  >([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'upcoming' | 'overdue' | 'completed'
  >('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [maintenanceData, carsData] = await Promise.all([
        maintenanceService.getAllMaintenanceRecords(),
        getCars(),
      ]);
      setMaintenanceRecords(maintenanceData);
      setCars(carsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load maintenance data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenance = (car?: Car): void => {
    setSelectedCar(car || null);
    setShowForm(true);
  };

  const handleFormClose = (): void => {
    setShowForm(false);
    setSelectedCar(null);
  };

  const handleFormSubmit = async (): Promise<void> => {
    await fetchData();
    setShowForm(false);
    setSelectedCar(null);
  };

  const maintenanceTypes = useMemo(() => {
    const types = new Set<string>();
    maintenanceRecords.forEach((record) => {
      types.add(record.type);
    });
    return Array.from(types);
  }, [maintenanceRecords]);

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter((record) => {
      // Search term filter
      const searchMatch =
        searchTerm === '' ||
        record.carDetails.manufacturer
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.carDetails.model
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.carLicensePlate
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let statusMatch = true;
      const today = new Date();
      const nextDueDate = record.nextDueDate
        ? new Date(record.nextDueDate)
        : null;

      if (filterStatus === 'upcoming') {
        statusMatch = nextDueDate !== null && nextDueDate > today;
      } else if (filterStatus === 'overdue') {
        statusMatch = record.isOverdue;
      } else if (filterStatus === 'completed') {
        statusMatch = nextDueDate === null;
      }

      // Type filter
      const typeMatch = filterType === 'all' || record.type === filterType;

      return searchMatch && statusMatch && typeMatch;
    });
  }, [maintenanceRecords, searchTerm, filterStatus, filterType]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMaintenanceTable = (): JSX.Element => (
    <div className="maintenance-table-container">
      <div className="maintenance-filters">
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search cars or maintenance types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">
              <FilterIcon className="filter-icon" />
              Status:
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="type-filter" className="filter-label">
              <AdjustmentsIcon className="filter-icon" />
              Type:
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {maintenanceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="no-records-message">
          <p>No maintenance records found matching your filters.</p>
        </div>
      ) : (
        <div className="maintenance-records-wrapper">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>License Plate</th>
                <th>Maintenance Type</th>
                <th>Last Service</th>
                <th>Next Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id || record.carLicensePlate}
                  className={record.isOverdue ? 'overdue-row' : ''}
                >
                  <td>
                    {record.carDetails.manufacturer} {record.carDetails.model} (
                    {record.carDetails.year})
                  </td>
                  <td>{record.carLicensePlate}</td>
                  <td>{record.type}</td>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatDate(record.nextDueDate)}</td>
                  <td className="status-cell">
                    {record.isOverdue ? (
                      <span className="status-badge overdue">
                        <ExclamationCircleIcon className="status-icon" />
                        Overdue
                      </span>
                    ) : record.nextDueDate ? (
                      <span className="status-badge upcoming">Upcoming</span>
                    ) : (
                      <span className="status-badge completed">Completed</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-button"
                        onClick={() => {
                          const car = cars.find(
                            (c) => c.license_plate === record.carLicensePlate
                          );
                          if (car) handleAddMaintenance(car);
                        }}
                      >
                        Add Service
                      </button>
                      <button
                        className="action-button view-button"
                        onClick={() => {
                          // Navigate to car details with maintenance tab active
                          // This would be implemented based on your routing system
                        }}
                      >
                        View Car
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="maintenance-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Kontrolna ploča za održavanje</h2>
        <button
          className="add-maintenance-button"
          onClick={() => handleAddMaintenance()}
        >
          <PlusIcon className="button-icon" />
          Dodaj zapis o održavanju
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading maintenance data...</div>
      ) : (
        renderMaintenanceTable()
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <MaintenanceForm
              onClose={handleFormClose}
              onSubmit={handleFormSubmit}
              cars={cars}
              selectedCar={selectedCar}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
