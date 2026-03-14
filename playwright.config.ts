import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './demo',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',

  use: {
    // Base URL for the app
    baseURL: process.env.DEMO_URL || 'https://tradeguard-two.vercel.app',

    // Record video for all tests
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    },

    // Fast actions but longer pauses for viewing
    launchOptions: {
      slowMo: 200,
    },

    // Take screenshot on failure
    screenshot: 'on',

    // Record trace
    trace: 'on',

    // Viewport
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'demo-recording',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],

  // Output folder for videos
  outputDir: './demo/videos',
})
