/**
 * MoodChip component — behavior tests.
 *
 * MoodChip needs ThemeProvider (calls useTheme) and expo-linear-gradient.
 * Reanimated is auto-mocked by jest-expo preset.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { MoodChip } from '@/components/ui/MoodChip';
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
// Factory
// ---------------------------------------------------------------------------

function renderChip(overrides: Partial<React.ComponentProps<typeof MoodChip>> = {}) {
  const props = {
    emoji: '😊',
    label: 'Happy',
    selected: false,
    onPress: jest.fn(),
    ...overrides,
  };
  return { ...renderWithProviders(<MoodChip {...props} />), onPress: props.onPress };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MoodChip', () => {
  it('renders the chip with correct accessibility label', () => {
    const { getByRole } = renderChip({ emoji: '😔', label: 'Sad' });

    // Emoji text has accessibilityElementsHidden — query the chip by its label.
    expect(getByRole('button', { name: 'Sad mood' })).toBeTruthy();
  });

  it('has accessibilityRole="button"', () => {
    const { getByRole } = renderChip();

    expect(getByRole('button', { name: 'Happy mood' })).toBeTruthy();
  });

  it('accessibilityState.selected is false when not selected', () => {
    const { getByRole } = renderChip({ selected: false });

    const chip = getByRole('button', { name: 'Happy mood' });
    expect(chip.props.accessibilityState?.selected).toBe(false);
  });

  it('accessibilityState.selected is true when selected=true', () => {
    const { getByRole } = renderChip({ selected: true });

    const chip = getByRole('button', { name: 'Happy mood' });
    expect(chip.props.accessibilityState?.selected).toBe(true);
  });

  it('calls onPress when tapped', () => {
    const { getByRole, onPress } = renderChip();

    fireEvent.press(getByRole('button', { name: 'Happy mood' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
