import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './demo',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html'], ['list']],

  use: {
    // Base URL for the app
    baseURL: process.env.DEMO_URL || 'https://tradeguard-two.vercel.app',

    // Record video for all tests - full screen
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    },

    // Minimal slowMo - timing controlled by audio durations
    launchOptions: {
      slowMo: 50,
      args: [
        '--start-fullscreen',
        '--kiosk',
        '--disable-infobars',
        '--hide-scrollbars',
      ],
    },

    // Take screenshot on failure
    screenshot: 'on',

    // Record trace
    trace: 'on',

    // Viewport - full HD
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'demo-recording',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Override to ensure no device emulation interferes
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    },
  ],

  // Output folder for videos
  outputDir: './demo/videos',
})
