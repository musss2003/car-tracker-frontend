import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PhotographIcon } from '@heroicons/react/solid';
import { Customer } from '../../../../types/Customer';
import { downloadDocument } from '../../../../services/uploadService';
import './CustomerDocumentsSection.css';

interface CustomerDocumentsSectionProps {
  customer: Customer;
  getValue: (value: string | number | null | undefined, defaultValue?: string) => string | number;
  getFieldValue: (
    newField: string | number | null | undefined,
    legacyField: string | number | null | undefined,
    defaultValue?: string
  ) => string | number;
  onImageClick: (imageUrl: string | null | undefined, type: string) => void;
}

// Component to display authenticated image
const AuthenticatedImage: React.FC<{
  filename: string | number;
  alt: string;
  className: string;
}> = ({ filename, alt, className }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!filename || filename === 'N/A') {
        setIsLoading(false);
        setError(true);
        return;
      }

      setIsLoading(true);
      setError(false);

      try {
        const blob = await downloadDocument(filename as string);
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [filename]);

  if (isLoading) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>⏳</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>❌ Failed to load</span>
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} />;
};

const CustomerDocumentsSection: React.FC<CustomerDocumentsSectionProps> = ({
  customer,
  getValue,
  getFieldValue,
  onImageClick,
}) => {
  const drivingLicenseFilename = getFieldValue(
    customer.drivingLicensePhotoUrl,
    (customer as any).driving_license_photo_url
  );
  
  const passportFilename = getFieldValue(
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
            {drivingLicenseFilename && drivingLicenseFilename !== 'N/A' ? (
              <div 
                className="photo-container photo-container--clickable"
                onClick={() => onImageClick(drivingLicenseFilename as string, 'Vozačka dozvola')}
              >
                <AuthenticatedImage
                  filename={drivingLicenseFilename}
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
            {passportFilename && passportFilename !== 'N/A' ? (
              <div 
                className="photo-container photo-container--clickable"
                onClick={() => onImageClick(passportFilename as string, 'Pasoš')}
              >
                <AuthenticatedImage
                  filename={passportFilename}
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