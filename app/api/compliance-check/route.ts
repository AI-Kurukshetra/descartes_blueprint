import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const checkSchema = z.object({
  origin_country: z.string().length(2),
  destination_country: z.string().length(2),
  hs_code: z.string().min(4),
  product_description: z.string().optional(),
  declared_value: z.number().optional(),
  shipper_name: z.string().optional(),
  consignee_name: z.string().optional(),
})

interface ComplianceViolation {
  rule_id: string
  rule_name: string
  rule_type: string
  severity: "low" | "medium" | "high" | "critical"
  action: "warn" | "block" | "require_approval" | "notify"
  message: string
  details?: Record<string, unknown>
}

interface ComplianceResult {
  compliant: boolean
  violations: ComplianceViolation[]
  warnings: ComplianceViolation[]
  approvals_required: ComplianceViolation[]
  fta_benefits: {
    available: boolean
    agreement_name?: string
    potential_savings?: number
  }
  documentation_required: string[]
  risk_score: number
  recommendations: string[]
}

// Sanctioned countries
const SANCTIONED_COUNTRIES = ["RU", "IR", "KP", "SY", "CU"]
const PARTIAL_SANCTIONS = ["CN", "BY", "VE"]

// Restricted HS codes (dual-use, controlled items)
const RESTRICTED_HS_CODES: Record<string, { restriction: string; countries: string[] }> = {
  "8401": { restriction: "Nuclear technology - requires export license", countries: ["*"] },
  "8541": { restriction: "Semiconductor devices - export controls", countries: ["CN", "RU"] },
  "8542": { restriction: "Electronic integrated circuits - export controls", countries: ["CN", "RU"] },
  "9013": { restriction: "Laser equipment - dual-use controls", countries: ["CN", "RU", "IR"] },
  "9014": { restriction: "Navigation equipment - defense controls", countries: ["CN", "RU", "IR", "KP"] },
  "9015": { restriction: "Surveying equipment - potential dual-use", countries: ["CN", "RU"] },
  "8802": { restriction: "Aircraft - aerospace export controls", countries: ["CN", "RU", "IR"] },
  "9306": { restriction: "Ammunition - defense articles", countries: ["*"] },
}

// Documentation requirements by route/product
const DOC_REQUIREMENTS: Record<string, string[]> = {
  "plant_products": ["Phytosanitary Certificate", "Fumigation Certificate"],
  "food": ["Health Certificate", "Certificate of Analysis", "FDA Prior Notice"],
  "chemicals": ["Material Safety Data Sheet (MSDS)", "Dangerous Goods Declaration"],
  "pharmaceuticals": ["Drug Import License", "Certificate of Pharmaceutical Product (CPP)"],
  "textiles": ["Certificate of Origin", "Textile Declaration"],
  "electronics": ["FCC Declaration of Conformity", "CE Marking Certificate"],
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = checkSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const data = validatedData.data
    const result: ComplianceResult = {
      compliant: true,
      violations: [],
      warnings: [],
      approvals_required: [],
      fta_benefits: { available: false },
      documentation_required: ["Commercial Invoice", "Packing List", "Bill of Lading"],
      risk_score: 0,
      recommendations: [],
    }

    // Check 1: Sanctioned countries
    if (SANCTIONED_COUNTRIES.includes(data.destination_country)) {
      result.compliant = false
      result.violations.push({
        rule_id: "SANCTION-001",
        rule_name: "Trade Sanctions",
        rule_type: "prohibition",
        severity: "critical",
        action: "block",
        message: `Trade with ${data.destination_country} is prohibited due to international sanctions.`,
        details: {
          country: data.destination_country,
          sanction_type: "comprehensive",
          lists: ["OFAC", "UN Security Council", "EU Sanctions"],
        },
      })
      result.risk_score = 100
    }

    if (SANCTIONED_COUNTRIES.includes(data.origin_country)) {
      result.compliant = false
      result.violations.push({
        rule_id: "SANCTION-002",
        rule_name: "Import Sanctions",
        rule_type: "prohibition",
        severity: "critical",
        action: "block",
        message: `Imports from ${data.origin_country} are prohibited due to international sanctions.`,
      })
      result.risk_score = 100
    }

    // Check 2: Partial sanctions
    if (PARTIAL_SANCTIONS.includes(data.destination_country)) {
      result.warnings.push({
        rule_id: "SANCTION-003",
        rule_name: "Partial Trade Restrictions",
        rule_type: "restriction",
        severity: "high",
        action: "warn",
        message: `Enhanced due diligence required for trade with ${data.destination_country}.`,
      })
      result.risk_score = Math.max(result.risk_score, 60)
    }

    // Check 3: Restricted HS codes
    const hsPrefix = data.hs_code.substring(0, 4)
    const restriction = RESTRICTED_HS_CODES[hsPrefix]
    if (restriction) {
      if (restriction.countries.includes("*") || restriction.countries.includes(data.destination_country)) {
        result.approvals_required.push({
          rule_id: `HS-RESTRICT-${hsPrefix}`,
          rule_name: "Export Control",
          rule_type: "license",
          severity: "high",
          action: "require_approval",
          message: restriction.restriction,
          details: {
            hs_code: data.hs_code,
            controlled_destinations: restriction.countries,
          },
        })
        result.documentation_required.push("Export License")
        result.risk_score = Math.max(result.risk_score, 70)
      }
    }

    // Check 4: Query database for custom compliance rules
    const { data: dbRules } = await supabase
      .from("compliance_rules")
      .select("*")
      .eq("active", true)
      .or(
        `destination_countries.cs.{${data.destination_country}},destination_countries.eq.{}`
      )

    if (dbRules) {
      for (const rule of dbRules) {
        // Check if HS code matches (empty array = all codes)
        const hsMatch = !rule.hs_codes?.length ||
          rule.hs_codes.some((code: string) => data.hs_code.startsWith(code))

        // Check if origin matches
        const originMatch = !rule.origin_countries?.length ||
          rule.origin_countries.includes(data.origin_country)

        if (hsMatch && originMatch) {
          const violation: ComplianceViolation = {
            rule_id: rule.id,
            rule_name: rule.name,
            rule_type: rule.rule_type,
            severity: rule.severity as ComplianceViolation["severity"],
            action: rule.action as ComplianceViolation["action"],
            message: rule.message || rule.description,
          }

          if (rule.action === "block") {
            result.compliant = false
            result.violations.push(violation)
            result.risk_score = Math.max(result.risk_score, 100)
          } else if (rule.action === "require_approval") {
            result.approvals_required.push(violation)
            result.risk_score = Math.max(result.risk_score, 70)
          } else {
            result.warnings.push(violation)
            result.risk_score = Math.max(result.risk_score, 40)
          }
        }
      }
    }

    // Check 5: FTA benefits
    const { data: ftas } = await supabase
      .from("trade_agreements")
      .select("*")
      .eq("active", true)
      .contains("member_countries", [data.origin_country, data.destination_country])

    if (ftas && ftas.length > 0) {
      const fta = ftas[0]
      result.fta_benefits = {
        available: true,
        agreement_name: fta.name,
        potential_savings: data.declared_value
          ? (data.declared_value * (fta.duty_reduction_percent || 0)) / 100
          : undefined,
      }
      result.documentation_required.push("Certificate of Origin")
      result.recommendations.push(
        `Eligible for ${fta.name} preferential rates. Ensure Certificate of Origin is obtained.`
      )
    }

    // Check 6: Denied party screening for shipper/consignee
    if (data.shipper_name || data.consignee_name) {
      const { data: deniedParties } = await supabase
        .from("denied_parties")
        .select("*")

      if (deniedParties) {
        for (const party of deniedParties) {
          const names = [data.shipper_name?.toLowerCase(), data.consignee_name?.toLowerCase()]
          const partyNames = [party.name.toLowerCase(), ...(party.aliases || []).map((a: string) => a.toLowerCase())]

          for (const name of names.filter(Boolean)) {
            for (const partyName of partyNames) {
              if (name && partyName.includes(name) || name?.includes(partyName)) {
                result.compliant = false
                result.violations.push({
                  rule_id: `DPS-${party.id}`,
                  rule_name: "Denied Party Match",
                  rule_type: "prohibition",
                  severity: "critical",
                  action: "block",
                  message: `Potential match with denied party: ${party.name} (${party.list_type})`,
                  details: {
                    matched_party: party.name,
                    list: party.list_type,
                    reason: party.reason,
                  },
                })
                result.risk_score = 100
              }
            }
          }
        }
      }
    }

    // Add recommendations based on risk score
    if (result.risk_score >= 70) {
      result.recommendations.push("Consider engaging a licensed customs broker for this shipment.")
    }
    if (result.risk_score >= 40 && result.risk_score < 70) {
      result.recommendations.push("Ensure all documentation is accurate and complete before shipping.")
    }
    if (result.approvals_required.length > 0) {
      result.recommendations.push("Obtain all required licenses and approvals before proceeding.")
    }

    // Log compliance check to audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "compliance_check",
      entity_type: "shipment",
      details: {
        input: data,
        compliant: result.compliant,
        risk_score: result.risk_score,
        violations_count: result.violations.length,
        warnings_count: result.warnings.length,
      },
    })

    return NextResponse.json({
      success: true,
      result,
      checked_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Compliance check error:", error)
    return NextResponse.json(
      { error: "Failed to perform compliance check" },
      { status: 500 }
    )
  }
}
