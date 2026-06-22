import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // stub out the server-only guard so lib/* can be imported in tests
      'server-only': path.resolve(__dirname, '__mocks__/server-only.ts'),
    },
  },
});
