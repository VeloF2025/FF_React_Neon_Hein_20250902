import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { ThemeName, ThemeContextType, ThemePreference } from '@/types/theme.types';
import { getTheme, DEFAULT_THEME, AVAILABLE_THEMES } from '@/config/themes';

// Storage keys
const THEME_STORAGE_KEY = 'fibreflow-theme-preference';
const THEME_CSS_VAR_PREFIX = '--ff';

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
  enableSystemTheme?: boolean;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = DEFAULT_THEME,
  enableSystemTheme = true 
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(defaultTheme);
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Load theme preference from localStorage
  const loadThemePreference = useCallback((): ThemePreference | null => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) return null;
      
      const preference: ThemePreference = JSON.parse(stored);
      
      // Validate stored theme
      if (!AVAILABLE_THEMES.includes(preference.theme)) {
        return null;
      }
      
      return preference;
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return null;
    }
  }, []);

  // Save theme preference to localStorage
  const saveThemePreference = useCallback((preference: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Apply CSS variables for the current theme
  const applyCSSVariables = useCallback((themeName: ThemeName) => {
    const themeConfig = getTheme(themeName);
    const root = document.documentElement;

    // Apply color variables
    Object.entries(themeConfig.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object' && colors !== null) {
        Object.entries(colors).forEach(([shade, value]) => {
          root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-${category}-${shade}`, value);
        });
      }
    });

    // Apply shadow variables
    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-shadow-${key}`, value);
    });

    // Apply border radius variables
    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-radius-${key}`, value);
    });

    // Apply spacing variables
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-spacing-${key}`, value);
    });

    // Apply typography variables
    Object.entries(themeConfig.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-text-${key}`, value);
    });

    Object.entries(themeConfig.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-font-${key}`, value);
    });

    Object.entries(themeConfig.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CSS_VAR_PREFIX}-leading-${key}`, value);
    });

    // Apply theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${themeName}`);
    
    // Apply dark class for compatibility
    if (themeConfig.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Set theme and save preference
  const setTheme = useCallback((theme: ThemeName) => {
    if (!AVAILABLE_THEMES.includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using default theme.`);
      theme = DEFAULT_THEME;
    }

    setCurrentTheme(theme);
    setIsSystemTheme(false);
    applyCSSVariables(theme);

    // Save preference
    const preference: ThemePreference = {
      theme,
      useSystemTheme: false,
      lastChanged: new Date(),
    };
    saveThemePreference(preference);
  }, [applyCSSVariables, saveThemePreference]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [currentTheme, setTheme]);

  // Reset to system theme
  const resetToSystemTheme = useCallback(() => {
    if (!enableSystemTheme) return;

    const sysTheme = getSystemTheme();
    setCurrentTheme(sysTheme);
    setIsSystemTheme(true);
    setSystemTheme(sysTheme);
    applyCSSVariables(sysTheme);

    // Save preference
    const preference: ThemePreference = {
      theme: sysTheme,
      useSystemTheme: true,
      lastChanged: new Date(),
    };
    saveThemePreference(preference);
  }, [enableSystemTheme, getSystemTheme, applyCSSVariables, saveThemePreference]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // If user is using system theme, update current theme
      if (isSystemTheme) {
        setCurrentTheme(newSystemTheme);
        applyCSSVariables(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [enableSystemTheme, isSystemTheme, applyCSSVariables]);

  // Initialize theme on mount
  useEffect(() => {
    const preference = loadThemePreference();
    
    if (preference) {
      if (preference.useSystemTheme && enableSystemTheme) {
        resetToSystemTheme();
      } else {
        setCurrentTheme(preference.theme);
        applyCSSVariables(preference.theme);
      }
    } else if (enableSystemTheme) {
      // No saved preference, use system theme
      resetToSystemTheme();
    } else {
      // Use default theme
      applyCSSVariables(defaultTheme);
    }

    // Update system theme state
    setSystemTheme(getSystemTheme());
  }, [
    loadThemePreference, 
    resetToSystemTheme, 
    applyCSSVariables, 
    defaultTheme, 
    enableSystemTheme,
    getSystemTheme
  ]);

  // Get current theme config
  const themeConfig = getTheme(currentTheme);

  const contextValue: ThemeContextType = {
    currentTheme,
    themeConfig,
    availableThemes: AVAILABLE_THEMES,
    setTheme,
    toggleTheme,
    resetToSystemTheme,
    isSystemTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Utility hook to get theme-aware CSS classes
export function useThemeClasses() {
  const { themeConfig } = useTheme();
  
  return {
    // Background classes
    bgPrimary: 'bg-[var(--ff-background-primary)]',
    bgSecondary: 'bg-[var(--ff-background-secondary)]',
    bgTertiary: 'bg-[var(--ff-background-tertiary)]',
    
    // Text classes
    textPrimary: 'text-[var(--ff-text-primary)]',
    textSecondary: 'text-[var(--ff-text-secondary)]',
    textTertiary: 'text-[var(--ff-text-tertiary)]',
    textAccent: 'text-[var(--ff-text-accent)]',
    
    // Border classes
    borderPrimary: 'border-[var(--ff-border-primary)]',
    borderSecondary: 'border-[var(--ff-border-secondary)]',
    borderFocus: 'focus:border-[var(--ff-border-focus)]',
    
    // Surface classes
    surfacePrimary: 'bg-[var(--ff-surface-primary)]',
    surfaceSecondary: 'bg-[var(--ff-surface-secondary)]',
    surfaceElevated: 'bg-[var(--ff-surface-elevated)]',
    
    // Primary color classes
    primaryBg: 'bg-[var(--ff-primary-500)]',
    primaryText: 'text-[var(--ff-primary-600)]',
    primaryBorder: 'border-[var(--ff-primary-500)]',
    
    // Helper to check if current theme is dark
    isDark: themeConfig.isDark,
  };
}