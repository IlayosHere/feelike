/// <reference types="node" />
import type { Entry, MoodValue, PaginatedEntries, Tag, User } from '@/types/api';

// ─── Internal types ───────────────────────────────────────────────────────────

type StoredUser = User & { passwordHash: string };
type StoredTag = Tag & { userId: string };
type StoredEntry = Entry & { userId: string };

// In-memory store — reset on app restart (intentional for mock layer)
type MockDb = {
  users: Map<string, StoredUser>;
  entries: Map<string, StoredEntry>;
  tags: Map<string, StoredTag>;
  currentUserId: string | null;
};

export const db: MockDb = {
  users: new Map(),
  entries: new Map(),
  tags: new Map(),
  currentUserId: null,
};

// ─── Seed data ────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SEED_USER: StoredUser = {
  id: 'user-1',
  email: 'demo@feelike.app',
  display_name: 'Demo User',
  created_at: '2026-01-01T00:00:00.000Z',
  passwordHash: 'password123',
};

const SEED_TAGS: StoredTag[] = [
  { id: 'tag-work', name: 'work', userId: 'user-1', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-personal', name: 'personal', userId: 'user-1', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-ideas', name: 'ideas', userId: 'user-1', created_at: '2026-01-01T00:00:00.000Z' },
];

const SEED_ENTRIES: StoredEntry[] = [
  {
    id: 'entry-1',
    userId: 'user-1',
    content:
      "Finally shipped the feature I've been wrestling with all week. It feels good to close that loop — not just because it's done, but because I actually learned something new about how I work under pressure. I tend to go quiet when I'm stuck instead of asking for help earlier. Something to watch.",
    mood: 'happy',
    tags: ['work'],
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'entry-2',
    userId: 'user-1',
    content:
      "Couldn't sleep last night. Kept replaying the conversation with my manager — I don't think I expressed what I meant clearly and now it's stuck in my head. I need to remember that most things feel bigger at 2am than they actually are. Tomorrow I'll just send a follow-up message and clarify.",
    mood: 'anxious',
    tags: ['personal', 'work'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: 'entry-3',
    userId: 'user-1',
    content:
      "Had this random idea on my walk this morning: what if the onboarding flow started with a single question instead of five? Like, one question that actually gets at something real. Most apps ask about preferences. We could ask about something the person cares about right now. Filed it away for later.",
    mood: 'excited',
    tags: ['ideas'],
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: 'entry-4',
    userId: 'user-1',
    content:
      "Quiet Sunday. Made coffee, read for an hour, didn't look at my phone until noon. I keep forgetting how much this resets me. The week ahead looks heavy but right now I feel okay about it. Small things — like a good morning — matter more than I give them credit for.",
    mood: 'calm',
    tags: ['personal'],
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
  },
];

function seedDatabase(): void {
  db.users.set(SEED_USER.id, SEED_USER);
  for (const tag of SEED_TAGS) {
    db.tags.set(tag.id, tag);
  }
  for (const entry of SEED_ENTRIES) {
    db.entries.set(entry.id, entry);
  }
}

seedDatabase();

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getEntriesForUser(
  userId: string,
  limit: number,
  cursor: string | null,
): PaginatedEntries {
  const allUserEntries = Array.from(db.entries.values())
    .filter((e) => e.userId === userId)
    .sort((a, b) => {
      const dateDiff =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    });

  let startIndex = 0;
  if (cursor !== null) {
    const decoded = decodeCursor(cursor);
    if (decoded !== null) {
      const idx = allUserEntries.findIndex(
        (e) => e.created_at.slice(0, 19) === decoded.created_at.slice(0, 19) && e.id === decoded.id,
      );
      startIndex = idx === -1 ? allUserEntries.length : idx + 1;
    }
  }

  const page = allUserEntries.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < allUserEntries.length;
  const next_cursor =
    hasMore && page.length > 0
      ? encodeCursor(page[page.length - 1].created_at, page[page.length - 1].id)
      : null;

  return { items: page.map(stripUserId), next_cursor };
}

export function createEntry(
  userId: string,
  data: { content: string; mood?: MoodValue; tags?: string[] },
): Entry {
  const now = new Date().toISOString();
  const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const entry: StoredEntry = {
    id,
    userId,
    content: data.content,
    mood: data.mood ?? null,
    tags: data.tags ?? [],
    created_at: now,
    updated_at: now,
  };

  db.entries.set(id, entry);

  // Persist any new tag names to the tag store so they appear in autocomplete
  for (const name of entry.tags) {
    const exists = Array.from(db.tags.values()).some(
      (t) => t.userId === userId && t.name === name,
    );
    if (!exists) {
      const tagId = `tag-${userId}-${name}-${Date.now()}`;
      db.tags.set(tagId, { id: tagId, name, userId, created_at: now });
    }
  }

  return stripUserId(entry);
}

export function updateEntry(
  userId: string,
  entryId: string,
  data: Partial<{ content: string; mood: MoodValue | null; tags: string[] }>,
): Entry | null {
  const existing = db.entries.get(entryId);
  if (!existing || existing.userId !== userId) return null;

  const updated: StoredEntry = {
    ...existing,
    ...(data.content !== undefined ? { content: data.content } : {}),
    ...(data.mood !== undefined ? { mood: data.mood } : {}),
    ...(data.tags !== undefined ? { tags: data.tags } : {}),
    updated_at: new Date().toISOString(),
  };

  db.entries.set(entryId, updated);

  // Persist any new tag names to the tag store
  if (data.tags) {
    const now = new Date().toISOString();
    for (const name of data.tags) {
      const exists = Array.from(db.tags.values()).some(
        (t) => t.userId === userId && t.name === name,
      );
      if (!exists) {
        const tagId = `tag-${userId}-${name}-${Date.now()}`;
        db.tags.set(tagId, { id: tagId, name, userId, created_at: now });
      }
    }
  }

  return stripUserId(updated);
}

export function deleteEntry(userId: string, entryId: string): boolean {
  const existing = db.entries.get(entryId);
  if (!existing || existing.userId !== userId) return false;

  db.entries.delete(entryId);
  return true;
}

export function getTagsForUser(userId: string): Tag[] {
  return Array.from(db.tags.values())
    .filter((t) => t.userId === userId)
    .map(({ userId: _uid, ...tag }) => tag);
}

// ─── Cursor helpers ───────────────────────────────────────────────────────────

type CursorPayload = { created_at: string; id: string };

function encodeCursor(created_at: string, id: string): string {
  const ts = created_at.slice(0, 19).replace('T', ' ');
  const raw = `${ts},${id}`;
  return Buffer.from(raw, 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const b64 = cursor.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
    const raw = Buffer.from(padded, 'base64').toString('utf8');
    const commaIdx = raw.indexOf(',');
    if (commaIdx === -1) return null;
    const created_at_str = raw.slice(0, commaIdx);
    const id = raw.slice(commaIdx + 1);
    const created_at = created_at_str.replace(' ', 'T') + '.000Z';
    return { created_at, id };
  } catch {
    return null;
  }
}

function stripUserId({ userId: _uid, ...entry }: StoredEntry): Entry {
  return entry;
}
