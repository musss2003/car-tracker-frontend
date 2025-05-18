import React, { JSX } from 'react';
import { useState, useEffect, type FC } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/solid';
import { maintenanceService } from '../../../services/maintenanceService';
import { Car } from '../../../types/Car';
import {
  MaintenanceFormData,
  MaintenanceRecord,
} from '../../../types/Maintenance';

interface CarMaintenanceLogProps {
  car: Car;
}

const CarMaintenanceLog: FC<CarMaintenanceLogProps> = ({ car }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    type: '',
    mileage: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    nextDueDate: '',
    nextDueMileage: '',
  });

  useEffect(() => {
    if (car && car.license_plate) {
      fetchMaintenanceRecords();
    }
  }, [car]);

  const fetchMaintenanceRecords = async (): Promise<void> => {
    try {
      setLoading(true);
      const records = await maintenanceService.getCarMaintenanceRecords(
        car.license_plate
      );
      setMaintenanceRecords(records);
      setError(null);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
      setError('Failed to load maintenance records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      await maintenanceService.addMaintenanceRecord(
        car.license_plate,
        formData
      );
      // Reset form
      setFormData({
        type: '',
        mileage: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        nextDueDate: '',
        nextDueMileage: '',
      });
      setShowForm(false);
      // Refresh records
      await fetchMaintenanceRecords();
    } catch (err) {
      console.error('Error adding maintenance record:', err);
      setError('Failed to add maintenance record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (
      window.confirm('Are you sure you want to delete this maintenance record?')
    ) {
      try {
        setLoading(true);
        await maintenanceService.deleteMaintenanceRecord(id);
        // Refresh records
        await fetchMaintenanceRecords();
      } catch (err) {
        console.error('Error deleting maintenance record:', err);
        setError('Failed to delete maintenance record. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const isOverdue = (record: MaintenanceRecord): boolean => {
    if (!record.nextDueDate) return false;

    const today = new Date();
    const nextDue = new Date(record.nextDueDate);
    return nextDue < today;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMaintenanceForm = (): JSX.Element => (
    <div className="maintenance-form-container">
      <h3 className="form-title">Add Maintenance Record</h3>
      <form onSubmit={handleSubmit} className="maintenance-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Maintenance Type*</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select type</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Air Filter">Air Filter</option>
              <option value="Battery Replacement">Battery Replacement</option>
              <option value="Inspection">Inspection</option>
              <option value="Fluid Check">Fluid Check</option>
              <option value="Transmission Service">Transmission Service</option>
              <option value="Coolant Flush">Coolant Flush</option>
              <option value="Spark Plugs">Spark Plugs</option>
              <option value="Timing Belt">Timing Belt</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mileage">Mileage*</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              required
              className="form-input"
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Service Date*</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nextDueDate">Next Due Date</label>
            <input
              type="date"
              id="nextDueDate"
              name="nextDueDate"
              value={formData.nextDueDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nextDueMileage">Next Due Mileage</label>
            <input
              type="number"
              id="nextDueMileage"
              name="nextDueMileage"
              value={formData.nextDueMileage}
              onChange={handleInputChange}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost || ''}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="form-textarea"
            rows={3}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Save Record
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderMaintenanceTable = (): JSX.Element => (
    <div className="maintenance-table-container">
      <div className="maintenance-header">
        <h3 className="maintenance-title">Maintenance History</h3>
        <button
          className="add-maintenance-button"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Record
        </button>
      </div>

      {maintenanceRecords.length === 0 ? (
        <div className="no-records-message">
          <p>No maintenance records found for this vehicle.</p>
        </div>
      ) : (
        <div className="maintenance-records-wrapper">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Mileage</th>
                <th>Description</th>
                <th>Next Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map((record) => (
                <tr
                  key={record.id}
                  className={isOverdue(record) ? 'overdue-row' : ''}
                >
                  <td>{record.type}</td>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.mileage.toLocaleString()} mi</td>
                  <td className="description-cell">{record.description}</td>
                  <td className="next-due-cell">
                    {isOverdue(record) && (
                      <ExclamationCircleIcon className="overdue-icon h-5 w-5">
                        <title>Overdue</title>
                      </ExclamationCircleIcon>
                    )}
                    {record.nextDueDate ? (
                      <div>
                        <div>{formatDate(record.nextDueDate)}</div>
                        {record.nextDueMileage && (
                          <div className="next-due-mileage">
                            {record.nextDueMileage.toLocaleString()} mi
                          </div>
                        )}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(record.id)}
                      title="Delete record"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Overdue Maintenance Alert */}
      {maintenanceRecords.some(isOverdue) && (
        <div className="maintenance-alert">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          <span>This vehicle has overdue maintenance items!</span>
        </div>
      )}

      {/* Next Scheduled Maintenance */}
      {maintenanceRecords.length > 0 && (
        <div className="next-maintenance-info">
          <ClockIcon className="h-5 w-5 mr-2" />
          <span>
            Next scheduled maintenance:{' '}
            {(() => {
              const upcomingMaintenance = maintenanceRecords
                .filter((r) => r.nextDueDate && !isOverdue(r))
                .sort(
                  (a, b) =>
                    new Date(a.nextDueDate!).getTime() -
                    new Date(b.nextDueDate!).getTime()
                )[0];

              return upcomingMaintenance
                ? `${upcomingMaintenance.type} on ${formatDate(upcomingMaintenance.nextDueDate)}`
                : 'None scheduled';
            })()}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="car-maintenance-log">
      {error && <div className="error-message">{error}</div>}

      {loading && !showForm ? (
        <div className="loading-spinner">Loading maintenance records...</div>
      ) : (
        <>{showForm ? renderMaintenanceForm() : renderMaintenanceTable()}</>
      )}
    </div>
  );
};

export default CarMaintenanceLog;
