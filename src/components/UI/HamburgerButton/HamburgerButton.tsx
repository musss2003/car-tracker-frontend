import React from 'react';
import { MenuIcon } from '@heroicons/react/solid';
import './HamburgerButton.css';

interface HamburgerButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <button
      className="hamburger-button"
      onClick={onClick}
      aria-label="Open navigation menu"
      type="button"
    >
      <MenuIcon className="hamburger-icon" />
    </button>
  );
};

export default HamburgerButton;