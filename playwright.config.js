import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  // The CPU is slowed down four times, so each test needs longer than Playwright's default.
  timeout: 180_000,
  // One test at a time, so tests don't slow each other down.
  workers: 1,
  use: {
    baseURL: "http://localhost:4173",
    viewport: { width: 1280, height: 900 },
    browserName: "chromium",
    // Set DS_PERF_CHROME to use a different Chrome.
    launchOptions: { executablePath: process.env.DS_PERF_CHROME || undefined },
  },
  // Tests run against a production build, the way apps ship the design system.
  webServer: {
    command: "npx vite build && npx vite preview --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
