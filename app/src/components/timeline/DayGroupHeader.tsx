import React from 'react';
import { Text } from 'react-native';

export type DayGroupHeaderProps = {
  label: string;
};

export function DayGroupHeader({ label }: DayGroupHeaderProps) {
  return (
    <Text className="text-text-secondary text-caption uppercase tracking-widest mb-2 mt-4 px-4">
      {label}
    </Text>
  );
}
