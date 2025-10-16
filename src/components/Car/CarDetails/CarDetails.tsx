'use client';
import {
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid';
import './CarDetails.css';
import { Car } from '../../../types/Car';
import { formatCurrency } from '../../../utils/contractUtils';

interface CarDetailsProps {
  car: Car;
  isBusy: boolean;
  onEdit: () => void;
  onClose: () => void;
}

const CarDetails: React.FC<CarDetailsProps> = ({
  car,
  isBusy,
  onEdit,
  onClose,
}) => {
  return (
    <div className="car-details">
      <div className="car-details-header">
        <h2 className="car-details-title">
          {car.manufacturer} {car.model}
        </h2>
        <div
          className={`car-status ${
            isBusy ? 'car-status-busy' : 'car-status-available'
          }`}
        >
          {isBusy ? (
            <>
              <ExclamationCircleIcon className="h-5 w-5 mr-1" />
              <span>Currently Rented</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              <span>Available</span>
            </>
          )}
        </div>
      </div>

      <div className="car-image-container">
        {car.photoUrl ? (
          <img
            src={car.photoUrl || '/placeholder.svg'}
            alt={`${car.manufacturer} ${car.model}`}
            className="car-image"
          />
        ) : (
          <div className="car-image-placeholder">
            <span>No Image Available</span>
          </div>
        )}
      </div>

      <div className="car-details-content">
        <div className="car-details-section">
          <h3 className="section-title">Vehicle Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Manufacturer</span>
              <span className="detail-value">{car.manufacturer}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Model</span>
              <span className="detail-value">{car.model}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Year</span>
              <span className="detail-value">{car.year}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Color</span>
              <div className="color-display">
                {car.color && (
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: car.color }}
                  ></div>
                )}
                <span>{car.color || 'N/A'}</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-label">License Plate</span>
              <span className="detail-value">{car.licensePlate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Chassis Number</span>
              <span className="detail-value">{car.chassisNumber || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fuel Type</span>
              <span className="detail-value">{car.fuelType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Transmission</span>
              <span className="detail-value">{car.transmission}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Doors</span>
              <span className="detail-value">{car.doors || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mileage</span>
              <span className="detail-value">{car.mileage ? `${car.mileage} km` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Engine Power</span>
              <span className="detail-value">{car.enginePower ? `${car.enginePower} HP` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{car.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">{car.status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current Location</span>
              <span className="detail-value">{car.currentLocation || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Price per Day</span>
              <span className="detail-value">
                {car.pricePerDay
                  ? formatCurrency(Number(car.pricePerDay))
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="car-details-footer">
        <button className="edit-button" onClick={onEdit}>
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Car Details
        </button>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CarDetails;
