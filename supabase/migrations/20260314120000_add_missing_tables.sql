-- Migration: Add missing database tables for TradeGuard
-- Date: 2026-03-14
-- Description: Creates tables for countries, regulations, trade agreements, duty rates, etc.

-- ============================================================================
-- COUNTRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY, -- ISO 3166-1 alpha-2
  name TEXT NOT NULL,
  region TEXT,
  currency TEXT,
  import_restrictions JSONB DEFAULT '[]'::jsonb,
  export_restrictions JSONB DEFAULT '[]'::jsonb,
  sanctions_status TEXT DEFAULT 'none', -- 'none', 'partial', 'full'
  documentation_required TEXT[] DEFAULT '{}',
  customs_info JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REGULATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT REFERENCES countries(code) ON DELETE CASCADE,
  regulation_type TEXT NOT NULL, -- 'import', 'export', 'customs', 'documentation', 'licensing'
  title TEXT NOT NULL,
  description TEXT,
  hs_codes TEXT[], -- Applicable HS codes
  effective_date DATE,
  expiry_date DATE,
  source_url TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRADE AGREEMENTS (FTA) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trade_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., 'USMCA', 'EU-India FTA'
  short_code TEXT UNIQUE,
  member_countries TEXT[] NOT NULL, -- Array of country codes
  effective_date DATE,
  expiry_date DATE,
  duty_reduction_percent DECIMAL DEFAULT 0,
  rules_of_origin TEXT,
  documentation_required TEXT[] DEFAULT '{}',
  benefits JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DUTY RATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS duty_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hs_code TEXT NOT NULL,
  hs_description TEXT,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  standard_rate DECIMAL NOT NULL DEFAULT 0,
  fta_rate DECIMAL,
  fta_id UUID REFERENCES trade_agreements(id) ON DELETE SET NULL,
  vat_rate DECIMAL DEFAULT 0,
  excise_rate DECIMAL DEFAULT 0,
  additional_taxes JSONB DEFAULT '{}'::jsonb,
  effective_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hs_code, origin_country, destination_country)
);

-- ============================================================================
-- EXCHANGE RATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL,
  rate DECIMAL NOT NULL,
  source TEXT DEFAULT 'api', -- 'api', 'manual'
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_currency, target_currency, fetched_at::DATE)
);

-- ============================================================================
-- CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  certificate_type TEXT NOT NULL, -- 'origin', 'phytosanitary', 'fumigation', 'health', 'quality'
  certificate_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'draft', -- 'draft', 'pending', 'approved', 'rejected', 'expired'
  origin_country TEXT,
  destination_country TEXT,
  product_description TEXT,
  hs_code TEXT,
  content_json JSONB DEFAULT '{}'::jsonb,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'compliance', 'shipment', 'regulatory', 'system', 'document'
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  entity_type TEXT, -- 'shipment', 'document', 'compliance', etc.
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CUSTOMS BROKERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customs_brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT,
  countries TEXT[] DEFAULT '{}', -- Countries they operate in
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  rating DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FREIGHT FORWARDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS freight_forwarders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  iata_code TEXT,
  scac_code TEXT,
  countries TEXT[] DEFAULT '{}',
  modes TEXT[] DEFAULT '{}', -- 'air', 'sea', 'road', 'rail'
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  api_endpoint TEXT,
  tracking_url_template TEXT,
  rating DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL, -- 'restriction', 'prohibition', 'documentation', 'license', 'quota'
  name TEXT NOT NULL,
  description TEXT,
  hs_codes TEXT[] DEFAULT '{}', -- Applicable HS codes (empty = all)
  origin_countries TEXT[] DEFAULT '{}', -- Origin countries (empty = all)
  destination_countries TEXT[] DEFAULT '{}', -- Destination countries (empty = all)
  conditions JSONB DEFAULT '{}'::jsonb, -- Complex rule conditions
  action TEXT NOT NULL DEFAULT 'warn', -- 'block', 'warn', 'require_approval', 'notify'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message TEXT, -- Message to show when rule is triggered
  active BOOLEAN DEFAULT TRUE,
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAVED REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'shipments', 'compliance', 'duties', 'documents', 'custom'
  description TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  columns TEXT[] DEFAULT '{}',
  schedule TEXT, -- cron expression for scheduled reports
  recipients TEXT[] DEFAULT '{}', -- email addresses
  format TEXT DEFAULT 'pdf', -- 'pdf', 'csv', 'excel'
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_regulations_country ON regulations(country_code);
CREATE INDEX IF NOT EXISTS idx_regulations_type ON regulations(regulation_type);
CREATE INDEX IF NOT EXISTS idx_trade_agreements_countries ON trade_agreements USING gin(member_countries);
CREATE INDEX IF NOT EXISTS idx_duty_rates_route ON duty_rates(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_duty_rates_hs ON duty_rates(hs_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_shipment ON certificates(shipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_compliance_rules_type ON compliance_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON compliance_rules(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Countries (public read)
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Countries are viewable by all authenticated users" ON countries
  FOR SELECT TO authenticated USING (true);

-- Regulations (public read)
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regulations are viewable by all authenticated users" ON regulations
  FOR SELECT TO authenticated USING (true);

-- Trade Agreements (public read)
ALTER TABLE trade_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trade agreements are viewable by all authenticated users" ON trade_agreements
  FOR SELECT TO authenticated USING (true);

-- Duty Rates (public read)
ALTER TABLE duty_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Duty rates are viewable by all authenticated users" ON duty_rates
  FOR SELECT TO authenticated USING (true);

-- Exchange Rates (public read)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exchange rates are viewable by all authenticated users" ON exchange_rates
  FOR SELECT TO authenticated USING (true);

-- Certificates (user-specific)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certificates" ON certificates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certificates" ON certificates
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own certificates" ON certificates
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications (user-specific)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Customs Brokers (public read)
ALTER TABLE customs_brokers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customs brokers are viewable by all authenticated users" ON customs_brokers
  FOR SELECT TO authenticated USING (true);

-- Freight Forwarders (public read)
ALTER TABLE freight_forwarders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Freight forwarders are viewable by all authenticated users" ON freight_forwarders
  FOR SELECT TO authenticated USING (true);

-- Compliance Rules (public read)
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Compliance rules are viewable by all authenticated users" ON compliance_rules
  FOR SELECT TO authenticated USING (true);

-- Reports (user-specific)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Common Countries
-- ============================================================================
INSERT INTO countries (code, name, region, currency, sanctions_status) VALUES
  ('US', 'United States', 'North America', 'USD', 'none'),
  ('IN', 'India', 'South Asia', 'INR', 'none'),
  ('CN', 'China', 'East Asia', 'CNY', 'partial'),
  ('DE', 'Germany', 'Europe', 'EUR', 'none'),
  ('GB', 'United Kingdom', 'Europe', 'GBP', 'none'),
  ('JP', 'Japan', 'East Asia', 'JPY', 'none'),
  ('AE', 'United Arab Emirates', 'Middle East', 'AED', 'none'),
  ('SG', 'Singapore', 'Southeast Asia', 'SGD', 'none'),
  ('AU', 'Australia', 'Oceania', 'AUD', 'none'),
  ('CA', 'Canada', 'North America', 'CAD', 'none'),
  ('FR', 'France', 'Europe', 'EUR', 'none'),
  ('IT', 'Italy', 'Europe', 'EUR', 'none'),
  ('BR', 'Brazil', 'South America', 'BRL', 'none'),
  ('MX', 'Mexico', 'North America', 'MXN', 'none'),
  ('KR', 'South Korea', 'East Asia', 'KRW', 'none'),
  ('RU', 'Russia', 'Europe/Asia', 'RUB', 'full'),
  ('IR', 'Iran', 'Middle East', 'IRR', 'full'),
  ('KP', 'North Korea', 'East Asia', 'KPW', 'full'),
  ('SA', 'Saudi Arabia', 'Middle East', 'SAR', 'none'),
  ('ZA', 'South Africa', 'Africa', 'ZAR', 'none')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED DATA: Trade Agreements
-- ============================================================================
INSERT INTO trade_agreements (name, short_code, member_countries, duty_reduction_percent, active) VALUES
  ('United States-Mexico-Canada Agreement', 'USMCA', ARRAY['US', 'MX', 'CA'], 100, TRUE),
  ('Comprehensive Economic Partnership Agreement', 'CEPA', ARRAY['IN', 'AE'], 90, TRUE),
  ('ASEAN Free Trade Area', 'AFTA', ARRAY['SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'BN', 'MM', 'KH', 'LA'], 85, TRUE),
  ('European Union Single Market', 'EU', ARRAY['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL'], 100, TRUE),
  ('Comprehensive and Progressive TPP', 'CPTPP', ARRAY['JP', 'CA', 'AU', 'MX', 'SG', 'NZ', 'VN', 'PE', 'MY', 'BN', 'CL'], 80, TRUE),
  ('India-Japan CEPA', 'IJCEPA', ARRAY['IN', 'JP'], 75, TRUE),
  ('India-South Korea CEPA', 'IKCEPA', ARRAY['IN', 'KR'], 70, TRUE),
  ('SAFTA', 'SAFTA', ARRAY['IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV', 'AF'], 60, TRUE)
ON CONFLICT (short_code) DO NOTHING;

-- ============================================================================
-- SEED DATA: Sample Compliance Rules
-- ============================================================================
INSERT INTO compliance_rules (rule_type, name, description, destination_countries, action, severity, message, active) VALUES
  ('prohibition', 'Russia Sanctions', 'Trade restrictions with Russia due to international sanctions', ARRAY['RU'], 'block', 'critical', 'Trade with Russia is prohibited due to international sanctions.', TRUE),
  ('prohibition', 'Iran Sanctions', 'Trade restrictions with Iran due to international sanctions', ARRAY['IR'], 'block', 'critical', 'Trade with Iran is prohibited due to international sanctions.', TRUE),
  ('prohibition', 'North Korea Sanctions', 'Trade restrictions with North Korea due to international sanctions', ARRAY['KP'], 'block', 'critical', 'Trade with North Korea is prohibited due to international sanctions.', TRUE),
  ('restriction', 'China Dual-Use Goods', 'Restrictions on dual-use technology exports to China', ARRAY['CN'], 'require_approval', 'high', 'Dual-use technology exports to China require special approval.', TRUE),
  ('documentation', 'EU Phytosanitary', 'Phytosanitary certificate required for plant products to EU', ARRAY['DE', 'FR', 'IT', 'ES', 'NL'], 'warn', 'medium', 'Phytosanitary certificate required for plant products.', TRUE),
  ('documentation', 'Certificate of Origin', 'COO required for FTA benefits', ARRAY[]::TEXT[], 'warn', 'low', 'Certificate of Origin required to claim FTA benefits.', TRUE);

-- ============================================================================
-- SEED DATA: Sample Duty Rates
-- ============================================================================
INSERT INTO duty_rates (hs_code, hs_description, origin_country, destination_country, standard_rate, vat_rate) VALUES
  ('3004.90', 'Pharmaceutical preparations', 'IN', 'US', 0, 0),
  ('5205.11', 'Cotton yarn, single', 'IN', 'US', 6.5, 0),
  ('8708.30', 'Brake parts for vehicles', 'IN', 'US', 2.5, 0),
  ('8534.00', 'Printed circuit boards', 'IN', 'US', 0, 0),
  ('7102.39', 'Diamonds, non-industrial', 'IN', 'US', 0, 0),
  ('3004.90', 'Pharmaceutical preparations', 'IN', 'DE', 0, 19),
  ('5205.11', 'Cotton yarn, single', 'IN', 'DE', 4, 19),
  ('8708.30', 'Brake parts for vehicles', 'IN', 'DE', 3.5, 19),
  ('3004.90', 'Pharmaceutical preparations', 'CN', 'US', 0, 0),
  ('8534.00', 'Printed circuit boards', 'CN', 'US', 25, 0)
ON CONFLICT (hs_code, origin_country, destination_country) DO NOTHING;

-- ============================================================================
-- SEED DATA: Sample Exchange Rates (as of today)
-- ============================================================================
INSERT INTO exchange_rates (base_currency, target_currency, rate, source) VALUES
  ('USD', 'INR', 83.12, 'seed'),
  ('USD', 'EUR', 0.92, 'seed'),
  ('USD', 'GBP', 0.79, 'seed'),
  ('USD', 'JPY', 149.50, 'seed'),
  ('USD', 'CNY', 7.24, 'seed'),
  ('USD', 'AED', 3.67, 'seed'),
  ('USD', 'CAD', 1.36, 'seed'),
  ('USD', 'AUD', 1.53, 'seed'),
  ('USD', 'SGD', 1.34, 'seed'),
  ('USD', 'KRW', 1320.50, 'seed')
ON CONFLICT DO NOTHING;
