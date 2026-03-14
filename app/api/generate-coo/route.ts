import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const cooRequestSchema = z.object({
  shipment_id: z.string().uuid(),
  exporter_name: z.string().min(2),
  exporter_address: z.string().min(5),
  consignee_name: z.string().min(2),
  consignee_address: z.string().min(5),
  origin_country: z.string().length(2),
  destination_country: z.string().length(2),
  product_description: z.string().min(5),
  hs_code: z.string().min(4),
  quantity: z.string().min(1),
  gross_weight: z.string().min(1),
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional(),
  fta_preference: z.string().optional(),
  manufacturing_process: z.string().optional(),
  origin_criterion: z.enum(["WO", "P", "PE", "RVC", "CTC", "SP"]).default("WO"),
})

// Origin criteria descriptions
const ORIGIN_CRITERIA = {
  WO: "Wholly Obtained - Product obtained entirely in one country",
  P: "Produced - Product made in exporting country from originating materials",
  PE: "Produced Exclusively - All inputs from FTA partner countries",
  RVC: "Regional Value Content - Meets minimum local value threshold",
  CTC: "Change in Tariff Classification - HS code changed during production",
  SP: "Specific Process - Product underwent specific manufacturing process",
}

// FTA preferences with rules of origin requirements
const FTA_RULES: Record<string, { name: string; minRVC?: number; documentation: string[] }> = {
  "IN-AE": {
    name: "India-UAE CEPA",
    minRVC: 40,
    documentation: ["Exporter declaration", "Producer's certificate", "Cost breakdown"],
  },
  "IN-JP": {
    name: "India-Japan CEPA",
    minRVC: 35,
    documentation: ["Certificate of Origin", "Invoice", "Bill of Lading"],
  },
  "IN-KR": {
    name: "India-Korea CEPA",
    minRVC: 35,
    documentation: ["Certificate of Origin", "Producer's declaration"],
  },
  "USMCA": {
    name: "US-Mexico-Canada Agreement",
    minRVC: 75,
    documentation: ["Certification of Origin", "Records of production"],
  },
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = cooRequestSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const data = validatedData.data

    // Generate COO number
    const cooNumber = `COO-${Date.now().toString(36).toUpperCase()}`

    // Determine FTA benefits
    const routeKey = `${data.origin_country}-${data.destination_country}`
    const ftaRule = FTA_RULES[routeKey]

    // Build COO content
    const cooContent = {
      certificate_number: cooNumber,
      issue_date: new Date().toISOString(),
      exporter: {
        name: data.exporter_name,
        address: data.exporter_address,
        country: data.origin_country,
      },
      consignee: {
        name: data.consignee_name,
        address: data.consignee_address,
        country: data.destination_country,
      },
      goods: {
        description: data.product_description,
        hs_code: data.hs_code,
        quantity: data.quantity,
        gross_weight: data.gross_weight,
        origin_country: data.origin_country,
      },
      invoice: {
        number: data.invoice_number || "N/A",
        date: data.invoice_date || new Date().toISOString().split("T")[0],
      },
      origin_criterion: {
        code: data.origin_criterion,
        description: ORIGIN_CRITERIA[data.origin_criterion],
      },
      fta_preference: data.fta_preference ? {
        agreement: ftaRule?.name || data.fta_preference,
        preferential_rate_applicable: !!ftaRule,
        minimum_rvc: ftaRule?.minRVC,
        documentation_required: ftaRule?.documentation || [],
      } : null,
      manufacturing_process: data.manufacturing_process || null,
      certifying_authority: "TradeGuard Certification Authority",
      declaration: `The undersigned hereby declares that the above details and statements are correct; that all goods were produced in ${data.origin_country} and that they comply with the origin requirements specified.`,
      generated_by: "TradeGuard - AI-Powered Trade Compliance Platform",
      generated_at: new Date().toISOString(),
    }

    // Save certificate to database
    const { data: certificate, error } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        shipment_id: data.shipment_id,
        certificate_type: "origin",
        certificate_number: cooNumber,
        issuing_authority: "TradeGuard Certification Authority",
        issue_date: new Date().toISOString().split("T")[0],
        status: "approved",
        origin_country: data.origin_country,
        destination_country: data.destination_country,
        product_description: data.product_description,
        hs_code: data.hs_code,
        content_json: cooContent,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving certificate:", error)
      // Continue even if save fails, return the generated content
    }

    // Also create a trade document entry
    await supabase.from("trade_documents").insert({
      user_id: user.id,
      shipment_id: data.shipment_id,
      doc_type: "certificate_of_origin",
      doc_number: cooNumber,
      status: "generated",
      content_json: cooContent,
      version: 1,
      version_history: [],
    })

    // Log to audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "generate_coo",
      entity_type: "certificate",
      entity_id: certificate?.id,
      details: {
        certificate_number: cooNumber,
        shipment_id: data.shipment_id,
        origin_country: data.origin_country,
        destination_country: data.destination_country,
        hs_code: data.hs_code,
      },
    })

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate?.id,
        certificate_number: cooNumber,
        content: cooContent,
        status: "approved",
      },
    })
  } catch (error) {
    console.error("COO generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate Certificate of Origin" },
      { status: 500 }
    )
  }
}
