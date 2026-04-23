import { Platform } from 'react-native';

export async function startMockServer(): Promise<void> {
  if (!__DEV__) return;
  const { server } = await import('./server');
  if (Platform.OS === 'web') {
    // msw/browser uses start() with a service worker
    await (server as unknown as { start(opts: object): Promise<void> }).start({
      onUnhandledRequest: 'warn',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  } else {
    // msw/native uses listen()
    (server as unknown as { listen(opts: object): void }).listen({ onUnhandledRequest: 'warn' });
  }
}
