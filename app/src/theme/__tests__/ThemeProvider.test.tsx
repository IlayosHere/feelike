import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(() => ({ colorScheme: 'light', setColorScheme: jest.fn() })),
  setColorScheme: jest.fn(),
  vars: (v: object) => v,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
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

const mockUseColorScheme = jest.fn<'light' | 'dark' | null, []>(() => 'light');
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => mockUseColorScheme(),
}));

function ThemeConsumer() {
  const { mode, resolvedMode, setMode } = useTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="resolvedMode">{resolvedMode}</Text>
      <Text testID="setDark" onPress={() => setMode('dark')}>set dark</Text>
      <Text testID="setLight" onPress={() => setMode('light')}>set light</Text>
      <Text testID="setAuto" onPress={() => setMode('auto')}>set auto</Text>
    </>
  );
}

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ThemeProvider / useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('useTheme throws if used outside ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow(
      'useTheme must be used within ThemeProvider',
    );
    spy.mockRestore();
  });

  it('default mode is "auto"', async () => {
    const { getByTestId } = wrap(<ThemeConsumer />);
    await act(async () => {});
    expect(getByTestId('mode').props.children).toBe('auto');
  });

  it('setMode("dark") changes resolvedMode to "dark" when system is light', async () => {
    mockUseColorScheme.mockReturnValue('light');
    const { getByTestId } = wrap(<ThemeConsumer />);
    await act(async () => {});

    expect(getByTestId('resolvedMode').props.children).toBe('light');

    await act(async () => {
      getByTestId('setDark').props.onPress();
    });

    expect(getByTestId('resolvedMode').props.children).toBe('dark');
  });

  it('setMode("light") resolves to "light" regardless of system color scheme', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { getByTestId } = wrap(<ThemeConsumer />);
    await act(async () => {});

    await act(async () => {
      getByTestId('setLight').props.onPress();
    });

    expect(getByTestId('resolvedMode').props.children).toBe('light');
  });

  it('setMode("auto") reads from system color scheme — system dark → resolvedMode dark', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { getByTestId } = wrap(<ThemeConsumer />);
    await act(async () => {});

    await act(async () => {
      getByTestId('setLight').props.onPress();
    });
    expect(getByTestId('resolvedMode').props.children).toBe('light');

    await act(async () => {
      getByTestId('setAuto').props.onPress();
    });

    expect(getByTestId('resolvedMode').props.children).toBe('dark');
  });
});
