import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const TagsSchema = z.array(TagSchema);

export function useTags() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['tags'],
    enabled: !!token,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>('/api/tags');
      return TagsSchema.parse(raw);
    },
  });
}
