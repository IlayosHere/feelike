import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import type { MoodValue } from '@/types/api';

const MoodValueSchema = z.enum(['happy', 'excited', 'sad', 'anxious', 'angry', 'calm']);

const EntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  mood: MoodValueSchema.nullable(),
  tags: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

type CreateEntryInput = {
  content: string;
  mood?: MoodValue;
  tags?: string[];
};

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEntryInput) => {
      const raw = await apiClient.post<unknown>('/api/entries', input);
      return EntrySchema.parse(raw);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['entries'] });
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
