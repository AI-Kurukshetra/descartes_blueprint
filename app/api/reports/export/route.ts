import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Export reports as CSV or JSON
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "shipments"
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    let data: Record<string, unknown>[] = []
    let filename = ""

    switch (reportType) {
      case "shipments": {
        let query = supabase
          .from("shipments")
          .select("reference_no, origin_country, destination_country, shipper_name, consignee_name, product_name, hs_code, declared_value, currency, status, compliance_status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (startDate) query = query.gte("created_at", startDate)
        if (endDate) query = query.lte("created_at", endDate)

        const { data: shipments, error } = await query
        if (error) throw error
        data = shipments || []
        filename = `shipments_export_${new Date().toISOString().split("T")[0]}`
        break
      }

      case "compliance": {
        const { data: exceptions, error } = await supabase
          .from("compliance_exceptions")
          .select("id, exception_type, severity, description, status, assigned_to, created_at, resolved_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        data = exceptions || []
        filename = `compliance_export_${new Date().toISOString().split("T")[0]}`
        break
      }

      case "classifications": {
        const { data: classifications, error } = await supabase
          .from("hs_classifications")
          .select("product_description, suggested_hs_code, hs_chapter, confidence_score, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        data = classifications || []
        filename = `hs_classifications_${new Date().toISOString().split("T")[0]}`
        break
      }

      case "duty_calculations": {
        const { data: calculations, error } = await supabase
          .from("duty_calculations")
          .select("origin_country, destination_country, hs_code, product_description, declared_value, currency, duty_amount, vat_amount, total_landed_cost, fta_applicable, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        data = calculations || []
        filename = `duty_calculations_${new Date().toISOString().split("T")[0]}`
        break
      }

      case "denied_party": {
        const { data: screenings, error } = await supabase
          .from("denied_party_screenings")
          .select("party_name, party_country, search_type, result, risk_level, matched_list, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        data = screenings || []
        filename = `denied_party_screenings_${new Date().toISOString().split("T")[0]}`
        break
      }

      case "audit": {
        const { data: logs, error } = await supabase
          .from("audit_logs")
          .select("action, entity_type, details, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1000)

        if (error) throw error
        data = logs || []
        filename = `audit_log_${new Date().toISOString().split("T")[0]}`
        break
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Log export action
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "export_report",
      entity_type: "report",
      details: { report_type: reportType, format, record_count: data.length },
    })

    if (format === "csv") {
      if (data.length === 0) {
        return new NextResponse("No data to export", {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}.csv"`,
          },
        })
      }

      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(","),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header]
            if (value === null || value === undefined) return ""
            if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            const stringValue = String(value)
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          }).join(",")
        ),
      ]

      return new NextResponse(csvRows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }

    // JSON format
    return NextResponse.json({
      success: true,
      report_type: reportType,
      record_count: data.length,
      exported_at: new Date().toISOString(),
      data,
    })
  } catch (error) {
    console.error("Report export error:", error)
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 })
  }
}
