import React from 'react';
import {
  Text,
  TextInput,
  View,
} from 'react-native';
import { MoodChip } from '@/components/ui/MoodChip';
import { Button } from '@/components/ui/Button';
import { EntryTagEditor } from '@/components/entry/EntryTagEditor';
import type { MoodValue } from '@/types/api';

type MoodDefinition = { value: MoodValue; emoji: string; label: string };

export const MOODS: MoodDefinition[] = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🔥', label: 'Excited' },
  { value: 'sad', emoji: '😔', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry', emoji: '😤', label: 'Angry' },
  { value: 'calm', emoji: '🧘', label: 'Calm' },
];

export type EntryFormProps = {
  content: string;
  mood: MoodValue | null;
  tags: string[];
  hasChanges: boolean;
  isSaving: boolean;
  saveError: string | null;
  onContentChange: (v: string) => void;
  onMoodPress: (v: MoodValue) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSave: () => void;
};

export function EntryForm({
  content,
  mood,
  tags,
  hasChanges,
  isSaving,
  saveError,
  onContentChange,
  onMoodPress,
  onAddTag,
  onRemoveTag,
  onSave,
}: EntryFormProps) {
  return (
    <>
      <TextInput
        value={content}
        onChangeText={onContentChange}
        multiline
        textAlignVertical="top"
        className="bg-surface-sunken rounded-xl p-4 min-h-[120px] text-text-primary text-body mb-6"
        accessibilityLabel="Entry content"
      />

      <SectionLabel label="Mood" />
      <View className="flex-row flex-wrap gap-3 mb-6">
        {MOODS.map((m) => (
          <MoodChip
            key={m.value}
            emoji={m.emoji}
            label={m.label}
            selected={mood === m.value}
            onPress={() => onMoodPress(m.value)}
          />
        ))}
      </View>

      <SectionLabel label="Tags" />
      <EntryTagEditor
        tags={tags}
        onAdd={onAddTag}
        onRemove={onRemoveTag}
      />

      {saveError !== null ? (
        <Text className="text-danger text-caption mt-3">{saveError}</Text>
      ) : null}

      {hasChanges ? (
        <View className="mt-6">
          <Button
            label="Save changes"
            onPress={onSave}
            loading={isSaving}
            disabled={!hasChanges}
          />
        </View>
      ) : null}
    </>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-text-secondary text-caption uppercase tracking-widest mb-2">
      {label}
    </Text>
  );
}
