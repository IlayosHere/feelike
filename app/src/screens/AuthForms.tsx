/**
 * Form sub-components for AuthScreen.
 * Kept separate to stay under the 300-line file limit.
 */

import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const emailSchema = z.string().email('Enter a valid email address');
const signInPasswordSchema = z.string().min(1, 'Password is required');
const signUpPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------

function passwordStrength(pw: string): 'weak' | 'fair' | 'strong' {
  if (pw.length < 8) return 'weak';
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  if (pw.length >= 12 && hasNumber && hasSpecial) return 'strong';
  return 'fair';
}

type StrengthBarProps = { password: string };

export function PasswordStrengthBar({ password }: StrengthBarProps) {
  if (!password) return null;
  const level = passwordStrength(password);
  const widthClass =
    level === 'strong' ? 'w-full' : level === 'fair' ? 'w-2/3' : 'w-1/3';
  const colorClass =
    level === 'strong'
      ? 'bg-success'
      : level === 'fair'
      ? 'bg-warning'
      : 'bg-danger';
  const label =
    level === 'strong'
      ? 'Strong password'
      : level === 'fair'
      ? 'Fair password'
      : 'Weak password';

  return (
    <View
      className="h-1 bg-border rounded-full mb-2 overflow-hidden"
      accessibilityLabel={label}
      accessibilityRole="progressbar"
    >
      <View className={`h-full ${widthClass} ${colorClass} rounded-full`} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sign In form
// ---------------------------------------------------------------------------

type SignInFormProps = {
  onSuccess: () => void;
  mutate: (input: { email: string; password: string }) => void;
  isLoading: boolean;
  isSuccess: boolean;
  serverError?: string;
};

export function SignInForm({
  onSuccess: _onSuccess,
  mutate,
  isLoading,
  isSuccess,
  serverError,
}: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleSubmit = useCallback(() => {
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = signInPasswordSchema.safeParse(password);

    setEmailError(
      emailResult.success ? undefined : emailResult.error.issues[0]?.message,
    );
    setPasswordError(
      passwordResult.success
        ? undefined
        : passwordResult.error.issues[0]?.message,
    );

    if (!emailResult.success || !passwordResult.success) return;
    mutate({ email, password });
  }, [email, password, mutate]);

  return (
    <View>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        error={emailError}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoFocus
        returnKeyType="next"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        error={passwordError}
        secureTextEntry
        showToggle
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Text className="text-text-muted text-xs text-right -mt-2 mb-4">
        Forgot password?
      </Text>
      <Button
        label="Sign In"
        onPress={handleSubmit}
        loading={isLoading}
        success={isSuccess}
        disabled={isLoading}
      />
      {serverError ? (
        <Text
          className="text-danger text-xs mt-2 text-center"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {serverError}
        </Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sign Up form
// ---------------------------------------------------------------------------

type SignUpFormProps = {
  onSuccess: () => void;
  mutate: (input: { email: string; password: string }) => void;
  isLoading: boolean;
  isSuccess: boolean;
  serverError?: string;
};

export function SignUpForm({
  onSuccess: _onSuccess,
  mutate,
  isLoading,
  isSuccess,
  serverError,
}: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleSubmit = useCallback(() => {
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = signUpPasswordSchema.safeParse(password);

    setEmailError(
      emailResult.success ? undefined : emailResult.error.issues[0]?.message,
    );
    setPasswordError(
      passwordResult.success
        ? undefined
        : passwordResult.error.issues[0]?.message,
    );

    if (!emailResult.success || !passwordResult.success) return;
    mutate({ email, password });
  }, [email, password, mutate]);

  return (
    <View>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        error={emailError}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoFocus
        returnKeyType="next"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a password"
        error={passwordError}
        secureTextEntry
        showToggle
        textContentType="newPassword"
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <PasswordStrengthBar password={password} />
      <Button
        label="Create Account"
        onPress={handleSubmit}
        loading={isLoading}
        success={isSuccess}
        disabled={isLoading}
      />
      {serverError ? (
        <Text
          className="text-danger text-xs mt-2 text-center"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {serverError}
        </Text>
      ) : null}
    </View>
  );
}
