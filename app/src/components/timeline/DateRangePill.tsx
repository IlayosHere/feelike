import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { MonthScrollerSheet } from './MonthScrollerSheet';

type DateRange = { from: Date; to: Date };

export type DateRangePillProps = {
  range: DateRange | null;
  onChange: (range: DateRange | null) => void;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function DateRangePill({ range, onChange }: DateRangePillProps) {
  const { theme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const label = range
    ? `${formatDate(range.from)}  →  ${formatDate(range.to)}`
    : 'All time';

  const isActive = range !== null;

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={isActive ? `Date range: ${label}` : 'Select date range'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 9999,
            borderWidth: isActive ? 1.5 : 1,
            borderColor: isActive ? theme.accent : theme.border,
            backgroundColor: isActive ? theme.accentMuted : theme.surface,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13 }}>{'📅'}</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: isActive ? '600' : '400',
              color: isActive ? theme.accent : theme.textSecondary,
            }}
          >
            {label}
          </Text>
        </Pressable>

        {isActive && (
          <Pressable
            onPress={() => onChange(null)}
            accessibilityRole="button"
            accessibilityLabel="Clear date range"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: theme.surfaceSunken,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: theme.textMuted, lineHeight: 17 }}>
              {'×'}
            </Text>
          </Pressable>
        )}
      </View>

      <MonthScrollerSheet
        visible={sheetOpen}
        initialRange={range}
        onConfirm={(newRange) => {
          onChange(newRange);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
