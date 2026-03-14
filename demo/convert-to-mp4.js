#!/usr/bin/env node

/**
 * Convert WebM videos to MP4 format
 * Uses FFmpeg (installed with Playwright)
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const VIDEOS_DIR = path.join(__dirname, 'videos')
const OUTPUT_DIR = path.join(__dirname, 'output')

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Find FFmpeg path (prefer system ffmpeg for full codec support)
function findFFmpeg() {
  // First try system ffmpeg (has full codec support)
  try {
    const systemPath = execSync('which ffmpeg', { encoding: 'utf-8' }).trim()
    if (systemPath) {
      return systemPath
    }
  } catch {
    // System ffmpeg not found
  }

  // Fallback to Playwright's ffmpeg (limited codecs)
  const playwrightCache = path.join(
    process.env.HOME || '',
    'Library/Caches/ms-playwright'
  )

  try {
    const ffmpegDirs = fs.readdirSync(playwrightCache)
      .filter(d => d.startsWith('ffmpeg'))
      .sort()
      .reverse()

    if (ffmpegDirs.length > 0) {
      const ffmpegDir = path.join(playwrightCache, ffmpegDirs[0])
      const possibleNames = ['ffmpeg', 'ffmpeg-mac', 'ffmpeg-linux', 'ffmpeg.exe']

      for (const name of possibleNames) {
        const ffmpegPath = path.join(ffmpegDir, name)
        if (fs.existsSync(ffmpegPath)) {
          return ffmpegPath
        }
      }
    }
  } catch (e) {
    // Playwright cache not found
  }

  return null
}

// Find all WebM files recursively
function findWebMFiles(dir) {
  const files = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...findWebMFiles(fullPath))
    } else if (item.name.endsWith('.webm')) {
      files.push(fullPath)
    }
  }

  return files
}

// Convert WebM to MP4
function convertToMP4(inputPath, ffmpegPath) {
  const filename = path.basename(inputPath, '.webm')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outputPath = path.join(OUTPUT_DIR, `TradeGuard-Demo-${timestamp}.mp4`)

  console.log(`\n🎬 Converting: ${path.basename(inputPath)}`)
  console.log(`📁 Output: ${outputPath}`)

  try {
    // FFmpeg command for high-quality MP4
    // -c:v libx264 - Use H.264 codec (widely compatible)
    // -preset slow - Better compression
    // -crf 18 - High quality (lower = better, 18 is visually lossless)
    // -c:a aac - AAC audio codec
    // -movflags +faststart - Enable streaming
    const cmd = `"${ffmpegPath}" -i "${inputPath}" -c:v libx264 -preset slow -crf 18 -c:a aac -movflags +faststart -y "${outputPath}"`

    execSync(cmd, { stdio: 'inherit' })

    // Get file sizes
    const inputSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)
    const outputSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)

    console.log(`✅ Converted successfully!`)
    console.log(`   WebM: ${inputSize} MB → MP4: ${outputSize} MB`)

    return outputPath
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`)
    return null
  }
}

// Main
async function main() {
  console.log('🎥 TradeGuard Demo Video Converter')
  console.log('===================================\n')

  // Find FFmpeg
  const ffmpegPath = findFFmpeg()
  if (!ffmpegPath) {
    console.error('❌ FFmpeg not found! Install it or run: npx playwright install')
    process.exit(1)
  }
  console.log(`✓ FFmpeg found: ${ffmpegPath}`)

  // Find WebM files
  const webmFiles = findWebMFiles(VIDEOS_DIR)

  if (webmFiles.length === 0) {
    console.log('\n⚠️  No WebM files found in demo/videos/')
    console.log('   Run the demo first: npm run demo')
    process.exit(0)
  }

  console.log(`\n📹 Found ${webmFiles.length} video(s) to convert`)

  // Convert each file
  const converted = []
  for (const webm of webmFiles) {
    const mp4 = convertToMP4(webm, ffmpegPath)
    if (mp4) {
      converted.push(mp4)
    }
  }

  // Summary
  console.log('\n===================================')
  console.log(`🎉 Conversion complete!`)
  console.log(`   Converted: ${converted.length}/${webmFiles.length} videos`)
  console.log(`\n📁 Output folder: ${OUTPUT_DIR}`)

  if (converted.length > 0) {
    console.log('\n📹 Generated files:')
    converted.forEach(f => console.log(`   - ${path.basename(f)}`))
  }
}

main().catch(console.error)
