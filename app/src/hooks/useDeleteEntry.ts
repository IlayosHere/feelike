import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/entries/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}
