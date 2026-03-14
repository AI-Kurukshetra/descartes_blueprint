import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createLCSchema = z.object({
  shipment_id: z.string().uuid(),
  lc_type: z.enum(["irrevocable", "revocable", "confirmed", "unconfirmed", "transferable", "back_to_back"]),
  amount: z.number().positive(),
  currency: z.string().length(3),
  beneficiary_name: z.string().min(2),
  beneficiary_bank: z.string().min(2),
  issuing_bank: z.string().min(2),
  expiry_date: z.string(),
  shipment_deadline: z.string().optional(),
  documents_required: z.array(z.string()).optional(),
  terms: z.string().optional(),
})

// GET - List trade finance instruments
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shipmentId = searchParams.get("shipment_id")
    const status = searchParams.get("status")

    let query = supabase
      .from("trade_finance")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (shipmentId) query = query.eq("shipment_id", shipmentId)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      instruments: data || [],
    })
  } catch (error) {
    console.error("Trade finance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch trade finance instruments" }, { status: 500 })
  }
}

// POST - Create Letter of Credit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createLCSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const data = validatedData.data

    // Verify shipment exists and belongs to user
    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .select("id, reference_no, declared_value, currency")
      .eq("id", data.shipment_id)
      .eq("user_id", user.id)
      .single()

    if (shipmentError || !shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Generate LC reference
    const lcReference = `LC-${Date.now().toString(36).toUpperCase()}`

    // Create trade finance record
    const tradeFinanceData = {
      user_id: user.id,
      shipment_id: data.shipment_id,
      instrument_type: "letter_of_credit",
      reference_number: lcReference,
      lc_type: data.lc_type,
      amount: data.amount,
      currency: data.currency,
      beneficiary_name: data.beneficiary_name,
      beneficiary_bank: data.beneficiary_bank,
      issuing_bank: data.issuing_bank,
      expiry_date: data.expiry_date,
      shipment_deadline: data.shipment_deadline,
      documents_required: data.documents_required || [
        "Commercial Invoice",
        "Bill of Lading",
        "Packing List",
        "Certificate of Origin",
        "Insurance Certificate",
      ],
      terms: data.terms,
      status: "draft",
    }

    const { data: created, error: createError } = await supabase
      .from("trade_finance")
      .insert(tradeFinanceData)
      .select()
      .single()

    if (createError) throw createError

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "create_letter_of_credit",
      entity_type: "trade_finance",
      entity_id: created.id,
      details: {
        lc_reference: lcReference,
        shipment: shipment.reference_no,
        amount: data.amount,
        currency: data.currency,
      },
    })

    return NextResponse.json({
      success: true,
      letter_of_credit: created,
    })
  } catch (error) {
    console.error("Trade finance creation error:", error)
    return NextResponse.json({ error: "Failed to create letter of credit" }, { status: 500 })
  }
}

// PATCH - Update LC status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const validStatuses = ["draft", "submitted", "approved", "active", "amended", "utilized", "expired", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }
    if (notes) updateData.notes = notes
    if (status === "active") updateData.activated_at = new Date().toISOString()
    if (status === "utilized") updateData.utilized_at = new Date().toISOString()

    const { data: updated, error } = await supabase
      .from("trade_finance")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "update_lc_status",
      entity_type: "trade_finance",
      entity_id: id,
      details: { new_status: status, notes },
    })

    return NextResponse.json({
      success: true,
      letter_of_credit: updated,
    })
  } catch (error) {
    console.error("Trade finance update error:", error)
    return NextResponse.json({ error: "Failed to update letter of credit" }, { status: 500 })
  }
}
