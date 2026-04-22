/**
 * Button component — behavior tests.
 *
 * The Button renders inside a LinearGradient for the primary variant and needs
 * the ThemeProvider because it calls useTheme(). We wrap in renderWithProviders
 * from the shared helper (which also provides QueryClient).
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <View {...props}>{children}</View>
    ),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Button', () => {
  it('renders the label', () => {
    const { getByText } = renderWithProviders(
      <Button label="Save entry" onPress={jest.fn()} />,
    );

    expect(getByText('Save entry')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <Button label="Sign In" onPress={onPress} />,
    );

    fireEvent.press(getByRole('button', { name: 'Sign In' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled=true', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <Button label="Sign In" onPress={onPress} disabled />,
    );

    fireEvent.press(getByRole('button', { name: 'Sign In' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading=true', () => {
    const { UNSAFE_getByType, queryByText } = renderWithProviders(
      <Button label="Sign In" onPress={jest.fn()} loading />,
    );

    // The label text is replaced by the spinner while loading.
    expect(queryByText('Sign In')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows checkmark when success=true', () => {
    const { getByLabelText, queryByText } = renderWithProviders(
      <Button label="Sign In" onPress={jest.fn()} success />,
    );

    // The label text is replaced by the checkmark node.
    expect(queryByText('Sign In')).toBeNull();
    expect(getByLabelText('Success')).toBeTruthy();
  });

  it('has accessibilityRole="button"', () => {
    const { getByRole } = renderWithProviders(
      <Button label="Create Account" onPress={jest.fn()} />,
    );

    expect(getByRole('button', { name: 'Create Account' })).toBeTruthy();
  });

  it('has accessibilityState.disabled=true when disabled=true', () => {
    const { getByRole } = renderWithProviders(
      <Button label="Submit" onPress={jest.fn()} disabled />,
    );

    const button = getByRole('button', { name: 'Submit' });
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
