import { Platform } from 'react-native';

export async function startMockServer(): Promise<void> {
  if (!__DEV__) return;
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
  if (apiUrl && !apiUrl.includes('localhost')) return;

  if (Platform.OS === 'web') {
    const { server } = await import('./server.web');
    await server.start({
      onUnhandledRequest: 'warn',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  } else {
    const { server } = await import('./server');
    server.listen({ onUnhandledRequest: 'warn' });
  }
}
