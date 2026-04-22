import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';

const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const TagsSchema = z.array(TagSchema);

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>('/api/tags');
      return TagsSchema.parse(raw);
    },
  });
}
