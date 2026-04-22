import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TagChip } from '@/components/ui/TagChip';
import type { Entry } from '@/types/api';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  excited: '🔥',
  sad: '😔',
  anxious: '😰',
  angry: '😤',
  calm: '🧘',
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export type EntryCardProps = {
  entry: Entry;
  onPress: () => void;
};

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const moodEmoji = entry.mood ? MOOD_EMOJI[entry.mood] : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Entry from ${formatTime(entry.created_at)}`}
      className="bg-surface rounded-xl p-4 mb-3 shadow-sm active:opacity-70"
    >
      <Text
        className="text-text-primary text-body mb-2"
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {entry.content}
      </Text>

      {entry.tags.length > 0 ? (
        <View className="flex-row flex-wrap mb-2">
          {entry.tags.map((tag, index) => (
            <TagChip
              key={tag}
              label={tag}
              colorIndex={index}
            />
          ))}
        </View>
      ) : null}

      <View className="flex-row items-center gap-2">
        <Text className="text-text-muted text-caption">
          {formatTime(entry.created_at)}
        </Text>
        {moodEmoji !== null ? (
          <Text
            className="text-caption"
            accessibilityLabel={`Mood: ${entry.mood ?? ''}`}
          >
            {moodEmoji}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
