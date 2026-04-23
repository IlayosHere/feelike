import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MoodChip } from '@/components/ui/MoodChip';
import { EntryTagEditor } from '@/components/entry/EntryTagEditor';
import { useTheme } from '@/theme/useTheme';
import type { MoodValue } from '@/types/api';

type MoodDefinition = { value: MoodValue; emoji: string; label: string };

export const MOODS: MoodDefinition[] = [
  { value: 'happy',   emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🔥', label: 'Excited' },
  { value: 'sad',     emoji: '😔', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry',   emoji: '😤', label: 'Angry' },
  { value: 'calm',    emoji: '🧘', label: 'Calm' },
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
  const { theme } = useTheme();

  return (
    <>
      {/* Content input — same card treatment as CaptureScreen */}
      <TextInput
        value={content}
        onChangeText={onContentChange}
        multiline
        textAlignVertical="top"
        style={{
          backgroundColor: theme.surface,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: theme.border,
          padding: 22,
          minHeight: 160,
          color: theme.textPrimary,
          fontSize: 17,
          lineHeight: 26,
          fontWeight: '500',
          marginBottom: 8,
        }}
        accessibilityLabel="Entry content"
      />

      {/* Mood chips — horizontal scroll, no wrapping, no label */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16, gap: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        {MOODS.map((m) => (
          <MoodChip
            key={m.value}
            emoji={m.emoji}
            label={m.label}
            selected={mood === m.value}
            onPress={() => onMoodPress(m.value)}
          />
        ))}
      </ScrollView>

      {/* Tags — no label */}
      <EntryTagEditor
        tags={tags}
        onAdd={onAddTag}
        onRemove={onRemoveTag}
      />

      {saveError !== null ? (
        <Text style={{ color: theme.danger, fontSize: 13, marginTop: 12 }}>
          {saveError}
        </Text>
      ) : null}

      {/* Save button — always visible, muted when no changes */}
      <View style={{ marginTop: 24 }}>
        <SaveButton
          hasChanges={hasChanges}
          isSaving={isSaving}
          onSave={onSave}
        />
      </View>
    </>
  );
}

function SaveButton({
  hasChanges,
  isSaving,
  onSave,
}: {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  const { theme } = useTheme();
  const inactive = !hasChanges && !isSaving;

  return (
    <Pressable
      onPress={onSave}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel="Save changes"
      accessibilityState={{ disabled: inactive }}
      style={{ borderRadius: 20, overflow: 'hidden', opacity: inactive ? 0.38 : 1 }}
    >
      <LinearGradient
        colors={[theme.gradPrimaryStart, theme.gradPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
