import { z } from "zod"

// Shipment schemas
export const createShipmentSchema = z.object({
  reference_no: z.string().min(1, "Reference number is required"),
  origin_country: z.string().min(2, "Origin country is required"),
  destination_country: z.string().min(2, "Destination country is required"),
  shipper_name: z.string().min(1, "Shipper name is required"),
  consignee_name: z.string().min(1, "Consignee name is required"),
  product_name: z.string().min(1, "Product name is required"),
  hs_code: z.string().optional(),
  declared_value: z.number().positive("Declared value must be positive"),
  currency: z.string().min(1, "Currency is required"),
  weight_kg: z.number().positive("Weight must be positive"),
  incoterm: z.string().min(1, "Incoterm is required"),
  customs_broker: z.string().optional(),
  freight_forwarder: z.string().optional(),
  estimated_delivery: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  hs_code: z.string().optional(),
  country_of_origin: z.string().min(2, "Country of origin is required"),
  weight_kg: z.number().positive("Weight must be positive"),
  value_usd: z.number().positive("Value must be positive"),
  category: z.string().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

// HS Classification schemas
export const hsClassifySchema = z.object({
  productDescription: z
    .string()
    .min(10, "Please provide a detailed product description (at least 10 characters)"),
  countryOfOrigin: z.string().min(2, "Country of origin is required"),
  productName: z.string().optional(),
  intendedUse: z.string().optional(),
})

export type HSClassifyInput = z.infer<typeof hsClassifySchema>

// Duty Calculation schemas
export const dutyCalculateSchema = z.object({
  origin_country: z.string().min(2, "Origin country is required"),
  destination_country: z.string().min(2, "Destination country is required"),
  hs_code: z.string().min(4, "HS code is required"),
  product_description: z.string().optional(),
  declared_value: z.number().positive("Declared value must be positive"),
  currency: z.string().min(1, "Currency is required"),
  quantity: z.number().positive("Quantity must be positive"),
  weight_kg: z.number().positive("Weight must be positive"),
  incoterm: z.string().min(1, "Incoterm is required"),
})

export type DutyCalculateInput = z.infer<typeof dutyCalculateSchema>

// Denied Party Screening schemas
export const screenPartySchema = z.object({
  party_name: z.string().min(2, "Party name is required"),
  party_country: z.string().optional(),
  search_type: z.enum(["company", "individual"]).default("company"),
})

export type ScreenPartyInput = z.infer<typeof screenPartySchema>

// Document schemas
export const createDocumentSchema = z.object({
  shipment_id: z.string().uuid("Invalid shipment ID"),
  doc_type: z.enum([
    "commercial_invoice",
    "packing_list",
    "certificate_of_origin",
    "bill_of_lading",
    "phytosanitary",
  ]),
  doc_number: z.string().min(1, "Document number is required"),
  content_json: z.record(z.string(), z.unknown()).optional(),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type SignupInput = z.infer<typeof signupSchema>
