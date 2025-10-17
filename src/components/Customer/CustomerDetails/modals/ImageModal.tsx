import React from 'react';
import { XIcon } from '@heroicons/react/solid';
import { Button } from '../../../ui';
import './ImageModal.css';

interface ImageModalProps {
  imageUrl: string;
  imageType: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  imageType,
  onClose,
}) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <h3 className="image-modal-title">{imageType}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<XIcon />}
          >
            Zatvori
          </Button>
        </div>
        
        <div className="image-modal-content">
          <img 
            src={imageUrl} 
            alt={imageType}
            className="image-modal-image"
          />
        </div>
        
        <div className="image-modal-footer">
          <p className="image-modal-hint">
            Kliknite van slike ili pritisnite Escape da zatvorite
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;