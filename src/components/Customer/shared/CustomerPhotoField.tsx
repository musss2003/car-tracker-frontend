import React, { useState, useRef } from 'react';
import { uploadDocument } from '../../../services/uploadService';
import './CustomerPhotoField.css';

interface CustomerPhotoFieldProps {
  value?: string | null; // filename stored on backend
  onChange: (filename: string | null) => void;
  label?: string;
  customerId?: string;
  documentType?: 'license' | 'passport' | 'photo';
  required?: boolean;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const CustomerPhotoField: React.FC<CustomerPhotoFieldProps> = ({
  value,
  onChange,
  label = 'Upload Photo',
  customerId,
  documentType,
  required = false,
  disabled = false,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Please select an image file',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'File size must be less than 5MB',
      });
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Simulate progress (since backend doesn't support progress tracking)
      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      // Upload to backend
      const filename = await uploadDocument(file);

      clearInterval(progressInterval);

      onChange(filename);

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setPreviewUrl(null);
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!value) return;

    if (window.confirm('Are you sure you want to remove this photo?')) {
      try {
        onChange(null);
        setPreviewUrl(null);
        setUploadState({
          isUploading: false,
          progress: 0,
          error: null,
        });
      } catch (error) {
        console.error('Delete failed:', error);
        setUploadState((prev) => ({
          ...prev,
          error: 'Failed to delete photo',
        }));
      }
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && !uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Get the image URL for preview
  const getImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (value) {
      // If value is a filename, construct download URL
      const API_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      return `${API_URL}/api/documents/${value}`;
    }
    return null;
  };

  const imageUrl = getImageUrl();

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
          {imageUrl ? (
            <div className="photo-preview">
              <img
                src={imageUrl}
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
                <small>Filename: {value}</small>
              </div>
            </div>
          ) : (
            <div
              className={`upload-placeholder ${disabled ? 'disabled' : ''}`}
              onClick={triggerFileSelect}
            >
              <div className="upload-icon">📷</div>
              <span className="upload-text">
                {uploadState.isUploading
                  ? 'Uploading...'
                  : 'Click to upload photo'}
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
            <span className="progress-text">
              {Math.round(uploadState.progress)}%
            </span>
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
