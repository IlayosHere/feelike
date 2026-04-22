/**
 * CaptureScreen — behavior tests.
 *
 * The Zustand captureStore runs for real (it's pure JS — no native modules).
 * We reset it between tests so state doesn't bleed across.
 *
 * useCreateEntry and useTags are mocked at the module level — they hit the
 * network in production but that's a true boundary for these unit tests.
 */

import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { CaptureScreen } from '@/screens/CaptureScreen';
import { useCaptureStore } from '@/stores/captureStore';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.useAnimatedStyle = (fn: () => object) => fn();
  return Reanimated;
});

// ---------------------------------------------------------------------------
// Hook mocks
// ---------------------------------------------------------------------------

const mockCreateMutate = jest.fn();

jest.mock('@/hooks/useCreateEntry', () => ({
  useCreateEntry: () => ({
    mutate: mockCreateMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useTags', () => ({
  useTags: () => ({ data: [] }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CaptureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Zustand store so each test starts with empty content/mood/tags.
    useCaptureStore.getState().reset();
  });

  it('renders the text input', async () => {
    const { getByLabelText } = renderWithProviders(<CaptureScreen />);

    await act(async () => {});

    expect(getByLabelText('Journal entry')).toBeTruthy();
  });

  it('Save button is disabled when text input is empty', async () => {
    const { getByRole } = renderWithProviders(<CaptureScreen />);

    await act(async () => {});

    const saveButton = getByRole('button', { name: 'Save' });
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('Save button is enabled after typing content', async () => {
    const { getByRole, getByLabelText } = renderWithProviders(<CaptureScreen />);

    await act(async () => {});

    await act(async () => {
      fireEvent.changeText(getByLabelText('Journal entry'), 'Today was a good day.');
    });

    const saveButton = getByRole('button', { name: 'Save' });
    expect(saveButton.props.accessibilityState?.disabled).not.toBe(true);
  });

  it('pressing a mood chip selects it (accessibilityState.selected becomes true)', async () => {
    const { getByRole } = renderWithProviders(<CaptureScreen />);

    await act(async () => {});

    const happyChip = getByRole('button', { name: 'Happy mood' });
    expect(happyChip.props.accessibilityState?.selected).toBe(false);

    await act(async () => {
      fireEvent.press(happyChip);
    });

    expect(getByRole('button', { name: 'Happy mood' }).props.accessibilityState?.selected).toBe(true);
  });

  it('pressing the same mood chip again deselects it', async () => {
    const { getByRole } = renderWithProviders(<CaptureScreen />);

    await act(async () => {});

    const happyChip = getByRole('button', { name: 'Happy mood' });

    // Select
    await act(async () => {
      fireEvent.press(happyChip);
    });
    expect(getByRole('button', { name: 'Happy mood' }).props.accessibilityState?.selected).toBe(true);

    // Deselect
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Happy mood' }));
    });
    expect(getByRole('button', { name: 'Happy mood' }).props.accessibilityState?.selected).toBe(false);
  });

  it('typing a tag name and pressing Enter (submitEditing) adds it as a chip', async () => {
    const { getByLabelText, findByLabelText } = renderWithProviders(
      <CaptureScreen />,
    );

    await act(async () => {});

    const tagInput = getByLabelText('Add tag');

    await act(async () => {
      fireEvent.changeText(tagInput, 'gratitude');
    });

    await act(async () => {
      fireEvent(tagInput, 'submitEditing');
    });

    // TagChip renders with an accessible remove button labelled "Remove tag <name>".
    // After addTag the chip should appear in the rendered tag list.
    const removeButton = await findByLabelText('Remove tag gratitude');
    expect(removeButton).toBeTruthy();
  });
});
