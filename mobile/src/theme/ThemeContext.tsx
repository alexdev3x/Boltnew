import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type BoltTheme, type ThemeName } from './colors';

const STORAGE_KEY = 'bolt_theme';

type ThemeContextValue = {
  themeName: ThemeName;
  theme: BoltTheme;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeName, setThemeNameState] = useState<ThemeName>(systemScheme === 'dark' ? 'dark' : 'light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setThemeNameState(stored);
        }
      })
      .catch(() => {
        // Keep the system/default theme when storage is unavailable.
      })
      .finally(() => setReady(true));
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {
      // Ignore persistence failures; in-memory theme still updates.
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme: themes[themeName],
      setThemeName,
      toggleTheme: () => setThemeName(themeName === 'dark' ? 'light' : 'dark'),
    }),
    [themeName],
  );

  if (!ready) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
