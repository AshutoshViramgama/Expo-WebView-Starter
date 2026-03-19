/**
 * hooks/useTheme.ts
 *
 * Returns a typed theme object that tracks the system colour scheme.
 * When the user (or OS) switches between light/dark mode, components
 * using this hook will automatically re-render with updated colours.
 *
 * Dark mode can be disabled globally via the `enableDarkMode` feature flag.
 */

import { useColorScheme } from 'react-native';
import appConfig from '../config/app.config';

// ─── Theme Tokens ─────────────────────────────────────────────────────────────

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    statusBar: 'light-content' | 'dark-content';
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#007AFF',
    text: '#1C1C1E',
    textSecondary: '#6C6C70',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    statusBar: 'dark-content',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    statusBar: 'light-content',
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): Theme {
  const colorScheme = useColorScheme();

  if (!appConfig.features.enableDarkMode) {
    return lightTheme;
  }

  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
