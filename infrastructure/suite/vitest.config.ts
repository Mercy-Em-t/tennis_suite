import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Since we are testing pure logic engines
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
