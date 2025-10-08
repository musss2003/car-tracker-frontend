import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon } from '@heroicons/react/solid';
import municipalitiesData from '../../../../municipalities.json';

interface MunicipalityDropdownProps {
  selectedMunicipality: string;
  onSelect: (municipalityName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MunicipalityDropdown: React.FC<MunicipalityDropdownProps> = ({
  selectedMunicipality,
  onSelect,
  placeholder = 'Izaberite grad...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten all municipalities from the JSON structure
  const getAllMunicipalities = (): string[] => {
    const allMunicipalities: string[] = [];
    
    // Add municipalities from Federacija Bosne i Hercegovine
    if (municipalitiesData['Federacija Bosne i Hercegovine']) {
      Object.values(municipalitiesData['Federacija Bosne i Hercegovine']).forEach((cantonMunicipalities) => {
        allMunicipalities.push(...cantonMunicipalities);
      });
    }
    
    // Add municipalities from Republika Srpska
    if (municipalitiesData['Republika Srpska']) {
      allMunicipalities.push(...municipalitiesData['Republika Srpska']);
    }
    
    // Add municipalities from Brčko distrikt
    if (municipalitiesData['Brčko distrikt']) {
      allMunicipalities.push(...municipalitiesData['Brčko distrikt']);
    }
    
    // Sort alphabetically and remove duplicates
    return [...new Set(allMunicipalities)].sort((a, b) => a.localeCompare(b, 'bs'));
  };

  const municipalities = getAllMunicipalities();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter municipalities based on search term
  const filteredMunicipalities = municipalities.filter((municipality) =>
    municipality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle municipality selection
  const handleMunicipalitySelect = (municipalityName: string) => {
    onSelect(municipalityName);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="country-dropdown" ref={dropdownRef}>
      <div
        className={`country-dropdown__trigger ${isOpen ? 'country-dropdown__trigger--open' : ''} ${disabled ? 'country-dropdown__trigger--disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="country-dropdown__selected">
          {selectedMunicipality ? (
            <span className="country-dropdown__name">
              {selectedMunicipality}
            </span>
          ) : (
            <span className="country-dropdown__placeholder">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDownIcon 
          className={`country-dropdown__arrow ${isOpen ? 'country-dropdown__arrow--open' : ''}`} 
        />
      </div>

      {isOpen && !disabled && (
        <div className="country-dropdown__menu">
          <div className="country-dropdown__search">
            <SearchIcon className="country-dropdown__search-icon" />
            <input
              type="text"
              placeholder="Pretražite gradove..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="country-dropdown__search-input"
              autoFocus
            />
          </div>

          <div className="country-dropdown__options">
            {filteredMunicipalities.length > 0 ? (
              filteredMunicipalities.map((municipality) => (
                <div
                  key={municipality}
                  className={`country-dropdown__option ${
                    municipality === selectedMunicipality ? 'country-dropdown__option--selected' : ''
                  }`}
                  onClick={() => handleMunicipalitySelect(municipality)}
                >
                  <span className="country-dropdown__name">
                    {municipality}
                  </span>
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

export default MunicipalityDropdown;