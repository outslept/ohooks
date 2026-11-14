import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    isolate: false,
    coverage: {
      provider: 'istanbul',
      include: ['hooks/**/*.ts'],
      reporter: ['text', 'html'],
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
  },
})
