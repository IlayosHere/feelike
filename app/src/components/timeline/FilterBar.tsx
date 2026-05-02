import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';
import type { TimelineFilter } from '@/hooks/useTimelineFilter';
import { FilterTagChip } from './FilterTagChip';
import { DateRangePill } from './DateRangePill';

const EXPANDED_HEIGHT = 112;

export type FilterBarProps = {
  expanded: boolean;
  filter: TimelineFilter;
  allTags: string[];
};

export function FilterBar({ expanded, filter, allTags }: FilterBarProps) {
  const { theme } = useTheme();
  const heightAnim = useRef(new Animated.Value(expanded ? EXPANDED_HEIGHT : 0)).current;
  const opacityAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: expanded ? EXPANDED_HEIGHT : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: expanded ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [expanded, heightAnim, opacityAnim]);

  const sortedTags = [...allTags].sort((a, b) => {
    const aActive = filter.activeTags.includes(a);
    const bActive = filter.activeTags.includes(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.localeCompare(b);
  });

  return (
    <Animated.View
      style={{
        height: heightAnim,
        opacity: opacityAnim,
        backgroundColor: theme.surfaceSunken,
        overflow: 'hidden',
      }}
    >
      {/* Date row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 8,
        }}
      >
        <DateRangePill range={filter.dateRange} onChange={filter.setDateRange} />

        {filter.isActive && (
          <Pressable
            onPress={filter.clearAll}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>
              Clear all
            </Text>
          </Pressable>
        )}
      </View>

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 24 }}
      />

      {/* Tag row */}
      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            gap: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          {sortedTags.length === 0 ? (
            <Text style={{ fontSize: 13, color: theme.textMuted }}>
              No tags yet
            </Text>
          ) : (
            sortedTags.map((tag) => (
              <FilterTagChip
                key={tag}
                label={`#${tag}`}
                active={filter.activeTags.includes(tag)}
                onPress={() => filter.toggleTag(tag)}
              />
            ))
          )}
        </ScrollView>

        {/* Trailing fade gradient */}
        <LinearGradient
          colors={[`${theme.surfaceSunken}00`, theme.surfaceSunken]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 24,
            pointerEvents: 'none',
          }}
        />
      </View>
    </Animated.View>
  );
}
