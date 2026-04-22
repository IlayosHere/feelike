import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { startMockServer } from '@/mocks/setup';

// Keep the splash screen visible until fonts and token are both ready.
SplashScreen.preventAutoHideAsync();

// Start MSW in development before any queries run.
startMockServer();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const loadToken = useAuthStore((s) => s.loadToken);
  const isTokenLoading = useAuthStore((s) => s.isLoading);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
  });

  // Load the persisted auth token once on mount.
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Hide splash once both fonts and token state are ready.
  useEffect(() => {
    if (fontsLoaded && !isTokenLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isTokenLoading]);

  if (!fontsLoaded || isTokenLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
