/**
 * Theme Manager for Rent A Car System
 * 
 * This utility manages theme switching throughout the application.
 * Themes are applied by adding CSS classes to the document body.
 */

export type ThemeName = 'default' | 'green' | 'purple' | 'orange' | 'dark';

interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  className: string;
  primaryColor: string;
}

export const AVAILABLE_THEMES: Theme[] = [
  {
    name: 'default',
    displayName: 'Plava (Zadana)',
    description: 'Klasična plava tema',
    className: '',
    primaryColor: '#0056b3'
  },
  {
    name: 'green',
    displayName: 'Zelena',
    description: 'Prirodna zelena tema',
    className: 'theme-green',
    primaryColor: '#28a745'
  },
  {
    name: 'purple',
    displayName: 'Ljubičasta',
    description: 'Elegantna ljubičasta tema',
    className: 'theme-purple',
    primaryColor: '#6f42c1'
  },
  {
    name: 'orange',
    displayName: 'Narandžasta',
    description: 'Energična narandžasta tema',
    className: 'theme-orange',
    primaryColor: '#fd7e14'
  },
  {
    name: 'dark',
    displayName: 'Tamna',
    description: 'Tamna tema za noćni rad',
    className: 'theme-dark',
    primaryColor: '#0056b3'
  }
];

class ThemeManager {
  private currentTheme: ThemeName = 'default';
  private readonly STORAGE_KEY = 'rent-a-car-theme';

  constructor() {
    this.loadSavedTheme();
  }

  /**
   * Load theme from localStorage on app startup
   */
  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeName;
      if (savedTheme && this.isValidTheme(savedTheme)) {
        this.applyTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
    }
  }

  /**
   * Check if theme name is valid
   */
  private isValidTheme(theme: string): theme is ThemeName {
    return AVAILABLE_THEMES.some(t => t.name === theme);
  }

  /**
   * Apply theme to the document
   */
  public applyTheme(themeName: ThemeName): void {
    const theme = AVAILABLE_THEMES.find(t => t.name === themeName);
    if (!theme) {
      console.error(`Theme "${themeName}" not found`);
      return;
    }

    // Remove all theme classes
    AVAILABLE_THEMES.forEach(t => {
      if (t.className) {
        document.body.classList.remove(t.className);
      }
    });

    // Apply new theme class
    if (theme.className) {
      document.body.classList.add(theme.className);
    }

    // Update current theme
    this.currentTheme = themeName;

    // Save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, themeName);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }

    // Dispatch custom event for components that need to react to theme changes
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName, themeData: theme }
    }));
  }

  /**
   * Get current active theme
   */
  public getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  /**
   * Get current theme data
   */
  public getCurrentThemeData(): Theme | undefined {
    return AVAILABLE_THEMES.find(t => t.name === this.currentTheme);
  }

  /**
   * Get all available themes
   */
  public getAvailableThemes(): Theme[] {
    return [...AVAILABLE_THEMES];
  }

  /**
   * Toggle between light and dark mode
   */
  public toggleDarkMode(): void {
    const newTheme = this.currentTheme === 'dark' ? 'default' : 'dark';
    this.applyTheme(newTheme);
  }

  /**
   * Check if current theme is dark mode
   */
  public isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Cycle to next theme (useful for testing)
   */
  public cycleTheme(): void {
    const currentIndex = AVAILABLE_THEMES.findIndex(t => t.name === this.currentTheme);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    this.applyTheme(AVAILABLE_THEMES[nextIndex].name);
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// Export for React hooks
export const useTheme = () => {
  return {
    currentTheme: themeManager.getCurrentTheme(),
    currentThemeData: themeManager.getCurrentThemeData(),
    availableThemes: themeManager.getAvailableThemes(),
    applyTheme: themeManager.applyTheme.bind(themeManager),
    toggleDarkMode: themeManager.toggleDarkMode.bind(themeManager),
    isDarkMode: themeManager.isDarkMode.bind(themeManager),
    cycleTheme: themeManager.cycleTheme.bind(themeManager)
  };
};

export default themeManager;