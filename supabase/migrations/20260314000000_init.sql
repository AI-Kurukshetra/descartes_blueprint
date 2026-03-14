-- TradeGuard Database Schema
-- Run this in Supabase SQL Editor

-- Note: gen_random_uuid() is available by default in PostgreSQL 14+ (Supabase)

-- ============================================
-- TABLES
-- ============================================

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_no TEXT UNIQUE NOT NULL,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  shipper_name TEXT NOT NULL,
  consignee_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  hs_code TEXT,
  declared_value DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  weight_kg DECIMAL(10, 2),
  incoterm TEXT,
  status TEXT DEFAULT 'in_transit' CHECK (status IN ('in_transit', 'pending_clearance', 'cleared', 'flagged', 'delivered')),
  duty_amount DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  customs_broker TEXT,
  freight_forwarder TEXT,
  estimated_delivery DATE,
  actual_delivery DATE,
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'review_required', 'flagged')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  hs_code TEXT,
  hs_confidence DECIMAL(5, 2) CHECK (hs_confidence >= 0 AND hs_confidence <= 100),
  country_of_origin TEXT,
  weight_kg DECIMAL(10, 2),
  value_usd DECIMAL(15, 2),
  category TEXT,
  is_restricted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HS Classifications table
CREATE TABLE IF NOT EXISTS hs_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_description TEXT NOT NULL,
  suggested_hs_code TEXT NOT NULL,
  hs_chapter TEXT,
  hs_description TEXT,
  confidence_score DECIMAL(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('accepted', 'rejected', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duty Calculations table
CREATE TABLE IF NOT EXISTS duty_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  hs_code TEXT NOT NULL,
  product_description TEXT,
  declared_value DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  duty_rate DECIMAL(5, 2),
  duty_amount DECIMAL(15, 2),
  vat_rate DECIMAL(5, 2),
  vat_amount DECIMAL(15, 2),
  other_fees DECIMAL(15, 2),
  total_landed_cost DECIMAL(15, 2),
  fta_applicable BOOLEAN DEFAULT FALSE,
  fta_name TEXT,
  savings_vs_standard DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Denied Party Screenings table
CREATE TABLE IF NOT EXISTS denied_party_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party_name TEXT NOT NULL,
  party_country TEXT,
  search_type TEXT DEFAULT 'company' CHECK (search_type IN ('company', 'individual')),
  result TEXT NOT NULL CHECK (result IN ('clear', 'match', 'possible_match')),
  risk_level TEXT DEFAULT 'none' CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
  matched_list TEXT,
  match_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Documents table
CREATE TABLE IF NOT EXISTS trade_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('commercial_invoice', 'packing_list', 'certificate_of_origin', 'bill_of_lading', 'phytosanitary')),
  doc_number TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'submitted', 'approved')),
  content_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Exceptions table
CREATE TABLE IF NOT EXISTS compliance_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  exception_type TEXT NOT NULL,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'waived')),
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Denied Parties (Watchlist) table - for screening lookups
CREATE TABLE IF NOT EXISTS denied_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  country TEXT,
  list_type TEXT NOT NULL,
  risk_level TEXT DEFAULT 'high' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_reference_no ON shipments(reference_no);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);

CREATE INDEX IF NOT EXISTS idx_hs_classifications_user_id ON hs_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_hs_classifications_created_at ON hs_classifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_duty_calculations_user_id ON duty_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_duty_calculations_created_at ON duty_calculations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_denied_party_screenings_user_id ON denied_party_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_denied_party_screenings_result ON denied_party_screenings(result);

CREATE INDEX IF NOT EXISTS idx_trade_documents_user_id ON trade_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_documents_shipment_id ON trade_documents(shipment_id);

CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_user_id ON compliance_exceptions(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_status ON compliance_exceptions(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_denied_parties_name ON denied_parties(name);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE denied_party_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE denied_parties ENABLE ROW LEVEL SECURITY;

-- Shipments policies
CREATE POLICY "Users can view their own shipments" ON shipments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shipments" ON shipments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments" ON shipments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipments" ON shipments
  FOR DELETE USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- HS Classifications policies
CREATE POLICY "Users can view their own hs_classifications" ON hs_classifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hs_classifications" ON hs_classifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hs_classifications" ON hs_classifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hs_classifications" ON hs_classifications
  FOR DELETE USING (auth.uid() = user_id);

-- Duty Calculations policies
CREATE POLICY "Users can view their own duty_calculations" ON duty_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own duty_calculations" ON duty_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own duty_calculations" ON duty_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Denied Party Screenings policies
CREATE POLICY "Users can view their own denied_party_screenings" ON denied_party_screenings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own denied_party_screenings" ON denied_party_screenings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own denied_party_screenings" ON denied_party_screenings
  FOR DELETE USING (auth.uid() = user_id);

-- Trade Documents policies
CREATE POLICY "Users can view their own trade_documents" ON trade_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade_documents" ON trade_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade_documents" ON trade_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade_documents" ON trade_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Compliance Exceptions policies
CREATE POLICY "Users can view their own compliance_exceptions" ON compliance_exceptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance_exceptions" ON compliance_exceptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance_exceptions" ON compliance_exceptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance_exceptions" ON compliance_exceptions
  FOR DELETE USING (auth.uid() = user_id);

-- Audit Logs policies
CREATE POLICY "Users can view their own audit_logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Denied Parties (public read for screening)
CREATE POLICY "Anyone can view denied_parties" ON denied_parties
  FOR SELECT USING (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_documents_updated_at
  BEFORE UPDATE ON trade_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_exceptions_updated_at
  BEFORE UPDATE ON compliance_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DENIED PARTIES (Watchlist)
-- ============================================

INSERT INTO denied_parties (name, aliases, country, list_type, risk_level, reason) VALUES
  ('Volkov Trading LLC', ARRAY['Volkov Trade', 'V Trading LLC'], 'RU', 'OFAC SDN List', 'critical', 'Sanctions evasion, involvement in restricted trade activities'),
  ('Dragon Shell Corp', ARRAY['Dragon Shell', 'DS Corporation'], 'Unknown', 'BIS Entity List', 'high', 'Export control violations, military end-use concerns'),
  ('Northern Star Logistics', ARRAY['N Star Logistics', 'Northern Star'], 'IR', 'OFAC', 'critical', 'Designated for supporting sanctioned entities'),
  ('Petrolex International', ARRAY['Petrolex', 'Petrolex Intl'], 'SY', 'EU Sanctions List', 'high', 'Energy sector sanctions'),
  ('Golden Tiger Trading', ARRAY['GT Trading', 'Golden Tiger'], 'KP', 'UN Security Council Sanctions', 'critical', 'WMD proliferation concerns')
ON CONFLICT DO NOTHING;
