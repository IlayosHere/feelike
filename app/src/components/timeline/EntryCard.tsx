import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TagChip } from '@/components/ui/TagChip';
import { useTheme } from '@/theme/useTheme';
import type { Entry } from '@/types/api';

const MOOD_EMOJI: Record<string, string> = {
  happy:   '😊',
  excited: '🔥',
  sad:     '😔',
  anxious: '😰',
  angry:   '😤',
  calm:    '🧘',
};

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export type EntryCardProps = {
  entry: Entry;
  onPress: () => void;
};

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const { theme } = useTheme();
  const moodEmoji = entry.mood ? MOOD_EMOJI[entry.mood] : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Entry from ${formatTime(entry.created_at)}`}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: 20,
          marginHorizontal: 24,
          marginBottom: 12,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
        },
        theme.shadowSm,
      ]}
    >
      {/* Top row: mood emoji + time */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {moodEmoji !== null ? (
          <Text style={{ fontSize: 22 }} accessibilityLabel={`Mood: ${entry.mood ?? ''}`}>
            {moodEmoji}
          </Text>
        ) : (
          <View />
        )}
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: theme.textSecondary }}>
          {formatTime(entry.created_at)}
        </Text>
      </View>

      {/* Body */}
      <Text
        style={{ fontSize: 14, lineHeight: 22, fontWeight: '500', color: theme.textPrimary }}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {entry.content}
      </Text>

      {/* Tags */}
      {entry.tags.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {entry.tags.map((tag, index) => (
            <TagChip key={tag} label={tag} colorIndex={index} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}
