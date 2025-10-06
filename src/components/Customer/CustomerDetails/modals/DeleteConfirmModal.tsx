import React from 'react';
import { ExclamationIcon } from '@heroicons/react/solid';
import { Button } from '../../../UI';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
  customerName: string | number;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  customerName,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="delete-confirm-overlay">
      <div className="delete-confirm-modal">
        <div className="delete-confirm-content">
          <div className="delete-confirm-icon">
            <ExclamationIcon />
          </div>
          
          <div className="delete-confirm-text">
            <h3 className="delete-confirm-title">
              Potvrdi brisanje
            </h3>
            <p className="delete-confirm-message">
              Da li ste sigurni da želite da obrišete korisnika{' '}
              <strong>"{customerName}"</strong>?
            </p>
            <p className="delete-confirm-warning">
              Ova akcija se ne može poništiti.
            </p>
          </div>
        </div>
        
        <div className="delete-confirm-actions">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Otkaži
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
          >
            Da, obriši
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;