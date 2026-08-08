import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // 'server-only' (imported throughout lib/watchdog) resolves to a
    // throwing stub unless the "react-server" export condition is set —
    // Next's bundler sets it for server code; vitest needs to be told to
    // do the same, otherwise every server-only import throws in tests.
    server: {
      deps: {
        conditions: ['react-server'],
      },
    },
  },
  resolve: {
    conditions: ['react-server'],
  },
  ssr: {
    resolve: {
      conditions: ['react-server'],
    },
  },
});
