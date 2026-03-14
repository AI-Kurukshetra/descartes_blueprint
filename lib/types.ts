// Shipment types
export interface Shipment {
  id: string
  user_id: string
  reference_no: string
  origin_country: string
  destination_country: string
  shipper_name: string
  consignee_name: string
  product_name: string
  hs_code: string
  declared_value: number
  currency: string
  weight_kg: number
  incoterm: string
  status: ShipmentStatus
  duty_amount: number | null
  tax_amount: number | null
  customs_broker: string | null
  freight_forwarder: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  compliance_status: ComplianceStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type ShipmentStatus =
  | "in_transit"
  | "pending_clearance"
  | "cleared"
  | "flagged"
  | "delivered"

export type ComplianceStatus = "compliant" | "review_required" | "flagged"

// Product types
export interface Product {
  id: string
  user_id: string
  name: string
  description: string
  hs_code: string
  hs_confidence: number
  country_of_origin: string
  weight_kg: number
  value_usd: number
  category: string
  is_restricted: boolean
  created_at: string
  updated_at: string
}

// HS Classification types
export interface HSClassification {
  id: string
  user_id: string
  product_description: string
  suggested_hs_code: string
  hs_chapter: string
  hs_description: string
  confidence_score: number
  reasoning: string
  status: ClassificationStatus
  created_at: string
}

export type ClassificationStatus = "accepted" | "rejected" | "pending"

// Duty Calculation types
export interface DutyCalculation {
  id: string
  user_id: string
  origin_country: string
  destination_country: string
  hs_code: string
  product_description: string
  declared_value: number
  currency: string
  duty_rate: number
  duty_amount: number
  vat_rate: number
  vat_amount: number
  other_fees: number
  total_landed_cost: number
  fta_applicable: boolean
  fta_name: string | null
  savings_vs_standard: number | null
  created_at: string
}

// Denied Party Screening types
export interface DeniedPartyScreening {
  id: string
  user_id: string
  party_name: string
  party_country: string | null
  search_type: SearchType
  result: ScreeningResult
  risk_level: RiskLevel
  matched_list: string | null
  match_details: string | null
  created_at: string
}

export type SearchType = "company" | "individual"
export type ScreeningResult = "clear" | "match" | "possible_match"
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical"

// Trade Document types
export interface TradeDocument {
  id: string
  user_id: string
  shipment_id: string
  doc_type: DocumentType
  doc_number: string
  status: DocumentStatus
  content_json: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type DocumentType =
  | "commercial_invoice"
  | "packing_list"
  | "certificate_of_origin"
  | "bill_of_lading"
  | "phytosanitary"

export type DocumentStatus = "draft" | "generated" | "submitted" | "approved"

// Compliance Exception types
export interface ComplianceException {
  id: string
  user_id: string
  shipment_id: string
  exception_type: string
  severity: Severity
  description: string
  status: ExceptionStatus
  assigned_to: string | null
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export type Severity = "low" | "medium" | "high" | "critical"
export type ExceptionStatus = "open" | "in_review" | "resolved" | "waived"

// Audit Log types
export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// User types
export interface User {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
}

// Denied Party (watchlist) types
export interface DeniedParty {
  id: string
  name: string
  aliases: string[]
  country: string
  list_type: string
  risk_level: RiskLevel
  reason: string
  created_at: string
}

// Chart data types
export interface DailyShipmentData {
  date: string
  shipments: number
  compliant: number
}

export interface DutyByCountry {
  country: string
  amount: number
}
