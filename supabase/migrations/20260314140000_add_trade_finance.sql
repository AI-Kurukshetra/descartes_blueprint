-- Migration: Add Trade Finance Table
-- Date: 2026-03-14
-- Description: Adds trade finance instruments (Letters of Credit, Bank Guarantees, etc.)

-- ============================================================================
-- TRADE FINANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trade_finance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  instrument_type TEXT NOT NULL DEFAULT 'letter_of_credit', -- 'letter_of_credit', 'bank_guarantee', 'documentary_collection', 'open_account'
  reference_number TEXT NOT NULL,
  lc_type TEXT, -- 'irrevocable', 'revocable', 'confirmed', 'unconfirmed', 'transferable', 'back_to_back'
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  beneficiary_name TEXT NOT NULL,
  beneficiary_bank TEXT,
  issuing_bank TEXT NOT NULL,
  advising_bank TEXT,
  expiry_date DATE,
  shipment_deadline DATE,
  documents_required TEXT[] DEFAULT '{}',
  terms TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'active', 'amended', 'utilized', 'expired', 'cancelled'
  notes TEXT,
  activated_at TIMESTAMPTZ,
  utilized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trade_finance_user ON trade_finance(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_finance_shipment ON trade_finance(shipment_id);
CREATE INDEX IF NOT EXISTS idx_trade_finance_status ON trade_finance(status);
CREATE INDEX IF NOT EXISTS idx_trade_finance_reference ON trade_finance(reference_number);

-- RLS Policies
ALTER TABLE trade_finance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade finance instruments" ON trade_finance
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade finance instruments" ON trade_finance
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade finance instruments" ON trade_finance
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade finance instruments" ON trade_finance
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- SEED: Customs Brokers
-- ============================================================================
INSERT INTO customs_brokers (name, license_number, countries, contact_email, contact_phone, rating, status) VALUES
  ('Global Customs Services Ltd', 'GCS-2024-001', ARRAY['US', 'CA', 'MX'], 'contact@globalcustoms.com', '+1-555-0100', 4.8, 'active'),
  ('EuroTrade Customs Agency', 'ECA-2024-DE-001', ARRAY['DE', 'FR', 'IT', 'NL', 'BE'], 'info@eurotrade-customs.eu', '+49-30-123456', 4.7, 'active'),
  ('Asia Pacific Customs Solutions', 'APCS-2024-SG-001', ARRAY['SG', 'JP', 'CN', 'KR', 'IN'], 'asia@apcs-customs.com', '+65-6789-0123', 4.9, 'active'),
  ('Indian Customs Clearing House', 'ICCH-2024-IN-001', ARRAY['IN', 'AE', 'BD', 'LK'], 'services@icch.in', '+91-22-12345678', 4.6, 'active'),
  ('Middle East Customs Partners', 'MECP-2024-AE-001', ARRAY['AE', 'SA', 'QA', 'KW', 'BH'], 'customs@mecp.ae', '+971-4-123-4567', 4.5, 'active'),
  ('UK Border Services Agency', 'UKBS-2024-GB-001', ARRAY['GB', 'IE'], 'clearance@ukborder.co.uk', '+44-20-7123-4567', 4.7, 'active'),
  ('Oceania Customs Network', 'OCN-2024-AU-001', ARRAY['AU', 'NZ'], 'support@oceania-customs.com.au', '+61-2-9876-5432', 4.6, 'active'),
  ('Latin America Customs Express', 'LACE-2024-BR-001', ARRAY['BR', 'AR', 'CL', 'CO', 'PE'], 'express@lacustoms.com.br', '+55-11-98765-4321', 4.4, 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: Freight Forwarders
-- ============================================================================
INSERT INTO freight_forwarders (name, iata_code, scac_code, countries, modes, contact_email, contact_phone, rating, status) VALUES
  ('DHL Global Forwarding', 'DHL', 'DHLG', ARRAY['US', 'DE', 'CN', 'SG', 'AE'], ARRAY['air', 'sea', 'road'], 'freight@dhl.com', '+1-800-225-5345', 4.8, 'active'),
  ('Kuehne + Nagel', 'KN', 'KNAG', ARRAY['CH', 'DE', 'US', 'CN', 'NL'], ARRAY['air', 'sea', 'road', 'rail'], 'info@kuehne-nagel.com', '+41-44-786-9511', 4.7, 'active'),
  ('DB Schenker', 'SCH', 'DBSC', ARRAY['DE', 'US', 'CN', 'IN', 'BR'], ARRAY['air', 'sea', 'road', 'rail'], 'logistics@dbschenker.com', '+49-201-8781-0', 4.6, 'active'),
  ('Maersk Logistics', 'MSK', 'MAEU', ARRAY['DK', 'US', 'CN', 'SG', 'NL'], ARRAY['sea', 'road'], 'customerservice@maersk.com', '+45-3363-3363', 4.9, 'active'),
  ('FedEx Trade Networks', 'FDX', 'FEDX', ARRAY['US', 'CA', 'MX', 'CN', 'JP'], ARRAY['air', 'road'], 'tradenetworks@fedex.com', '+1-800-463-3339', 4.7, 'active'),
  ('Expeditors International', 'EXP', 'EXPO', ARRAY['US', 'CN', 'TW', 'HK', 'SG'], ARRAY['air', 'sea'], 'info@expeditors.com', '+1-206-674-3400', 4.5, 'active')
ON CONFLICT DO NOTHING;
