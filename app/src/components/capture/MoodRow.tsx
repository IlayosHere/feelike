import React from 'react';
import { ScrollView, View } from 'react-native';
import { MoodChip } from '@/components/ui/MoodChip';
import { useCaptureStore } from '@/stores/captureStore';
import type { MoodValue } from '@/types/api';

type MoodDefinition = {
  value: MoodValue;
  emoji: string;
  label: string;
};

const MOODS: MoodDefinition[] = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🔥', label: 'Excited' },
  { value: 'sad', emoji: '😔', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry', emoji: '😤', label: 'Angry' },
  { value: 'calm', emoji: '🧘', label: 'Calm' },
];

export function MoodRow() {
  const { mood, setMood } = useCaptureStore();

  const handlePress = (value: MoodValue) => {
    setMood(mood === value ? null : value);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="mt-4"
      keyboardShouldPersistTaps="handled"
    >
      {MOODS.map((m) => (
        <View key={m.value} style={{ marginRight: 8 }}>
          <MoodChip
            emoji={m.emoji}
            label={m.label}
            selected={mood === m.value}
            onPress={() => handlePress(m.value)}
          />
        </View>
      ))}
    </ScrollView>
  );
}
