import React from 'react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
  isVisible: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4 md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="mr-2"
        aria-label="Toggle menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Button>

      <h1 className="text-lg font-semibold">Car Tracker</h1>
    </header>
  );
};

export default MobileHeader;
