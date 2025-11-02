import React, { useState } from 'react';
import { XIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <Card className="customer-details-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                Detalji korisnika: {getValue(customer.name)}
              </h3>
              <p className="text-sm text-muted-foreground">
                ID: {customer.id} • Email: {getValue(customer.email)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Uredi
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Obriši
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <XIcon className="w-4 h-4 mr-1" />
                Zatvori
              </Button>
            </div>
          </div>
        </CardHeader>

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
