import React, { useState, useRef } from 'react';
import { supabasePhotoUploadService } from '../../../services/supabasePhotoUploadService';
import './CustomerPhotoField.css';

interface CustomerPhotoFieldSupabaseProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  customerId?: string;
  documentType?: 'license' | 'passport';
  required?: boolean;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const CustomerPhotoField: React.FC<CustomerPhotoFieldSupabaseProps> = ({
  value,
  onChange,
  label = 'Upload Photo',
  customerId,
  documentType,
  required = false,
  disabled = false
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null
    });

    try {
      let photoUrl: string;

      if (customerId && documentType) {
        // Upload customer document
        photoUrl = await supabasePhotoUploadService.uploadCustomerDocument(
          file,
          customerId,
          documentType,
          (progress) => {
            setUploadState(prev => ({
              ...prev,
              progress: progress.progress
            }));
          }
        );
      } else {
        // Upload regular photo
        photoUrl = await supabasePhotoUploadService.uploadPhoto(
          file,
          {
            folder: 'general',
            maxWidth: 1200,
            maxHeight: 900,
            quality: 0.85
          },
          (progress) => {
            setUploadState(prev => ({
              ...prev,
              progress: progress.progress
            }));
          }
        );
      }

      onChange(photoUrl);
      
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!value) return;

    try {
      const success = await supabasePhotoUploadService.deletePhoto(value);
      if (success) {
        onChange(null);
        setUploadState({
          isUploading: false,
          progress: 0,
          error: null
        });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to delete photo'
      }));
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && !uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="customer-photo-field">
      <label className="photo-field-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <div className="photo-upload-container">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploadState.isUploading}
          style={{ display: 'none' }}
        />

        {/* Photo preview or upload area */}
        <div className="photo-preview-area">
          {value ? (
            <div className="photo-preview">
              <img
                src={value}
                alt="Uploaded photo"
                className="preview-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="photo-error-fallback hidden">
                <span>⚠️ Image preview not available</span>
                <small>URL: {value}</small>
              </div>
            </div>
          ) : (
            <div 
              className={`upload-placeholder ${disabled ? 'disabled' : ''}`}
              onClick={triggerFileSelect}
            >
              <div className="upload-icon">📷</div>
              <span className="upload-text">
                {uploadState.isUploading ? 'Uploading...' : 'Click to upload photo'}
              </span>
            </div>
          )}
        </div>

        {/* Upload progress */}
        {uploadState.isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <span className="progress-text">{Math.round(uploadState.progress)}%</span>
          </div>
        )}

        {/* Error message */}
        {uploadState.error && (
          <div className="upload-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{uploadState.error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="photo-actions">
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={disabled || uploadState.isUploading}
            className="btn-upload"
          >
            {value ? 'Change Photo' : 'Select Photo'}
          </button>
          
          {value && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={disabled || uploadState.isUploading}
              className="btn-remove"
            >
              Remove
            </button>
          )}
        </div>
      </div>


    </div>
  );
};

export default CustomerPhotoField;