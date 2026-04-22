import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import { ThemeContext, type ThemeContextValue } from '@/theme/ThemeContext';
import { lightTheme } from '@/theme/tokens';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

// Synchronous stub — avoids async AsyncStorage reads that cause act() warnings
// when the real ThemeProvider is used in non-theme tests.
const stubThemeValue: ThemeContextValue = {
  mode: 'auto',
  setMode: jest.fn(),
  resolvedMode: 'light',
  theme: lightTheme,
};

function AllProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={stubThemeValue}>
        {children}
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export function makeTestQueryClient() {
  return makeQueryClient();
}
