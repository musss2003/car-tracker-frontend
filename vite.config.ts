import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Add this import
import { configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true, // ✅ make expect, describe, test, etc. available globally
    exclude: [...configDefaults.exclude, 'dist/**'], // optional: ignore dist
  },
})
