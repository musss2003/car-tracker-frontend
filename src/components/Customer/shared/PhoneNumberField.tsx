import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { CountryOption } from '../../../services/customerService';
import './PhoneNumberField.css';

interface PhoneNumberFieldProps {
  countries: CountryOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
}

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  countries,
  value,
  onChange,
  placeholder = '61123456',
  loading = false,
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse current value
  const currentCountryCode = value?.split(' ')[0] || '';
  const currentPhoneNumber = value?.split(' ').slice(1).join(' ') || '';

  // Find selected country
  const selectedCountry = countries.find(
    (country) => country.dialCode === currentCountryCode
  );

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  );

  // Handle country code selection
  const handleCountrySelect = (dialCode: string) => {
    const newValue = `${dialCode} ${currentPhoneNumber}`.trim();
    onChange(newValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle phone number input
  const handlePhoneNumberChange = (phoneNumber: string) => {
    const newValue = `${currentCountryCode} ${phoneNumber}`.trim();
    onChange(newValue);
  };

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  if (loading) {
    return (
      <div className="phone-field">
        <div className="phone-field__loading">
          <div className="phone-field__loading-spinner"></div>
          <span>Učitavanje kodova zemalja...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="phone-field">
        <div className="phone-field__error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Don't render if no countries available
  if (!countries || countries.length === 0) {
    return (
      <div className="phone-field">
        <div className="phone-field__container">
          <div className="phone-field__country-section">
            <button
              type="button"
              className="phone-field__country-trigger"
              disabled
            >
              <span className="phone-field__code">Loading...</span>
            </button>
          </div>
          <div className="phone-field__number-section">
            <input
              type="tel"
              className="phone-field__number-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`phone-field ${isOpen ? 'phone-field--open' : ''}`}
      ref={dropdownRef}
    >
      <div className="phone-field__container">
        {/* Country Code Dropdown */}
        <div className="phone-field__country-section">
          <button
            type="button"
            className={`phone-field__country-trigger ${isOpen ? 'phone-field__country-trigger--open' : ''}`}
            onClick={() => {
              console.log('PhoneField button clicked, isOpen was:', isOpen);
              setIsOpen((prev) => !prev);
            }}
          >
            <div className="phone-field__country-content">
              {selectedCountry && (
                <span className="phone-field__flag">
                  {selectedCountry.flag}
                </span>
              )}
              <span className="phone-field__code">
                {currentCountryCode || 'Kod'}
              </span>
            </div>
            <ChevronDownIcon
              className={`phone-field__arrow ${isOpen ? 'phone-field__arrow--open' : ''}`}
            />
          </button>
        </div>

        {/* Phone Number Input */}
        <div className="phone-field__number-section">
          <input
            type="tel"
            className="phone-field__number-input"
            value={currentPhoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </div>

      {/* Dropdown Menu - Positioned relative to phone-field */}
      {isOpen && (
        <div className="phone-field__dropdown">
          <div className="phone-field__search-container">
            <input
              ref={searchInputRef}
              type="text"
              className="phone-field__search"
              placeholder="Pretraži zemlje..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="phone-field__options">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`phone-field__option ${
                    country.dialCode === currentCountryCode
                      ? 'phone-field__option--selected'
                      : ''
                  }`}
                  onClick={() => handleCountrySelect(country.dialCode)}
                >
                  <span className="phone-field__flag">{country.flag}</span>
                  <div className="phone-field__option-content">
                    <span className="phone-field__country-name">
                      {country.name}
                    </span>
                    <span className="phone-field__calling-code">
                      {country.dialCode}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="phone-field__no-results">
                Nema rezultata za "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberField;
