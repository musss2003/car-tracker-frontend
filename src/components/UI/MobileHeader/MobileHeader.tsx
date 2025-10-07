import React from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, UserCircleIcon, HomeIcon } from '@heroicons/react/solid';
import './MobileHeader.css';

interface MobileHeaderProps {
  onMenuClick: () => void;
  isVisible: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <header className="mobile-header">
      <div className="mobile-header__content">
        {/* Left side - Hamburger menu */}
        <button
          className="mobile-header__menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          type="button"
        >
          <MenuIcon className="mobile-header__menu-icon" />
        </button>

        {/* Center - Company name/logo */}
        <Link to="/dashboard" className="mobile-header__brand">
          <HomeIcon className="mobile-header__brand-icon" />
          <span className="mobile-header__brand-text">RENT A CAR</span>
        </Link>

        {/* Right side - User profile */}
        <Link 
          to="/profile" 
          className="mobile-header__profile-button"
          aria-label="Go to profile"
        >
          <UserCircleIcon className="mobile-header__profile-icon" />
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;