import React from 'react';
import { DocumentTextIcon, PhotographIcon } from '@heroicons/react/solid';
import { Customer } from '../../../../types/Customer';
import './CustomerDocumentsSection.css';

interface CustomerDocumentsSectionProps {
  customer: Customer;
  getValue: (
    value: string | number | null | undefined,
    defaultValue?: string
  ) => string | number;
  getFieldValue: (
    newField: string | number | null | undefined,
    legacyField: string | number | null | undefined,
    defaultValue?: string
  ) => string | number;
  onImageClick: (imageUrl: string | null | undefined, type: string) => void;
}

const CustomerDocumentsSection: React.FC<CustomerDocumentsSectionProps> = ({
  customer,
  getValue,
  getFieldValue,
  onImageClick,
}) => {
  const drivingLicenseUrl = getFieldValue(
    customer.drivingLicensePhotoUrl,
    (customer as any).driving_license_photo_url
  );

  const passportUrl = getFieldValue(
    customer.passportPhotoUrl,
    (customer as any).passport_photo_url
  );

  return (
    <div className="customer-documents-section">
      <h3 className="section-title">
        <DocumentTextIcon className="section-icon" />
        Dokumenti
      </h3>

      <div className="documents-grid">
        {/* Driver License */}
        <div className="document-group">
          <div className="document-info">
            <div className="document-label">Vozačka dozvola</div>
            <div className="document-number">
              {getFieldValue(
                customer.driverLicenseNumber,
                (customer as any).driver_license_number
              )}
            </div>
          </div>

          <div className="document-photo">
            {drivingLicenseUrl && drivingLicenseUrl !== 'N/A' ? (
              <div
                className="photo-container photo-container--clickable"
                onClick={() =>
                  onImageClick(drivingLicenseUrl as string, 'Vozačka dozvola')
                }
              >
                <img
                  src={drivingLicenseUrl as string}
                  alt="Vozačka dozvola"
                  className="document-image"
                />
                <div className="photo-overlay">
                  <PhotographIcon className="photo-icon" />
                  <span>Kliknite za uvećanje</span>
                </div>
              </div>
            ) : (
              <div className="photo-placeholder">
                <PhotographIcon className="photo-icon" />
                <span>Nema slike</span>
              </div>
            )}
          </div>
        </div>

        {/* Passport */}
        <div className="document-group">
          <div className="document-info">
            <div className="document-label">Pasoš</div>
            <div className="document-number">
              {getFieldValue(
                customer.passportNumber,
                (customer as any).passport_number
              )}
            </div>
          </div>

          <div className="document-photo">
            {passportUrl && passportUrl !== 'N/A' ? (
              <div
                className="photo-container photo-container--clickable"
                onClick={() => onImageClick(passportUrl as string, 'Pasoš')}
              >
                <img
                  src={passportUrl as string}
                  alt="Pasoš"
                  className="document-image"
                />
                <div className="photo-overlay">
                  <PhotographIcon className="photo-icon" />
                  <span>Kliknite za uvećanje</span>
                </div>
              </div>
            ) : (
              <div className="photo-placeholder">
                <PhotographIcon className="photo-icon" />
                <span>Nema slike</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDocumentsSection;
