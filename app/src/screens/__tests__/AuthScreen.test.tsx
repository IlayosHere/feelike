/**
 * AuthScreen — behavior tests.
 *
 * Strategy: mock the two auth hooks (useLogin / useSignup) at the module level
 * so network never touches the test. The forms themselves (validation, tab
 * switching) are exercised against the real SignInForm / SignUpForm components.
 */

import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { AuthScreen } from '@/screens/AuthScreen';
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
// Auth hook mocks — replaced per test where needed via mockReturnValue.
// ---------------------------------------------------------------------------

const mockLoginMutate = jest.fn();
const mockSignupMutate = jest.fn();

// Default stub: idle state for both mutations.
const makeLoginStub = (overrides = {}) => ({
  mutate: mockLoginMutate,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  reset: jest.fn(),
  ...overrides,
});

const makeSignupStub = (overrides = {}) => ({
  mutate: mockSignupMutate,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  reset: jest.fn(),
  ...overrides,
});

jest.mock('@/hooks/useLogin', () => ({
  useLogin: () => makeLoginStub(),
}));

jest.mock('@/hooks/useSignup', () => ({
  useSignup: () => makeSignupStub(),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Sign In form by default (email and password inputs visible)', async () => {
    const { getByLabelText } = renderWithProviders(<AuthScreen />);

    await act(async () => {});

    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
  });

  it('switching to Sign Up tab renders the sign-up form (password strength bar visible after typing)', async () => {
    const { getByLabelText } = renderWithProviders(<AuthScreen />);

    await act(async () => {});

    // Press the Sign Up tab by its accessibilityLabel
    await act(async () => {
      fireEvent.press(getByLabelText('Sign Up'));
    });

    // Type into the password field to trigger the strength bar
    const passwordInput = getByLabelText('Password');
    await act(async () => {
      fireEvent.changeText(passwordInput, 'test123');
    });

    // PasswordStrengthBar renders with accessibilityLabel "Weak password" / "Fair password" / "Strong password"
    expect(getByLabelText('Weak password')).toBeTruthy();
  });

  it('Sign In button is present and pressable when fields are empty (validation fires on submit, not on field state)', async () => {
    const { getByRole } = renderWithProviders(<AuthScreen />);

    await act(async () => {});

    // AuthForms.tsx passes disabled={isLoading} — not field-gated.
    // The button is always pressable; Zod validation fires on press.
    const button = getByRole('button', { name: 'Sign In' });
    expect(button.props.accessibilityState?.disabled).not.toBe(true);
  });

  it('Sign In button is enabled (not disabled) when both email and password are filled', async () => {
    const { getByRole, getByLabelText } = renderWithProviders(<AuthScreen />);

    await act(async () => {});

    await act(async () => {
      fireEvent.changeText(getByLabelText('Email'), 'user@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'secret123');
    });

    const button = getByRole('button', { name: 'Sign In' });
    expect(button.props.accessibilityState?.disabled).not.toBe(true);
  });

  it('shows inline email validation error when an invalid email is submitted', async () => {
    const { getByRole, getByLabelText, findByText } = renderWithProviders(
      <AuthScreen />,
    );

    await act(async () => {});

    await act(async () => {
      fireEvent.changeText(getByLabelText('Email'), 'not-an-email');
      fireEvent.changeText(getByLabelText('Password'), 'password123');
    });

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Sign In' }));
    });

    const errorText = await findByText('Enter a valid email address');
    expect(errorText).toBeTruthy();
  });

  it('shows inline password error when password is empty on submit', async () => {
    const { getByRole, getByLabelText, findByText } = renderWithProviders(
      <AuthScreen />,
    );

    await act(async () => {});

    await act(async () => {
      fireEvent.changeText(getByLabelText('Email'), 'user@example.com');
      // Password intentionally left empty.
    });

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Sign In' }));
    });

    const errorText = await findByText('Password is required');
    expect(errorText).toBeTruthy();
  });

  it('calls the login mutate when valid email+password submitted', async () => {
    const { getByRole, getByLabelText } = renderWithProviders(<AuthScreen />);

    await act(async () => {});

    await act(async () => {
      fireEvent.changeText(getByLabelText('Email'), 'user@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'mypassword');
    });

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Sign In' }));
    });

    expect(mockLoginMutate).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'mypassword',
    });
  });
});
