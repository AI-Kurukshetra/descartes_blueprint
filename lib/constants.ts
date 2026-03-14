// Countries with flags
export const COUNTRIES = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
] as const

export type CountryCode = (typeof COUNTRIES)[number]["code"]

// HS Chapters
export const HS_CHAPTERS = [
  { chapter: "01", description: "Live animals" },
  { chapter: "02", description: "Meat and edible meat offal" },
  { chapter: "03", description: "Fish and crustaceans" },
  { chapter: "10", description: "Cereals" },
  { chapter: "27", description: "Mineral fuels, oils and products" },
  { chapter: "29", description: "Organic chemicals" },
  { chapter: "30", description: "Pharmaceutical products" },
  { chapter: "39", description: "Plastics and articles thereof" },
  { chapter: "42", description: "Articles of leather" },
  { chapter: "52", description: "Cotton" },
  { chapter: "61", description: "Knitted or crocheted apparel" },
  { chapter: "62", description: "Woven apparel" },
  { chapter: "71", description: "Natural or cultured pearls, precious stones" },
  { chapter: "72", description: "Iron and steel" },
  { chapter: "73", description: "Articles of iron or steel" },
  { chapter: "84", description: "Nuclear reactors, boilers, machinery" },
  { chapter: "85", description: "Electrical machinery and equipment" },
  { chapter: "87", description: "Vehicles other than railway" },
  { chapter: "90", description: "Optical, measuring, medical instruments" },
  { chapter: "94", description: "Furniture; bedding, mattresses" },
] as const

// Incoterms
export const INCOTERMS = [
  "EXW",
  "FCA",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
] as const

export type Incoterm = (typeof INCOTERMS)[number]

// Currencies
export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

// Document types
export const DOCUMENT_TYPES = [
  { value: "commercial_invoice", label: "Commercial Invoice" },
  { value: "packing_list", label: "Packing List" },
  { value: "certificate_of_origin", label: "Certificate of Origin" },
  { value: "bill_of_lading", label: "Bill of Lading" },
  { value: "phytosanitary", label: "Phytosanitary Certificate" },
] as const

// Duty rates by route (simplified)
export const DUTY_RATES: Record<
  string,
  Record<string, { rate: number; vat: number; notes?: string }>
> = {
  "IN-US": {
    "3004": { rate: 0, vat: 0, notes: "Pharmaceutical products - duty free" },
    "5205": { rate: 12, vat: 0, notes: "Cotton yarn" },
    "8708": { rate: 2.5, vat: 0, notes: "Auto parts" },
    "8534": { rate: 0, vat: 0, notes: "Electronic circuits" },
    "7102": { rate: 0, vat: 0, notes: "Diamonds" },
    default: { rate: 5, vat: 0 },
  },
  "IN-DE": {
    "3004": { rate: 0, vat: 19, notes: "Pharmaceutical products" },
    "5205": { rate: 8, vat: 19, notes: "Cotton yarn - EU textile rate" },
    "8708": { rate: 4.5, vat: 19, notes: "Auto parts" },
    "8534": { rate: 0, vat: 19, notes: "Electronic circuits" },
    default: { rate: 6.5, vat: 19 },
  },
  "IN-AE": {
    "3004": { rate: 0, vat: 5, notes: "Pharmaceutical products" },
    "5205": { rate: 5, vat: 5, notes: "Cotton yarn" },
    "7102": { rate: 0, vat: 5, notes: "Diamonds - duty free" },
    default: { rate: 5, vat: 5 },
  },
  "IN-GB": {
    "3004": { rate: 0, vat: 20, notes: "Pharmaceutical products" },
    "5205": { rate: 8, vat: 20, notes: "Cotton yarn" },
    "8708": { rate: 4, vat: 20, notes: "Auto parts" },
    default: { rate: 4.5, vat: 20 },
  },
  "CN-IN": {
    "8471": { rate: 10, vat: 18, notes: "Computers" },
    "8473": { rate: 7.5, vat: 18, notes: "Computer parts" },
    "8517": { rate: 20, vat: 18, notes: "Telecom equipment" },
    "8541": { rate: 15, vat: 18, notes: "Semiconductors" },
    default: { rate: 10, vat: 18 },
  },
  "IN-SG": {
    default: { rate: 0, vat: 8, notes: "Singapore FTA" },
  },
}

// FTA (Free Trade Agreements)
export const FTA_AGREEMENTS: Record<string, { name: string; savings: number }> = {
  "IN-SG": { name: "India-Singapore CECA", savings: 5 },
  "IN-AE": { name: "India-UAE CEPA", savings: 3.5 },
  "IN-JP": { name: "India-Japan CEPA", savings: 4 },
  "IN-KR": { name: "India-Korea CEPA", savings: 4 },
  "IN-TH": { name: "India-Thailand FTA", savings: 3 },
}

// Watchlists for denied party screening
export const WATCHLISTS = [
  "OFAC SDN List",
  "OFAC Consolidated List",
  "BIS Entity List",
  "BIS Denied Persons List",
  "EU Consolidated List",
  "UN Security Council Sanctions",
  "UK Sanctions List",
] as const

// Status display configurations
export const STATUS_CONFIG = {
  shipment: {
    in_transit: { label: "In Transit", color: "indigo" },
    pending_clearance: { label: "Pending Clearance", color: "amber" },
    cleared: { label: "Cleared", color: "emerald" },
    flagged: { label: "Flagged", color: "red" },
    delivered: { label: "Delivered", color: "emerald" },
  },
  compliance: {
    compliant: { label: "Compliant", color: "emerald" },
    review_required: { label: "Review Required", color: "amber" },
    flagged: { label: "Flagged", color: "red" },
  },
  document: {
    draft: { label: "Draft", color: "zinc" },
    generated: { label: "Generated", color: "emerald" },
    submitted: { label: "Submitted", color: "indigo" },
    approved: { label: "Approved", color: "emerald" },
    pending: { label: "Pending", color: "amber" },
  },
  screening: {
    clear: { label: "Clear", color: "emerald" },
    match: { label: "Match", color: "red" },
    possible_match: { label: "Possible Match", color: "amber" },
  },
  risk: {
    none: { label: "None", color: "emerald" },
    low: { label: "Low", color: "emerald" },
    medium: { label: "Medium", color: "amber" },
    high: { label: "High", color: "red" },
    critical: { label: "Critical", color: "red", pulse: true },
  },
  classification: {
    accepted: { label: "Accepted", color: "emerald" },
    rejected: { label: "Rejected", color: "red" },
    pending: { label: "Pending", color: "amber" },
  },
} as const

// Sample products for seeding
export const SAMPLE_PRODUCTS = [
  {
    name: "Pharmaceutical Tablets",
    hs_code: "3004.90",
    description: "Medicaments consisting of mixed or unmixed products",
  },
  {
    name: "Cotton Yarn",
    hs_code: "5205.11",
    description: "Single cotton yarn, of uncombed fibers",
  },
  {
    name: "Automotive Brake Pads",
    hs_code: "8708.30",
    description: "Brakes and servo-brakes for motor vehicles",
  },
  {
    name: "Electronic Circuit Boards",
    hs_code: "8534.00",
    description: "Printed circuits",
  },
  {
    name: "Polished Diamonds",
    hs_code: "7102.39",
    description: "Non-industrial diamonds, worked",
  },
  {
    name: "Stainless Steel Pipes",
    hs_code: "7304.41",
    description: "Cold-drawn or cold-rolled stainless steel tubes",
  },
  {
    name: "Leather Handbags",
    hs_code: "4202.21",
    description: "Handbags with outer surface of leather",
  },
  {
    name: "Basmati Rice",
    hs_code: "1006.30",
    description: "Semi-milled or wholly milled rice",
  },
] as const

// Indian shippers
export const INDIAN_SHIPPERS = [
  "Tata Global Exports Pvt Ltd",
  "Reliance Industries Ltd",
  "Infosys BPO Ltd",
  "Sun Pharma International",
  "Mahindra Logistics Ltd",
  "Wipro Infrastructure Ltd",
  "Bajaj Auto Ltd",
  "HCL Technologies Ltd",
  "Cipla Ltd",
  "Dr. Reddy's Laboratories",
] as const

// International consignees
export const INTERNATIONAL_CONSIGNEES = [
  { name: "Global Pharma Inc", country: "US" },
  { name: "Euro Auto Parts GmbH", country: "DE" },
  { name: "Dubai Gems Trading LLC", country: "AE" },
  { name: "London Textiles Ltd", country: "GB" },
  { name: "Singapore Electronics Pte", country: "SG" },
  { name: "Tokyo Industrial Co", country: "JP" },
  { name: "Paris Fashion House", country: "FR" },
  { name: "Amsterdam Trading BV", country: "NL" },
] as const
