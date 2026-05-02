import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DateRange = { from: Date; to: Date };

export type MonthScrollerSheetProps = {
  visible: boolean;
  initialRange: DateRange | null;
  onConfirm: (range: DateRange | null) => void;
  onClose: () => void;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(d: Date, start: Date, end: Date): boolean {
  const ts = d.getTime();
  return ts > start.getTime() && ts < end.getTime();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });
}

function monthsAround(centerDate: Date, range: number): Array<{ year: number; month: number }> {
  const result: Array<{ year: number; month: number }> = [];
  const center = { year: centerDate.getFullYear(), month: centerDate.getMonth() };
  for (let i = -range; i <= range; i++) {
    let month = center.month + i;
    let year = center.year;
    while (month < 0) { month += 12; year -= 1; }
    while (month > 11) { month -= 12; year += 1; }
    result.push({ year, month });
  }
  return result;
}

// ---------------------------------------------------------------------------
// MonthGrid
// ---------------------------------------------------------------------------

type SelectionState = 'start' | 'end' | 'between' | 'none';

function getDaySelection(
  date: Date,
  startDate: Date | null,
  endDate: Date | null,
): SelectionState {
  if (!startDate) return 'none';
  if (isSameDay(date, startDate)) return 'start';
  if (endDate && isSameDay(date, endDate)) return 'end';
  if (endDate && isBetween(date, startDate, endDate)) return 'between';
  return 'none';
}

type MonthGridProps = {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  onDayPress: (date: Date) => void;
};

function MonthGrid({ year, month, startDate, endDate, onDayPress }: MonthGridProps) {
  const { theme } = useTheme();
  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfWeek(year, month);

  const cells: Array<{ day: number | null; date: Date | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, date: null });
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, date: new Date(year, month, d) });
  }

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: theme.textPrimary,
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        {formatMonthYear(year, month)}
      </Text>

      {/* Day-of-week header */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 }}>
        {DAYS_OF_WEEK.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textMuted }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
        {cells.map((cell, idx) => {
          if (!cell.day || !cell.date) {
            return <View key={`empty-${idx}`} style={{ width: '14.28%', height: 40 }} />;
          }

          const sel = getDaySelection(cell.date, startDate, endDate);
          const isSelected = sel === 'start' || sel === 'end';
          const isInRange = sel === 'between';

          return (
            <Pressable
              key={cell.day}
              onPress={() => onDayPress(cell.date!)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${cell.date.toLocaleDateString()}`}
              style={{
                width: '14.28%',
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isInRange ? theme.accentSubtle : 'transparent',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? theme.gradPrimaryStart : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? '700' : '400',
                    color: isSelected ? theme.textOnAccent : theme.textPrimary,
                  }}
                >
                  {cell.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MonthScrollerSheet
// ---------------------------------------------------------------------------

export function MonthScrollerSheet({
  visible,
  initialRange,
  onConfirm,
  onClose,
}: MonthScrollerSheetProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(600)).current;

  const [startDate, setStartDate] = useState<Date | null>(initialRange?.from ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initialRange?.to ?? null);
  const [tapCount, setTapCount] = useState<0 | 1 | 2>(
    initialRange ? 2 : 0,
  );

  const months = monthsAround(new Date(), 12);

  useEffect(() => {
    if (visible) {
      setStartDate(initialRange?.from ?? null);
      setEndDate(initialRange?.to ?? null);
      setTapCount(initialRange ? 2 : 0);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible, initialRange, slideAnim]);

  const handleDayPress = useCallback((date: Date) => {
    if (tapCount === 0) {
      setStartDate(date);
      setEndDate(null);
      setTapCount(1);
    } else if (tapCount === 1) {
      if (startDate && date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setTapCount(2);
    } else {
      setStartDate(date);
      setEndDate(null);
      setTapCount(1);
    }
  }, [tapCount, startDate]);

  const handleConfirm = () => {
    if (startDate && endDate) {
      onConfirm({ from: startDate, to: endDate });
    } else if (startDate) {
      onConfirm({ from: startDate, to: startDate });
    } else {
      onConfirm(null);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop — tapping outside closes the sheet */}
      <View style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
          accessibilityLabel="Close date picker"
        />

        {/* Sheet — does not propagate taps to backdrop */}
        <Animated.View
          style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Handle + header */}
          <View
            style={{
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.border,
                marginBottom: 12,
              }}
            />
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
              Select date range
            </Text>
            {(startDate || endDate) && (
              <Text
                style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}
              >
                {startDate
                  ? startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : '—'}
                {' → '}
                {endDate
                  ? endDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : '...'}
              </Text>
            )}
          </View>

          {/* Month scroll — flex: 1 so it fills available space up to maxHeight */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {months.map(({ year, month }) => (
              <MonthGrid
                key={`${year}-${month}`}
                year={year}
                month={month}
                startDate={startDate}
                endDate={endDate}
                onDayPress={handleDayPress}
              />
            ))}
          </ScrollView>

          {/* Done button */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 32,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            <Pressable
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirm date range"
              style={{
                backgroundColor: theme.gradPrimaryStart,
                borderRadius: 14,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textOnAccent }}>
                Done
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
