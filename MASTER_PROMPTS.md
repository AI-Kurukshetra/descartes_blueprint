# 🚀 TRADEGUARD — MASTER CLAUDE CODE PROMPTS
# All brackets filled. Fire Phase 1 first thing on hackathon day.
# Launch: claude --dangerously-skip-permissions

---

## ══════════════════════════════════════
## PHASE 1 — FULL SCAFFOLD (Hour 0–0:35)
## ══════════════════════════════════════

```
Read CLAUDE.md completely before writing any code.

PROJECT:
- Name: TradeGuard
- Tagline: Global trade compliance, simplified.
- Description: A SaaS platform for mid-market manufacturers and distributors to manage customs compliance — AI-powered HS code classification, duty calculation, denied party screening, and shipment tracking.
- Alternative to: Descartes Global Trade Intelligence
- Target user: Trade compliance managers and operations teams

Execute every step fully before the next. Do not skip any step.

STEP 1 — INITIALIZE
Run: npx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*"

STEP 2 — INSTALL ALL DEPENDENCIES
Run: npm install @supabase/supabase-js @supabase/ssr openai framer-motion lucide-react recharts react-hook-form @hookform/resolvers zod sonner react-countup date-fns clsx tailwind-merge @faker-js/faker tsx

STEP 3 — SHADCN SETUP
Run: npx shadcn@latest init
Choose: Default style, zinc base color, yes to CSS variables
Then install components:
npx shadcn@latest add button card input label badge avatar dropdown-menu sheet skeleton separator tabs dialog select table tooltip progress switch textarea

STEP 4 — FOLDER STRUCTURE
Create all folders and placeholder files per the project structure in CLAUDE.md.

STEP 5 — SUPABASE SETUP
Create lib/supabase/client.ts using createBrowserClient from @supabase/ssr
Create lib/supabase/server.ts using createServerClient from @supabase/ssr
Create middleware.ts: protect all /dashboard/* routes, redirect unauthenticated to /login

STEP 6 — AUTH PAGES

/app/(auth)/login/page.tsx:
- Centered card layout with TradeGuard logo (use Shield icon from lucide)
- "Global Trade Compliance" subtitle
- Email + password with React Hook Form + Zod
- Show/hide password toggle
- Loading spinner on submit
- Sonner toast on error
- Redirect to /dashboard on success
- Link to signup
- Framer Motion fade+slide entry animation
- Background: subtle grid pattern or gradient

/app/(auth)/signup/page.tsx:
- Full name + company name + email + password
- Same quality as login
- Redirect to /dashboard on success

STEP 7 — DASHBOARD SHELL

/app/(dashboard)/layout.tsx:
Sidebar (260px expanded, 64px collapsed, Framer Motion animated):
  Logo: Shield icon + "TradeGuard" text (hidden when collapsed)
  Nav items with icons:
    - Dashboard → LayoutDashboard icon → /dashboard
    - Shipments → Package icon → /dashboard/shipments
    - HS Classifier → Cpu icon → /dashboard/hs-classifier
    - Duty Calculator → Calculator icon → /dashboard/duty-calculator
    - Denied Party → ShieldAlert icon → /dashboard/denied-party
    - Documents → FileText icon → /dashboard/documents
    - Compliance → AlertTriangle icon → /dashboard/compliance
    - Audit Log → ScrollText icon → /dashboard/audit-log
    - Settings → Settings icon → /dashboard/settings
  Active item: bg-indigo-500/10 text-indigo-500 border-l-2 border-indigo-500
  Bottom: user avatar + name + company + logout button
  Mobile (<768px): sidebar becomes bottom tab bar showing 5 primary items

Top navbar:
  Left: hamburger (mobile) + breadcrumb showing current page
  Right: global search bar (cmd+K style, decorative) + bell icon + theme toggle + avatar dropdown
  Avatar dropdown: Profile, Company Settings, Logout

STEP 8 — DASHBOARD HOME (/app/(dashboard)/page.tsx)

PageWrapper with entry animation.

4 Stat cards (responsive grid: 1 col mobile → 2 col tablet → 4 col desktop):
  Card 1: "Shipments This Month" — Package icon — react-countup to 142 — ↑12% trend (emerald)
  Card 2: "Compliance Rate" — ShieldCheck icon — react-countup to 94.2 with suffix="%" — ↓1.1% trend (amber)  
  Card 3: "Duty Savings (FTA)" — TrendingDown icon — react-countup to 842000 prefix="₹" separator="," — ↑23% trend (emerald)
  Card 4: "Open Exceptions" — AlertTriangle icon — react-countup to 7 — ↓3 trend (emerald, fewer exceptions = good)

Primary chart (full width):
  Recharts AreaChart — 30 days of shipment data
  Smooth curve (type="monotone"), gradient fill (indigo with opacity)
  Custom tooltip showing date + shipment count
  ResponsiveContainer

Secondary row (2 columns):
  Left: Bar chart — "Duty Cost by Destination" (top 5 countries)
  Right: Recent Shipments table (last 8, columns: Reference, Route, Status badge, Value, Date)

Status badges in table use StatusBadge component with colors from CLAUDE.md.

/app/(dashboard)/loading.tsx: full skeleton matching the dashboard layout

STEP 9 — TYPES AND VALIDATIONS

/lib/types.ts — complete TypeScript interfaces for:
  Shipment, Product, HSClassification, DutyCalculation,
  DeniedPartyScreening, TradeDocument, ComplianceException, AuditLog, User

/lib/validations.ts — Zod schemas for:
  createShipmentSchema, createProductSchema, hsClassifySchema,
  dutyCalculateSchema, screenPartySchema, createDocumentSchema

/lib/constants.ts — export these constants:
  COUNTRIES array with { code, name, flag } for major trading nations (30+ countries)
  Include: IN, US, DE, CN, AE, GB, JP, SG, FR, IT, NL, CA, AU, BR, MX, KR, TH, VN, BD, PK
  HS_CHAPTERS array with top 20 HS chapters and descriptions
  INCOTERMS: ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
  CURRENCIES: ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD', 'JPY', 'CNY']
  DOCUMENT_TYPES: commercial_invoice, packing_list, certificate_of_origin, bill_of_lading, phytosanitary

STEP 10 — SHARED COMPONENTS

/components/shared/page-wrapper.tsx — Framer Motion entry (opacity 0→1, y 12→0)
/components/shared/empty-state.tsx — icon (large, muted) + title + description + optional CTA button
/components/shared/status-badge.tsx — colored badge by status string, uses colors from CLAUDE.md
/components/shared/risk-badge.tsx — colored badge with pulse on "critical"
/components/dashboard/stat-card.tsx — icon + label + CountUp number + trend arrow + %
/components/dashboard/sidebar.tsx — extracted full sidebar component

STEP 11 — API ROUTE: HS CLASSIFIER

/app/api/classify-hs/route.ts (POST):
- Import OpenAI from 'openai'
- Use process.env.OPENAI_API_KEY (server only)
- Accepts: { productDescription: string, countryOfOrigin: string }
- Prompt GPT-4 to return JSON with: hsCode, chapter, description, confidence (0-100), reasoning, tradeRestrictions
- Parse response and return JSON
- Handle errors gracefully with fallback message
- Add simple rate limiting: max 10 requests per minute

STEP 12 — SEED SCRIPT

/scripts/seed.ts — creates the following in Supabase:

Demo user: demo@tradeguard.com / demo1234

Shipments (35 records):
  Mix of statuses: in_transit (12), pending_clearance (8), cleared (10), flagged (3), delivered (2)
  Routes: India→USA, India→Germany, India→UAE, India→UK, China→India, India→Singapore
  Reference format: TG-2026-XXXXX (e.g. TG-2026-00142)
  Shippers: "Tata Global Exports Pvt Ltd", "Sun Pharma International", "Mahindra Logistics Ltd",
    "Reliance Industries Ltd", "Wipro Infrastructure Ltd", "Bajaj Auto Ltd", "HCL Technologies Ltd"
  Products: Pharmaceutical tablets (HS 3004.90), Cotton yarn (HS 5205.11),
    Automotive brake pads (HS 8708.30), Electronic circuit boards (HS 8534.00),
    Polished diamonds (HS 7102.39), Stainless steel pipes (HS 7304.41)
  Values: realistic ₹ amounts (50,000 to 5,000,000)

Products (20 records): mix of above product types with hs_code, hs_confidence, country_of_origin

HS Classifications (15 records): past AI classifications with varying confidence scores (65–97)

Duty Calculations (20 records):
  Mix of routes and hs codes
  Include 5 with fta_applicable=true showing savings

Denied Party Screenings (12 records):
  8 CLEAR results, 3 MATCH results, 1 possible_match
  Matched parties: "Volkov Trading LLC" (Russia, SDN), "Dragon Shell Corp" (Iran, OFAC)

Trade Documents (25 records): mix of commercial_invoice, packing_list, certificate_of_origin

Compliance Exceptions (8 records): mix of open (5) and resolved (3), various severities

Audit Logs (30 records): mix of actions (created_shipment, classified_hs, screened_party, etc.)

Chart data: 30 days, start at 80 shipments/day, grow to 142 by today, realistic weekend dips

Run with: npx tsx scripts/seed.ts

STEP 13 — ENV FILES

.env.local:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

.gitignore: verify .env.local is listed

After ALL steps complete, output:
1. Complete SQL for Supabase (CREATE TABLE statements + RLS policies for all tables)
2. Full file tree
3. Run commands: npm run dev, npx tsx scripts/seed.ts
4. Any remaining setup needed

Follow CLAUDE.md exactly. Mobile-first. Dark mode default.
Every list needs empty state. Every route needs loading.tsx.
Every page wrapped in PageWrapper.
```

---

## ══════════════════════════════════════
## PHASE 2A — SHIPMENTS PAGE (Hour 1–2)
## ══════════════════════════════════════

```
Read CLAUDE.md. Phase 1 working. Build the Shipments feature completely.

/app/(dashboard)/shipments/page.tsx

What users can do:
- View all their shipments in a searchable, filterable table
- Filter by: status (all/in_transit/pending_clearance/cleared/flagged/delivered), origin country, destination country, date range
- Search by reference number, shipper name, consignee name, or product
- Create new shipment via modal
- View shipment detail in an expandable side panel or modal
- Edit shipment details
- Delete shipment with confirmation

Page structure:
1. PageWrapper + page header: "Shipments" + "Manage your international shipments" + "New Shipment" button
2. Filter bar: status tabs (All | In Transit | Pending | Cleared | Flagged) + search input + country selects + date range
3. Shipments table with columns:
   - Reference (TG-2026-XXXXX in monospace font, indigo color)
   - Route (origin flag+name → destination flag+name with arrow)
   - Product / HS Code
   - Shipper → Consignee
   - Declared Value (formatted with currency)
   - Status (StatusBadge component)
   - Compliance (StatusBadge: compliant/review_required/flagged)
   - Created date
   - Actions (view, edit, delete — show on row hover)
4. Pagination: show 20 per page
5. Empty state: Package icon + "No shipments yet" + "Track your first shipment"

Create Shipment Modal:
  Section 1 — Shipment Details: reference_no (auto-generated), incoterm select, shipper_name, consignee_name
  Section 2 — Route: origin_country (searchable select with flags), destination_country
  Section 3 — Product & Compliance: product_name, hs_code (text input), declared_value, currency
  Section 4 — Logistics: weight_kg, customs_broker, freight_forwarder, estimated_delivery
  Full React Hook Form + Zod validation. Loading state. Toast on success. Auto-refresh list.

Shipment Detail Panel (slide-in from right):
  Full shipment details in organized sections
  Timeline showing status history
  Linked documents count
  Duty calculation summary if available
  Quick actions: Generate Document, Screen Party, Calculate Duty

Also build:
  /app/(dashboard)/shipments/loading.tsx (table skeleton)
  /app/(dashboard)/shipments/error.tsx

Stagger animate all table rows. Row hover: bg-muted/50.
Follow CLAUDE.md. Do not touch other pages.
```

---

## ══════════════════════════════════════
## PHASE 2B — HS CLASSIFIER (Hour 2–3)
## ══════════════════════════════════════

```
Read CLAUDE.md. Build the HS Code Classifier page. This is the KILLER feature.

/app/(dashboard)/hs-classifier/page.tsx

This page uses the /api/classify-hs route to call OpenAI GPT-4 and classify products.

Page structure:

1. PageWrapper + page header:
   "AI HS Code Classifier" + "Classify products instantly using AI" + "View History" button

2. Classifier Card (prominent, center stage):
   Title: "Classify Your Product"
   Form fields:
     - Product Name (text input)
     - Detailed Description (textarea, min 3 rows) — placeholder: "Describe the product including materials, use, manufacturing process..."
     - Country of Origin (searchable select with flags)
     - Optional: Intended Use (text input)
   Submit button: "Classify with AI" with Cpu icon
   
3. Loading state (while API call in progress):
   Animated scanning effect — horizontal line moving across the card
   Text: "AI is analyzing your product..." with ellipsis animation
   
4. Result card (slides in from bottom with Framer Motion when result arrives):
   Large HS Code display: e.g. "3004.90.90" in monospace, indigo, text-4xl
   HS Chapter: "Chapter 30 — Pharmaceutical products"
   Official Description: the HS description text
   
   Confidence Score bar:
     Label: "Classification Confidence"
     Animated progress bar fills from 0 to {confidence}%
     Color: emerald if >80, amber if 60-80, red if <60
     Large percentage number animates with CountUp
   
   AI Reasoning: expandable section with the reasoning text
   Trade Restrictions: any known notes
   
   Action buttons:
     "✓ Accept Classification" → saves to hs_classifications table → toast success
     "↻ Reclassify" → clears result, back to form
     "Apply to Product" → if came from product, links it

5. History section below (last 10 classifications):
   Table: Product Name | HS Code | Confidence | Status | Date
   Status badge: accepted (emerald) / rejected (red) / pending (amber)
   Stagger animation on rows

Empty state for history: Cpu icon + "No classifications yet" + "Try the classifier above"

/app/(dashboard)/hs-classifier/loading.tsx

Follow CLAUDE.md exactly. This page must look impressive — it's the AI showcase.
```

---

## ══════════════════════════════════════
## PHASE 2C — DUTY CALCULATOR (Hour 3–4)
## ══════════════════════════════════════

```
Read CLAUDE.md. Build the Duty & Tax Calculator page.

/app/(dashboard)/duty-calculator/page.tsx

Page structure:

1. PageWrapper + page header: "Duty Calculator" + "Calculate landed costs for any shipment" + "View History"

2. Calculator form card:
   Origin Country (searchable select with flags)
   Destination Country (searchable select with flags)
   HS Code (text input with format hint: XXXX.XX.XX)
   Product Description (text input)
   Declared Value (number input)
   Currency (select: USD, EUR, GBP, INR, AED...)
   Quantity (number)
   Weight (kg)
   Incoterm (select)
   Submit: "Calculate Duties" button

3. Results section (appears after submit with stagger animation):
   Summary header: "Landed Cost Breakdown for [Origin] → [Destination]"
   
   Line items (each animates in with stagger):
   Row 1: Declared Value — $10,000.00
   Row 2: Duty Rate — 7.5% → Duty Amount — $750.00
   Row 3: VAT/GST Rate — 18% → VAT Amount — $1,935.00 (on CIF value)
   Row 4: Other Fees (handling, inspection) — $85.00
   ───────────────────────────────────────────────
   Row 5: Total Landed Cost (bold, large) — $12,770.00

   FTA Section (if applicable):
   Green highlighted box: "✓ FTA Available — ASEAN-India FTA"
   Reduced rate: 3.5% (standard: 7.5%)
   Savings: $400.00 highlighted in emerald

   CountUp animation on all monetary values

4. History table below (last 15 calculations):
   Columns: Route | HS Code | Value | Duty | Total Landed Cost | FTA | Date
   FTA column: checkmark badge (emerald) or dash

   Logic: use pre-built duty rate constants in /lib/constants.ts
   Include realistic duty rates for common India trade routes:
   - India→USA: electronics 0%, textiles 12%, pharma 0-3.7%
   - India→EU: textiles 12%, auto parts 3.5-6.5%
   - India→UAE: most goods 5% VAT
   - China→India: machinery 7.5-15%, electronics 0-20%

/app/(dashboard)/duty-calculator/loading.tsx

Stagger all result rows. CountUp all numbers. Follow CLAUDE.md.
```

---

## ══════════════════════════════════════
## PHASE 2D — DENIED PARTY SCREENING (Hour 4–4:30)
## ══════════════════════════════════════

```
Read CLAUDE.md. Build the Denied Party Screening page.

/app/(dashboard)/denied-party/page.tsx

What it does: Screen any company or individual name against a seeded database 
of restricted parties (watchlists). Returns CLEAR, POSSIBLE MATCH, or MATCH.

Page structure:

1. PageWrapper + page header: "Denied Party Screening" + "Screen trading partners against global watchlists" + "View Screening History"

2. Screening form card:
   Party Name (text input) — placeholder: "Enter company or individual name"
   Country (optional, select)
   Search Type (toggle: Company / Individual)
   "Screen Now" button with ShieldAlert icon

3. Result display (animates in after screening):
   
   If CLEAR:
   Large emerald circle with checkmark pulsing once
   "✓ No Match Found" in emerald, large text
   "This party was not found on any restricted lists"
   List of watchlists checked (OFAC SDN, BIS Entity List, EU Sanctions, UN Sanctions)
   "Save Screening Record" button

   If MATCH:
   Large red circle with X pulsing 3 times → stays red
   "⚠ MATCH FOUND" in red, large text
   Matched party details:
     - Matched Name: [name]
     - Watchlist: OFAC SDN / BIS Entity List
     - Country: [country]
     - Risk Level: RiskBadge (CRITICAL/HIGH)
     - Reason: [reason from seed data]
   Warning: "Do not proceed with this trade transaction"
   "Save Screening Record" button

   If POSSIBLE_MATCH:
   Amber warning icon
   "⚠ Possible Match — Manual Review Required"
   Similar match details but with lower confidence

   Implementation: check against denied_parties table in Supabase
   Use fuzzy matching: ilike '%name%' or check if name contains key words

4. Screening History table (last 20):
   Columns: Party Name | Country | Search Type | Result badge | Risk | Watchlist | Date
   Result badge: CLEAR (emerald), MATCH (red), POSSIBLE MATCH (amber)
   Stagger animation on rows

/app/(dashboard)/denied-party/loading.tsx
Follow CLAUDE.md. The animation on MATCH vs CLEAR is key to the UX.
```

---

## ══════════════════════════════════════
## PHASE 3 — POLISH (Hour 5:30–6:30)
## ══════════════════════════════════════

```
Read CLAUDE.md. All core features working. Polish everything for judges and Product Hunt.

1. LANDING PAGE (/app/page.tsx — public, before auth)
   
   Hero section:
     Shield logo icon (large, indigo)
     "TradeGuard" heading (very large, bold)
     Tagline: "Global trade compliance, simplified."
     Subtext: "AI-powered HS classification, duty calculation, and denied party screening for mid-market businesses. Stop losing money to wrong duties and compliance violations."
     CTA buttons: "Try Demo Free →" (primary) | "See How It Works" (ghost)
     Background: dark with subtle grid + indigo glow effect
   
   Stats bar (animate in on scroll):
     "94.2% Compliance Rate" | "$2.4M Duty Savings" | "10,000+ Shipments Tracked" | "150+ Countries"
   
   Feature cards (3 columns, stagger in):
     Card 1: Cpu icon — "AI HS Classification" — "Classify any product in seconds with 94% accuracy using GPT-4"
     Card 2: Calculator — "Duty Calculator" — "Calculate exact landed costs including FTA benefits across 150+ countries"
     Card 3: ShieldAlert — "Denied Party Screening" — "Screen against OFAC, BIS, EU, and UN watchlists in real time"
   
   How it works (3 steps):
     1. Add your product → 2. AI classifies + calculates → 3. Stay compliant, save money
   
   "Alternative to Descartes" section:
     Simple comparison table: TradeGuard vs Descartes
     Columns: Feature | TradeGuard | Descartes
     Highlight: "Modern UI" ✓ vs ✗, "AI-Native" ✓ vs ✗, "Free Trial" ✓ vs ✗, "SMB-Friendly" ✓ vs ✗
   
   CTA section:
     "Ready to simplify your trade compliance?"
     "Try Demo →" button → /login
     Demo credentials shown: demo@tradeguard.com / demo1234
   
   Footer: TradeGuard | Built at Bacancy AI Mahakurukshetra 2026 | [Shield icon]
   
   Full Framer Motion: hero slides up, stats count up, cards stagger in, steps sequence

2. MOBILE AUDIT — check every page at 375px
   Fix any horizontal overflow, tiny text, broken layouts

3. ANIMATION AUDIT
   Every page: PageWrapper ✓ | Stagger on lists ✓ | Card hover ✓ | Button press ✓

4. DARK MODE — verify all pages, fix any hardcoded colors

5. DOCUMENTS PAGE (if time permits):
   /app/(dashboard)/documents/page.tsx
   Simple list of trade documents with: type badge, shipment reference, status, date
   "Generate Document" button opening modal with: doc type select + shipment select
   Empty state: FileText icon

6. COMPLIANCE PAGE (if time permits):
   /app/(dashboard)/compliance/page.tsx
   List of compliance exceptions with severity badges
   Filter by status and severity
   Each exception shows: type, severity, shipment link, status, created date
   "Resolve" action with notes input

Report every fix made.
```

---

## ══════════════════════════════════════
## PHASE 4 — SECURITY SWEEP (Hour 6:30–7)
## ══════════════════════════════════════

```
Security audit before deployment. Fix everything.

1. Verify OPENAI_API_KEY is ONLY in /app/api/classify-hs/route.ts (server-side). Never imported in components.
2. Verify SUPABASE_SERVICE_ROLE_KEY is never in client files.
3. Show all Supabase tables — confirm RLS ENABLED on each.
4. Show RLS policies — confirm users see only their own data.
5. Verify middleware.ts properly protects /dashboard/*.
6. Show .gitignore — confirm .env.local is listed.
7. Check all forms have Zod validation in lib/validations.ts.
8. Verify /api/classify-hs/route.ts has error handling (try/catch).
9. Verify denied party screening can't be manipulated to expose other users' screenings.
10. Check no console.log leaks user data or API keys.

For each issue: show before → fix → after.
```

---

## ══════════════════════════════════════
## DEBUGGING PROMPTS
## ══════════════════════════════════════

### Any error:
```
Fix this error only. Do not change anything else.
Error: [PASTE FULL ERROR + STACK TRACE]
File: [filename]
Context: [what you were doing]
```

### OpenAI API not responding in HS Classifier:
```
The /api/classify-hs route is returning an error. Fix it.
OPENAI_API_KEY is set in .env.local.
Error: [paste]
Full route file: [paste]
```

### Supabase RLS blocking legitimate queries:
```
Supabase query returning empty or permission error for authenticated user.
Query: [paste]
User is logged in. RLS policy: [paste]
Fix the policy without removing security.
```

### Vercel build failure:
```
Vercel build failed. Fix without changing logic.
Full log: [paste]
```

### Going off track:
```
Stop. Read CLAUDE.md from the top.
Do ONLY this one thing: [very specific task]
Nothing else.
```
