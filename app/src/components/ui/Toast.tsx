import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  const translateY = useSharedValue(HIDDEN_TRANSLATE);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: SLIDE_IN_DURATION });
      opacity.value = withTiming(1, { duration: SLIDE_IN_DURATION });
    } else {
      translateY.value = withTiming(HIDDEN_TRANSLATE, { duration: SLIDE_OUT_DURATION });
      opacity.value = withTiming(0, { duration: SLIDE_OUT_DURATION });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const bgClass =
    type === 'error'
      ? 'bg-danger'
      : 'bg-success';

  return (
    <Animated.View
      style={animStyle}
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
