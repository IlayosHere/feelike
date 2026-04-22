/**
 * ThemeProvider + useTheme — behavior tests.
 *
 * We exercise the public API of the ThemeContext:
 *   - mode / resolvedMode / setMode
 *   - error thrown when used outside provider
 *
 * AsyncStorage and expo-splash-screen are mocked so the provider can load
 * without native modules.
 */

import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockHideAsync = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: mockHideAsync,
}));

// Mock Reanimated — jest-expo handles the preset but Animated.View from
// react-native-reanimated needs stubbing for the background transition wrapper.
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // useAnimatedStyle must return an object (not undefined) so Animated.View
  // can spread it as a style prop without throwing.
  Reanimated.useAnimatedStyle = (fn: () => object) => fn();
  return Reanimated;
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <View {...props}>{children}</View>
    ),
  };
});

// We need to control useColorScheme on a per-test basis.
const mockUseColorScheme = jest.fn<'light' | 'dark' | null, []>(() => 'light');
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => mockUseColorScheme(),
}));

// ---------------------------------------------------------------------------
// Helper consumer component
// ---------------------------------------------------------------------------

/**
 * Renders the ThemeContext values into accessible text nodes so tests can
 * query them without reaching into component internals.
 */
function ThemeConsumer() {
  const { mode, resolvedMode, setMode } = useTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="resolvedMode">{resolvedMode}</Text>
      <Text
        testID="setDark"
        onPress={() => setMode('dark')}
        accessibilityRole="button"
        accessibilityLabel="Set dark"
      >
        set dark
      </Text>
      <Text
        testID="setLight"
        onPress={() => setMode('light')}
        accessibilityRole="button"
        accessibilityLabel="Set light"
      >
        set light
      </Text>
      <Text
        testID="setAuto"
        onPress={() => setMode('auto')}
        accessibilityRole="button"
        accessibilityLabel="Set auto"
      >
        set auto
      </Text>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ThemeProvider / useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: system is light
    mockUseColorScheme.mockReturnValue('light');
  });

  it('useTheme throws if used outside ThemeProvider', () => {
    // Suppress React's console.error for the expected throw.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<ThemeConsumer />),
    ).toThrow('useTheme must be used within ThemeProvider');
    spy.mockRestore();
  });

  it('default mode is "auto"', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Wait for AsyncStorage.getItem to resolve and the provider to become loaded.
    await act(async () => {});

    expect(getByTestId('mode').props.children).toBe('auto');
  });

  it('setMode("dark") changes resolvedMode to "dark" when system is light', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await act(async () => {});

    // Sanity: starts as light
    expect(getByTestId('resolvedMode').props.children).toBe('light');

    await act(async () => {
      getByRole('button', { name: 'Set dark' }).props.onPress();
    });

    expect(getByTestId('resolvedMode').props.children).toBe('dark');
  });

  it('setMode("light") resolves to "light" regardless of system color scheme', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await act(async () => {});

    await act(async () => {
      getByRole('button', { name: 'Set light' }).props.onPress();
    });

    expect(getByTestId('resolvedMode').props.children).toBe('light');
  });

  it('setMode("auto") reads from system color scheme — system dark → resolvedMode dark', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await act(async () => {});

    // First force to light to prove the transition happens.
    await act(async () => {
      getByRole('button', { name: 'Set light' }).props.onPress();
    });
    expect(getByTestId('resolvedMode').props.children).toBe('light');

    // Now switch back to auto — system is dark so resolved should flip.
    await act(async () => {
      getByRole('button', { name: 'Set auto' }).props.onPress();
    });

    expect(getByTestId('resolvedMode').props.children).toBe('dark');
  });
});
