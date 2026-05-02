import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  View,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type InputProps = {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: KeyboardTypeOptions;
};

const SHAKE_AMPLITUDE = 4;
const SHAKE_DURATION = 50; // ms per half-oscillation

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  showToggle = false,
  autoFocus = false,
  returnKeyType,
  onSubmitEditing,
  textContentType,
  autoComplete,
  keyboardType,
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);
  const translateX = useSharedValue(0);
  const prevErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (error && !prevErrorRef.current) {
      // New error arrived — trigger shake unless reduce motion is on
      AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
        if (!reduceMotion) {
          translateX.value = withSequence(
            withTiming(SHAKE_AMPLITUDE, { duration: SHAKE_DURATION }),
            withTiming(-SHAKE_AMPLITUDE, { duration: SHAKE_DURATION }),
            withTiming(SHAKE_AMPLITUDE, { duration: SHAKE_DURATION }),
            withTiming(-SHAKE_AMPLITUDE, { duration: SHAKE_DURATION }),
            withTiming(SHAKE_AMPLITUDE, { duration: SHAKE_DURATION }),
            withTiming(-SHAKE_AMPLITUDE, { duration: SHAKE_DURATION }),
            withTiming(0, { duration: SHAKE_DURATION }),
          );
        }
      }).catch(() => {
        // Fallback: just show error without animation
      });
    }
    prevErrorRef.current = error;
  }, [error, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const borderClass = error
    ? 'border-danger'
    : isFocused
    ? 'border-accent'
    : 'border-border';

  return (
    <View className="w-full mb-4">
      {label ? (
        <Text className="text-text-secondary text-sm mb-1 font-medium">
          {label}
        </Text>
      ) : null}

      <Animated.View
        style={animatedStyle}
        className={`flex-row items-center bg-surface-sunken rounded-lg border ${borderClass} px-3`}
      >
        <TextInput
          className="flex-1 h-12 text-text-primary text-base"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={hidden}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          textContentType={textContentType}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label ?? placeholder}
        />
        {showToggle && secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            className="p-1 ml-1"
          >
            <Text className="text-text-muted text-base">
              {hidden ? '👁' : '🙈'}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>

      {error ? (
        <Text
          className="text-danger text-xs mt-1"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
