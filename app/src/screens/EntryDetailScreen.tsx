import React, { useCallback, useEffect, useState } from 'react';
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
import { useSidePanel } from '@/context/SidePanelContext';
import { useTheme } from '@/theme/useTheme';
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
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={{ height: 12, backgroundColor: theme.surfaceSunken, borderRadius: 6, marginBottom: 16, width: '50%' }} />
      <View style={{ backgroundColor: theme.surfaceSunken, borderRadius: 12, padding: 16, minHeight: 120, marginBottom: 24 }}>
        <View style={{ height: 16, backgroundColor: theme.surface, borderRadius: 4, marginBottom: 8 }} />
        <View style={{ height: 16, backgroundColor: theme.surface, borderRadius: 4, marginBottom: 8, width: '80%' }} />
        <View style={{ height: 16, backgroundColor: theme.surface, borderRadius: 4, width: '60%' }} />
      </View>
      <View style={{ height: 12, backgroundColor: theme.surfaceSunken, borderRadius: 6, marginBottom: 12, width: 64 }} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <View key={n} style={{ width: 52, height: 52, backgroundColor: theme.surfaceSunken, borderRadius: 8 }} />
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
  const { theme } = useTheme();
  const { setDeleteAction } = useSidePanel();

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

  // Register delete action in sidebar; clear when leaving this screen
  useEffect(() => {
    setDeleteAction(handleDeletePress);
    return () => setDeleteAction(null);
  }, [handleDeletePress, setDeleteAction]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, ...(Platform.OS === 'web' ? { height: '100%' as any } : {}) }}>
      <DetailHeader onBack={() => router.back()} />

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !entry ? (
        <EntryNotFound onBack={() => router.back()} />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: theme.bg }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={{ flex: 1, backgroundColor: theme.bg }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
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

function DetailHeader({ onBack }: { onBack: () => void }) {
  const { open: openPanel } = useSidePanel();
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ padding: 8 }}
      >
        <Text style={{ fontSize: 20, color: theme.textSecondary }}>{'←'}</Text>
      </Pressable>
      <Pressable
        onPress={openPanel}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ padding: 8 }}
      >
        <Text style={{ fontSize: 20, color: theme.textSecondary }}>{'≡'}</Text>
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
