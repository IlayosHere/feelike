import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  display_name: z.string().nullable(),
});

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['currentUser'],
    enabled: !!token,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>('/api/auth/me');
      return UserSchema.parse(raw);
    },
  });
}
