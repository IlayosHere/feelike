import { useQuery } from '@tanstack/react-query';
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

export function useEntry(id: string) {
  return useQuery({
    queryKey: ['entry', id],
    enabled: !!id,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/entries/${id}`);
      return EntrySchema.parse(raw);
    },
  });
}
