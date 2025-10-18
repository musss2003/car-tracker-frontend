import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon } from '@heroicons/react/solid';
import { CountryOption } from '../../../services/customerService';
import './CountryDropdown.css';

interface CountryDropdownProps {
  countries: CountryOption[];
  selectedCountry: string;
  onSelect: (countryName: string) => void;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  countries,
  selectedCountry,
  onSelect,
  loading = false,
  error = null,
  placeholder = 'Izaberite zemlju...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search term
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (countryName: string) => {
    onSelect(countryName);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Get selected country data
  const selectedCountryData = countries.find((c) => c.name === selectedCountry);

  if (loading) {
    return (
      <div className="country-dropdown country-dropdown--loading">
        <div className="country-dropdown__loading">
          <div className="loading-spinner" />
          <span>Učitavanje zemalja...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="country-dropdown country-dropdown--error">
        <div className="country-dropdown__error">
          <span>⚠ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="country-dropdown" ref={dropdownRef}>
      <div
        className={`country-dropdown__trigger ${isOpen ? 'country-dropdown__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="country-dropdown__selected">
          {selectedCountryData ? (
            <>
              <span>{selectedCountryData.flag}</span>
              <span className="country-dropdown__name">
                {selectedCountryData.name}
              </span>
            </>
          ) : (
            <span className="country-dropdown__placeholder">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={`country-dropdown__arrow ${isOpen ? 'country-dropdown__arrow--open' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="country-dropdown__menu">
          <div className="country-dropdown__search">
            <SearchIcon className="country-dropdown__search-icon" />
            <input
              type="text"
              placeholder="Pretražite zemlje..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="country-dropdown__search-input"
              autoFocus
            />
          </div>

          <div className="country-dropdown__options">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className={`country-dropdown__option ${
                    country.name === selectedCountry
                      ? 'country-dropdown__option--selected'
                      : ''
                  }`}
                  onClick={() => handleCountrySelect(country.name)}
                >
                  <span>{country.flag}</span>
                  <span className="country-dropdown__name">{country.name}</span>
                </div>
              ))
            ) : (
              <div className="country-dropdown__no-results">
                Nema rezultata za "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;
