#!/usr/bin/env node

/**
 * Add AI-generated voiceover to demo video
 * Uses OpenAI TTS API to generate speech from the voiceover script
 * Audio is perfectly synced because video timing matches audio duration
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')

const OUTPUT_DIR = path.join(__dirname, 'output')
const AUDIO_DIR = path.join(__dirname, 'audio')

// Voiceover scenes - text only (timing is automatic)
const VOICEOVER_SCENES = [
  { start: 0, duration: 10, text: "Welcome to TradeGuard - the next-generation global trade compliance and customs management platform. Built for mid-market manufacturers and distributors who need enterprise-grade compliance without enterprise complexity." },
  { start: 10, duration: 8, text: "TradeGuard combines AI-powered HS code classification, automated duty calculations, denied party screening, and comprehensive compliance management - all in one integrated platform." },
  { start: 18, duration: 8, text: "Let's log into the platform. TradeGuard uses enterprise-grade authentication powered by Supabase, with support for single sign-on, two-factor authentication, and role-based access control." },
  { start: 26, duration: 7, text: "We're logging in with our demo account. In production, your organization can configure custom authentication providers including Google, Microsoft, and SAML-based identity providers." },
  { start: 33, duration: 7, text: "TradeGuard supports four user roles: Administrator with full system access, Compliance Manager for operations, Trade Analyst for reporting, and Viewer for read-only dashboards." },
  { start: 40, duration: 7, text: "Welcome to the TradeGuard dashboard. This is your command center for global trade compliance. Let's explore the key metrics and visualizations." },
  { start: 47, duration: 10, text: "At the top, you see four critical KPIs: Total shipments this month, your overall compliance rate, duty savings achieved through Free Trade Agreement optimization, and open compliance exceptions requiring attention." },
  { start: 57, duration: 7, text: "Notice how the numbers animate on load - this provides visual feedback and draws attention to changes. The color-coded arrows indicate trends compared to the previous period." },
  { start: 64, duration: 8, text: "The shipment trend chart shows your daily shipment volume overlaid with compliance rates. This helps identify patterns and potential issues before they become problems." },
  { start: 72, duration: 8, text: "The duty costs breakdown shows your top destination countries and associated duty expenses. This visualization helps identify opportunities for route optimization and cost reduction." },
  { start: 80, duration: 7, text: "Now let's dive into the Shipments module - the heart of your trade operations. Click on Shipments in the sidebar to access the full shipment management interface." },
  { start: 87, duration: 9, text: "Here you see all your shipments in a comprehensive table view. Each row displays the reference number, trade route with country flags, product details, HS code classification, declared value, and current status." },
  { start: 96, duration: 8, text: "Notice the color-coded status badges: Blue for in-transit shipments, amber for pending clearance, green for cleared and compliant, and red for flagged items requiring immediate attention." },
  { start: 104, duration: 7, text: "Use the filter buttons to quickly segment shipments by status. The search bar allows full-text search across all fields including reference numbers, product names, and trading partners." },
  { start: 111, duration: 7, text: "Each shipment contains detailed information including customs broker assignments, freight forwarder details, incoterms, estimated delivery dates, and complete compliance history." },
  { start: 118, duration: 9, text: "Now for TradeGuard's flagship feature - the AI-powered Harmonized System Code Classifier. This revolutionary tool uses OpenAI GPT-4 to automatically classify products with expert-level accuracy." },
  { start: 127, duration: 8, text: "The interface is designed for speed and accuracy. Simply enter your product description in natural language - the more detail you provide, the more accurate the classification." },
  { start: 135, duration: 9, text: "We've entered a detailed description of industrial stainless steel pipes. The AI considers material composition, dimensions, intended use, manufacturing origin, and destination market to determine the correct classification." },
  { start: 144, duration: 8, text: "When you click Classify, the AI analyzes your product against the entire Harmonized System nomenclature - over 5,000 product categories used in international trade worldwide." },
  { start: 152, duration: 8, text: "The AI returns a suggested HS code with a confidence score. Green indicates high confidence above 80%, amber for moderate confidence, and red for classifications that may need expert review." },
  { start: 160, duration: 8, text: "Importantly, the AI provides its reasoning - explaining why it chose this classification. This transparency helps compliance teams validate decisions and provides documentation for customs audits." },
  { start: 168, duration: 7, text: "All classifications are automatically saved and can be accepted or rejected. This creates a knowledge base that improves over time and provides audit trail for compliance purposes." },
  { start: 175, duration: 8, text: "Next, let's explore the Duty Calculator - your tool for calculating landed costs across any trade route. Understanding total costs is critical for pricing and profitability." },
  { start: 183, duration: 8, text: "Enter the origin country, destination, HS code, and declared value. TradeGuard calculates import duties, VAT or GST, and any additional fees to give you the complete landed cost." },
  { start: 191, duration: 9, text: "The calculator automatically identifies applicable Free Trade Agreements between the origin and destination countries. It shows potential duty savings - often significant amounts that directly impact your bottom line." },
  { start: 200, duration: 8, text: "TradeGuard supports all WTO customs valuation methods including transaction value, identical goods, similar goods, and computed value - ensuring compliance with international customs regulations." },
  { start: 208, duration: 8, text: "Compliance with export controls and sanctions is non-negotiable. The Denied Party Screening module protects your business from inadvertently trading with restricted entities." },
  { start: 216, duration: 9, text: "TradeGuard screens against all major restricted party lists including the US OFAC SDN List, BIS Entity List, UN Security Council Sanctions, and EU Consolidated List - covering over 50,000 restricted entities." },
  { start: 225, duration: 8, text: "Let's screen a company name. The system searches across all databases using fuzzy matching to catch aliases and spelling variations that might be used to evade detection." },
  { start: 233, duration: 9, text: "A match has been found! The system displays the matched list, risk level, and detailed information about why this entity is restricted. Critical matches like this trigger immediate alerts to compliance officers." },
  { start: 242, duration: 7, text: "Every screening is logged with timestamps and results, creating a complete audit trail that demonstrates your due diligence in compliance with export control regulations." },
  { start: 249, duration: 8, text: "The Documents module centralizes all your customs paperwork. Generate commercial invoices, packing lists, certificates of origin, and bills of lading - all pre-populated from your shipment data." },
  { start: 257, duration: 7, text: "Track document status from draft through generation, submission, and approval. Linked documents are automatically associated with their shipments for easy reference." },
  { start: 264, duration: 6, text: "The Compliance module tracks exceptions, manages resolution workflows, and maintains your compliance posture. Let's take a quick look." },
  { start: 270, duration: 7, text: "Compliance exceptions are categorized by severity and assigned to team members. Each exception includes full context, resolution steps, and audit history." },
  { start: 277, duration: 7, text: "Every action in TradeGuard is logged in the Audit module. This comprehensive trail provides evidence for regulatory audits and supports your compliance program." },
  { start: 284, duration: 7, text: "Finally, let's look at team management. TradeGuard's role-based access control ensures the right people have access to the right features." },
  { start: 291, duration: 9, text: "Administrators can invite team members and assign roles. Four role levels provide granular control: Admin for full access, Manager for operations, Analyst for data and reports, and Viewer for dashboards only." },
  { start: 300, duration: 7, text: "TradeGuard implements enterprise security best practices including encrypted data at rest and in transit, session management, and comprehensive access logging." },
  { start: 307, duration: 4, text: "Let's return to the dashboard for our closing overview." },
  { start: 311, duration: 9, text: "That concludes our tour of TradeGuard. You've seen how the platform combines AI-powered classification, automated duty calculations, comprehensive compliance screening, and enterprise-grade security." },
  { start: 320, duration: 12, text: "TradeGuard simplifies global trade compliance for mid-market businesses. Whether you're managing dozens or thousands of shipments, TradeGuard scales with your needs. Thank you for watching, and we look forward to helping you streamline your trade operations." },
]

// Create directories
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

async function generateAudio(openai, text, outputPath, index) {
  console.log(`  Generating audio ${index + 1}/${VOICEOVER_SCENES.length}...`)

  const response = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'onyx', // Professional male voice
    input: text,
    speed: 1.0,
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)

  return outputPath
}

async function main() {
  console.log('🎙️  TradeGuard Demo Voiceover Generator')
  console.log('=======================================\n')

  // Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env.local')
    process.exit(1)
  }
  console.log('✓ OpenAI API key found')

  const openai = new OpenAI({ apiKey })

  // Find the latest MP4 video
  const mp4Files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.mp4') && !f.includes('-with-voiceover'))
    .sort()
    .reverse()

  if (mp4Files.length === 0) {
    console.error('❌ No MP4 video found in demo/output/')
    console.log('   Run the demo first: npm run demo')
    process.exit(1)
  }

  const videoPath = path.join(OUTPUT_DIR, mp4Files[0])
  console.log(`✓ Found video: ${mp4Files[0]}`)

  // Generate audio for each scene
  console.log('\n🎙️  Generating voiceover audio...\n')

  const audioFiles = []
  for (let i = 0; i < VOICEOVER_SCENES.length; i++) {
    const scene = VOICEOVER_SCENES[i]
    const audioPath = path.join(AUDIO_DIR, `scene_${String(i).padStart(2, '0')}.mp3`)

    // Skip if already generated
    if (fs.existsSync(audioPath)) {
      console.log(`  Scene ${i + 1}: Using cached audio`)
      audioFiles.push({ ...scene, audioPath })
      continue
    }

    await generateAudio(openai, scene.text, audioPath, i)
    audioFiles.push({ ...scene, audioPath })

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100))
  }

  console.log('\n✓ All audio generated!')

  // Create FFmpeg concat file - no silence needed, video is synced to audio
  console.log('\n🎬 Merging audio with video...')

  const concatFilePath = path.join(AUDIO_DIR, 'concat.txt')
  let concatContent = ''

  // Simply concatenate all audio files in order
  for (let i = 0; i < audioFiles.length; i++) {
    concatContent += `file '${audioFiles[i].audioPath}'\n`
  }

  fs.writeFileSync(concatFilePath, concatContent)

  // Concatenate all audio files
  const fullAudioPath = path.join(AUDIO_DIR, 'full_voiceover.mp3')
  execSync(`ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c:a libmp3lame -q:a 2 -y "${fullAudioPath}" 2>/dev/null`, { stdio: 'pipe' })
  console.log('✓ Audio track created')

  // Merge audio with video
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outputPath = path.join(OUTPUT_DIR, `TradeGuard-Demo-${timestamp}-with-voiceover.mp4`)

  execSync(`ffmpeg -i "${videoPath}" -i "${fullAudioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest -y "${outputPath}"`, { stdio: 'inherit' })

  console.log('\n✅ Voiceover added successfully!')
  console.log(`📁 Output: ${outputPath}`)

  // Get file size
  const outputSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)
  console.log(`📊 Size: ${outputSize} MB`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
