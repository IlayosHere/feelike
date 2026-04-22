import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

export type ToastType = 'error' | 'success';

export type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
};

const SLIDE_IN_DURATION = 220;
const SLIDE_OUT_DURATION = 180;
const HIDDEN_TRANSLATE = 80;

export function Toast({ message, type, visible }: ToastProps) {
  const translateY = useRef(new Animated.Value(HIDDEN_TRANSLATE)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: SLIDE_IN_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: SLIDE_IN_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: HIDDEN_TRANSLATE,
          duration: SLIDE_OUT_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: SLIDE_OUT_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const bgClass =
    type === 'error'
      ? 'bg-danger'
      : 'bg-success';

  return (
    <Animated.View
      style={{ transform: [{ translateY }], opacity }}
      className={`mx-4 mb-3 px-4 py-3 rounded-lg ${bgClass}`}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      pointerEvents="none"
    >
      <Text className="text-text-on-accent text-body font-sans-medium">
        {message}
      </Text>
    </Animated.View>
  );
}
