'use client';
import {
  XIcon,
  PencilIcon,
  TrashIcon,
  DocumentDownloadIcon,
  CalendarIcon,
  CreditCardIcon,
  UserIcon,
  TruckIcon,
  DocumentTextIcon,
  PhotographIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/solid';
import './ContractDetails.css';
import { Contract } from '../../../types/Contract';
import { calculateDuration } from '../../../utils/contractUtils';

interface ContractDetailsProps {
  contract: Contract;
  onEdit: () => void;
  onBack: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onEdit,
  onBack,
  onDelete,
  onDownload,
}) => {
  // Check if the contract is valid and has required data
  if (!contract || Object.keys(contract).length === 0 || !contract.id) {
    return (
      <div className="contract-error">
        <ExclamationCircleIcon className="error-icon" />
        <p>No contract details available or contract data is empty.</p>
        <button className="back-button" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  // Helper function to handle empty values
  const getValue = (value: unknown, defaultValue: string = 'N/A') => {
    // More robust check for empty values
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      return defaultValue;
    }
    return String(value);
  };

  // Format currency
  const formatCurrency = (amount: unknown) => {
    if (
      amount === undefined ||
      amount === null ||
      amount === '' ||
      isNaN(Number(amount))
    )
      return 'N/A';
    return `$${Number.parseFloat(amount as string).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return 'N/A';
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Calculate contract status
  const getContractStatus = () => {
    const now = new Date();

    // Safely access dates with optional chaining and nullish coalescing
    const startDateStr = contract?.rentalPeriod?.startDate;
    const endDateStr = contract?.rentalPeriod?.endDate;

    if (!startDateStr || !endDateStr) {
      return {
        status: 'Unknown',
        className: 'status-unknown',
        icon: <ExclamationCircleIcon className="status-icon" />,
      };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (now < startDate) {
      return {
        status: 'Confirmed',
        className: 'status-confirmed',
        icon: <ClockIcon className="status-icon" />,
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        status: 'Active',
        className: 'status-active',
        icon: <CheckCircleIcon className="status-icon" />,
      };
    } else {
      return {
        status: 'Completed',
        className: 'status-completed',
        icon: <CheckCircleIcon className="status-icon" />,
      };
    }
  };

  const { status, className, icon } = getContractStatus();

  // Destructure contract properties with defaults
  const {
    id,
    createdAt,
    updatedAt,
    additionalNotes = '',
    contractPhoto = '',
    customer = {},
    car = {},
    rentalPeriod = {},
    rentalPrice = {},
    paymentDetails = {},
  } = contract;

  // Destructure nested objects with defaults
  const {
    name = '',
    passport_number = '',
    driver_license_number = '',
    address = '',
  }: {
    name?: string;
    passport_number?: string;
    driver_license_number?: string;
    address?: string;
  } = customer ?? {};

  const {
    model = '',
    license_plate = '',
    manufacturer = '',
    year = '',
  }: {
    model?: string;
    license_plate?: string;
    manufacturer?: string;
    year?: string | number;
  } = car ?? {};

  const {
    startDate = '',
    endDate = '',
  }: {
    startDate?: string;
    endDate?: string;
  } = rentalPeriod ?? {};

  const {
    dailyRate = 0,
    totalAmount = 0,
    deposit = 0,
  }: {
    dailyRate?: number;
    totalAmount?: number;
    deposit?: number;
  } = rentalPrice ?? {};

  const {
    paymentMethod = '',
    paymentStatus = '',
  }: {
    paymentMethod?: string;
    paymentStatus?: string;
  } = paymentDetails ?? {};

  return (
    <div className="contract-details">
      <div className="contract-header">
        <div className="header-content">
          <h2 className="contract-title">Contract Details</h2>
          <div className={`contract-status ${className}`}>
            {icon}
            <span>{status}</span>
          </div>
        </div>
      </div>

      <div className="contract-body">
        {/* Customer Section */}
        <div className="contract-section">
          <div className="section-header">
            <UserIcon className="section-icon" />
            <h3 className="section-title">Customer Information</h3>
          </div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{getValue(name)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Passport Number</span>
                <span className="info-value">{getValue(passport_number)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Driver License</span>
                <span className="info-value">
                  {getValue(driver_license_number)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{getValue(address)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Section */}
        <div className="contract-section">
          <div className="section-header">
            <TruckIcon className="section-icon" />
            <h3 className="section-title">Vehicle Information</h3>
          </div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Model</span>
                <span className="info-value">{getValue(model)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">License Plate</span>
                <span className="info-value">{getValue(license_plate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Manufacturer</span>
                <span className="info-value">{getValue(manufacturer)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Year</span>
                <span className="info-value">{getValue(year)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Period Section */}
        <div className="contract-section">
          <div className="section-header">
            <CalendarIcon className="section-icon" />
            <h3 className="section-title">Rental Period</h3>
          </div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Start Date</span>
                <span className="info-value">{formatDate(startDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">End Date</span>
                <span className="info-value">{formatDate(endDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration</span>
                <span className="info-value">
                  {calculateDuration(
                    contract?.rentalPeriod?.startDate,
                    contract?.rentalPeriod?.endDate
                  ) > 0
                    ? `${calculateDuration(
                        contract?.rentalPeriod?.startDate,
                        contract?.rentalPeriod?.endDate
                      )} days`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="contract-section">
          <div className="section-header">
            <CreditCardIcon className="section-icon" />
            <h3 className="section-title">Pricing Information</h3>
          </div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Daily Rate</span>
                <span className="info-value">{formatCurrency(dailyRate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount</span>
                <span className="info-value highlight">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              {deposit > 0 && (
                <div className="info-item">
                  <span className="info-label">Deposit</span>
                  <span className="info-value">{formatCurrency(deposit)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        {(paymentMethod || paymentStatus) && (
          <div className="contract-section">
            <div className="section-header">
              <CreditCardIcon className="section-icon" />
              <h3 className="section-title">Payment Details</h3>
            </div>
            <div className="section-content">
              <div className="info-grid">
                {paymentMethod && (
                  <div className="info-item">
                    <span className="info-label">Payment Method</span>
                    <span className="info-value">
                      {getValue(paymentMethod)}
                    </span>
                  </div>
                )}
                {paymentStatus && (
                  <div className="info-item">
                    <span className="info-label">Payment Status</span>
                    <span className="info-value capitalize">
                      {getValue(paymentStatus)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes Section */}
        {additionalNotes && (
          <div className="contract-section">
            <div className="section-header">
              <DocumentTextIcon className="section-icon" />
              <h3 className="section-title">Additional Notes</h3>
            </div>
            <div className="section-content">
              <p className="notes-text">{getValue(additionalNotes)}</p>
            </div>
          </div>
        )}

        {/* Contract Photo Section */}
        {contractPhoto && (
          <div className="contract-section">
            <div className="section-header">
              <PhotographIcon className="section-icon" />
              <h3 className="section-title">Contract Photo</h3>
            </div>
            <div className="section-content">
              <div
                className="photo-container"
                title="Contract photo - click to view full size"
              >
                <img
                  src={contractPhoto || '/placeholder.svg'}
                  alt="Contract"
                  className="contract-photo"
                  onClick={() =>
                    contractPhoto && window.open(contractPhoto, '_blank')
                  }
                  onError={(e) => {
                    const target = e.target as HTMLImageElement; // 👈 cast correctly
                    target.onerror = null;
                    target.src = '/placeholder.svg';
                    target.classList.add('error-image');
                  }}
                />
                {contractPhoto && (
                  <div className="photo-overlay">
                    <span>Click to enlarge</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contract ID and Dates Section */}
        <div className="contract-section">
          <div className="section-header">
            <DocumentTextIcon className="section-icon" />
            <h3 className="section-title">Contract Information</h3>
          </div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Contract ID</span>
                <span className="info-value">{getValue(id)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created At</span>
                <span className="info-value">{formatDate(createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">{formatDate(updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contract-footer">
        <button className="action-button back" onClick={onBack}>
          <XIcon className="button-icon" />
          Back
        </button>

        <div className="action-group">
          <button className="action-button edit" onClick={onEdit}>
            <PencilIcon className="button-icon" />
            Edit
          </button>

          <button className="action-button download" onClick={onDownload}>
            <DocumentDownloadIcon className="button-icon" />
            Download
          </button>

          <button className="action-button delete" onClick={onDelete}>
            <TrashIcon className="button-icon" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
