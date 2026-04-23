import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

const AuthResponseSchema = z.object({
  access_token: z.string(),
});

type SignupInput = {
  email: string;
  password: string;
};

export function useSignup() {
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const raw = await apiClient.post<unknown>('/api/auth/signup', input);
      return AuthResponseSchema.parse(raw);
    },
    onSuccess: async (data) => {
      await setToken(data.access_token);
    },
  });
}
