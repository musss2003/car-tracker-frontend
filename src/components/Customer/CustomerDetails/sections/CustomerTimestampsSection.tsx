import React from 'react';
import { ClockIcon } from '@heroicons/react/solid';
import { Customer } from '../../../../types/Customer';
import './CustomerTimestampsSection.css';

interface CustomerTimestampsSectionProps {
  customer: Customer;
  formatDate: (dateString: string | Date | undefined | null) => string;
}

const CustomerTimestampsSection: React.FC<CustomerTimestampsSectionProps> = ({
  customer,
  formatDate,
}) => {
  return (
    <div className="customer-timestamps-section">
      <h3 className="section-title">
        <ClockIcon className="section-icon" />
        Podaci o vremenu
      </h3>

      <div className="timestamps-grid">
        <div className="timestamp-item">
          <div className="timestamp-label">
            <ClockIcon className="timestamp-icon" />
            Kreiran
          </div>
          <div className="timestamp-value">
            {formatDate(customer.createdAt)}
          </div>
        </div>

        <div className="timestamp-item">
          <div className="timestamp-label">
            <ClockIcon className="timestamp-icon" />
            Posljednja izmjena
          </div>
          <div className="timestamp-value">
            {formatDate(customer.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTimestampsSection;
