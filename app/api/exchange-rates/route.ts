import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Fallback rates when API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AED: 3.67,
  CAD: 1.36,
  AUD: 1.53,
  SGD: 1.34,
  KRW: 1320.50,
  BRL: 4.97,
  MXN: 17.15,
  ZAR: 18.75,
  CHF: 0.88,
  HKD: 7.82,
  THB: 35.50,
  MYR: 4.72,
  PHP: 55.85,
  IDR: 15650,
  VND: 24350,
}

// GET - Fetch current exchange rates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const baseCurrency = searchParams.get("base") || "USD"
    const targetCurrency = searchParams.get("target")

    const supabase = await createClient()

    // Try to get rates from database first (cached)
    const today = new Date().toISOString().split("T")[0]
    const { data: cachedRates } = await supabase
      .from("exchange_rates")
      .select("target_currency, rate")
      .eq("base_currency", baseCurrency)
      .gte("fetched_at", `${today}T00:00:00`)

    let rates: Record<string, number> = {}

    if (cachedRates && cachedRates.length > 0) {
      // Use cached rates
      cachedRates.forEach(r => {
        rates[r.target_currency] = parseFloat(r.rate)
      })
    } else {
      // Use fallback rates (in production, would call external API here)
      // Example external API call (commented out):
      // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      // const data = await response.json()
      // rates = data.rates

      rates = { ...FALLBACK_RATES }

      // Cache rates in database
      const rateEntries = Object.entries(rates).map(([currency, rate]) => ({
        base_currency: baseCurrency,
        target_currency: currency,
        rate,
        source: "fallback",
      }))

      await supabase.from("exchange_rates").upsert(rateEntries, {
        onConflict: "base_currency,target_currency,fetched_at",
      })
    }

    // Add USD = 1 rate
    rates["USD"] = 1

    // If specific target requested, return only that
    if (targetCurrency) {
      const rate = rates[targetCurrency]
      if (!rate) {
        return NextResponse.json(
          { error: `Rate not available for ${targetCurrency}` },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        base: baseCurrency,
        target: targetCurrency,
        rate,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      base: baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Exchange rate error:", error)
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    )
  }
}

// POST - Convert amount between currencies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, from, to } = body

    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: "Missing required fields: amount, from, to" },
        { status: 400 }
      )
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Get rates
    const supabase = await createClient()
    const { data: fromRate } = await supabase
      .from("exchange_rates")
      .select("rate")
      .eq("base_currency", "USD")
      .eq("target_currency", from)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single()

    const { data: toRate } = await supabase
      .from("exchange_rates")
      .select("rate")
      .eq("base_currency", "USD")
      .eq("target_currency", to)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single()

    // Use fallback if not in DB
    const fromRateValue = from === "USD" ? 1 : (fromRate?.rate || FALLBACK_RATES[from] || 1)
    const toRateValue = to === "USD" ? 1 : (toRate?.rate || FALLBACK_RATES[to] || 1)

    // Convert: amount in FROM -> USD -> TO
    const usdAmount = numAmount / fromRateValue
    const convertedAmount = usdAmount * toRateValue

    return NextResponse.json({
      success: true,
      original: {
        amount: numAmount,
        currency: from,
      },
      converted: {
        amount: Math.round(convertedAmount * 100) / 100,
        currency: to,
      },
      rate: toRateValue / fromRateValue,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Currency conversion error:", error)
    return NextResponse.json(
      { error: "Failed to convert currency" },
      { status: 500 }
    )
  }
}
