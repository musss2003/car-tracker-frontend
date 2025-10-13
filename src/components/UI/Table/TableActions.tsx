import React from 'react';
import { 
  UserAddIcon, 
  DownloadIcon, 
  DocumentTextIcon,
  PlusCircleIcon 
} from '@heroicons/react/solid';
import { Button } from '../index';
import './TableActions.css';

interface TableActionsProps {
  onCreateClick?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  createLabel?: string;
  showExport?: boolean;
  createIcon?: 'user' | 'plus' | 'document';
  loading?: boolean;
}

const TableActions: React.FC<TableActionsProps> = ({
  onCreateClick,
  onExportExcel,
  onExportPDF,
  createLabel = 'Dodaj novi',
  showExport = true,
  createIcon = 'plus',
  loading = false
}) => {
  const getCreateIcon = () => {
    switch (createIcon) {
      case 'user':
        return <UserAddIcon className="btn-icon" />;
      case 'document':
        return <DocumentTextIcon className="btn-icon" />;
      default:
        return <PlusCircleIcon className="btn-icon" />;
    }
  };

  return (
    <div className="table-actions">
      {onCreateClick && (
        <Button
          variant="primary"
          size="md"
          onClick={onCreateClick}
          disabled={loading}
          className="create-btn"
        >
          {getCreateIcon()}
          {createLabel}
        </Button>
      )}

      {showExport && (
        <div className="export-controls">
          {onExportExcel && (
            <Button
              variant="secondary"
              size="md"
              onClick={onExportExcel}
              disabled={loading}
              className="export-btn excel"
            >
              <DownloadIcon className="btn-icon" />
              Excel
            </Button>
          )}
          
          {onExportPDF && (
            <Button
              variant="secondary"
              size="md"
              onClick={onExportPDF}
              disabled={loading}
              className="export-btn pdf"
            >
              <DocumentTextIcon className="btn-icon" />
              PDF
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableActions;