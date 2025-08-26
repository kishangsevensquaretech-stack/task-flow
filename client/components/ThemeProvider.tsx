import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ColorTheme = {
  name: string;
  primary: string;
  primaryHsl: string;
};

const colorThemes: ColorTheme[] = [
  { name: 'Green', primary: '#22c55e', primaryHsl: '142 76% 36%' },
  { name: 'Blue', primary: '#3b82f6', primaryHsl: '217 91% 60%' },
  { name: 'Purple', primary: '#a855f7', primaryHsl: '262 83% 58%' },
  { name: 'Orange', primary: '#f97316', primaryHsl: '21 90% 48%' },
  { name: 'Red', primary: '#ef4444', primaryHsl: '0 84% 60%' },
  { name: 'Pink', primary: '#ec4899', primaryHsl: '330 81% 60%' },
];

type ThemeProviderContextType = {
  theme: Theme;
  colorTheme: ColorTheme;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  colorThemes: ColorTheme[];
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  defaultColorTheme = colorThemes[0],
  storageKey = 'vite-ui-theme',
  colorStorageKey = 'vite-ui-color-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorTheme?: ColorTheme;
  storageKey?: string;
  colorStorageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    return stored || defaultTheme;
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem(colorStorageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultColorTheme;
      }
    }
    return defaultColorTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Update CSS custom properties for the selected color theme
    root.style.setProperty('--primary', colorTheme.primaryHsl);
    
  }, [theme, colorTheme]);

  const value = {
    theme,
    colorTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(colorStorageKey, JSON.stringify(colorTheme));
      setColorTheme(colorTheme);
    },
    colorThemes,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
