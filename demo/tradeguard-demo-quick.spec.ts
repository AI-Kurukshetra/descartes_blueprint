import { test, Page } from '@playwright/test'

// Faster, more reliable demo - 5 minutes
const SCENE_DURATION = 6000 // 6 seconds per scene average

let sceneIndex = 0

async function scene(page: Page, name: string, duration: number = SCENE_DURATION) {
  console.log(`📍 Scene ${sceneIndex++}: ${name}`)
  await page.waitForTimeout(duration)
}

async function slowScroll(page: Page, pixels: number = 300) {
  await page.evaluate((px) => window.scrollBy({ top: px, behavior: 'smooth' }), pixels)
  await page.waitForTimeout(800)
}

async function clickNav(page: Page, text: string) {
  const link = page.locator(`text=${text}`).first()
  if (await link.isVisible()) {
    await link.hover()
    await page.waitForTimeout(300)
    await link.click()
  }
}

test.describe('TradeGuard Demo - 5 Minutes', () => {
  test.setTimeout(600000)

  test('Quick Demo Recording', async ({ page }) => {
    console.log('\n🎬 Starting TradeGuard Quick Demo...\n')

    // ========== LANDING PAGE ==========
    await page.goto('/')
    await scene(page, 'Landing Page - Introduction', 8000)
    await slowScroll(page, 400)
    await scene(page, 'Platform Features', 5000)

    // ========== LOGIN ==========
    await page.click('text=Sign In')
    await page.waitForTimeout(1000)
    await scene(page, 'Login Page', 4000)

    await page.fill('input[type="email"]', 'admin@tradeguard.com')
    await page.waitForTimeout(500)
    await page.fill('input[type="password"]', 'Password123!')
    await scene(page, 'Enter Credentials', 3000)

    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 30000 })
    await page.waitForTimeout(2000)
    await scene(page, 'Dashboard Overview', 8000)

    // ========== DASHBOARD STATS ==========
    await slowScroll(page, 350)
    await scene(page, 'KPI Cards & Charts', 6000)
    await slowScroll(page, 300)
    await scene(page, 'Recent Shipments', 5000)

    // ========== SHIPMENTS ==========
    await clickNav(page, 'Shipments')
    await page.waitForSelector('h1:has-text("Shipments")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Shipments List', 8000)
    await slowScroll(page, 300)
    await scene(page, 'Shipment Details', 5000)

    // ========== HS CLASSIFIER ==========
    await clickNav(page, 'HS Classifier')
    await page.waitForSelector('h1:has-text("HS")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'HS Classifier - AI Feature', 6000)

    // Type product description
    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.click()
      await page.keyboard.type('Industrial stainless steel pipes for water treatment. Material: AISI 316L, 50mm diameter, 6 meters length.', { delay: 30 })
      await scene(page, 'Product Description', 5000)

      const classifyBtn = page.locator('button:has-text("Classify")').first()
      if (await classifyBtn.isVisible().catch(() => false)) {
        await classifyBtn.click()
        await scene(page, 'AI Classification Running', 8000)
      }
    }
    await slowScroll(page, 300)
    await scene(page, 'Classification History', 4000)

    // ========== DUTY CALCULATOR ==========
    await clickNav(page, 'Duty Calculator')
    await page.waitForSelector('h1:has-text("Duty")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Duty Calculator', 8000)

    // ========== DENIED PARTY SCREENING ==========
    await clickNav(page, 'Denied Party')
    await page.waitForSelector('h1:has-text("Denied")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Denied Party Screening', 6000)

    // Screen a party
    const partyInput = page.locator('input[placeholder*="company"], input[placeholder*="name"], input[type="text"]').first()
    if (await partyInput.isVisible().catch(() => false)) {
      await partyInput.click()
      await page.keyboard.type('Volkov Trading LLC', { delay: 40 })
      await scene(page, 'Enter Party Name', 4000)

      const screenBtn = page.locator('button:has-text("Screen")').first()
      if (await screenBtn.isVisible().catch(() => false)) {
        await screenBtn.click()
        await scene(page, 'Screening Result - MATCH', 8000)
      }
    }

    // ========== DOCUMENTS ==========
    await clickNav(page, 'Documents')
    await page.waitForSelector('h1:has-text("Document")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Trade Documents', 6000)

    // ========== COMPLIANCE ==========
    await clickNav(page, 'Compliance')
    await page.waitForSelector('h1:has-text("Compliance")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Compliance Management', 6000)

    // ========== AUDIT LOG ==========
    await clickNav(page, 'Audit')
    await page.waitForSelector('h1:has-text("Audit")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Audit Trail', 5000)

    // ========== SETTINGS ==========
    await clickNav(page, 'Settings')
    await page.waitForSelector('h1:has-text("Settings")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await scene(page, 'Settings & Team', 5000)

    // Click Team tab if visible
    const teamTab = page.locator('button:has-text("Team")')
    if (await teamTab.isVisible().catch(() => false)) {
      await teamTab.click()
      await scene(page, 'Team Management', 5000)
    }

    // ========== BACK TO DASHBOARD ==========
    await clickNav(page, 'Dashboard')
    await page.waitForTimeout(2000)
    await scene(page, 'Final Dashboard View', 8000)

    console.log('\n🎬 Demo recording completed!')
    console.log(`📊 Total scenes: ${sceneIndex}`)
  })
})
