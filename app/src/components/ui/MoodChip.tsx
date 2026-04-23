import React, { useEffect } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';

export type MoodChipProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

const SELECTED_SCALE = 1.12;
const DESELECTED_SCALE = 1.0;
const SELECTED_ROTATE_DEG = -4;
const DESELECTED_ROTATE_DEG = 0;
const ANIM_DURATION = 180;

export function MoodChip({ emoji, label, selected, onPress }: MoodChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(DESELECTED_SCALE);
  const rotateDeg = useSharedValue(DESELECTED_ROTATE_DEG);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (reduceMotion) return;
        scale.value = withTiming(
          selected ? SELECTED_SCALE : DESELECTED_SCALE,
          { duration: ANIM_DURATION },
        );
        rotateDeg.value = withTiming(
          selected ? SELECTED_ROTATE_DEG : DESELECTED_ROTATE_DEG,
          { duration: ANIM_DURATION },
        );
      })
      .catch(() => {
        // Fallback: no animation
      });
  }, [selected, scale, rotateDeg]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotateDeg.value}deg` },
    ],
  }));

  const shadowStyle = selected ? theme.shadowMd : undefined;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} mood`}
      accessibilityState={{ selected }}
    >
      <Animated.View
        style={[{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden' }, animatedStyle, shadowStyle]}
      >
        {selected ? (
          <LinearGradient
            colors={[theme.gradPrimaryStart, theme.gradPrimaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChipContent emoji={emoji} />
            <InsetRing />
            <CheckmarkDot />
          </LinearGradient>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surfaceSunken }}>
            <ChipContent emoji={emoji} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function ChipContent({ emoji }: { emoji: string }) {
  return (
    <Text style={{ fontSize: 24 }} accessibilityElementsHidden>
      {emoji}
    </Text>
  );
}

function InsetRing() {
  const { theme } = useTheme();
  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 14, borderWidth: 2, borderColor: theme.surface }}
      pointerEvents="none"
    />
  );
}

function CheckmarkDot() {
  const { theme } = useTheme();
  return (
    <View
      style={{ position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderRadius: 9999, backgroundColor: theme.accentHover, borderWidth: 2, borderColor: theme.surface }}
      pointerEvents="none"
    />
  );
}
