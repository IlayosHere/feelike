export type MoodValue = 'happy' | 'excited' | 'sad' | 'anxious' | 'angry' | 'calm';

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
