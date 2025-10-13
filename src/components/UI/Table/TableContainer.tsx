import React from 'react';
import './TableContainer.css';

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

const TableContainer: React.FC<TableContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`table-container ${className}`}>
      {children}
    </div>
  );
};

export default TableContainer;