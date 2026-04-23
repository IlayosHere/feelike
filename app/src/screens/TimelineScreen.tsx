import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { EntryCard } from '@/components/timeline/EntryCard';
import { DayGroupHeader } from '@/components/timeline/DayGroupHeader';
import { useEntries } from '@/hooks/useEntries';
import { useTheme } from '@/theme/useTheme';
import { GradientText } from '@/components/ui/GradientText';
import { useSidePanel } from '@/context/SidePanelContext';
import { buildListItems, type ListItem } from '@/utils/dateGrouping';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <View className="bg-surface rounded-xl p-4 mb-3 mx-6">
      <View className="h-4 bg-surface-sunken rounded mb-2 w-full" />
      <View className="h-4 bg-surface-sunken rounded mb-2 w-5/6" />
      <View className="h-3 bg-surface-sunken rounded w-1/3 mt-2" />
    </View>
  );
}

function SkeletonList() {
  return (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function TimelineScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useEntries();

  const allEntries = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const listItems = useMemo(() => buildListItems(allEntries), [allEntries]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') {
        return <DayGroupHeader label={item.label} />;
      }
      return (
        <EntryCard
          entry={item.entry}
          onPress={() => router.push(`/entry/${item.entry.id}`)}
        />
      );
    },
    [router],
  );

  const ListFooter = isFetchingNextPage ? (
    <ActivityIndicator className="my-4" accessibilityLabel="Loading more entries" />
  ) : null;

  const webFullHeight = Platform.OS === 'web' ? { height: '100%' as const } : undefined;

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.bg }, webFullHeight]}>
      <TimelineHeader onBack={() => router.back()} onNewEntry={() => router.back()} />

      {isLoading ? (
        <View className="flex-1">
          <SkeletonList />
        </View>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : allEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={ListFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => void refetch()}
              accessibilityLabel="Refresh entries"
            />
          }
          contentContainerStyle={{ paddingBottom: 96 }}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <NewEntryFab onPress={() => router.back()} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TimelineHeader({
  onBack,
  onNewEntry,
}: {
  onBack: () => void;
  onNewEntry: () => void;
}) {
  const { theme } = useTheme();
  const { open: openPanel } = useSidePanel();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={openPanel}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: theme.surfaceSunken, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 18, color: theme.textPrimary }}>{'≡'}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: theme.textPrimary }}>
            {'Your '}
          </Text>
          <GradientText
            from={theme.gradBrandStart}
            to={theme.gradBrandEnd}
            style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}
          >
            journey
          </GradientText>
        </View>
      </View>
      <Pressable
        onPress={onNewEntry}
        accessibilityRole="button"
        accessibilityLabel="New entry"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: theme.surfaceSunken, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 20, color: theme.textPrimary, fontWeight: '700' }}>{'+'}</Text>
      </Pressable>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-text-primary text-body mb-4 text-center">
        Something went wrong loading your entries.
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        className="bg-surface rounded-lg px-6 py-3"
      >
        <Text className="text-accent text-body font-sans-medium">Try again</Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4" accessibilityElementsHidden>
        {'📔'}
      </Text>
      <Text className="text-text-primary text-body font-sans-medium mb-2 text-center">
        No entries yet.
      </Text>
      <Text className="text-text-secondary text-body text-center">
        Tap + to write your first.
      </Text>
    </View>
  );
}

function NewEntryFab({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="New entry"
      style={{
        position: 'absolute',
        bottom: 28,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={[theme.gradPrimaryStart, theme.gradPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FF5D73',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 28, lineHeight: 32, fontWeight: '300' }}>
          {'+'}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
