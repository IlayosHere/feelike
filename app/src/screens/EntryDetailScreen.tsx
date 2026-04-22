import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EntryForm } from '@/components/entry/EntryForm';
import { useEntry } from '@/hooks/useEntry';
import { usePatchEntry } from '@/hooks/usePatchEntry';
import { useDeleteEntry } from '@/hooks/useDeleteEntry';
import type { Entry } from '@/types/api';
import type { MoodValue } from '@/types/api';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timePart = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <View className="flex-1 px-4 pt-4">
      <View className="h-3 bg-surface-sunken rounded mb-4 w-1/2" />
      <View className="bg-surface-sunken rounded-xl p-4 min-h-[120px] mb-6">
        <View className="h-4 bg-surface rounded mb-2 w-full" />
        <View className="h-4 bg-surface rounded mb-2 w-4/5" />
        <View className="h-4 bg-surface rounded w-3/5" />
      </View>
      <View className="h-3 bg-surface-sunken rounded mb-3 w-16" />
      <View className="flex-row gap-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <View
            key={n}
            className="w-[52px] h-[52px] bg-surface-sunken rounded-lg"
          />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Editable entry body — only rendered once entry is loaded
// ---------------------------------------------------------------------------

type EntryBodyProps = {
  entry: Entry;
};

function EntryBody({ entry }: EntryBodyProps) {
  const patchEntry = usePatchEntry();

  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState<MoodValue | null>(entry.mood);
  const [tags, setTags] = useState<string[]>(entry.tags);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasChanges =
    content !== entry.content ||
    mood !== entry.mood ||
    JSON.stringify(tags) !== JSON.stringify(entry.tags);

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    setSaveError(null);

    patchEntry.mutate(
      { id: entry.id, content, mood, tags },
      {
        onError: (err) => {
          setSaveError(
            err instanceof Error ? err.message : 'Could not save. Try again.',
          );
        },
      },
    );
  }, [hasChanges, entry.id, content, mood, tags, patchEntry]);

  const handleMoodPress = (value: MoodValue) => {
    setMood((prev) => (prev === value ? null : value));
  };

  const handleAddTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <>
      <TimestampRow
        createdAt={entry.created_at}
        updatedAt={entry.updated_at}
      />
      <EntryForm
        content={content}
        mood={mood}
        tags={tags}
        hasChanges={hasChanges}
        isSaving={patchEntry.isPending}
        saveError={saveError}
        onContentChange={setContent}
        onMoodPress={handleMoodPress}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onSave={handleSave}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError } = useEntry(id ?? '');
  const deleteEntry = useDeleteEntry();

  const handleDeletePress = useCallback(() => {
    if (!entry) return;

    Alert.alert('Delete Entry', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry.mutate(entry.id, {
            onSuccess: () => router.back(),
          });
        },
      },
    ]);
  }, [entry, deleteEntry, router]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <DetailHeader
        onBack={() => router.back()}
        onDelete={handleDeletePress}
        isDeleting={deleteEntry.isPending}
      />

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !entry ? (
        <EntryNotFound onBack={() => router.back()} />
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1 px-4"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <EntryBody entry={entry} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type DetailHeaderProps = {
  onBack: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

function DetailHeader({ onBack, onDelete, isDeleting }: DetailHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="p-2"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-text-secondary text-xl">{'←'}</Text>
      </Pressable>

      <Pressable
        onPress={onDelete}
        disabled={isDeleting}
        accessibilityRole="button"
        accessibilityLabel="Delete entry"
        className={`p-2 ${isDeleting ? 'opacity-40' : ''}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-danger text-body">Delete</Text>
      </Pressable>
    </View>
  );
}

function TimestampRow({
  createdAt,
  updatedAt,
}: {
  createdAt: string;
  updatedAt: string;
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-muted text-caption">
        {'Created ' + formatDateTime(createdAt)}
      </Text>
      {createdAt !== updatedAt ? (
        <Text className="text-text-muted text-caption">
          {'Edited ' + formatDateTime(updatedAt)}
        </Text>
      ) : null}
    </View>
  );
}

function EntryNotFound({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-text-primary text-body mb-4 text-center">
        Entry not found.
      </Text>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="bg-surface rounded-lg px-6 py-3"
      >
        <Text className="text-accent text-body font-sans-medium">Go back</Text>
      </Pressable>
    </View>
  );
}
