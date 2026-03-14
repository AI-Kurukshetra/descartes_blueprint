import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limit"

const requestSchema = z.object({
  party_name: z.string().min(2),
  party_country: z.string().optional(),
  search_type: z.enum(["company", "individual"]).default("company"),
})

// Simulated denied parties database
const DENIED_PARTIES = [
  {
    name: "Volkov Trading LLC",
    aliases: ["Volkov Trade", "V Trading LLC"],
    country: "RU",
    list_type: "OFAC SDN List",
    risk_level: "critical",
    reason: "Sanctions evasion, involvement in restricted trade activities",
  },
  {
    name: "Dragon Shell Corp",
    aliases: ["Dragon Shell", "DS Corporation"],
    country: "Unknown",
    list_type: "BIS Entity List",
    risk_level: "high",
    reason: "Export control violations, military end-use concerns",
  },
  {
    name: "Northern Star Logistics",
    aliases: ["N Star Logistics", "Northern Star"],
    country: "IR",
    list_type: "OFAC",
    risk_level: "critical",
    reason: "Designated for supporting sanctioned entities",
  },
  {
    name: "Petrolex International",
    aliases: ["Petrolex", "Petrolex Intl"],
    country: "SY",
    list_type: "EU Sanctions List",
    risk_level: "high",
    reason: "Energy sector sanctions",
  },
  {
    name: "Golden Tiger Trading",
    aliases: ["GT Trading", "Golden Tiger"],
    country: "KP",
    list_type: "UN Security Council Sanctions",
    risk_level: "critical",
    reason: "WMD proliferation concerns",
  },
]

function fuzzyMatch(searchName: string, targetName: string): number {
  const search = searchName.toLowerCase().trim()
  const target = targetName.toLowerCase().trim()

  if (search === target) return 100
  if (target.includes(search) || search.includes(target)) return 85

  // Simple word matching
  const searchWords = search.split(/\s+/)
  const targetWords = target.split(/\s+/)
  const matchedWords = searchWords.filter((word) =>
    targetWords.some((tw) => tw.includes(word) || word.includes(tw))
  )

  if (matchedWords.length > 0) {
    return Math.min(75, (matchedWords.length / searchWords.length) * 100)
  }

  return 0
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (20 requests per minute)
    const clientId = `screen:${getClientIdentifier(request)}`
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.partyScreening)

    if (!rateLimitResult.success) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429, headers }
      )
    }

    const body = await request.json()
    const validatedData = requestSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { party_name, party_country } = validatedData.data

    // Check for matches
    let bestMatch = null
    let bestScore = 0

    for (const party of DENIED_PARTIES) {
      // Check main name
      let score = fuzzyMatch(party_name, party.name)

      // Check aliases
      for (const alias of party.aliases) {
        const aliasScore = fuzzyMatch(party_name, alias)
        if (aliasScore > score) score = aliasScore
      }

      // Boost score if country matches
      if (party_country && party.country === party_country) {
        score = Math.min(100, score + 10)
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = party
      }
    }

    // Determine result based on match score
    let result: "clear" | "match" | "possible_match"
    let risk_level: string
    let matched_list: string | null = null
    let match_details: string | null = null

    if (bestScore >= 80 && bestMatch) {
      result = "match"
      risk_level = bestMatch.risk_level
      matched_list = bestMatch.list_type
      match_details = JSON.stringify({
        matched_name: bestMatch.name,
        country: bestMatch.country,
        reason: bestMatch.reason,
        match_score: bestScore,
      })
    } else if (bestScore >= 50 && bestMatch) {
      result = "possible_match"
      risk_level = "medium"
      matched_list = bestMatch.list_type
      match_details = JSON.stringify({
        matched_name: bestMatch.name,
        country: bestMatch.country,
        reason: "Partial name match - manual review recommended",
        match_score: bestScore,
      })
    } else {
      result = "clear"
      risk_level = "none"
    }

    return NextResponse.json({
      success: true,
      screening: {
        party_name,
        party_country,
        result,
        risk_level,
        matched_list,
        match_details: match_details ? JSON.parse(match_details) : null,
        screened_lists: [
          "OFAC SDN List",
          "OFAC Consolidated List",
          "BIS Entity List",
          "BIS Denied Persons List",
          "EU Consolidated List",
          "UN Security Council Sanctions",
          "UK Sanctions List",
        ],
        screened_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Party screening error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during screening" },
      { status: 500 }
    )
  }
}
