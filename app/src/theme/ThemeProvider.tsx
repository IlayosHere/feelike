import React, { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeContext } from './ThemeContext';
import { darkTheme, lightTheme } from './tokens';
import type { ThemeMode } from './types';

// Block the splash screen until the saved preference is loaded.
SplashScreen.preventAutoHideAsync();

const STORAGE_KEY = '@feelike/theme-mode';

// RGB channels for lightTheme.bg (250,250,255) and darkTheme.bg (11,11,15).
// Hardcoded so the Reanimated worklet can interpolate without JS-side lookups.
const LIGHT_R = 250, LIGHT_G = 250, LIGHT_B = 255;
const DARK_R = 11, DARK_G = 11, DARK_B = 15;

const TRANSITION_DURATION = 220;
const TRANSITION_EASING = Easing.bezier(0.2, 0, 0, 1);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive resolved mode from stored preference and system scheme.
  const resolvedMode: 'light' | 'dark' =
    mode === 'auto'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : mode;

  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  // Shared value: 0 = light, 1 = dark
  const darkProgress = useSharedValue(resolvedMode === 'dark' ? 1 : 0);

  // Animate whenever resolvedMode changes.
  useEffect(() => {
    darkProgress.value = withTiming(resolvedMode === 'dark' ? 1 : 0, {
      duration: TRANSITION_DURATION,
      easing: TRANSITION_EASING,
    });
  }, [resolvedMode, darkProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate RGB channels between light and dark background values.
    const t = darkProgress.value;
    const r = Math.round(LIGHT_R + (DARK_R - LIGHT_R) * t);
    const g = Math.round(LIGHT_G + (DARK_G - LIGHT_G) * t);
    const b = Math.round(LIGHT_B + (DARK_B - LIGHT_B) * t);
    return { backgroundColor: `rgb(${r},${g},${b})` };
  });

  // Load saved preference on mount.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark' || stored === 'auto') {
          setModeState(stored);
        }
      })
      .catch(() => {
        // Silently fall back to 'auto' — non-critical.
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide splash screen once preference is loaded.
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Persist failure is non-fatal; in-memory state still updated.
    });
  }, []);

  // Don't render children until we know the saved preference.
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode, theme }}>
      <Animated.View
        className={`flex-1 bg-bg${resolvedMode === 'dark' ? ' dark' : ''}`}
        style={animatedStyle}
      >
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}
