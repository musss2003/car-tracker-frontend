import React, { useState, useEffect } from 'react';
import { XIcon } from '@heroicons/react/solid';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '../../../../services/uploadService';
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const blob = await downloadDocument(imageUrl);
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
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
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <h3 className="image-modal-title">{imageType}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <XIcon className="w-4 h-4 mr-1" />
            Zatvori
          </Button>
        </div>

        <div className="image-modal-content">
          <img src={imageUrl} alt={imageType} className="image-modal-image" />
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
