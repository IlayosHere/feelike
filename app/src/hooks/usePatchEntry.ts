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

type PatchEntryInput = {
  id: string;
  content?: string;
  mood?: MoodValue | null;
  tags?: string[];
};

export function usePatchEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: PatchEntryInput) => {
      const raw = await apiClient.patch<unknown>(`/api/entries/${id}`, data);
      return EntrySchema.parse(raw);
    },
    onSuccess: (entry) => {
      void queryClient.invalidateQueries({ queryKey: ['entries'] });
      void queryClient.invalidateQueries({ queryKey: ['entry', entry.id] });
    },
  });
}
