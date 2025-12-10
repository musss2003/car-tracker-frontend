'use client';

import { useState, useEffect } from 'react';

interface UseIsMobileReturn {
  isMobile: boolean;
  isLoading: boolean;
}

export const useIsMobile = (): UseIsMobileReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      // Only use media query for reliable, secure detection
      // User-agent detection is unreliable and can be spoofed
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      
      setIsMobile(mediaQuery.matches);
      setIsLoading(false);
    };

    // Initial check
    checkIsMobile();

    // Listen for media query changes
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = () => checkIsMobile();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Listen for window resize
    window.addEventListener('resize', checkIsMobile);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return {
    isMobile,
    isLoading,
  };
};

export default useIsMobile;
