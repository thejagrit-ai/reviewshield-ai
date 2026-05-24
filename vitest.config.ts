import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setupTests.ts',
    include: ['test/**/*.test.{js,ts,tsx}', 'test/**/*.spec.{js,ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**']
  }
})
