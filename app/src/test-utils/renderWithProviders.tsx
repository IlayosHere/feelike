/**
 * Shared test utility: wraps a component in QueryClientProvider + a real
 * ThemeProvider backed by mocked AsyncStorage and expo-splash-screen.
 *
 * Each call creates a fresh QueryClient so tests are isolated.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme/ThemeProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Never retry in tests — fail fast.
        retry: false,
        // Disable background refetching so tests stay deterministic.
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

type WrapperProps = { children: React.ReactNode };

function AllProviders({ children }: WrapperProps) {
  // QueryClient is created once per wrapper instance (i.e. per test).
  const [queryClient] = React.useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/** Expose a bare QueryClientProvider wrapper for cases where ThemeProvider
 *  is not needed (e.g. hook-only tests). */
export function makeTestQueryClient() {
  return makeQueryClient();
}
