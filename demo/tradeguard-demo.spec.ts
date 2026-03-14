import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// Voiceover script with timestamps
interface VoiceoverEntry {
  timestamp: string
  duration: number
  scene: string
  narration: string
}

const voiceoverScript: VoiceoverEntry[] = []
let startTime: number

// Helper to add voiceover entry
function addVoiceover(scene: string, narration: string, durationSeconds: number = 5) {
  const elapsed = Date.now() - startTime
  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  voiceoverScript.push({
    timestamp,
    duration: durationSeconds,
    scene,
    narration
  })

  console.log(`📍 ${timestamp} - ${scene}`)
}

// Helper to wait and let viewer see the screen
async function pause(page: Page, seconds: number = 3) {
  await page.waitForTimeout(seconds * 1000)
}

// Helper to scroll slowly for effect
async function slowScroll(page: Page, pixels: number = 300) {
  await page.evaluate((px) => {
    window.scrollBy({ top: px, behavior: 'smooth' })
  }, pixels)
  await pause(page, 1.5)
}

// Helper to highlight element before clicking
async function highlightAndClick(page: Page, selector: string) {
  const element = page.locator(selector).first()
  if (await element.isVisible()) {
    await element.hover()
    await pause(page, 0.5)
    await element.click()
  }
}

test.describe('TradeGuard Complete Demo - 5 Minutes', () => {
  test.setTimeout(600000) // 10 minute timeout

  test.beforeAll(() => {
    startTime = Date.now()
  })

  test.afterAll(() => {
    // Save voiceover script
    const scriptPath = path.join(__dirname, 'scripts', 'voiceover-script.json')
    fs.mkdirSync(path.dirname(scriptPath), { recursive: true })
    fs.writeFileSync(scriptPath, JSON.stringify(voiceoverScript, null, 2))

    // Generate markdown script for easy reading
    let totalDuration = 0
    const mdScript = voiceoverScript.map(v => {
      totalDuration += v.duration
      return `## ${v.timestamp} - ${v.scene}\n**Duration:** ${v.duration}s\n\n> ${v.narration}\n`
    }).join('\n---\n\n')

    const header = `# TradeGuard Demo Voiceover Script

**Generated:** ${new Date().toISOString()}
**Total Scenes:** ${voiceoverScript.length}
**Estimated Duration:** ${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}

---

`

    fs.writeFileSync(
      path.join(__dirname, 'scripts', 'VOICEOVER_SCRIPT.md'),
      header + mdScript
    )

    console.log(`\n✅ Demo completed!`)
    console.log(`📁 Video: demo/videos/`)
    console.log(`📝 Script: demo/scripts/VOICEOVER_SCRIPT.md`)
    console.log(`⏱️  Total scenes: ${voiceoverScript.length}`)
  })

  test('Complete Product Demo - 5 Minutes', async ({ page }) => {

    // ==========================================
    // INTRO: Landing Page (0:00 - 0:20)
    // ==========================================
    addVoiceover(
      'Introduction',
      'Welcome to TradeGuard - the next-generation global trade compliance and customs management platform. Built for mid-market manufacturers and distributors who need enterprise-grade compliance without enterprise complexity.',
      10
    )

    await page.goto('/')
    await pause(page, 5)

    addVoiceover(
      'Platform Overview',
      'TradeGuard combines AI-powered HS code classification, automated duty calculations, denied party screening, and comprehensive compliance management - all in one integrated platform.',
      8
    )

    await pause(page, 4)
    await slowScroll(page, 400)
    await pause(page, 3)

    // ==========================================
    // LOGIN FLOW (0:20 - 0:45)
    // ==========================================
    addVoiceover(
      'Secure Authentication',
      'Let\'s log into the platform. TradeGuard uses enterprise-grade authentication powered by Supabase, with support for single sign-on, two-factor authentication, and role-based access control.',
      8
    )

    await page.click('text=Sign In')
    await pause(page, 3)

    addVoiceover(
      'Login Credentials',
      'We\'re logging in with our demo account. In production, your organization can configure custom authentication providers including Google, Microsoft, and SAML-based identity providers.',
      7
    )

    await page.fill('input[type="email"]', 'demo@tradeguard.com')
    await pause(page, 1.5)
    await page.fill('input[type="password"]', 'demo1234')
    await pause(page, 2)

    addVoiceover(
      'Role-Based Access',
      'TradeGuard supports four user roles: Administrator with full system access, Compliance Manager for operations, Trade Analyst for reporting, and Viewer for read-only dashboards.',
      7
    )

    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 20000 })
    await pause(page, 4)

    // ==========================================
    // DASHBOARD DEEP DIVE (0:45 - 1:30)
    // ==========================================
    addVoiceover(
      'Dashboard Overview',
      'Welcome to the TradeGuard dashboard. This is your command center for global trade compliance. Let\'s explore the key metrics and visualizations.',
      7
    )

    await pause(page, 4)

    addVoiceover(
      'Key Performance Indicators',
      'At the top, you see four critical KPIs: Total shipments this month with month-over-month comparison, your overall compliance rate, duty savings achieved through Free Trade Agreement optimization, and open compliance exceptions requiring attention.',
      10
    )

    await pause(page, 5)

    addVoiceover(
      'Animated Metrics',
      'Notice how the numbers animate on load - this provides visual feedback and draws attention to changes. The color-coded arrows indicate trends compared to the previous period.',
      7
    )

    await pause(page, 3)
    await slowScroll(page, 350)

    addVoiceover(
      'Shipment Analytics',
      'The 30-day shipment trend chart shows your daily shipment volume overlaid with compliance rates. This helps identify patterns and potential issues before they become problems.',
      8
    )

    await pause(page, 4)
    await slowScroll(page, 300)

    addVoiceover(
      'Duty Cost Analysis',
      'The duty costs breakdown shows your top destination countries and associated duty expenses. This visualization helps identify opportunities for route optimization and cost reduction.',
      8
    )

    await pause(page, 4)

    // ==========================================
    // SHIPMENTS MODULE (1:30 - 2:15)
    // ==========================================
    addVoiceover(
      'Shipments Module',
      'Now let\'s dive into the Shipments module - the heart of your trade operations. Click on Shipments in the sidebar to access the full shipment management interface.',
      7
    )

    await highlightAndClick(page, 'text=Shipments')
    await page.waitForSelector('h1:has-text("Shipments")')
    await pause(page, 4)

    addVoiceover(
      'Shipment List View',
      'Here you see all your shipments in a comprehensive table view. Each row displays the reference number, trade route with country flags, product details, HS code classification, declared value, and current status.',
      9
    )

    await pause(page, 5)

    addVoiceover(
      'Status Indicators',
      'Notice the color-coded status badges: Blue for in-transit shipments, amber for pending clearance, green for cleared and compliant, and red for flagged items requiring immediate attention.',
      8
    )

    await pause(page, 4)

    addVoiceover(
      'Filtering and Search',
      'Use the filter buttons to quickly segment shipments by status. The search bar allows full-text search across all fields including reference numbers, product names, and trading partners.',
      7
    )

    await pause(page, 3)
    await slowScroll(page, 300)

    addVoiceover(
      'Shipment Details',
      'Each shipment contains detailed information including customs broker assignments, freight forwarder details, incoterms, estimated delivery dates, and complete compliance history.',
      7
    )

    await pause(page, 4)

    // ==========================================
    // HS CLASSIFIER - AI FEATURE (2:15 - 3:15)
    // ==========================================
    addVoiceover(
      'AI-Powered HS Classifier',
      'Now for TradeGuard\'s flagship feature - the AI-powered Harmonized System Code Classifier. This revolutionary tool uses OpenAI GPT-4 to automatically classify products with expert-level accuracy.',
      9
    )

    await highlightAndClick(page, 'text=HS Classifier')
    await page.waitForSelector('h1:has-text("HS Code")')
    await pause(page, 4)

    addVoiceover(
      'Classification Interface',
      'The interface is designed for speed and accuracy. Simply enter your product description in natural language - the more detail you provide, the more accurate the classification.',
      8
    )

    await pause(page, 3)

    // Fill in detailed product description
    const productDescription = `Industrial grade seamless stainless steel pipes for water treatment and desalination systems.
Material: AISI 316L stainless steel
Outer diameter: 50mm
Wall thickness: 3mm
Length: 6 meters
Surface finish: Polished
Pressure rating: PN16
Manufactured in India for export to European Union`

    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible()) {
      await textarea.fill(productDescription)
      await pause(page, 3)
    }

    addVoiceover(
      'Detailed Product Input',
      'We\'ve entered a detailed description of industrial stainless steel pipes. The AI considers material composition, dimensions, intended use, manufacturing origin, and destination market to determine the correct classification.',
      9
    )

    await pause(page, 4)

    addVoiceover(
      'AI Classification Process',
      'When you click Classify, the AI analyzes your product against the entire Harmonized System nomenclature - over 5,000 product categories used in international trade worldwide.',
      8
    )

    // Try to submit
    const classifyButton = page.locator('button:has-text("Classify")').first()
    if (await classifyButton.isVisible()) {
      await classifyButton.click()
      await pause(page, 6)

      addVoiceover(
        'Classification Results',
        'The AI returns a suggested HS code with a confidence score. Green indicates high confidence above 80%, amber for moderate confidence, and red for classifications that may need expert review.',
        8
      )

      await pause(page, 4)

      addVoiceover(
        'AI Reasoning',
        'Importantly, the AI provides its reasoning - explaining why it chose this classification. This transparency helps compliance teams validate decisions and provides documentation for customs audits.',
        8
      )

      await pause(page, 4)
    } else {
      await pause(page, 4)
    }

    addVoiceover(
      'Classification History',
      'All classifications are automatically saved and can be accepted or rejected. This creates a knowledge base that improves over time and provides audit trail for compliance purposes.',
      7
    )

    await slowScroll(page, 300)
    await pause(page, 3)

    // ==========================================
    // DUTY CALCULATOR (3:15 - 3:55)
    // ==========================================
    addVoiceover(
      'Duty Calculator',
      'Next, let\'s explore the Duty Calculator - your tool for calculating landed costs across any trade route. Understanding total costs is critical for pricing and profitability.',
      8
    )

    await highlightAndClick(page, 'text=Duty Calculator')
    await page.waitForSelector('h1:has-text("Duty")')
    await pause(page, 4)

    addVoiceover(
      'Landed Cost Calculation',
      'Enter the origin country, destination, HS code, and declared value. TradeGuard calculates import duties, VAT or GST, and any additional fees to give you the complete landed cost.',
      8
    )

    await pause(page, 4)

    addVoiceover(
      'Free Trade Agreement Optimization',
      'The calculator automatically identifies applicable Free Trade Agreements between the origin and destination countries. It shows potential duty savings - often significant amounts that directly impact your bottom line.',
      9
    )

    await pause(page, 4)

    addVoiceover(
      'WTO Valuation Methods',
      'TradeGuard supports all WTO customs valuation methods including transaction value, identical goods, similar goods, and computed value - ensuring compliance with international customs regulations.',
      8
    )

    await pause(page, 3)

    // ==========================================
    // DENIED PARTY SCREENING (3:55 - 4:35)
    // ==========================================
    addVoiceover(
      'Denied Party Screening',
      'Compliance with export controls and sanctions is non-negotiable. The Denied Party Screening module protects your business from inadvertently trading with restricted entities.',
      8
    )

    await highlightAndClick(page, 'text=Denied Party')
    await page.waitForSelector('h1:has-text("Denied Party")')
    await pause(page, 4)

    addVoiceover(
      'Global Watchlist Coverage',
      'TradeGuard screens against all major restricted party lists including the US OFAC SDN List, BIS Entity List, UN Security Council Sanctions, and EU Consolidated List - covering over 50,000 restricted entities.',
      9
    )

    await pause(page, 4)

    // Try to demonstrate screening
    const partyInput = page.locator('input').first()
    if (await partyInput.isVisible()) {
      await partyInput.fill('Volkov Trading LLC')
      await pause(page, 2)

      addVoiceover(
        'Real-Time Screening',
        'Let\'s screen a company name. The system searches across all databases using fuzzy matching to catch aliases and spelling variations that might be used to evade detection.',
        8
      )

      const screenButton = page.locator('button:has-text("Screen")').first()
      if (await screenButton.isVisible()) {
        await screenButton.click()
        await pause(page, 5)

        addVoiceover(
          'Match Detection',
          'A match has been found! The system displays the matched list, risk level, and detailed information about why this entity is restricted. Critical matches like this trigger immediate alerts to compliance officers.',
          9
        )

        await pause(page, 4)
      }
    }

    addVoiceover(
      'Screening History',
      'Every screening is logged with timestamps and results, creating a complete audit trail that demonstrates your due diligence in compliance with export control regulations.',
      7
    )

    await pause(page, 3)

    // ==========================================
    // DOCUMENTS & COMPLIANCE (4:35 - 5:00)
    // ==========================================
    addVoiceover(
      'Trade Documents',
      'The Documents module centralizes all your customs paperwork. Generate commercial invoices, packing lists, certificates of origin, and bills of lading - all pre-populated from your shipment data.',
      8
    )

    await highlightAndClick(page, 'text=Documents')
    await page.waitForSelector('h1:has-text("Documents")')
    await pause(page, 4)

    addVoiceover(
      'Document Management',
      'Track document status from draft through generation, submission, and approval. Linked documents are automatically associated with their shipments for easy reference.',
      7
    )

    await pause(page, 3)

    // Compliance module
    addVoiceover(
      'Compliance Management',
      'The Compliance module tracks exceptions, manages resolution workflows, and maintains your compliance posture. Let\'s take a quick look.',
      6
    )

    await highlightAndClick(page, 'text=Compliance')
    await page.waitForSelector('h1:has-text("Compliance")')
    await pause(page, 4)

    addVoiceover(
      'Exception Tracking',
      'Compliance exceptions are categorized by severity and assigned to team members. Each exception includes full context, resolution steps, and audit history.',
      7
    )

    await pause(page, 3)

    // Audit Log
    addVoiceover(
      'Complete Audit Trail',
      'Every action in TradeGuard is logged in the Audit module. This comprehensive trail provides evidence for regulatory audits and supports your compliance program.',
      7
    )

    await highlightAndClick(page, 'text=Audit')
    await page.waitForSelector('h1:has-text("Audit")')
    await pause(page, 4)

    // ==========================================
    // SETTINGS & ROLES (5:00 - 5:25)
    // ==========================================
    addVoiceover(
      'Team Management',
      'Finally, let\'s look at team management. TradeGuard\'s role-based access control ensures the right people have access to the right features.',
      7
    )

    await highlightAndClick(page, 'text=Settings')
    await page.waitForSelector('h1:has-text("Settings")')
    await pause(page, 3)

    const teamTab = page.locator('button:has-text("Team")')
    if (await teamTab.isVisible()) {
      await teamTab.click()
      await pause(page, 4)

      addVoiceover(
        'Role-Based Access Control',
        'Administrators can invite team members and assign roles. Four role levels provide granular control: Admin for full access, Manager for operations, Analyst for data and reports, and Viewer for dashboards only.',
        9
      )

      await pause(page, 4)
    }

    addVoiceover(
      'Enterprise Security',
      'TradeGuard implements enterprise security best practices including encrypted data at rest and in transit, session management, and comprehensive access logging.',
      7
    )

    await pause(page, 3)

    // ==========================================
    // CLOSING (5:25 - 5:45)
    // ==========================================
    addVoiceover(
      'Return to Dashboard',
      'Let\'s return to the dashboard for our closing overview.',
      4
    )

    await highlightAndClick(page, 'text=Dashboard')
    await pause(page, 4)

    addVoiceover(
      'Conclusion',
      'That concludes our tour of TradeGuard. You\'ve seen how the platform combines AI-powered classification, automated duty calculations, comprehensive compliance screening, and enterprise-grade security.',
      9
    )

    await pause(page, 4)

    addVoiceover(
      'Call to Action',
      'TradeGuard simplifies global trade compliance for mid-market businesses. Whether you\'re managing dozens or thousands of shipments, TradeGuard scales with your needs. Thank you for watching, and we look forward to helping you streamline your trade operations.',
      12
    )

    await pause(page, 6)

    console.log('\n🎬 Demo recording completed!')
  })
})
