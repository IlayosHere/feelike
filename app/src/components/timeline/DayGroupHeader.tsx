import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type DayGroupHeaderProps = {
  label: string;
};

export function DayGroupHeader({ label }: DayGroupHeaderProps) {
  const { theme } = useTheme();
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.textSecondary,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 8,
    }}>
      {label}
    </Text>
  );
}
