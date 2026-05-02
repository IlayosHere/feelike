import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/(auth)/index' as any);
    }
  }, [isLoading, token, router]);

  // Don't render while auth state is being determined.
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
