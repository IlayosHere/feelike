import { Platform } from 'react-native';

export async function startMockServer(): Promise<void> {
  if (!__DEV__) return;
  const { server } = await import('./server');
  if (Platform.OS === 'web') {
    // msw/browser uses start() with a service worker
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (server as any).start({
      onUnhandledRequest: 'warn',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  } else {
    // msw/native uses listen()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (server as any).listen({ onUnhandledRequest: 'warn' });
  }
}
