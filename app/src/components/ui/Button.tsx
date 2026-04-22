/**
 * NOTE for main agent: add `expo-linear-gradient: ~13.0.0` to app/package.json dependencies.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
// expo-linear-gradient must be installed: expo install expo-linear-gradient
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';

export type ButtonVariant = 'primary' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
};

export function Button({
  label,
  onPress,
  loading = false,
  success = false,
  disabled = false,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const inner = (() => {
    if (loading) {
      return <ActivityIndicator color={theme.textOnAccent} />;
    }
    if (success) {
      return (
        <Text
          className="text-white text-base font-semibold"
          accessibilityLabel="Success"
        >
          {'✓'}
        </Text>
      );
    }
    return (
      <Text
        className={
          variant === 'primary'
            ? 'text-white text-base font-semibold'
            : 'text-accent text-base font-semibold'
        }
      >
        {label}
      </Text>
    );
  })();

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
        className={`h-[52px] w-full rounded-lg items-center justify-center ${isDisabled ? 'opacity-50' : ''} ${className}`}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      className={`h-[52px] w-full rounded-lg overflow-hidden ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      <LinearGradient
        colors={[theme.gradPrimaryStart, theme.gradPrimaryEnd]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View className="items-center justify-center">{inner}</View>
      </LinearGradient>
    </Pressable>
  );
}
