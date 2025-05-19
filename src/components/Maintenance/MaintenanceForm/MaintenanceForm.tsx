'use client';

import type React from 'react';

import { useState, useEffect, type FC } from 'react';
import { XIcon } from '@heroicons/react/solid';
import './MaintenanceForm.css';
import { Car } from '../../../types/Car';
import { MaintenanceFormData } from '../../../types/Maintenance';
import maintenanceService from '../../../services/maintenanceService';

interface MaintenanceFormProps {
  onClose: () => void;
  onSubmit: () => void;
  cars: Car[];
  selectedCar: Car | null;
}

const MaintenanceForm: FC<MaintenanceFormProps> = ({
  onClose,
  onSubmit,
  cars,
  selectedCar,
}) => {
  const [formData, setFormData] = useState<
    MaintenanceFormData & { carLicensePlate: string }
  >({
    carLicensePlate: selectedCar?.license_plate || '',
    type: '',
    mileage: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    nextDueMileage: '',
    cost: '',
    performedBy: '',
    invoiceNumber: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCar) {
      setFormData((prev) => ({
        ...prev,
        carLicensePlate: selectedCar.license_plate,
      }));
    }
  }, [selectedCar]);

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

    if (!formData.carLicensePlate) {
      setError('Please select a vehicle');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await maintenanceService.addMaintenanceRecord(formData);

      setSuccess(true);
      setTimeout(() => {
        onSubmit();
      }, 1500);
    } catch (err) {
      console.error('Error adding maintenance record:', err);
      setError('Failed to add maintenance record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-form-modal">
      <div className="form-header">
        <h3 className="form-title">Dodaj zapis o održavanju</h3>
        <button className="close-button" onClick={onClose}>
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {success ? (
        <div className="success-message">
          <p>Maintenance record added successfully!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="maintenance-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="carLicensePlate">Vehicle*</label>
              <select
                id="carLicensePlate"
                name="carLicensePlate"
                value={formData.carLicensePlate}
                onChange={handleInputChange}
                required
                className="form-select"
                disabled={!!selectedCar}
              >
                <option value="">Select a vehicle</option>
                {cars.map((car) => (
                  <option key={car.license_plate} value={car.license_plate}>
                    {car.manufacturer} {car.model} ({car.year}) -{' '}
                    {car.license_plate}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                <option value="">Odaberi tip</option>
                <option value="Oil Change">Zamjena ulja</option>
                <option value="Tire Rotation">Rotacija guma</option>
                <option value="Brake Service">Servis kočnica</option>
                <option value="Air Filter">Filter zraka</option>
                <option value="Battery Replacement">Zamjena baterije</option>
                <option value="Inspection">Inspekcija</option>
                <option value="Fluid Check">Provjera tekućina</option>
                <option value="Transmission Service">Servis transmisije</option>
                <option value="Coolant Flush">
                  Ispiranje rashladne tekućine
                </option>
                <option value="Spark Plugs">Svjećice</option>
                <option value="Timing Belt">Zupčasti remen</option>
                <option value="Other">Ostalo</option>
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
              <label htmlFor="cost">Cost ($)</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="performedBy">Performed By</label>
              <input
                type="text"
                id="performedBy"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Mechanic or service center"
              />
            </div>

            <div className="form-group">
              <label htmlFor="invoiceNumber">Invoice Number</label>
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Receipt or invoice #"
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
                placeholder="e.g., 45000"
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
              placeholder="Describe the maintenance performed..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Record'}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MaintenanceForm;
