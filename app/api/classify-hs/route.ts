import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limit"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const requestSchema = z.object({
  productDescription: z.string().min(10),
  countryOfOrigin: z.string().min(2),
  productName: z.string().optional(),
  intendedUse: z.string().optional(),
})

const systemPrompt = `You are an expert customs classifier with deep knowledge of the Harmonized System (HS) nomenclature used in international trade.

Classify products and return ONLY a valid JSON object (no markdown, no code blocks):
{
  "hsCode": "XXXX.XX.XX",
  "chapter": "Chapter XX - Description",
  "description": "Official HS description for this product",
  "confidence": 87,
  "reasoning": "Brief explanation of why this HS code applies based on product characteristics",
  "tradeRestrictions": "Any known export/import restrictions or licensing requirements, or 'None known' if none"
}

Important guidelines:
- Use the full 8-digit HS code format when possible (e.g., "3004.90.90")
- Confidence should be a number from 0-100 reflecting your certainty
- Higher confidence (>85) for specific product descriptions
- Lower confidence (<70) for vague or ambiguous descriptions
- Consider the country of origin for any specific tariff considerations
- Be precise and professional in your reasoning`

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (10 requests per minute as specified)
    const clientId = `hs:${getClientIdentifier(request)}`
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.hsClassification)

    if (!rateLimitResult.success) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429, headers }
      )
    }

    // Validate API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
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

    const { productDescription, countryOfOrigin, productName, intendedUse } =
      validatedData.data

    const userMessage = `Classify the following product for customs purposes:

Product Name: ${productName || "Not specified"}
Description: ${productDescription}
Country of Origin: ${countryOfOrigin}
${intendedUse ? `Intended Use: ${intendedUse}` : ""}

Provide the HS code classification as a JSON object.`

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let classification
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedResponse = responseContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      classification = JSON.parse(cleanedResponse)
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          rawResponse: responseContent,
        },
        { status: 500 }
      )
    }

    // Validate the response structure
    const expectedFields = [
      "hsCode",
      "chapter",
      "description",
      "confidence",
      "reasoning",
    ]
    const missingFields = expectedFields.filter(
      (field) => !(field in classification)
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Incomplete classification response",
          missingFields,
          classification,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      classification: {
        hsCode: classification.hsCode,
        chapter: classification.chapter,
        description: classification.description,
        confidence: Number(classification.confidence),
        reasoning: classification.reasoning,
        tradeRestrictions: classification.tradeRestrictions || "None known",
      },
    })
  } catch (error) {
    console.error("HS Classification error:", error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during classification" },
      { status: 500 }
    )
  }
}
