import React, { useState, useRef } from 'react';
import { PhotographIcon, UploadIcon, XIcon, EyeIcon } from '@heroicons/react/solid';
import { supabasePhotoUploadService } from '../../../services/supabasePhotoUploadService';

interface CustomerPhotoFieldFirebaseProps {
  label: string;
  photoUrl?: string;
  onFileChange: (file: File | null, url?: string) => void;
  error?: string | null;
  customerId?: string;
  documentType?: 'license' | 'passport';
  disabled?: boolean;
}

const CustomerPhotoField: React.FC<CustomerPhotoFieldFirebaseProps> = ({
  label,
  photoUrl,
  onFileChange,
  error,
  customerId,
  documentType,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl || null);
  const [showFullImage, setShowFullImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create preview immediately
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to Firebase with progress tracking
      let uploadedUrl: string;
      
      if (customerId && documentType) {
        // Upload as customer document
        uploadedUrl = await supabasePhotoUploadService.uploadCustomerDocument(
          file,
          customerId,
          documentType,
          (progress) => {
            setUploadProgress(Math.round(progress.progress));
          }
        );
      } else {
        // Generic upload
        uploadedUrl = await supabasePhotoUploadService.uploadPhoto(
          file,
          {
            folder: 'temp-uploads',
            maxWidth: 1200,
            maxHeight: 900,
            quality: 0.9
          },
          (progress) => {
            setUploadProgress(Math.round(progress.progress));
          }
        );
      }

      // Clean up preview URL
      URL.revokeObjectURL(preview);
      
      // Set the actual uploaded URL
      setPreviewUrl(uploadedUrl);
      onFileChange(file, uploadedUrl);

    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
      
      // Clean up on error
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(photoUrl || null);
      
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemovePhoto = async () => {
    // Try to delete from Firebase if it's a Firebase URL
    if (previewUrl && previewUrl.includes('firebasestorage.googleapis.com')) {
      await supabasePhotoUploadService.deletePhoto(previewUrl);
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileChange(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="customer-photo-field-firebase">
      <label className="customer-photo-field-firebase__label">
        {label}
      </label>

      <div
        className={`customer-photo-field-firebase__container ${
          dragActive ? 'customer-photo-field-firebase__container--drag-active' : ''
        } ${error ? 'customer-photo-field-firebase__container--error' : ''} ${
          disabled ? 'customer-photo-field-firebase__container--disabled' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          // Upload Progress
          <div className="customer-photo-field-firebase__uploading">
            <div className="customer-photo-field-firebase__progress-ring">
              <svg className="customer-photo-field-firebase__progress-circle" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - uploadProgress / 100)}`}
                  className="customer-photo-field-firebase__progress-bar"
                />
              </svg>
              <div className="customer-photo-field-firebase__progress-text">
                {uploadProgress}%
              </div>
            </div>
            <p className="customer-photo-field-firebase__uploading-text">
              Uploading to Firebase...
            </p>
          </div>
        ) : previewUrl ? (
          // Photo Preview
          <div className="customer-photo-field-firebase__preview">
            <img
              src={previewUrl}
              alt={label}
              className="customer-photo-field-firebase__image"
            />
            <div className="customer-photo-field-firebase__overlay">
              <button
                type="button"
                className="customer-photo-field-firebase__action-btn customer-photo-field-firebase__action-btn--view"
                onClick={() => setShowFullImage(true)}
                title="View full image"
              >
                <EyeIcon />
              </button>
              <button
                type="button"
                className="customer-photo-field-firebase__action-btn customer-photo-field-firebase__action-btn--remove"
                onClick={handleRemovePhoto}
                title="Remove photo"
                disabled={disabled}
              >
                <XIcon />
              </button>
            </div>
          </div>
        ) : (
          // Upload Area
          <div className="customer-photo-field-firebase__upload-area">
            <PhotographIcon className="customer-photo-field-firebase__upload-icon" />
            <p className="customer-photo-field-firebase__upload-text">
              Drag & drop your photo here
            </p>
            <button
              type="button"
              className="customer-photo-field-firebase__browse-btn"
              onClick={handleBrowseClick}
              disabled={disabled}
            >
              <UploadIcon className="customer-photo-field-firebase__browse-icon" />
              Browse Files
            </button>
            <p className="customer-photo-field-firebase__upload-hint">
              JPEG, PNG, WebP up to 10MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="customer-photo-field-firebase__file-input"
          disabled={disabled || isUploading}
        />
      </div>

      {error && (
        <p className="customer-photo-field-firebase__error">
          {error}
        </p>
      )}

      {/* Full Image Modal */}
      {showFullImage && previewUrl && (
        <div className="customer-photo-field-firebase__modal-overlay" onClick={() => setShowFullImage(false)}>
          <div className="customer-photo-field-firebase__modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="customer-photo-field-firebase__modal-close"
              onClick={() => setShowFullImage(false)}
            >
              <XIcon />
            </button>
            <img
              src={previewUrl}
              alt={label}
              className="customer-photo-field-firebase__modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotoField;