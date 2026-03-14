import { test, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// Load audio durations for perfect sync
interface SceneTiming {
  index: number
  file: string
  duration: number // in ms
  durationSeconds: number
}

interface TimingsData {
  totalDuration: number
  scenes: SceneTiming[]
}

// Load scene timings
const timingsPath = path.join(__dirname, 'scene-timings.json')
let sceneDurations: number[] = []

if (fs.existsSync(timingsPath)) {
  const timings: TimingsData = JSON.parse(fs.readFileSync(timingsPath, 'utf-8'))
  sceneDurations = timings.scenes.map(s => s.duration)
  console.log(`📊 Loaded ${sceneDurations.length} scene durations (total: ${Math.floor(timings.totalDuration / 60)}:${Math.floor(timings.totalDuration % 60).toString().padStart(2, '0')})`)
} else {
  console.log('⚠️  No scene timings found, using default durations')
}

let currentScene = 0

// Get duration for current scene (ms)
function getSceneDuration(): number {
  const duration = sceneDurations[currentScene] || 5000
  currentScene++
  return duration
}

// Wait for the exact audio duration - with error handling
async function waitForAudio(page: Page, extraMs: number = 500) {
  try {
    const duration = getSceneDuration() + extraMs
    await page.waitForTimeout(duration)
  } catch {
    // Page closed, ignore
  }
}

// Helper to scroll slowly for effect
async function slowScroll(page: Page, pixels: number = 300) {
  try {
    await page.evaluate((px) => {
      window.scrollBy({ top: px, behavior: 'smooth' })
    }, pixels)
    await page.waitForTimeout(800)
  } catch {
    // Page closed, ignore
  }
}

// Helper to highlight element before clicking
async function highlightAndClick(page: Page, selector: string) {
  try {
    const element = page.locator(selector).first()
    if (await element.isVisible()) {
      await element.hover()
      await page.waitForTimeout(300)
      await element.click()
    }
  } catch {
    // Element not found or page closed, ignore
  }
}

// Safe page wait
async function safeWait(page: Page, selector: string, timeout: number = 10000) {
  try {
    await page.waitForSelector(selector, { timeout })
  } catch {
    // Continue regardless
  }
  await page.waitForTimeout(500)
}

test.describe('TradeGuard Demo - Synced with Voiceover', () => {
  test.setTimeout(600000) // 10 minute timeout

  test('Complete Product Demo', async ({ page }) => {
    console.log('\n🎬 Starting TradeGuard Demo Recording...\n')

    // ==========================================
    // SCENE 0: Introduction (on landing page)
    // ==========================================
    console.log('📍 Scene 0: Introduction')
    await page.goto('/')
    await page.waitForTimeout(1000)
    await waitForAudio(page)

    // ==========================================
    // SCENE 1: Platform Overview
    // ==========================================
    console.log('📍 Scene 1: Platform Overview')
    await slowScroll(page, 400)
    await waitForAudio(page)

    // ==========================================
    // SCENE 2: Secure Authentication
    // ==========================================
    console.log('📍 Scene 2: Secure Authentication')
    await page.click('text=Sign In').catch(() => {})
    await page.waitForTimeout(500)
    await waitForAudio(page)

    // ==========================================
    // SCENE 3: Login Credentials
    // ==========================================
    console.log('📍 Scene 3: Login Credentials')
    await page.fill('input[type="email"]', 'admin@tradeguard.com').catch(() => {})
    await page.waitForTimeout(800)
    await page.fill('input[type="password"]', 'Password123!').catch(() => {})
    await waitForAudio(page)

    // ==========================================
    // SCENE 4: Role-Based Access
    // ==========================================
    console.log('📍 Scene 4: Role-Based Access')
    await page.click('button[type="submit"]').catch(() => {})
    await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {})
    await waitForAudio(page)

    // ==========================================
    // SCENE 5: Dashboard Overview
    // ==========================================
    console.log('📍 Scene 5: Dashboard Overview')
    await page.waitForTimeout(1000)
    await waitForAudio(page)

    // ==========================================
    // SCENE 6: Key Performance Indicators
    // ==========================================
    console.log('📍 Scene 6: Key Performance Indicators')
    await waitForAudio(page)

    // ==========================================
    // SCENE 7: Animated Metrics
    // ==========================================
    console.log('📍 Scene 7: Animated Metrics')
    await waitForAudio(page)

    // ==========================================
    // SCENE 8: Shipment Analytics
    // ==========================================
    console.log('📍 Scene 8: Shipment Analytics')
    await slowScroll(page, 350)
    await waitForAudio(page)

    // ==========================================
    // SCENE 9: Duty Cost Analysis
    // ==========================================
    console.log('📍 Scene 9: Duty Cost Analysis')
    await slowScroll(page, 300)
    await waitForAudio(page)

    // ==========================================
    // SCENE 10: Shipments Module
    // ==========================================
    console.log('📍 Scene 10: Shipments Module')
    await highlightAndClick(page, 'text=Shipments')
    await safeWait(page, 'h1:has-text("Shipments")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 11: Shipment List View
    // ==========================================
    console.log('📍 Scene 11: Shipment List View')
    await waitForAudio(page)

    // ==========================================
    // SCENE 12: Status Indicators
    // ==========================================
    console.log('📍 Scene 12: Status Indicators')
    await waitForAudio(page)

    // ==========================================
    // SCENE 13: Filtering and Search
    // ==========================================
    console.log('📍 Scene 13: Filtering and Search')
    await waitForAudio(page)

    // ==========================================
    // SCENE 14: Shipment Details
    // ==========================================
    console.log('📍 Scene 14: Shipment Details')
    await slowScroll(page, 300)
    await waitForAudio(page)

    // ==========================================
    // SCENE 15: AI-Powered HS Classifier
    // ==========================================
    console.log('📍 Scene 15: AI-Powered HS Classifier')
    await highlightAndClick(page, 'text=HS Classifier')
    await safeWait(page, 'h1:has-text("HS Code")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 16: Classification Interface
    // ==========================================
    console.log('📍 Scene 16: Classification Interface')
    await waitForAudio(page)

    // ==========================================
    // SCENE 17: Detailed Product Input
    // ==========================================
    console.log('📍 Scene 17: Detailed Product Input')
    const productDescription = `Industrial grade seamless stainless steel pipes for water treatment systems.
Material: AISI 316L stainless steel
Outer diameter: 50mm, Wall thickness: 3mm
Length: 6 meters, Surface finish: Polished
Manufactured in India for export to European Union`

    try {
      const textarea = page.locator('textarea').first()
      if (await textarea.isVisible()) {
        await textarea.click()
        await page.keyboard.type(productDescription, { delay: 20 })
      }
    } catch {
      // Continue
    }
    await waitForAudio(page)

    // ==========================================
    // SCENE 18: AI Classification Process
    // ==========================================
    console.log('📍 Scene 18: AI Classification Process')
    try {
      const classifyButton = page.locator('button:has-text("Classify")').first()
      if (await classifyButton.isVisible()) {
        await classifyButton.click()
      }
    } catch {
      // Continue
    }
    await waitForAudio(page)

    // ==========================================
    // SCENE 19: Classification Results
    // ==========================================
    console.log('📍 Scene 19: Classification Results')
    await waitForAudio(page)

    // ==========================================
    // SCENE 20: AI Reasoning
    // ==========================================
    console.log('📍 Scene 20: AI Reasoning')
    await waitForAudio(page)

    // ==========================================
    // SCENE 21: Classification History
    // ==========================================
    console.log('📍 Scene 21: Classification History')
    await slowScroll(page, 300)
    await waitForAudio(page)

    // ==========================================
    // SCENE 22: Duty Calculator
    // ==========================================
    console.log('📍 Scene 22: Duty Calculator')
    await highlightAndClick(page, 'text=Duty Calculator')
    await safeWait(page, 'h1:has-text("Duty")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 23: Landed Cost Calculation
    // ==========================================
    console.log('📍 Scene 23: Landed Cost Calculation')
    await waitForAudio(page)

    // ==========================================
    // SCENE 24: Free Trade Agreement Optimization
    // ==========================================
    console.log('📍 Scene 24: Free Trade Agreement Optimization')
    await waitForAudio(page)

    // ==========================================
    // SCENE 25: WTO Valuation Methods
    // ==========================================
    console.log('📍 Scene 25: WTO Valuation Methods')
    await waitForAudio(page)

    // ==========================================
    // SCENE 26: Denied Party Screening
    // ==========================================
    console.log('📍 Scene 26: Denied Party Screening')
    await highlightAndClick(page, 'text=Denied Party')
    await safeWait(page, 'h1:has-text("Denied Party")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 27: Global Watchlist Coverage
    // ==========================================
    console.log('📍 Scene 27: Global Watchlist Coverage')
    await waitForAudio(page)

    // ==========================================
    // SCENE 28: Real-Time Screening
    // ==========================================
    console.log('📍 Scene 28: Real-Time Screening')
    try {
      const partyInput = page.locator('input').first()
      if (await partyInput.isVisible()) {
        await partyInput.click()
        await page.keyboard.type('Volkov Trading LLC', { delay: 50 })
      }
    } catch {
      // Continue
    }
    await waitForAudio(page)

    // ==========================================
    // SCENE 29: Match Detection
    // ==========================================
    console.log('📍 Scene 29: Match Detection')
    try {
      const screenButton = page.locator('button:has-text("Screen")').first()
      if (await screenButton.isVisible()) {
        await screenButton.click()
      }
    } catch {
      // Continue
    }
    await waitForAudio(page)

    // ==========================================
    // SCENE 30: Screening History
    // ==========================================
    console.log('📍 Scene 30: Screening History')
    await waitForAudio(page)

    // ==========================================
    // SCENE 31: Trade Documents
    // ==========================================
    console.log('📍 Scene 31: Trade Documents')
    await highlightAndClick(page, 'text=Documents')
    await safeWait(page, 'h1:has-text("Documents")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 32: Document Management
    // ==========================================
    console.log('📍 Scene 32: Document Management')
    await waitForAudio(page)

    // ==========================================
    // SCENE 33: Compliance Management
    // ==========================================
    console.log('📍 Scene 33: Compliance Management')
    await highlightAndClick(page, 'text=Compliance')
    await safeWait(page, 'h1:has-text("Compliance")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 34: Exception Tracking
    // ==========================================
    console.log('📍 Scene 34: Exception Tracking')
    await waitForAudio(page)

    // ==========================================
    // SCENE 35: Complete Audit Trail
    // ==========================================
    console.log('📍 Scene 35: Complete Audit Trail')
    await highlightAndClick(page, 'text=Audit')
    await safeWait(page, 'h1:has-text("Audit")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 36: Team Management
    // ==========================================
    console.log('📍 Scene 36: Team Management')
    await highlightAndClick(page, 'text=Settings')
    await safeWait(page, 'h1:has-text("Settings")')
    await waitForAudio(page)

    // ==========================================
    // SCENE 37: Role-Based Access Control
    // ==========================================
    console.log('📍 Scene 37: Role-Based Access Control')
    try {
      const teamTab = page.locator('button:has-text("Team")')
      if (await teamTab.isVisible()) {
        await teamTab.click()
      }
    } catch {
      // Continue
    }
    await waitForAudio(page)

    // ==========================================
    // SCENE 38: Enterprise Security
    // ==========================================
    console.log('📍 Scene 38: Enterprise Security')
    await waitForAudio(page)

    // ==========================================
    // SCENE 39: Return to Dashboard
    // ==========================================
    console.log('📍 Scene 39: Return to Dashboard')
    await highlightAndClick(page, 'text=Dashboard')
    await waitForAudio(page)

    // ==========================================
    // SCENE 40: Conclusion
    // ==========================================
    console.log('📍 Scene 40: Conclusion')
    await waitForAudio(page)

    // ==========================================
    // SCENE 41: Call to Action
    // ==========================================
    console.log('📍 Scene 41: Call to Action')
    await waitForAudio(page, 2000)

    console.log('\n🎬 Demo recording completed!')
    console.log(`📊 Total scenes: ${currentScene}`)
  })
})
