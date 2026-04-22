import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

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
  const token = useAuthStore((s) => s.token);
  return useInfiniteQuery({
    queryKey: ['entries'],
    enabled: !!token,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : '';
      const raw = await apiClient.get<unknown>(`/api/entries?limit=${PAGE_LIMIT}${cursor}`);
      return PaginatedEntriesSchema.parse(raw);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
}
