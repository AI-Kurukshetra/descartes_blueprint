#!/usr/bin/env node

/**
 * Get actual duration of each audio file using FFprobe
 * Outputs a JSON file with scene timings
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const AUDIO_DIR = path.join(__dirname, 'audio')
const OUTPUT_FILE = path.join(__dirname, 'scene-timings.json')

function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf-8' }
    )
    return parseFloat(result.trim())
  } catch (e) {
    return 0
  }
}

function main() {
  console.log('📊 Getting audio durations...\n')

  const scenes = []
  let totalDuration = 0

  // Get all scene audio files
  const audioFiles = fs.readdirSync(AUDIO_DIR)
    .filter(f => f.startsWith('scene_') && f.endsWith('.mp3'))
    .sort()

  for (const file of audioFiles) {
    const filePath = path.join(AUDIO_DIR, file)
    const duration = getAudioDuration(filePath)
    const index = parseInt(file.replace('scene_', '').replace('.mp3', ''))

    scenes.push({
      index,
      file,
      duration: Math.ceil(duration * 1000), // Convert to ms and round up
      durationSeconds: duration
    })

    totalDuration += duration
    console.log(`  Scene ${index + 1}: ${duration.toFixed(2)}s`)
  }

  // Write timings file
  const output = {
    totalDuration: totalDuration,
    totalDurationFormatted: `${Math.floor(totalDuration / 60)}:${Math.floor(totalDuration % 60).toString().padStart(2, '0')}`,
    scenes
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))

  console.log(`\n✅ Total duration: ${output.totalDurationFormatted}`)
  console.log(`📁 Saved to: ${OUTPUT_FILE}`)
}

main()
