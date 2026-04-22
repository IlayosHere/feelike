import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type TagChipProps = {
  label: string;
  colorIndex: number;
  onRemove?: () => void;
};

type TagColor = {
  bg: string;
  ink: string;
};

const TAG_COLORS: TagColor[] = [
  { bg: 'bg-tag-pink-bg', ink: 'text-tag-pink-ink' },
  { bg: 'bg-tag-blue-bg', ink: 'text-tag-blue-ink' },
  { bg: 'bg-tag-green-bg', ink: 'text-tag-green-ink' },
  { bg: 'bg-tag-purple-bg', ink: 'text-tag-purple-ink' },
];

export function TagChip({ label, colorIndex, onRemove }: TagChipProps) {
  const { bg, ink } = TAG_COLORS[colorIndex % TAG_COLORS.length];

  return (
    <View
      className={`flex-row items-center rounded-full px-3 py-1 mr-2 mb-2 ${bg}`}
      accessibilityRole="text"
    >
      <Text className={`text-body font-sans-medium ${ink}`}>{label}</Text>
      {onRemove !== undefined ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove tag ${label}`}
          className="ml-1.5"
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
          <Text className={`text-body ${ink}`}>{'×'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
