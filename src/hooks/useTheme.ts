import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'ecorain_theme_preference';

export function useTheme() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'light';
  });

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, applyTheme]);

  return { themeMode, setThemeMode };
}
