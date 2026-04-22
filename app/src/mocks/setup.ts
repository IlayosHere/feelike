export async function startMockServer(): Promise<void> {
  if (!__DEV__) return;
  const { server } = await import('./server');
  server.listen({ onUnhandledRequest: 'warn' });
}
