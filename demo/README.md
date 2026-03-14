# TradeGuard Demo Recording

Automated 5+ minute demo recording with Playwright for screen capture and voiceover script generation.

## Quick Start

### 1. Run Demo Against Production
```bash
npm run demo
```

### 2. Run Demo Against Local
```bash
npm run dev  # In one terminal
npm run demo:local  # In another terminal
```

## Output

After running the demo, you'll find:

- **Video**: `demo/videos/` - Full 1080p screen recording (~5:30)
- **Voiceover Script**: `demo/scripts/VOICEOVER_SCRIPT.md` - Timestamped narration
- **JSON Script**: `demo/scripts/voiceover-script.json` - Machine-readable format

## Demo Flow (33 Scenes, ~5:30)

| Time | Scene | Duration |
|------|-------|----------|
| 00:00 | Landing Page | 8s |
| 00:08 | Login Page | 4s |
| 00:12 | Authentication | 5s |
| 00:17 | Dashboard | 7s |
| 00:24 | Dashboard Stats | 6s |
| 00:30 | Shipments Module | 5s |
| 00:35 | Shipment List | 7s |
| 00:42 | AI HS Classifier | 7s |
| 00:49 | Product Classification | 6s |
| 00:55 | AI Processing | 6s |
| 01:01 | Classification Result | 7s |
| 01:08 | Duty Calculator | 6s |
| 01:14 | Landed Cost Calculation | 6s |
| 01:20 | FTA Optimization | 6s |
| 01:26 | Denied Party Screening | 7s |
| 01:33 | Risk Assessment | 7s |
| 01:40 | Trade Documents | 5s |
| 01:45 | Compliance Management | 5s |
| 01:50 | Audit Trail | 5s |
| 01:55 | Settings & Team | 4s |
| 01:59 | Role-Based Access | 8s |
| 02:07 | Conclusion | 10s |

**Total Runtime: ~2:30**

## Customization

### Change Demo URL
```bash
DEMO_URL=https://your-app.vercel.app npm run demo
```

### Slow Down Actions
Edit `playwright.config.ts`:
```ts
launchOptions: {
  slowMo: 1000,  // Increase for slower demo
}
```

### Modify Narration
Edit `demo/tradeguard-demo.spec.ts` and update `addVoiceover()` calls.

## Creating Final Video

1. Run the demo to generate video and script
2. Import video into video editor (Final Cut, Premiere, DaVinci)
3. Record voiceover using the generated script
4. Sync audio with video using timestamps

## Tips for Recording

- Close unnecessary apps to free memory
- Use a clean browser profile
- Ensure good network connection for smooth animations
- Run demo once without recording to warm up the app
