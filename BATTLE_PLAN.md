# ⚔️ TRADEGUARD BATTLE PLAN
# AI Mahakurukshetra 2026 | March 14 | 10 Hours

---

## ✅ TONIGHT (March 13) — Non-negotiable

- [ ] `npm install -g @anthropic-ai/claude-code` → `claude --version` works
- [ ] `mkdir tradeguard && cd tradeguard && git init`
- [ ] Drop CLAUDE.md into the tradeguard folder
- [ ] Create `.env.local` template (fill actual keys when you have them):
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  OPENAI_API_KEY=
  ```
- [ ] Create Supabase project → save 3 keys
- [ ] Product Hunt account created (Bacancy email, real photo, 10 follows)
- [ ] When GitHub repo link arrives: `git remote add origin [url]`
- [ ] Loom installed and tested for screen recording
- [ ] Read VIDEO_AND_PH_KIT.md → fill in TradeGuard details tonight

---

## ⏱️ 10-HOUR BREAKDOWN

---

### 0:00–0:05 | IGNITION
```bash
# .env.local already has Supabase keys + OpenAI key

cd tradeguard
claude --dangerously-skip-permissions
```

---

### 0:05–0:40 | PHASE 1 — SCAFFOLD
Fire Phase 1 prompt. Let Claude Code run fully.

While it runs:
- Open Supabase SQL Editor in browser (ready to paste SQL)
- Keep CLAUDE.md open in a separate editor for reference

When done:
- [ ] Paste all SQL into Supabase SQL Editor → Run
- [ ] `npm run dev` → localhost:3000 loads ✓
- [ ] Login page shows Shield icon + TradeGuard branding ✓
- [ ] Dashboard shell renders with sidebar ✓

`git add . && git commit -m "feat: scaffold complete"`

---

### 0:40–1:10 | AUTH VERIFICATION
- [ ] Sign up → redirects to /dashboard ✓
- [ ] Login → works ✓
- [ ] Go to /dashboard without auth → redirects to /login ✓
- [ ] Supabase Auth > Users shows your test user ✓

`git add . && git commit -m "feat: auth working"`

---

### 1:10–2:10 | PHASE 2A — SHIPMENTS
Fire Phase 2A prompt.

Test:
- [ ] Create shipment → appears in table ✓
- [ ] Reference number auto-generates in TG-2026-XXXXX format ✓
- [ ] Status badge colors correct ✓
- [ ] Search filters work ✓
- [ ] Route shows flag → flag ✓
- [ ] Edit and delete work ✓
- [ ] Empty state shows when no shipments ✓

`git add . && git commit -m "feat: shipments CRUD complete"`

---

### 2:10–3:10 | PHASE 2B — HS CLASSIFIER ⭐ (KILLER FEATURE)
Fire Phase 2B prompt.

Test:
- [ ] Fill form → click "Classify with AI" ✓
- [ ] Loading scanning animation shows ✓
- [ ] OpenAI API returns HS code ✓ (check .env.local has OPENAI_API_KEY)
- [ ] Confidence bar animates from 0 to result % ✓
- [ ] Color correct: >80% emerald, 60-80% amber, <60% red ✓
- [ ] "Accept Classification" saves to DB ✓
- [ ] History table shows past classifications ✓

Test with: "Pharmaceutical tablets containing amoxicillin, manufactured in India, for treating bacterial infections"
Expected: HS 3004.10 or similar with high confidence

`git add . && git commit -m "feat: AI HS classifier working"`

---

### 3:10–4:10 | PHASE 2C — DUTY CALCULATOR
Fire Phase 2C prompt.

Test:
- [ ] Select India → USA, HS 3004.90, $10,000 USD ✓
- [ ] Results show line-by-line breakdown ✓
- [ ] CountUp animates on all numbers ✓
- [ ] FTA section shows when applicable ✓
- [ ] Savings highlighted in emerald ✓
- [ ] History saves to DB ✓

`git add . && git commit -m "feat: duty calculator complete"`

---

### 4:10–4:40 | PHASE 2D — DENIED PARTY SCREENING
Fire Phase 2D prompt.

Test:
- [ ] Search "Volkov Trading" → shows MATCH in red, pulsing ✓
- [ ] Search "Tata Global" → shows CLEAR in emerald ✓
- [ ] Animation: MATCH pulses 3x red, CLEAR pulses once green ✓
- [ ] History saves to DB ✓

`git add . && git commit -m "feat: denied party screening complete"`

---

### 4:40–5:10 | SEED DATA
```bash
npx tsx scripts/seed.ts
```

Verify in browser:
- [ ] Dashboard stats: 142 shipments, 94.2%, ₹8,42,000 savings, 7 exceptions ✓
- [ ] Chart shows 30-day curve with weekend dips ✓
- [ ] Shipments table: 35 records with realistic Indian company names ✓
- [ ] HS Classifier history: 15 records with varying confidence ✓
- [ ] Denied party history: mix of CLEAR and MATCH results ✓
- [ ] Everything looks like a REAL compliance platform ✓

`git add . && git commit -m "data: 35 shipments + full seed data"`

---

### 5:10–6:30 | PHASE 3 — POLISH
Fire Phase 3 prompt.

Manually check during polish:
- [ ] Landing page at / looks enterprise-grade ✓
- [ ] Landing page comparison table (TradeGuard vs Descartes) renders well ✓
- [ ] Every page at 375px — no overflow, no tiny text ✓
- [ ] Dark mode: all pages consistent ✓
- [ ] Every stat card animating with CountUp ✓
- [ ] Documents and Compliance pages work (if time permits) ✓

`git add . && git commit -m "polish: landing page + mobile + animations"`

---

### 6:30–7:00 | PHASE 4 — SECURITY
Fire Phase 4 prompt.

Manual checks:
- [ ] `cat .gitignore | grep env` → shows .env.local ✓
- [ ] Supabase Table Editor → all tables show RLS badge ON ✓
- [ ] Open incognito → try /dashboard → redirects to /login ✓
- [ ] Check no OPENAI_API_KEY in any client file ✓

`git add . && git commit -m "security: audit complete"`

---

### 7:00–7:30 | DEPLOY
```bash
git push origin main
```

Vercel:
1. vercel.com → Add New Project → import tradeguard repo
2. Add env vars:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY  ← critical for HS Classifier
3. Deploy → wait for build

If build fails: paste full log into Claude Code → "Fix build, don't change logic"

Live URL checks:
- [ ] App loads ✓
- [ ] Login with demo@tradeguard.com / demo1234 ✓
- [ ] Dashboard shows seed data ✓
- [ ] HS Classifier calls OpenAI API live ✓ (test it on live URL!)
- [ ] Denied party MATCH animation works ✓
- [ ] Mobile view on phone ✓

---

### 7:30–8:30 | RECORD VIDEO
Use VIDEO_AND_PH_KIT.md script. TradeGuard-specific flow:

Hook (0:00–0:30):
"Businesses lose millions every year to wrong HS codes, missed FTA benefits, and compliance violations. 
Descartes costs $50k+ a year. TradeGuard gives you the same power, powered by Claude AI, in a modern interface."

Demo flow (0:30–2:30):
1. Dashboard → point out live stats (142 shipments, ₹8.4L savings)
2. HS Classifier → type "pharmaceutical tablets containing amoxicillin" → watch AI classify → confidence bar animates
3. Duty Calculator → India→USA, $10,000, show FTA savings
4. Denied Party → search "Volkov Trading" → red MATCH animation
5. Shipments → show the table, create one live

Tech section (2:30–3:30): Next.js + Supabase + Claude AI + Vercel

Why better (3:30–4:30):
"Descartes is a legacy system built in the 2000s. TradeGuard is AI-native, cloud-native, and actually usable."

CTA (4:30–5:00): Bacancy CTA from VIDEO_AND_PH_KIT.md

---

### 8:30–9:00 | SUBMIT
- [ ] GitHub repo URL
- [ ] Vercel live URL
- [ ] Google Drive video link
- [ ] Product Hunt listing URL

---

### 9:00–10:00 | BUFFER + PH PREP
- [ ] Fix anything on live URL
- [ ] Bacancy Slack message for upvotes
- [ ] PH maker comment written and ready
- [ ] Final check on phone

---

## 🚨 EMERGENCY PROTOCOLS

| Problem | Action |
|---|---|
| OpenAI API failing in production | Check OPENAI_API_KEY is set in Vercel env vars |
| HS Classifier returning bad JSON | Add try/catch + JSON.parse in the API route |
| Supabase RLS blocking queries | "Fix RLS policy for [table] — user is authenticated but query returns empty" |
| Build failing on Vercel | Paste full log → "Fix build only" |
| Running out of time | Cut Documents + Compliance pages. Keep: Dashboard + Shipments + HS Classifier + Duty Calc + Denied Party |
| 20+ min stuck | Troubleshooter chat + paste here |
