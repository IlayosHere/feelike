import { createContext } from 'react';
import type { ThemeMode, ResolvedTheme } from './types';

export type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
  theme: ResolvedTheme;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
