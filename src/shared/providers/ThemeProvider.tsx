import React, { createContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  );

  const applyTheme = (selected: Theme) => {
    const root = window.document.documentElement;

    if (selected === 'system') {
      const systemIsDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      root.classList.toggle('dark', systemIsDark);
      return;
    }

    root.classList.toggle('dark', selected === 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);

    const systemListener = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme('system');
    };
    systemListener.addEventListener('change', handler);

    return () => systemListener.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
