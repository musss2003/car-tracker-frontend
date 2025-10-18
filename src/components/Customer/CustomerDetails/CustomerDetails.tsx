import React, { useState } from 'react';
import { XIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import { Card, CardHeader, Button } from '../../ui';
import { Customer } from '../../../types/Customer';
import './CustomerDetails.css';
import CustomerInfoSection from './sections/CustomerInfoSection';
import CustomerDocumentsSection from './sections/CustomerDocumentsSection';
import CustomerTimestampsSection from './sections/CustomerTimestampsSection';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import ImageModal from './modals/ImageModal';

interface ExpandedImage {
  url: string;
  type: string;
}

interface CustomerDetailsProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  onEdit,
  onDelete,
  onClose,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedImage, setExpandedImage] = useState<ExpandedImage | null>(
    null
  );

  // Get value or fallback
  const getValue = (
    value: string | number | null | undefined,
    defaultValue = 'N/A'
  ): string | number => {
    return value ?? defaultValue;
  };

  // Get field value with backward compatibility for snake_case
  const getFieldValue = (
    newField: string | number | null | undefined,
    legacyField: string | number | null | undefined,
    defaultValue = 'N/A'
  ): string | number => {
    return newField ?? legacyField ?? defaultValue;
  };

  // Format date
  const formatDate = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return 'N/A';

    try {
      const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return 'N/A';

      return (
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }) +
        ' ' +
        date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    } catch (error) {
      return 'N/A';
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle image expansion
  const expandImage = (imageUrl: string | null | undefined, type: string) => {
    if (!imageUrl) return;
    setExpandedImage({ url: imageUrl, type });
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  return (
    <div className="customer-details-overlay">
      <Card className="customer-details-card" size="lg">
        <CardHeader
          title={`Detalji korisnika: ${getValue(customer.name)}`}
          subtitle={`ID: ${customer.id} • Email: ${getValue(customer.email)}`}
          actions={
            <div className="customer-details-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
                leftIcon={<PencilIcon />}
              >
                Uredi
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteClick}
                leftIcon={<TrashIcon />}
              >
                Obriši
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                leftIcon={<XIcon />}
              >
                Zatvori
              </Button>
            </div>
          }
        />

        <div className="customer-details-content">
          <div className="details-sections">
            {/* Personal Information Section */}
            <CustomerInfoSection
              customer={customer}
              getValue={getValue}
              getFieldValue={getFieldValue}
            />

            {/* Documents Section */}
            <CustomerDocumentsSection
              customer={customer}
              getValue={getValue}
              getFieldValue={getFieldValue}
              onImageClick={expandImage}
            />

            {/* Timestamps Section */}
            <CustomerTimestampsSection
              customer={customer}
              formatDate={formatDate}
            />
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          customerName={getValue(customer.name)}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Image Modal */}
      {expandedImage && (
        <ImageModal
          imageUrl={expandedImage.url}
          imageType={expandedImage.type}
          onClose={closeExpandedImage}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
