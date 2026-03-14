-- Seed Data for Test Users
-- Run this after creating test users

-- User IDs (from profiles table)
-- admin@tradeguard.com: d6638e02-4042-4d0d-8558-697e4055b3b4
-- manager@tradeguard.com: 1c42e8be-69ed-4856-8d13-d3f645fc20be
-- analyst@tradeguard.com: eda42344-2012-4a1f-9def-d172c6014c97
-- viewer@tradeguard.com: a09efe69-4ce4-4e33-875f-df533a93115d

-- ============================================================================
-- SHIPMENTS - Admin User (5 shipments)
-- ============================================================================
INSERT INTO shipments (
  user_id, reference_no, origin_country, destination_country,
  shipper_name, consignee_name, product_name, hs_code,
  declared_value, currency, weight_kg, incoterm,
  status, compliance_status, duty_amount, tax_amount,
  estimated_delivery, created_at
) VALUES
-- Admin shipments
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'TG-2026-00101', 'IN', 'US',
 'Tata Global Exports Pvt Ltd', 'Amazon USA Inc', 'Pharmaceutical Tablets', '3004.90',
 125000.00, 'USD', 450.5, 'CIF', 'in_transit', 'compliant', 0, 0,
 CURRENT_DATE + INTERVAL '7 days', NOW() - INTERVAL '2 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'TG-2026-00102', 'IN', 'DE',
 'Mahindra Auto Parts Ltd', 'BMW AG', 'Automotive Brake Pads', '8708.30',
 89500.00, 'EUR', 1200.0, 'FOB', 'cleared', 'compliant', 2237.50, 17005.00,
 CURRENT_DATE + INTERVAL '3 days', NOW() - INTERVAL '5 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'TG-2026-00103', 'CN', 'IN',
 'Shenzhen Electronics Co', 'Reliance Industries Ltd', 'Electronic Circuit Boards', '8534.00',
 245000.00, 'USD', 890.0, 'DDP', 'pending_clearance', 'review_required', 61250.00, 44100.00,
 CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '1 day'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'TG-2026-00104', 'IN', 'AE',
 'Surat Diamond Exports', 'Dubai Gold & Diamonds', 'Polished Diamonds', '7102.39',
 890000.00, 'USD', 12.5, 'CIF', 'delivered', 'compliant', 0, 0,
 CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '10 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'TG-2026-00105', 'IN', 'GB',
 'Sun Pharma International', 'NHS Supply Chain', 'Pharmaceutical Preparations', '3004.90',
 567000.00, 'GBP', 2100.0, 'CIF', 'in_transit', 'compliant', 0, 0,
 CURRENT_DATE + INTERVAL '4 days', NOW() - INTERVAL '3 days'),

-- Manager shipments (4 shipments)
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'TG-2026-00201', 'IN', 'US',
 'Reliance Textiles Ltd', 'Walmart Inc', 'Cotton Yarn Single', '5205.11',
 78000.00, 'USD', 5500.0, 'FOB', 'in_transit', 'compliant', 5070.00, 0,
 CURRENT_DATE + INTERVAL '12 days', NOW() - INTERVAL '4 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'TG-2026-00202', 'IN', 'JP',
 'Tata Steel Ltd', 'Toyota Motor Corp', 'Stainless Steel Pipes', '7304.41',
 156000.00, 'JPY', 8900.0, 'CIF', 'pending_clearance', 'compliant', 4680.00, 15600.00,
 CURRENT_DATE + INTERVAL '6 days', NOW() - INTERVAL '2 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'TG-2026-00203', 'IN', 'SG',
 'Infosys BPO Ltd', 'DBS Bank', 'IT Equipment', '8471.50',
 234000.00, 'SGD', 450.0, 'DAP', 'cleared', 'compliant', 0, 16380.00,
 CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '8 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'TG-2026-00204', 'CN', 'IN',
 'Huawei Technologies', 'Bharti Airtel Ltd', 'Telecom Equipment', '8517.62',
 1250000.00, 'USD', 3400.0, 'DDP', 'flagged', 'flagged', 125000.00, 225000.00,
 CURRENT_DATE + INTERVAL '8 days', NOW() - INTERVAL '1 day'),

-- Analyst shipments (3 shipments)
('eda42344-2012-4a1f-9def-d172c6014c97', 'TG-2026-00301', 'IN', 'US',
 'Bajaj Auto Ltd', 'Harley-Davidson Inc', 'Motorcycle Parts', '8714.10',
 45000.00, 'USD', 780.0, 'FOB', 'in_transit', 'compliant', 1125.00, 0,
 CURRENT_DATE + INTERVAL '9 days', NOW() - INTERVAL '3 days'),

('eda42344-2012-4a1f-9def-d172c6014c97', 'TG-2026-00302', 'IN', 'AU',
 'Godrej Consumer Products', 'Woolworths Group', 'Personal Care Products', '3304.99',
 67000.00, 'AUD', 1200.0, 'CIF', 'cleared', 'compliant', 3350.00, 6700.00,
 CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '12 days'),

('eda42344-2012-4a1f-9def-d172c6014c97', 'TG-2026-00303', 'IN', 'CA',
 'Dabur India Ltd', 'Loblaw Companies', 'Ayurvedic Medicines', '3004.90',
 89000.00, 'CAD', 560.0, 'DAP', 'pending_clearance', 'review_required', 0, 11570.00,
 CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '2 days'),

-- Viewer shipments (2 shipments - read only)
('a09efe69-4ce4-4e33-875f-df533a93115d', 'TG-2026-00401', 'IN', 'FR',
 'Titan Company Ltd', 'LVMH Group', 'Jewelry Articles', '7113.19',
 234000.00, 'EUR', 45.0, 'CIF', 'delivered', 'compliant', 8190.00, 44460.00,
 CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '15 days'),

('a09efe69-4ce4-4e33-875f-df533a93115d', 'TG-2026-00402', 'IN', 'IT',
 'Raymond Ltd', 'Armani Group', 'Woolen Fabrics', '5112.11',
 156000.00, 'EUR', 2300.0, 'FOB', 'in_transit', 'compliant', 12480.00, 29640.00,
 CURRENT_DATE + INTERVAL '6 days', NOW() - INTERVAL '4 days')
ON CONFLICT (reference_no) DO NOTHING;

-- ============================================================================
-- HS CLASSIFICATIONS
-- ============================================================================
INSERT INTO hs_classifications (
  user_id, product_description, suggested_hs_code, hs_chapter,
  hs_description, confidence_score, reasoning, status, created_at
) VALUES
-- Admin classifications
('d6638e02-4042-4d0d-8558-697e4055b3b4',
 'Paracetamol tablets 500mg for pain relief', '3004.90.10',
 'Chapter 30 - Pharmaceutical Products',
 'Medicaments containing paracetamol, put up in measured doses',
 94.5, 'Product is a pharmaceutical preparation in tablet form containing paracetamol as active ingredient. Falls under HS 3004 for medicaments in dosage form.',
 'accepted', NOW() - INTERVAL '5 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4',
 'Ceramic brake pads for passenger vehicles', '8708.30.10',
 'Chapter 87 - Vehicles',
 'Brakes and servo-brakes and parts thereof',
 91.2, 'Brake pads are parts of vehicle braking systems. Ceramic composition doesnt change classification. Falls under HS 8708.30.',
 'accepted', NOW() - INTERVAL '3 days'),

-- Manager classifications
('1c42e8be-69ed-4856-8d13-d3f645fc20be',
 '100% cotton yarn, single, uncombed, 20 count', '5205.11.00',
 'Chapter 52 - Cotton',
 'Cotton yarn, single, of uncombed fibres, >= 85% cotton',
 96.8, 'Single cotton yarn with 100% cotton content, uncombed. Clearly falls under 5205.11 for single uncombed cotton yarn.',
 'accepted', NOW() - INTERVAL '4 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be',
 'Stainless steel seamless pipes for industrial use', '7304.41.00',
 'Chapter 73 - Iron and Steel Articles',
 'Tubes and pipes, seamless, of stainless steel, cold-drawn',
 88.5, 'Seamless stainless steel pipes for industrial applications. Falls under 7304.41 for cold-drawn seamless stainless steel tubes.',
 'accepted', NOW() - INTERVAL '2 days'),

-- Analyst classifications
('eda42344-2012-4a1f-9def-d172c6014c97',
 'Smartphone with 5G capability and AMOLED display', '8517.13.00',
 'Chapter 85 - Electrical Machinery',
 'Smartphones for wireless network use',
 92.3, 'Mobile phone with cellular network capability. 5G and AMOLED features dont affect classification. HS 8517.13 for smartphones.',
 'accepted', NOW() - INTERVAL '6 days'),

('eda42344-2012-4a1f-9def-d172c6014c97',
 'LED television 55 inch 4K resolution', '8528.72.00',
 'Chapter 85 - Electrical Machinery',
 'Reception apparatus for television, colour, LCD/LED/Plasma',
 89.7, 'LED TV is a reception apparatus for television. Screen size and resolution dont affect HS code. Falls under 8528.72.',
 'pending', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DUTY CALCULATIONS
-- ============================================================================
INSERT INTO duty_calculations (
  user_id, origin_country, destination_country, hs_code,
  product_description, declared_value, currency,
  duty_rate, duty_amount, vat_rate, vat_amount,
  other_fees, total_landed_cost, fta_applicable, fta_name,
  savings_vs_standard, created_at
) VALUES
-- Admin calculations
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'IN', 'US', '3004.90',
 'Pharmaceutical tablets', 125000.00, 'USD',
 0, 0, 0, 0, 850.00, 125850.00, false, NULL, 0,
 NOW() - INTERVAL '2 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'IN', 'DE', '8708.30',
 'Automotive brake pads', 89500.00, 'EUR',
 2.5, 2237.50, 19.0, 17430.28, 450.00, 109617.78, false, NULL, 0,
 NOW() - INTERVAL '5 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'IN', 'AE', '7102.39',
 'Polished diamonds', 890000.00, 'USD',
 0, 0, 5.0, 44500.00, 1200.00, 935700.00, true, 'India-UAE CEPA', 44500.00,
 NOW() - INTERVAL '10 days'),

-- Manager calculations
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'IN', 'US', '5205.11',
 'Cotton yarn single', 78000.00, 'USD',
 6.5, 5070.00, 0, 0, 650.00, 83720.00, false, NULL, 0,
 NOW() - INTERVAL '4 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'IN', 'JP', '7304.41',
 'Stainless steel pipes', 156000.00, 'USD',
 3.0, 4680.00, 10.0, 16068.00, 890.00, 177638.00, true, 'India-Japan CEPA', 7800.00,
 NOW() - INTERVAL '2 days'),

-- Analyst calculations
('eda42344-2012-4a1f-9def-d172c6014c97', 'IN', 'AU', '3304.99',
 'Personal care products', 67000.00, 'AUD',
 5.0, 3350.00, 10.0, 7035.00, 320.00, 77705.00, false, NULL, 0,
 NOW() - INTERVAL '12 days'),

('eda42344-2012-4a1f-9def-d172c6014c97', 'IN', 'CA', '3004.90',
 'Ayurvedic medicines', 89000.00, 'CAD',
 0, 0, 13.0, 11570.00, 450.00, 101020.00, false, NULL, 0,
 NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DENIED PARTY SCREENINGS
-- ============================================================================
INSERT INTO denied_party_screenings (
  user_id, party_name, party_country, search_type,
  result, risk_level, matched_list, match_details, created_at
) VALUES
-- Admin screenings
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'Tata Global Exports Pvt Ltd', 'IN', 'company',
 'clear', 'none', NULL, 'No matches found in any restricted party lists.',
 NOW() - INTERVAL '2 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'Volkov Trading LLC', 'RU', 'company',
 'match', 'critical', 'OFAC SDN List',
 'Direct match found. Entity is on OFAC Specially Designated Nationals list. Trade prohibited.',
 NOW() - INTERVAL '1 day'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'Dragon Shell Corporation', 'CN', 'company',
 'possible_match', 'high', 'BIS Entity List',
 'Possible match with similar entity name. Manual verification required.',
 NOW() - INTERVAL '3 days'),

-- Manager screenings
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'BMW AG', 'DE', 'company',
 'clear', 'none', NULL, 'No matches found. Entity is a verified major automotive manufacturer.',
 NOW() - INTERVAL '5 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'Huawei Technologies', 'CN', 'company',
 'match', 'high', 'BIS Entity List',
 'Entity is on Bureau of Industry and Security Entity List. Export license required for certain items.',
 NOW() - INTERVAL '1 day'),

-- Analyst screenings
('eda42344-2012-4a1f-9def-d172c6014c97', 'Woolworths Group', 'AU', 'company',
 'clear', 'none', NULL, 'No matches found. Major Australian retailer with clean compliance record.',
 NOW() - INTERVAL '12 days'),

('eda42344-2012-4a1f-9def-d172c6014c97', 'Northern Star Logistics', 'IR', 'company',
 'match', 'critical', 'OFAC Iran Sanctions',
 'Entity located in sanctioned country. All trade prohibited under US sanctions.',
 NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRADE DOCUMENTS
-- ============================================================================
INSERT INTO trade_documents (
  user_id, shipment_id, doc_type, doc_number, status,
  content_json, version, version_history, created_at
)
SELECT
  s.user_id,
  s.id,
  'commercial_invoice',
  'INV-' || SUBSTRING(s.reference_no FROM 4),
  'generated',
  jsonb_build_object(
    'invoice_number', 'INV-' || SUBSTRING(s.reference_no FROM 4),
    'date', CURRENT_DATE,
    'shipper', s.shipper_name,
    'consignee', s.consignee_name,
    'product', s.product_name,
    'value', s.declared_value,
    'currency', s.currency
  ),
  1,
  '[]'::jsonb,
  s.created_at
FROM shipments s
ON CONFLICT DO NOTHING;

-- Add packing lists
INSERT INTO trade_documents (
  user_id, shipment_id, doc_type, doc_number, status,
  content_json, version, version_history, created_at
)
SELECT
  s.user_id,
  s.id,
  'packing_list',
  'PL-' || SUBSTRING(s.reference_no FROM 4),
  'generated',
  jsonb_build_object(
    'packing_list_number', 'PL-' || SUBSTRING(s.reference_no FROM 4),
    'date', CURRENT_DATE,
    'packages', 1,
    'gross_weight', s.weight_kg,
    'net_weight', s.weight_kg * 0.95
  ),
  1,
  '[]'::jsonb,
  s.created_at
FROM shipments s
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLIANCE EXCEPTIONS
-- ============================================================================
INSERT INTO compliance_exceptions (
  user_id, shipment_id, exception_type, severity,
  description, status, assigned_to, created_at
)
SELECT
  s.user_id,
  s.id,
  'documentation',
  'medium',
  'Certificate of Origin missing for FTA benefits claim',
  'open',
  'Compliance Team',
  NOW() - INTERVAL '1 day'
FROM shipments s
WHERE s.status = 'pending_clearance'
LIMIT 2
ON CONFLICT DO NOTHING;

INSERT INTO compliance_exceptions (
  user_id, shipment_id, exception_type, severity,
  description, status, assigned_to, created_at
)
SELECT
  s.user_id,
  s.id,
  'restricted_party',
  'critical',
  'Consignee flagged on restricted party list - requires manual review',
  'in_review',
  'Legal Team',
  NOW() - INTERVAL '1 day'
FROM shipments s
WHERE s.compliance_status = 'flagged'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO compliance_exceptions (
  user_id, shipment_id, exception_type, severity,
  description, status, assigned_to, resolved_at, resolution_notes, created_at
)
SELECT
  s.user_id,
  s.id,
  'valuation',
  'low',
  'Declared value below market reference - verified as promotional pricing',
  'resolved',
  'Finance Team',
  NOW() - INTERVAL '2 days',
  'Promotional pricing confirmed with purchase order documentation.',
  NOW() - INTERVAL '5 days'
FROM shipments s
WHERE s.status = 'delivered'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PRODUCTS
-- ============================================================================
INSERT INTO products (
  user_id, name, description, hs_code, hs_confidence,
  country_of_origin, weight_kg, value_usd, category, is_restricted, created_at
) VALUES
-- Admin products
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'Paracetamol 500mg Tablets',
 'Pain relief tablets containing 500mg paracetamol per tablet', '3004.90', 94.5,
 'IN', 0.5, 45.00, 'Pharmaceuticals', false, NOW() - INTERVAL '30 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'Ceramic Brake Pads Set',
 'High-performance ceramic brake pads for passenger vehicles', '8708.30', 91.2,
 'IN', 2.5, 125.00, 'Auto Parts', false, NOW() - INTERVAL '25 days'),

('d6638e02-4042-4d0d-8558-697e4055b3b4', 'Polished Diamond 1 Carat',
 'VVS1 clarity, D color, excellent cut round brilliant diamond', '7102.39', 98.0,
 'IN', 0.002, 8500.00, 'Gems & Jewelry', false, NOW() - INTERVAL '20 days'),

-- Manager products
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'Cotton Yarn 20 Count',
 '100% cotton single yarn, uncombed, 20 count quality', '5205.11', 96.8,
 'IN', 1.0, 12.50, 'Textiles', false, NOW() - INTERVAL '28 days'),

('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'SS304 Seamless Pipe',
 'Stainless steel 304 grade seamless pipe, 2 inch diameter', '7304.41', 88.5,
 'IN', 15.0, 89.00, 'Steel Products', false, NOW() - INTERVAL '22 days'),

-- Analyst products
('eda42344-2012-4a1f-9def-d172c6014c97', 'Organic Face Cream',
 'Natural ingredients face cream with SPF 30 protection', '3304.99', 87.3,
 'IN', 0.25, 18.50, 'Personal Care', false, NOW() - INTERVAL '15 days'),

('eda42344-2012-4a1f-9def-d172c6014c97', 'Ayurvedic Immunity Tablets',
 'Traditional herbal supplement for immunity support', '3004.90', 85.0,
 'IN', 0.3, 22.00, 'Pharmaceuticals', false, NOW() - INTERVAL '12 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
INSERT INTO audit_logs (user_id, action, entity_type, details, created_at) VALUES
-- Admin audit logs
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'login', 'user',
 '{"ip": "192.168.1.100", "browser": "Chrome", "location": "Mumbai, IN"}', NOW() - INTERVAL '1 hour'),
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'create_shipment', 'shipment',
 '{"reference": "TG-2026-00105", "destination": "GB", "value": 567000}', NOW() - INTERVAL '3 days'),
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'classify_hs', 'product',
 '{"product": "Paracetamol tablets", "hs_code": "3004.90.10", "confidence": 94.5}', NOW() - INTERVAL '5 days'),
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'screen_party', 'compliance',
 '{"party": "Volkov Trading LLC", "result": "MATCH", "list": "OFAC SDN"}', NOW() - INTERVAL '1 day'),
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'update_team_role', 'user',
 '{"user": "analyst@tradeguard.com", "old_role": "viewer", "new_role": "analyst"}', NOW() - INTERVAL '2 days'),

-- Manager audit logs
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'login', 'user',
 '{"ip": "192.168.1.101", "browser": "Firefox", "location": "Delhi, IN"}', NOW() - INTERVAL '2 hours'),
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'create_shipment', 'shipment',
 '{"reference": "TG-2026-00204", "destination": "IN", "value": 1250000}', NOW() - INTERVAL '1 day'),
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'calculate_duty', 'calculation',
 '{"origin": "IN", "destination": "JP", "duty": 4680, "fta_savings": 7800}', NOW() - INTERVAL '2 days'),
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'generate_document', 'document',
 '{"type": "commercial_invoice", "shipment": "TG-2026-00201"}', NOW() - INTERVAL '4 days'),

-- Analyst audit logs
('eda42344-2012-4a1f-9def-d172c6014c97', 'login', 'user',
 '{"ip": "192.168.1.102", "browser": "Safari", "location": "Bangalore, IN"}', NOW() - INTERVAL '3 hours'),
('eda42344-2012-4a1f-9def-d172c6014c97', 'classify_hs', 'product',
 '{"product": "Smartphone 5G", "hs_code": "8517.13.00", "confidence": 92.3}', NOW() - INTERVAL '6 days'),
('eda42344-2012-4a1f-9def-d172c6014c97', 'view_report', 'report',
 '{"report": "Monthly Compliance Summary", "format": "PDF"}', NOW() - INTERVAL '1 day'),

-- Viewer audit logs
('a09efe69-4ce4-4e33-875f-df533a93115d', 'login', 'user',
 '{"ip": "192.168.1.103", "browser": "Edge", "location": "Chennai, IN"}', NOW() - INTERVAL '4 hours'),
('a09efe69-4ce4-4e33-875f-df533a93115d', 'view_dashboard', 'dashboard',
 '{"widgets": ["shipments", "compliance", "alerts"]}', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
INSERT INTO notifications (user_id, type, title, message, read, action_url, created_at) VALUES
-- Admin notifications
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'compliance', 'Denied Party Match Found',
 'Volkov Trading LLC matched OFAC SDN list. Immediate review required.', false,
 '/dashboard/denied-party', NOW() - INTERVAL '1 day'),
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'shipment', 'Shipment Delivered',
 'TG-2026-00104 to UAE has been successfully delivered.', true,
 '/dashboard/shipments', NOW() - INTERVAL '2 days'),
('d6638e02-4042-4d0d-8558-697e4055b3b4', 'regulatory', 'New EU Regulation',
 'Updated documentation requirements for pharmaceutical exports to EU effective April 1.', false,
 '/dashboard/compliance', NOW() - INTERVAL '3 days'),

-- Manager notifications
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'compliance', 'Shipment Flagged',
 'TG-2026-00204 flagged for restricted party review. Action required.', false,
 '/dashboard/shipments', NOW() - INTERVAL '1 day'),
('1c42e8be-69ed-4856-8d13-d3f645fc20be', 'shipment', 'Customs Clearance Pending',
 'TG-2026-00202 awaiting customs clearance in Japan.', false,
 '/dashboard/shipments', NOW() - INTERVAL '2 days'),

-- Analyst notifications
('eda42344-2012-4a1f-9def-d172c6014c97', 'document', 'Document Generated',
 'Commercial invoice for TG-2026-00301 has been generated.', true,
 '/dashboard/documents', NOW() - INTERVAL '3 days'),
('eda42344-2012-4a1f-9def-d172c6014c97', 'system', 'Weekly Report Ready',
 'Your weekly trade compliance report is ready for review.', false,
 '/dashboard', NOW() - INTERVAL '1 day'),

-- Viewer notifications
('a09efe69-4ce4-4e33-875f-df533a93115d', 'shipment', 'Shipment Update',
 'TG-2026-00402 is now in transit to Italy.', true,
 '/dashboard/shipments', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;
