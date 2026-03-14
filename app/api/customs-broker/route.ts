import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const submitDeclarationSchema = z.object({
  shipment_id: z.string().uuid(),
  broker_id: z.string().uuid(),
  declaration_type: z.enum(["import", "export", "transit"]),
  documents: z.array(z.string()).optional(),
})

// GET - List available customs brokers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")

    let query = supabase
      .from("customs_brokers")
      .select("id, name, license_number, countries, contact_email, contact_phone, rating, status")
      .eq("status", "active")

    if (country) {
      query = query.contains("countries", [country])
    }

    const { data: brokers, error } = await query.order("rating", { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      brokers: brokers || [],
    })
  } catch (error) {
    console.error("Customs broker fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch brokers" }, { status: 500 })
  }
}

// POST - Submit customs declaration to broker
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = submitDeclarationSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { shipment_id, broker_id, declaration_type, documents } = validatedData.data

    // Fetch shipment details
    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", shipment_id)
      .eq("user_id", user.id)
      .single()

    if (shipmentError || !shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Fetch broker details
    const { data: broker, error: brokerError } = await supabase
      .from("customs_brokers")
      .select("*")
      .eq("id", broker_id)
      .single()

    if (brokerError || !broker) {
      return NextResponse.json({ error: "Broker not found" }, { status: 404 })
    }

    // Generate declaration reference
    const declarationRef = `DEC-${Date.now().toString(36).toUpperCase()}`

    // Create declaration record
    const declarationData = {
      reference: declarationRef,
      shipment_id,
      broker_id,
      broker_name: broker.name,
      declaration_type,
      status: "submitted",
      shipment_details: {
        reference_no: shipment.reference_no,
        origin_country: shipment.origin_country,
        destination_country: shipment.destination_country,
        hs_code: shipment.hs_code,
        declared_value: shipment.declared_value,
        currency: shipment.currency,
      },
      documents: documents || [],
      submitted_at: new Date().toISOString(),
    }

    // In production, this would call the broker's API
    // For now, we simulate the submission
    const mockBrokerResponse = {
      broker_reference: `${broker.name.substring(0, 3).toUpperCase()}-${Date.now()}`,
      estimated_clearance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      required_documents: [
        "Commercial Invoice",
        "Packing List",
        "Bill of Lading",
        declaration_type === "import" ? "Import License" : "Export License",
      ],
      fees: {
        broker_fee: 150,
        customs_duty: shipment.duty_amount || 0,
        processing_fee: 50,
        currency: "USD",
      },
    }

    // Update shipment with broker info
    await supabase
      .from("shipments")
      .update({
        customs_broker: broker.name,
        status: "pending_clearance",
      })
      .eq("id", shipment_id)

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "submit_customs_declaration",
      entity_type: "shipment",
      entity_id: shipment_id,
      details: {
        declaration_ref: declarationRef,
        broker: broker.name,
        declaration_type,
      },
    })

    return NextResponse.json({
      success: true,
      declaration: {
        ...declarationData,
        broker_response: mockBrokerResponse,
      },
    })
  } catch (error) {
    console.error("Customs declaration error:", error)
    return NextResponse.json({ error: "Failed to submit declaration" }, { status: 500 })
  }
}
