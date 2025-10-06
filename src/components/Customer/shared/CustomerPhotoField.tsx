import React from 'react';
import { PhotographIcon } from '@heroicons/react/solid';
import './CustomerPhotoField.css';

interface CustomerPhotoFieldProps {
  label: string;
  photoUrl?: string;
  onFileChange: (file: File | null) => void;
  error?: string | null;
  required?: boolean;
}

const CustomerPhotoField: React.FC<CustomerPhotoFieldProps> = ({
  label,
  photoUrl,
  onFileChange,
  error,
  required = false
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className={`customer-photo-field ${error ? 'customer-photo-field--error' : ''}`}>
      <label className="customer-photo-field__label">
        {label}
        {required && <span className="customer-photo-field__required">*</span>}
      </label>
      
      <div className="customer-photo-field__container">
        {photoUrl ? (
          <div className="customer-photo-field__preview">
            <img 
              src={photoUrl} 
              alt={label}
              className="customer-photo-field__image"
            />
            <div className="customer-photo-field__overlay">
              <PhotographIcon className="customer-photo-field__icon" />
              <span>Promijeni sliku</span>
            </div>
          </div>
        ) : (
          <div className="customer-photo-field__placeholder">
            <PhotographIcon className="customer-photo-field__icon" />
            <span>Dodaj {label.toLowerCase()}</span>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="customer-photo-field__input"
        />
      </div>
      
      {error && (
        <div className="customer-photo-field__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default CustomerPhotoField;