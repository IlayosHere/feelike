import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EntryCard } from '@/components/timeline/EntryCard';
import { DayGroupHeader } from '@/components/timeline/DayGroupHeader';
import { useEntries } from '@/hooks/useEntries';
import type { Entry } from '@/types/api';

// ---------------------------------------------------------------------------
// Date grouping helpers
// ---------------------------------------------------------------------------

function toDateKey(isoString: string): string {
  return new Date(isoString).toDateString();
}

function getDayLabel(dateKey: string): string {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  return new Date(dateKey).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

type HeaderItem = { type: 'header'; key: string; label: string };
type EntryItem = { type: 'entry'; key: string; entry: Entry };
type ListItem = HeaderItem | EntryItem;

function buildListItems(entries: Entry[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDateKey: string | null = null;

  for (const entry of entries) {
    const dateKey = toDateKey(entry.created_at);

    if (dateKey !== lastDateKey) {
      lastDateKey = dateKey;
      items.push({
        type: 'header',
        key: `header-${dateKey}`,
        label: getDayLabel(dateKey),
      });
    }

    items.push({ type: 'entry', key: entry.id, entry });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <View className="bg-surface rounded-xl p-4 mb-3 mx-4">
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
        <View className="px-4">
          <EntryCard
            entry={item.entry}
            onPress={() => router.push(`/entry/${item.entry.id}`)}
          />
        </View>
      );
    },
    [router],
  );

  const ListFooter = isFetchingNextPage ? (
    <ActivityIndicator
      className="my-4"
      accessibilityLabel="Loading more entries"
    />
  ) : null;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TimelineHeader onBack={() => router.back()} />

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
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TimelineHeader({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center px-4 pt-2 pb-3">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="p-2 mr-2"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-text-secondary text-xl">{'←'}</Text>
      </Pressable>
      <Text className="text-title text-text-primary font-sans-bold">
        Timeline
      </Text>
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
        <Text className="text-accent text-body font-sans-medium">
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text
        className="text-5xl mb-4"
        accessibilityElementsHidden
      >
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
