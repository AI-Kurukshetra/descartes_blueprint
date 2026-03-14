import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { faker } from "@faker-js/faker"
import { subDays, format } from "date-fns"

// Load environment variables from .env.local
config({ path: ".env.local" })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Constants
const DEMO_EMAIL = "demo@tradeguard.com"
const DEMO_PASSWORD = "demo1234"

const SHIPPERS = [
  "Tata Global Exports Pvt Ltd",
  "Reliance Industries Ltd",
  "Sun Pharma International",
  "Mahindra Logistics Ltd",
  "Wipro Infrastructure Ltd",
  "Bajaj Auto Ltd",
  "HCL Technologies Ltd",
  "Cipla Ltd",
  "Dr. Reddy's Laboratories",
  "Infosys BPO Ltd",
]

const CONSIGNEES = [
  { name: "Global Pharma Inc", country: "US" },
  { name: "Euro Auto Parts GmbH", country: "DE" },
  { name: "Dubai Gems Trading LLC", country: "AE" },
  { name: "London Textiles Ltd", country: "GB" },
  { name: "Singapore Electronics Pte", country: "SG" },
  { name: "Tokyo Industrial Co", country: "JP" },
  { name: "Paris Fashion House", country: "FR" },
  { name: "Amsterdam Trading BV", country: "NL" },
  { name: "Shanghai Imports Co", country: "CN" },
]

const PRODUCTS = [
  { name: "Pharmaceutical Tablets", hs_code: "3004.90", category: "Pharmaceuticals" },
  { name: "Cotton Yarn", hs_code: "5205.11", category: "Textiles" },
  { name: "Automotive Brake Pads", hs_code: "8708.30", category: "Auto Parts" },
  { name: "Electronic Circuit Boards", hs_code: "8534.00", category: "Electronics" },
  { name: "Polished Diamonds", hs_code: "7102.39", category: "Gems" },
  { name: "Stainless Steel Pipes", hs_code: "7304.41", category: "Steel" },
  { name: "Leather Handbags", hs_code: "4202.21", category: "Leather Goods" },
  { name: "Basmati Rice", hs_code: "1006.30", category: "Food Products" },
]

const ROUTES = [
  { origin: "IN", destination: "US" },
  { origin: "IN", destination: "DE" },
  { origin: "IN", destination: "AE" },
  { origin: "IN", destination: "GB" },
  { origin: "IN", destination: "SG" },
  { origin: "CN", destination: "IN" },
  { origin: "IN", destination: "JP" },
]

const STATUSES = ["in_transit", "pending_clearance", "cleared", "flagged", "delivered"]
const COMPLIANCE_STATUSES = ["compliant", "review_required", "flagged"]
const INCOTERMS = ["FOB", "CIF", "EXW", "DDP", "DAP"]

async function seed() {
  console.log("Starting seed process...")

  // Create demo user
  console.log("Creating demo user...")
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: "Demo User",
      company_name: "TradeGuard Demo",
    },
  })

  if (authError && !authError.message.includes("already been registered")) {
    console.error("Error creating user:", authError)
    return
  }

  // Get user ID (either new or existing)
  let userId: string
  if (authData?.user) {
    userId = authData.user.id
  } else {
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const user = existingUser.users.find((u) => u.email === DEMO_EMAIL)
    if (!user) {
      console.error("Could not find or create demo user")
      return
    }
    userId = user.id
  }

  console.log(`Using user ID: ${userId}`)

  // Generate shipments
  console.log("Creating shipments...")
  const shipments = []
  for (let i = 0; i < 35; i++) {
    const route = faker.helpers.arrayElement(ROUTES)
    const product = faker.helpers.arrayElement(PRODUCTS)
    const consignee = CONSIGNEES.find((c) => c.country === route.destination) ||
      faker.helpers.arrayElement(CONSIGNEES)
    const status = faker.helpers.weightedArrayElement([
      { value: "in_transit", weight: 12 },
      { value: "pending_clearance", weight: 8 },
      { value: "cleared", weight: 10 },
      { value: "flagged", weight: 3 },
      { value: "delivered", weight: 2 },
    ])

    shipments.push({
      user_id: userId,
      reference_no: `TG-2026-${String(i + 108).padStart(5, "0")}`,
      origin_country: route.origin,
      destination_country: route.destination,
      shipper_name: faker.helpers.arrayElement(SHIPPERS),
      consignee_name: consignee.name,
      product_name: product.name,
      hs_code: product.hs_code,
      declared_value: faker.number.int({ min: 50000, max: 5000000 }),
      currency: "USD",
      weight_kg: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
      incoterm: faker.helpers.arrayElement(INCOTERMS),
      status,
      duty_amount: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
      tax_amount: faker.number.float({ min: 500, max: 50000, fractionDigits: 2 }),
      customs_broker: faker.company.name() + " Customs",
      freight_forwarder: faker.company.name() + " Logistics",
      estimated_delivery: format(subDays(new Date(), faker.number.int({ min: -10, max: 30 })), "yyyy-MM-dd"),
      compliance_status: status === "flagged" ? "flagged" : faker.helpers.arrayElement(["compliant", "compliant", "review_required"]),
      created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
    })
  }

  const { error: shipmentsError } = await supabase.from("shipments").insert(shipments)
  if (shipmentsError) console.error("Shipments error:", shipmentsError)
  else console.log(`Created ${shipments.length} shipments`)

  // Generate products
  console.log("Creating products...")
  const products = PRODUCTS.map((p) => ({
    user_id: userId,
    name: p.name,
    description: faker.commerce.productDescription(),
    hs_code: p.hs_code,
    hs_confidence: faker.number.int({ min: 75, max: 98 }),
    country_of_origin: "IN",
    weight_kg: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    value_usd: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
    category: p.category,
    is_restricted: faker.datatype.boolean({ probability: 0.1 }),
  }))

  const { error: productsError } = await supabase.from("products").insert(products)
  if (productsError) console.error("Products error:", productsError)
  else console.log(`Created ${products.length} products`)

  // Generate HS classifications
  console.log("Creating HS classifications...")
  const classifications = []
  for (let i = 0; i < 15; i++) {
    const product = faker.helpers.arrayElement(PRODUCTS)
    classifications.push({
      user_id: userId,
      product_description: faker.commerce.productDescription(),
      suggested_hs_code: product.hs_code,
      hs_chapter: `Chapter ${product.hs_code.split(".")[0]} - ${product.category}`,
      hs_description: `${product.name} and similar goods`,
      confidence_score: faker.number.int({ min: 65, max: 97 }),
      reasoning: `Based on product characteristics and material composition, this item is classified under HS ${product.hs_code}.`,
      status: faker.helpers.weightedArrayElement([
        { value: "accepted", weight: 10 },
        { value: "rejected", weight: 2 },
        { value: "pending", weight: 3 },
      ]),
      created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
    })
  }

  const { error: classificationsError } = await supabase.from("hs_classifications").insert(classifications)
  if (classificationsError) console.error("Classifications error:", classificationsError)
  else console.log(`Created ${classifications.length} HS classifications`)

  // Generate duty calculations
  console.log("Creating duty calculations...")
  const dutyCalculations = []
  for (let i = 0; i < 20; i++) {
    const route = faker.helpers.arrayElement(ROUTES)
    const product = faker.helpers.arrayElement(PRODUCTS)
    const declaredValue = faker.number.float({ min: 5000, max: 500000, fractionDigits: 2 })
    const dutyRate = faker.number.float({ min: 0, max: 15, fractionDigits: 2 })
    const vatRate = faker.number.float({ min: 0, max: 20, fractionDigits: 2 })
    const dutyAmount = declaredValue * (dutyRate / 100)
    const vatAmount = (declaredValue + dutyAmount) * (vatRate / 100)
    const otherFees = faker.number.float({ min: 50, max: 500, fractionDigits: 2 })
    const ftaApplicable = faker.datatype.boolean({ probability: 0.25 })

    dutyCalculations.push({
      user_id: userId,
      origin_country: route.origin,
      destination_country: route.destination,
      hs_code: product.hs_code,
      product_description: product.name,
      declared_value: declaredValue,
      currency: "USD",
      duty_rate: dutyRate,
      duty_amount: dutyAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      other_fees: otherFees,
      total_landed_cost: declaredValue + dutyAmount + vatAmount + otherFees,
      fta_applicable: ftaApplicable,
      fta_name: ftaApplicable ? faker.helpers.arrayElement(["India-Singapore CECA", "India-UAE CEPA", "India-Japan CEPA"]) : null,
      savings_vs_standard: ftaApplicable ? faker.number.float({ min: 500, max: 50000, fractionDigits: 2 }) : null,
      created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
    })
  }

  const { error: dutyError } = await supabase.from("duty_calculations").insert(dutyCalculations)
  if (dutyError) console.error("Duty calculations error:", dutyError)
  else console.log(`Created ${dutyCalculations.length} duty calculations`)

  // Generate denied party screenings
  console.log("Creating denied party screenings...")
  const screenings = []
  const matchedParties = [
    { name: "Volkov Trading LLC", country: "RU", list: "OFAC SDN List", risk: "critical" },
    { name: "Dragon Shell Corp", country: "Unknown", list: "BIS Entity List", risk: "high" },
    { name: "Northern Star Logistics", country: "IR", list: "OFAC", risk: "critical" },
  ]

  // Clear results
  for (let i = 0; i < 8; i++) {
    screenings.push({
      user_id: userId,
      party_name: faker.company.name(),
      party_country: faker.helpers.arrayElement(["US", "DE", "GB", "SG", "JP"]),
      search_type: faker.helpers.arrayElement(["company", "individual"]),
      result: "clear",
      risk_level: "none",
      matched_list: null,
      match_details: null,
      created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
    })
  }

  // Match results
  for (const party of matchedParties) {
    screenings.push({
      user_id: userId,
      party_name: party.name,
      party_country: party.country,
      search_type: "company",
      result: "match",
      risk_level: party.risk,
      matched_list: party.list,
      match_details: `Matched against ${party.list}. Direct name match found.`,
      created_at: subDays(new Date(), faker.number.int({ min: 0, max: 15 })).toISOString(),
    })
  }

  // Possible match
  screenings.push({
    user_id: userId,
    party_name: "Northern Trading Co",
    party_country: "AE",
    search_type: "company",
    result: "possible_match",
    risk_level: "medium",
    matched_list: "OFAC",
    match_details: "Partial name match with 'Northern Star Logistics'. Manual review recommended.",
    created_at: subDays(new Date(), 5).toISOString(),
  })

  const { error: screeningsError } = await supabase.from("denied_party_screenings").insert(screenings)
  if (screeningsError) console.error("Screenings error:", screeningsError)
  else console.log(`Created ${screenings.length} denied party screenings`)

  // Generate trade documents
  console.log("Creating trade documents...")
  const { data: shipmentIds } = await supabase.from("shipments").select("id").limit(25)
  const documents = []
  const docTypes = ["commercial_invoice", "packing_list", "certificate_of_origin", "bill_of_lading"]
  const docStatuses = ["draft", "generated", "submitted", "approved"]

  if (shipmentIds) {
    for (const shipment of shipmentIds) {
      const numDocs = faker.number.int({ min: 1, max: 3 })
      for (let i = 0; i < numDocs; i++) {
        documents.push({
          user_id: userId,
          shipment_id: shipment.id,
          doc_type: faker.helpers.arrayElement(docTypes),
          doc_number: `DOC-${faker.string.alphanumeric(8).toUpperCase()}`,
          status: faker.helpers.arrayElement(docStatuses),
          content_json: {},
          created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
        })
      }
    }
  }

  const { error: docsError } = await supabase.from("trade_documents").insert(documents)
  if (docsError) console.error("Documents error:", docsError)
  else console.log(`Created ${documents.length} trade documents`)

  // Generate compliance exceptions
  console.log("Creating compliance exceptions...")
  const exceptions = []
  const exceptionTypes = ["Documentation Missing", "HS Code Mismatch", "Value Discrepancy", "License Required", "Restricted Destination"]
  const severities = ["low", "medium", "high", "critical"]

  if (shipmentIds) {
    for (let i = 0; i < 8; i++) {
      const isResolved = i < 3
      exceptions.push({
        user_id: userId,
        shipment_id: faker.helpers.arrayElement(shipmentIds).id,
        exception_type: faker.helpers.arrayElement(exceptionTypes),
        severity: faker.helpers.arrayElement(severities),
        description: faker.lorem.sentence(),
        status: isResolved ? "resolved" : faker.helpers.arrayElement(["open", "in_review"]),
        assigned_to: faker.person.fullName(),
        resolved_at: isResolved ? subDays(new Date(), faker.number.int({ min: 1, max: 10 })).toISOString() : null,
        resolution_notes: isResolved ? faker.lorem.sentence() : null,
        created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
      })
    }
  }

  const { error: exceptionsError } = await supabase.from("compliance_exceptions").insert(exceptions)
  if (exceptionsError) console.error("Exceptions error:", exceptionsError)
  else console.log(`Created ${exceptions.length} compliance exceptions`)

  // Generate audit logs
  console.log("Creating audit logs...")
  const auditLogs = []
  const actions = ["created_shipment", "updated_shipment", "classified_hs", "screened_party", "calculated_duty", "generated_document", "resolved_exception"]
  const entityTypes = ["shipment", "product", "hs_classification", "denied_party_screening", "duty_calculation", "trade_document"]

  for (let i = 0; i < 30; i++) {
    auditLogs.push({
      user_id: userId,
      action: faker.helpers.arrayElement(actions),
      entity_type: faker.helpers.arrayElement(entityTypes),
      entity_id: faker.string.uuid(),
      details: { description: faker.lorem.sentence() },
      ip_address: faker.internet.ip(),
      created_at: subDays(new Date(), faker.number.int({ min: 0, max: 30 })).toISOString(),
    })
  }

  const { error: auditError } = await supabase.from("audit_logs").insert(auditLogs)
  if (auditError) console.error("Audit logs error:", auditError)
  else console.log(`Created ${auditLogs.length} audit logs`)

  console.log("\nSeed completed successfully!")
  console.log(`\nDemo credentials:\n  Email: ${DEMO_EMAIL}\n  Password: ${DEMO_PASSWORD}`)
}

seed().catch(console.error)
