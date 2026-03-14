# CLAUDE.md — TradeGuard
# Global Trade Compliance & Customs Management Platform
# Alternative to: Descartes Global Trade Intelligence
# Hackathon: AI Mahakurukshetra 2026

---

## 🎯 PROJECT DEFINITION

- **Product Name:** TradeGuard
- **Tagline:** "Global trade compliance, simplified."
- **What it does:** Helps mid-market manufacturers and distributors manage customs compliance, classify products with AI-powered HS codes, calculate duties, screen denied parties, and track shipments — all in one platform.
- **Alternative to:** Descartes Global Trade Intelligence
- **Target user:** Trade compliance managers and operations teams at mid-market manufacturers and distributors
- **Core nav items:** Dashboard, Shipments, HS Classifier, Duty Calculator, Denied Party Screening, Documents, Compliance, Audit Log, Settings

---

## 🛠️ MANDATORY TECH STACK

- **Framework:** Next.js 14+ — App Router only, never Pages Router
- **Language:** TypeScript strict — never use `any`
- **Styling:** Tailwind CSS — no inline styles ever
- **Components:** shadcn/ui (initialize before adding components)
- **Database + Auth:** Supabase
- **AI Integration:** OpenAI GPT-4 API — for HS Code Classification feature
- **Animations:** Framer Motion — required on all transitions and interactions
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **Toasts:** Sonner
- **Number animations:** react-countup
- **Date utilities:** date-fns
- **Package manager:** npm

---

## 🏗️ PROJECT STRUCTURE

```
/app
  /(auth)
    /login/page.tsx
    /signup/page.tsx
  /(dashboard)
    /layout.tsx                    ← sidebar + top navbar
    /page.tsx                      ← dashboard home
    /loading.tsx
    /shipments/page.tsx            ← shipment list + CRUD
    /shipments/loading.tsx
    /shipments/error.tsx
    /hs-classifier/page.tsx        ← AI-powered HS code classifier
    /hs-classifier/loading.tsx
    /duty-calculator/page.tsx      ← duty & tax calculator
    /duty-calculator/loading.tsx
    /denied-party/page.tsx         ← denied party screening
    /denied-party/loading.tsx
    /documents/page.tsx            ← customs documents list
    /documents/loading.tsx
    /compliance/page.tsx           ← exceptions + rules
    /compliance/loading.tsx
    /audit-log/page.tsx            ← audit trail
    /audit-log/loading.tsx
    /settings/page.tsx
  /api
    /classify-hs/route.ts          ← calls Claude API for HS classification
    /screen-party/route.ts         ← denied party screening logic
/components
  /ui/                             ← shadcn primitives
  /dashboard/
    sidebar.tsx
    navbar.tsx
    stat-card.tsx
  /shared/
    page-wrapper.tsx               ← Framer Motion entry animation
    empty-state.tsx
    data-table.tsx
    country-flag.tsx               ← flag emoji + country name
    status-badge.tsx               ← colored status badges
    risk-badge.tsx                 ← risk level badges
/lib
  /supabase/
    client.ts
    server.ts
  /utils.ts
  /types.ts                        ← ALL TypeScript interfaces
  /validations.ts                  ← ALL Zod schemas
  /constants.ts                    ← countries, HS chapters, duty rates
/scripts
  seed.ts
/middleware.ts
```

---

## 🎨 UI/UX STANDARDS

### Visual Reference
Think: **Flexport + Linear + Stripe Dashboard**
Enterprise-grade, data-dense but clean. Blue/indigo primary. Serious but modern.
NOT startup-casual. This is compliance software for businesses.

### Theme
- Default: **dark mode**
- Light mode toggle available
- All colors via CSS variables — never hardcode

### Color Palette
- **Primary:** indigo-500 / indigo-600
- **Success/Compliant:** emerald-500
- **Warning/Pending:** amber-500
- **Danger/Violation:** red-500
- **Neutral:** zinc scale

### Status Badge Colors
```
clearance: compliant    → emerald bg + text
clearance: pending      → amber bg + text
clearance: flagged      → red bg + text
clearance: in-transit   → indigo bg + text
risk: low               → emerald
risk: medium            → amber
risk: high              → red
risk: critical          → red-900 + pulse animation
document: generated     → emerald
document: pending       → amber
document: draft         → zinc
party screening: clear  → emerald
party screening: match  → red + warning icon
```

### Layout
- Sidebar: 260px expanded → 64px collapsed
- Mobile: bottom navigation
- Top navbar: breadcrumb | search bar | notifications bell + avatar
- Every page: page header with title + description + action button
- Cards: p-6, rounded-xl, border border-border, bg-card

---

## ✨ ANIMATIONS — MANDATORY

### Page entry — wrap EVERY page
```tsx
// /components/shared/page-wrapper.tsx
"use client"
import { motion } from "framer-motion"
export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```

### Stagger lists — ALL card grids and table rows
```tsx
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }
```

### HS Classifier special animation
- When AI is processing: animated scanning line across the form
- When result arrives: confidence score bar fills from 0 to actual % (animated)
- Result card slides in from bottom

### Duty Calculator
- When calculating: number counter animates to result
- Each line item (duty, tax, fees) stagger-reveals

### Denied Party match
- If MATCH: card pulses red 3x → stays red
- If CLEAR: card pulses green once → stays green

### Dashboard stats: react-countup on mount

---

## 🗃️ DATABASE SCHEMA

### shipments
```sql
id uuid PK, user_id uuid FK,
reference_no text UNIQUE,
origin_country text, destination_country text,
shipper_name text, consignee_name text,
product_name text, hs_code text,
declared_value decimal, currency text DEFAULT 'USD',
weight_kg decimal, incoterm text,
status text, -- 'in_transit' | 'pending_clearance' | 'cleared' | 'flagged' | 'delivered'
duty_amount decimal, tax_amount decimal,
customs_broker text, freight_forwarder text,
estimated_delivery date, actual_delivery date,
compliance_status text, -- 'compliant' | 'review_required' | 'flagged'
notes text,
created_at, updated_at
```

### products
```sql
id uuid PK, user_id uuid FK,
name text, description text,
hs_code text, hs_confidence decimal, -- 0-100
country_of_origin text,
weight_kg decimal, value_usd decimal,
category text,
is_restricted boolean DEFAULT false,
created_at, updated_at
```

### hs_classifications
```sql
id uuid PK, user_id uuid FK,
product_description text,
suggested_hs_code text,
hs_chapter text,
hs_description text,
confidence_score decimal, -- 0-100
reasoning text, -- AI reasoning
status text, -- 'accepted' | 'rejected' | 'pending'
created_at
```

### duty_calculations
```sql
id uuid PK, user_id uuid FK,
origin_country text, destination_country text,
hs_code text, product_description text,
declared_value decimal, currency text,
duty_rate decimal, duty_amount decimal,
vat_rate decimal, vat_amount decimal,
other_fees decimal, total_landed_cost decimal,
fta_applicable boolean, fta_name text,
savings_vs_standard decimal,
created_at
```

### denied_party_screenings
```sql
id uuid PK, user_id uuid FK,
party_name text, party_country text,
search_type text, -- 'company' | 'individual'
result text, -- 'clear' | 'match' | 'possible_match'
risk_level text, -- 'none' | 'low' | 'medium' | 'high' | 'critical'
matched_list text, -- which watchlist matched
match_details text,
created_at
```

### trade_documents
```sql
id uuid PK, user_id uuid FK, shipment_id uuid FK,
doc_type text, -- 'commercial_invoice' | 'packing_list' | 'certificate_of_origin' | 'bill_of_lading'
doc_number text,
status text, -- 'draft' | 'generated' | 'submitted' | 'approved'
content_json jsonb,
created_at, updated_at
```

### compliance_exceptions
```sql
id uuid PK, user_id uuid FK, shipment_id uuid FK,
exception_type text,
severity text, -- 'low' | 'medium' | 'high' | 'critical'
description text,
status text, -- 'open' | 'in_review' | 'resolved' | 'waived'
assigned_to text,
resolved_at timestamptz,
resolution_notes text,
created_at, updated_at
```

### audit_logs
```sql
id uuid PK, user_id uuid FK,
action text, entity_type text, entity_id uuid,
details jsonb, ip_address text,
created_at
```

---

## 🤖 AI FEATURE — HS CODE CLASSIFIER

This is the app's killer feature. The app calls OpenAI GPT-4 API to classify products.

### /api/classify-hs/route.ts
```ts
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// POST body: { productDescription: string, countryOfOrigin: string }
// Returns: { hsCode, chapter, description, confidence, reasoning }

const systemPrompt = `You are an expert customs classifier with deep knowledge of the
Harmonized System (HS) nomenclature used in international trade.

Classify products and return ONLY a JSON object (no markdown):
{
  "hsCode": "XXXX.XX.XX",
  "chapter": "Chapter XX - Description",
  "description": "Official HS description",
  "confidence": 87,
  "reasoning": "Brief explanation of why this HS code applies",
  "tradeRestrictions": "Any known restrictions or notes"
}

Be precise. The confidence should reflect how certain you are (0-100).`

// Use: client.chat.completions.create({ model: "gpt-4", messages: [...] })
```

### UI Experience (hs-classifier page)
1. Input form: product name + detailed description + country of origin
2. Submit → loading animation (scanning effect)
3. Result card appears with:
   - HS Code in large bold text
   - Confidence bar (animated fill, color: green >80%, amber 60-80%, red <60%)
   - Chapter description
   - AI reasoning text
   - "Accept" or "Reclassify" buttons
4. All classifications saved to hs_classifications table
5. History list below the form

---

## 📊 DASHBOARD — 4 STAT CARDS

```
[Shipments This Month]    [Compliance Rate]      [Duty Savings (FTA)]    [Open Exceptions]
  142 shipments            94.2% compliant         ₹8,42,000 saved          7 open
  ↑ 12% vs last month      ↓ 1.1% vs last month    ↑ 23% vs last month      ↓ 3 vs last week
```

### Dashboard Charts
1. **Primary:** Line chart — Shipments per day (30 days) with compliance overlay
2. **Secondary:** Bar chart — Duty costs by country (top 5 destinations)
3. **Recent Shipments table** — last 10 with status badges

---

## 🌱 SEED DATA

### Demo account: demo@tradeguard.com / demo1234

### Seed these realistic records:

**Companies/Trade Routes (Indian export context):**
- India → USA (electronics, textiles, pharmaceuticals)
- India → Germany (auto parts, chemicals)
- India → UAE (gems, textiles)
- India → UK (software services, pharmaceuticals)
- China → India (machinery, electronics) ← import side

**Shipment reference format:** TG-2026-XXXXX

**Products to seed:**
- Pharmaceutical tablets (HS 3004.90)
- Cotton yarn (HS 5205.11)
- Automotive brake pads (HS 8708.30)
- Electronic circuit boards (HS 8534.00)
- Polished diamonds (HS 7102.39)
- Stainless steel pipes (HS 7304.41)
- Leather handbags (HS 4202.21)
- Rice (HS 1006.30)

**Denied parties to seed (fictional):**
- "Volkov Trading LLC" - Russia - SDN List - CRITICAL
- "Dragon Shell Corp" - Unknown - BIS List - HIGH
- "Northern Star Logistics" - Iran - OFAC - CRITICAL

**Shipper/Consignee names:** Use Indian company names
- "Tata Global Exports Pvt Ltd"
- "Reliance Industries Ltd"
- "Infosys BPO Ltd"
- "Sun Pharma International"
- "Mahindra Logistics Ltd"

**30-day chart:** Start at 80 shipments/day, grow to 142, with realistic dips on weekends

---

## 🔐 SECURITY

- `OPENAI_API_KEY` — server-side ONLY (no NEXT_PUBLIC_ prefix)
- `SUPABASE_SERVICE_ROLE_KEY` — server-side ONLY
- `NEXT_PUBLIC_` only for Supabase URL + Anon key
- RLS on ALL tables
- Zod validation on all forms + API routes
- middleware.ts protects all /dashboard routes
- Rate limit the /api/classify-hs route (max 10 req/min)

---

## ✅ REQUIRED ON EVERY PAGE

- **PageWrapper** with entry animation
- **Empty state** on every list with relevant trade icon + CTA
- **loading.tsx** skeleton on every route
- **error.tsx** with retry on every route
- **Sonner toast** on every user action

---

## 📱 MOBILE

Check at 375px:
- Sidebar → bottom navigation
- Shipment table → card view
- HS Classifier → full width form
- Dashboard cards → 2x2 grid → 1 column on very small
- No horizontal overflow

---

## 🚫 NEVER

`<img>` · TS `any` · inline styles · Pages Router · `alert()` · `select('*')` · secrets in NEXT_PUBLIC_ · skipping empty/loading/error states · hardcoded colors that break dark mode

---

## 🔁 COMMIT AFTER EVERY PHASE

```bash
git add . && git commit -m "feat: [description]"
```
scaffold → auth → shipments → hs-classifier → duty-calc → denied-party → seed → polish → security → deploy
