import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Force re-optimization on every server start to avoid stale cache issues
    force: true,
  },
  server: {
    // Clear cache on startup to prevent stale dependency issues
    fs: {
      strict: false,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setup-test.ts',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: false,
    unstubGlobals: false,
    unstubEnvs: false,
    testTimeout: 5000,
   hookTimeout: 5000,
    coverage: {
      reporter: ['text', 'json', 'lcov'], // lcov is needed for Codecov
    },
  },
});
