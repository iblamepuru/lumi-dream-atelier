import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against a real production build served by `vite preview`.
// They use the installed Google Chrome, so no extra browser download is needed.
const PORT = 4174;

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  // Two workers keep one local preview server responsive; lazy page chunks can take a moment.
  workers: 2,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
