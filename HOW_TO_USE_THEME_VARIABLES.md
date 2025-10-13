# 🎨 How to Use Theme Variables in Your Components

## **Method 1: Import in CSS Files (Recommended)**

### **Step 1: Add Import at the Top**
```css
/* Import theme variables GLOBALLY */
@import '../../../styles/theme.css';

/* Your component styles */
.my-component {
  background: var(--primary-color);
  color: var(--text-light);
}
```

### **Step 2: Replace Hardcoded Values**
```css
/* ❌ Before - hardcoded values */
.my-component {
  background: #0056b3;
  color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 86, 179, 0.15);
  transition: all 0.2s ease;
}

/* ✅ After - using theme variables */
.my-component {
  background: var(--primary-color);
  color: var(--text-light);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
}
```

## **Method 2: Global Import (Already Done)**

The theme is already imported in `main.tsx`, so variables are available globally:

```css
/* In any CSS file, you can directly use: */
.component {
  background: var(--primary-color);
  /* No need to import again */
}
```

## **Method 3: Dynamic Inline Styles (React)**

```tsx
import React from 'react';

const MyComponent: React.FC = () => {
  const dynamicStyle = {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--text-light)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--border-radius-md)'
  };

  return (
    <div style={dynamicStyle}>
      Themed Component
    </div>
  );
};
```

## **Method 4: CSS-in-JS with Styled Components**

```tsx
import styled from 'styled-components';

const ThemedButton = styled.button\`
  background: var(--primary-color);
  color: var(--text-light);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  transition: var(--transition-normal);

  &:hover {
    background: var(--primary-color-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
\`;
```

## **🎯 Available Theme Variables**

### **Colors**
```css
/* Primary Colors */
--primary-color: #0056b3;
--primary-color-light: #007bff;
--primary-color-dark: #004494;
--primary-color-darker: #003d82;

/* Background Colors */
--bg-primary: #ffffff;      /* Main backgrounds */
--bg-secondary: #f8f9fa;    /* Section backgrounds */
--bg-tertiary: #e9ecef;     /* Subtle backgrounds */

/* Text Colors */
--text-primary: #212529;    /* Main text */
--text-secondary: #6c757d;  /* Secondary text */
--text-muted: #adb5bd;      /* Muted text */
--text-light: #ffffff;      /* Light text on dark backgrounds */

/* Status Colors */
--success-color: #28a745;
--warning-color: #ffc107;
--error-color: #dc3545;
--info-color: #17a2b8;

/* Border Colors */
--border-primary: #dee2e6;
--border-secondary: #e9ecef;
```

### **Spacing**
```css
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-xxl: 3rem;      /* 48px */
```

### **Effects**
```css
/* Shadows */
--shadow-sm: 0 2px 4px rgba(0, 86, 179, 0.1);
--shadow-md: 0 4px 12px rgba(0, 86, 179, 0.15);
--shadow-lg: 0 6px 16px rgba(0, 86, 179, 0.2);
--shadow-xl: 0 8px 24px rgba(0, 86, 179, 0.25);

/* Gradients */
--gradient-primary: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
--gradient-primary-dark: linear-gradient(135deg, var(--primary-color-dark) 0%, var(--primary-color) 100%);

/* Border Radius */
--border-radius-sm: 0.25rem;  /* 4px */
--border-radius-md: 0.5rem;   /* 8px */
--border-radius-lg: 1rem;     /* 16px */

/* Transitions */
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
```

## **🔄 Quick Migration Examples**

### **Button Component**
```css
/* ❌ Before */
.btn {
  background: #0056b3;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn:hover {
  background: #004494;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* ✅ After */
.btn {
  background: var(--primary-color);
  color: var(--text-light);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  transition: var(--transition-normal);
}

.btn:hover {
  background: var(--primary-color-dark);
  box-shadow: var(--shadow-md);
}
```

### **Card Component**
```css
/* ❌ Before */
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* ✅ After */
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}
```

### **Form Input**
```css
/* ❌ Before */
.input {
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
}

.input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
}

/* ✅ After */
.input {
  border: 2px solid var(--border-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
}
```

## **💡 Pro Tips**

### **1. Use Fallback Values**
```css
.component {
  /* Fallback to blue if variable fails */
  background: var(--primary-color, #0056b3);
}
```

### **2. Create Component-Specific Variables**
```css
.my-component {
  --component-bg: var(--bg-primary);
  --component-text: var(--text-primary);
  
  background: var(--component-bg);
  color: var(--component-text);
}

.my-component--dark {
  --component-bg: var(--bg-dark);
  --component-text: var(--text-light);
}
```

### **3. Use calc() for Dynamic Spacing**
```css
.component {
  padding: calc(var(--spacing-md) * 1.5);
  margin-bottom: calc(var(--spacing-lg) + var(--spacing-sm));
}
```

### **4. Combine Variables**
```css
.component {
  /* Combine multiple variables */
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  
  /* Use in complex values */
  background: linear-gradient(45deg, var(--primary-color), var(--primary-color-light));
}
```

## **🎨 Theme-Aware Components**

### **React Hook for Theme Detection**
```tsx
import { useState, useEffect } from 'react';

export const useCurrentTheme = () => {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail.theme);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChanged', handleThemeChange as EventListener);
  }, []);

  return theme;
};

// Usage
const MyComponent = () => {
  const currentTheme = useCurrentTheme();
  
  return (
    <div className={\`component component--\${currentTheme}\`}>
      Content adapts to {currentTheme} theme
    </div>
  );
};
```

## **✅ Best Practices**

### **Do ✅**
- Always use CSS variables for colors
- Use spacing variables for consistency
- Import theme.css in each component CSS file
- Use semantic variable names (--primary-color, not --blue)
- Test components with different themes

### **Don't ❌**
- Don't use hardcoded hex colors
- Don't use fixed pixel values for spacing
- Don't skip fallback values for critical styles
- Don't forget to test theme switching

## **🚀 Result**

After converting your components:
- ✅ All components will automatically adapt to theme changes
- ✅ Consistent spacing and colors throughout the app
- ✅ Easy maintenance - change one variable, update everything
- ✅ Professional appearance with proper color harmony
- ✅ User can switch themes instantly

Your components are now theme-aware and will look great in any color scheme! 🌟