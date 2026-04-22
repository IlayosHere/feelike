import React from 'react';
import { ScrollView } from 'react-native';
import { MoodChip } from '@/components/ui/MoodChip';
import { useCaptureStore } from '@/stores/captureStore';
import type { MoodValue } from '@/types/api';

type MoodDefinition = { value: MoodValue; emoji: string; label: string };

const MOODS: MoodDefinition[] = [
  { value: 'sad',     emoji: '😔', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry',   emoji: '😤', label: 'Angry' },
  { value: 'calm',    emoji: '🧘', label: 'Calm' },
  { value: 'happy',   emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🔥', label: 'Excited' },
];

export function MoodRow() {
  const { mood, setMood } = useCaptureStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, gap: 10 }}
      keyboardShouldPersistTaps="handled"
    >
      {MOODS.map((m) => (
        <MoodChip
          key={m.value}
          emoji={m.emoji}
          label={m.label}
          selected={mood === m.value}
          onPress={() => setMood(mood === m.value ? null : m.value)}
        />
      ))}
    </ScrollView>
  );
}
