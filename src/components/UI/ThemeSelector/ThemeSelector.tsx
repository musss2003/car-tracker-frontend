import React, { useState, useEffect } from 'react';
import { ColorSwatchIcon, CheckIcon } from '@heroicons/react/solid';
import { themeManager, AVAILABLE_THEMES, ThemeName } from '../../../utils/themeManager';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  showLabel?: boolean;
  compact?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  showLabel = true, 
  compact = false 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(themeManager.getCurrentTheme());

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  const handleThemeSelect = (themeName: ThemeName) => {
    themeManager.applyTheme(themeName);
  };

  return (
    <div className={`theme-selector ${compact ? 'theme-selector--compact' : ''}`}>
      {showLabel && (
        <div className="theme-selector__label">
          <ColorSwatchIcon className="theme-selector__label-icon" />
          <span>Odaberite temu</span>
        </div>
      )}
      
      <div className="theme-selector__options">
        {AVAILABLE_THEMES.map((theme) => (
          <button
            key={theme.name}
            className={`theme-option ${currentTheme === theme.name ? 'theme-option--active' : ''}`}
            onClick={() => handleThemeSelect(theme.name)}
            title={theme.description}
            type="button"
          >
            <div 
              className="theme-option__color"
              style={{ backgroundColor: theme.primaryColor }}
            />
            {!compact && (
              <div className="theme-option__content">
                <span className="theme-option__name">{theme.displayName}</span>
                <span className="theme-option__description">{theme.description}</span>
              </div>
            )}
            {currentTheme === theme.name && (
              <CheckIcon className="theme-option__check" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;