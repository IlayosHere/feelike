import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type TagChipProps = {
  label: string;
  colorIndex: number;
  onRemove?: () => void;
};

type TagColor = {
  bg: string;
  ink: string;
};

export function TagChip({ label, colorIndex, onRemove }: TagChipProps) {
  const { theme } = useTheme();

  const COLORS: TagColor[] = [
    { bg: theme.tagPinkBg,   ink: theme.tagPinkInk },
    { bg: theme.tagBlueBg,   ink: theme.tagBlueInk },
    { bg: theme.tagGreenBg,  ink: theme.tagGreenInk },
    { bg: theme.tagPurpleBg, ink: theme.tagPurpleInk },
  ];

  const { bg, ink } = COLORS[colorIndex % COLORS.length];

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100, backgroundColor: bg }}
      accessibilityRole="text"
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color: ink }}>{label}</Text>
      {onRemove !== undefined ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove tag ${label}`}
          style={{ marginLeft: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: ink }}>{'×'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
