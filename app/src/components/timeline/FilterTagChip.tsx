import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type FilterTagChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function FilterTagChip({ label, active, onPress }: FilterTagChipProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${active ? 'Remove' : 'Add'} filter tag ${label}`}
      accessibilityState={{ selected: active }}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 9999,
        backgroundColor: active ? theme.accentMuted : theme.accentSubtle,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? theme.accent : theme.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: active ? '600' : '400',
          color: active ? theme.accent : theme.textSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
