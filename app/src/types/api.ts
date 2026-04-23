export type MoodValue = 'happy' | 'excited' | 'sad' | 'anxious' | 'angry' | 'calm';

export type MoodDefinition = { value: MoodValue; emoji: string; label: string };
export const MOODS: MoodDefinition[] = [
  { value: 'happy',   emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🔥', label: 'Excited' },
  { value: 'sad',     emoji: '😔', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry',   emoji: '😤', label: 'Angry' },
  { value: 'calm',    emoji: '🧘', label: 'Calm' },
];

export type Entry = {
  id: string;
  content: string;
  mood: MoodValue | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  display_name: string | null;
};

export type Tag = {
  id: string;
  name: string;
};

export type PaginatedEntries = {
  items: Entry[];
  next_cursor: string | null;
};

export type AuthResponse = {
  access_token: string;
};
