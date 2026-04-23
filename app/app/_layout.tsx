import '../global.css';
import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { SidePanelProvider } from '@/context/SidePanelContext';
import { SidePanel } from '@/components/SidePanel';
import { useAuthStore } from '@/stores/authStore';
import { startMockServer } from '@/mocks/setup';

SplashScreen.preventAutoHideAsync();

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
  const [mockReady, setMockReady] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Start MSW and load token before rendering anything.
  useEffect(() => {
    startMockServer().then(() => {
      setMockReady(true);
      loadToken();
    });
  }, [loadToken]);

  // Hide splash once everything is ready.
  useEffect(() => {
    if (fontsLoaded && !isTokenLoading && mockReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isTokenLoading, mockReady]);

  if (!fontsLoaded || isTokenLoading || !mockReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidePanelProvider>
          <Slot />
          <SidePanel />
        </SidePanelProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
