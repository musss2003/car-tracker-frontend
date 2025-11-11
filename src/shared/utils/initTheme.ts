/**
 * Initialize theme on app startup
 * This ensures the theme is applied before the UI renders
 */

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'system';
  const root = document.documentElement;

  if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else if (savedTheme === 'light') {
    root.classList.remove('dark');
  } else {
    // System theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// Run immediately
initializeTheme();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'system' || !savedTheme) {
    const root = document.documentElement;
    if (e.matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
});

export {};
