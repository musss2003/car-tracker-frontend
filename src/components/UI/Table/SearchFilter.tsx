import React from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import './SearchFilter.css';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Pretražite...',
  className = ''
}) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className={`search-container ${className}`}>
      <SearchIcon className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="clear-search"
          title="Očisti pretragu"
        >
          <XIcon className="clear-icon" />
        </button>
      )}
    </div>
  );
};

export default SearchFilter;