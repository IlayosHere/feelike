import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';

const MoodValueSchema = z.enum(['happy', 'excited', 'sad', 'anxious', 'angry', 'calm']);

const EntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  mood: MoodValueSchema.nullable(),
  tags: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

const PaginatedEntriesSchema = z.object({
  items: z.array(EntrySchema),
  next_cursor: z.string().nullable(),
});

const PAGE_LIMIT = 20;

export function useEntries() {
  return useInfiniteQuery({
    queryKey: ['entries'],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : '';
      const raw = await apiClient.get<unknown>(`/api/entries?limit=${PAGE_LIMIT}${cursor}`);
      return PaginatedEntriesSchema.parse(raw);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
}
