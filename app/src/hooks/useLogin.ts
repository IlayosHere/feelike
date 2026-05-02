import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

const AuthResponseSchema = z.object({
  access_token: z.string(),
});

type LoginInput = {
  email: string;
  password: string;
};

export function useLogin() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const raw = await apiClient.postForm<unknown>('/api/auth/login', {
        username: input.email,
        password: input.password,
      });
      return AuthResponseSchema.parse(raw);
    },
    onSuccess: async (data) => {
      await setToken(data.access_token);
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
