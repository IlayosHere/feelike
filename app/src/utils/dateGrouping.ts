import type { Entry } from '@/types/api';

export type HeaderItem = { type: 'header'; key: string; label: string };
export type EntryItem  = { type: 'entry';  key: string; entry: Entry };
export type ListItem   = HeaderItem | EntryItem;

export function toDateKey(isoString: string): string {
  return new Date(isoString).toDateString();
}

export function getDayLabel(dateKey: string): string {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  return new Date(dateKey).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function buildListItems(entries: Entry[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDateKey: string | null = null;

  for (const entry of entries) {
    const dateKey = toDateKey(entry.created_at);
    if (dateKey !== lastDateKey) {
      lastDateKey = dateKey;
      items.push({ type: 'header', key: `header-${dateKey}`, label: getDayLabel(dateKey) });
    }
    items.push({ type: 'entry', key: entry.id, entry });
  }

  return items;
}
