-- ============================================================================
-- COMPREHENSIVE SEED DATA FOR TRADEGUARD DEMO
-- Creates realistic, varied data for all 4 test users
-- ============================================================================

-- Get user IDs (run this after users are created)
DO $$
DECLARE
  admin_id UUID;
  manager_id UUID;
  analyst_id UUID;
  viewer_id UUID;
  i INTEGER;
  random_status TEXT;
  random_compliance TEXT;
  ship_id UUID;
  doc_id UUID;
BEGIN

-- Get user IDs from profiles
SELECT id INTO admin_id FROM profiles WHERE email = 'admin@tradeguard.com';
SELECT id INTO manager_id FROM profiles WHERE email = 'manager@tradeguard.com';
SELECT id INTO analyst_id FROM profiles WHERE email = 'analyst@tradeguard.com';
SELECT id INTO viewer_id FROM profiles WHERE email = 'viewer@tradeguard.com';

-- If no users found, try auth.users
IF admin_id IS NULL THEN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tradeguard.com';
  SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@tradeguard.com';
  SELECT id INTO analyst_id FROM auth.users WHERE email = 'analyst@tradeguard.com';
  SELECT id INTO viewer_id FROM auth.users WHERE email = 'viewer@tradeguard.com';
END IF;

-- Exit if no users
IF admin_id IS NULL THEN
  RAISE NOTICE 'No users found. Please create users first.';
  RETURN;
END IF;

RAISE NOTICE 'Seeding data for admin: %, manager: %, analyst: %, viewer: %', admin_id, manager_id, analyst_id, viewer_id;

-- ============================================================================
-- SHIPMENTS - 200+ shipments with realistic distribution
-- ============================================================================

-- Admin user - 80 shipments (heavy user)
FOR i IN 1..80 LOOP
  random_status := (ARRAY['in_transit', 'in_transit', 'in_transit', 'pending_clearance', 'pending_clearance', 'cleared', 'cleared', 'cleared', 'cleared', 'delivered', 'delivered', 'delivered', 'flagged'])[floor(random() * 13 + 1)];
  random_compliance := (ARRAY['compliant', 'compliant', 'compliant', 'compliant', 'review_required', 'flagged'])[floor(random() * 6 + 1)];

  INSERT INTO shipments (
    user_id, reference_no, origin_country, destination_country,
    shipper_name, consignee_name, product_name, hs_code,
    declared_value, currency, weight_kg, incoterm,
    status, compliance_status, duty_amount, tax_amount,
    customs_broker, freight_forwarder,
    estimated_delivery, created_at
  ) VALUES (
    admin_id,
    'TG-2026-' || LPAD(i::TEXT, 5, '0'),
    (ARRAY['IN', 'CN', 'DE', 'US', 'JP', 'KR', 'TW', 'VN', 'TH', 'MY'])[floor(random() * 10 + 1)],
    (ARRAY['US', 'DE', 'GB', 'FR', 'NL', 'AE', 'SG', 'AU', 'CA', 'IT'])[floor(random() * 10 + 1)],
    (ARRAY['Tata Global Exports Pvt Ltd', 'Reliance Industries Ltd', 'Infosys Technologies', 'Sun Pharma International', 'Mahindra Logistics Ltd', 'Wipro Limited', 'HCL Technologies', 'Bajaj Auto Ltd', 'Larsen & Toubro', 'Adani Enterprises'])[floor(random() * 10 + 1)],
    (ARRAY['Amazon Inc', 'Walmart Global', 'Target Corporation', 'Best Buy Co', 'Apple Inc', 'Microsoft Corp', 'Google LLC', 'Meta Platforms', 'Tesla Inc', 'Samsung Electronics'])[floor(random() * 10 + 1)],
    (ARRAY['Pharmaceutical Tablets', 'Cotton Yarn', 'Auto Brake Pads', 'Electronic Circuit Boards', 'Polished Diamonds', 'Stainless Steel Pipes', 'Leather Handbags', 'Basmati Rice', 'Organic Spices', 'Machine Parts', 'Textile Fabrics', 'Solar Panels', 'LED Lights', 'Computer Monitors', 'Mobile Accessories'])[floor(random() * 15 + 1)],
    (ARRAY['3004.90', '5205.11', '8708.30', '8534.00', '7102.39', '7304.41', '4202.21', '1006.30', '0910.11', '8466.93', '5208.21', '8541.40', '9405.42', '8528.52', '8517.62'])[floor(random() * 15 + 1)],
    (random() * 500000 + 5000)::DECIMAL(12,2),
    (ARRAY['USD', 'EUR', 'GBP', 'INR'])[floor(random() * 4 + 1)],
    (random() * 5000 + 100)::DECIMAL(10,2),
    (ARRAY['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA'])[floor(random() * 6 + 1)],
    random_status,
    random_compliance,
    (random() * 25000 + 500)::DECIMAL(12,2),
    (random() * 15000 + 200)::DECIMAL(12,2),
    (ARRAY['Global Customs Services Ltd', 'EuroTrade Customs Agency', 'Asia Pacific Customs Solutions', 'DHL Customs Brokerage'])[floor(random() * 4 + 1)],
    (ARRAY['DHL Global Forwarding', 'Kuehne + Nagel', 'DB Schenker', 'Maersk Logistics', 'FedEx Trade Networks'])[floor(random() * 5 + 1)],
    CURRENT_DATE + (random() * 30)::INTEGER,
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- Manager user - 50 shipments
FOR i IN 1..50 LOOP
  random_status := (ARRAY['in_transit', 'in_transit', 'pending_clearance', 'cleared', 'cleared', 'delivered', 'delivered', 'flagged'])[floor(random() * 8 + 1)];
  random_compliance := (ARRAY['compliant', 'compliant', 'compliant', 'review_required', 'flagged'])[floor(random() * 5 + 1)];

  INSERT INTO shipments (
    user_id, reference_no, origin_country, destination_country,
    shipper_name, consignee_name, product_name, hs_code,
    declared_value, currency, weight_kg, incoterm,
    status, compliance_status, duty_amount, tax_amount,
    estimated_delivery, created_at
  ) VALUES (
    manager_id,
    'TG-MGR-' || LPAD(i::TEXT, 5, '0'),
    (ARRAY['IN', 'CN', 'DE', 'JP', 'KR'])[floor(random() * 5 + 1)],
    (ARRAY['US', 'DE', 'GB', 'AE', 'SG'])[floor(random() * 5 + 1)],
    (ARRAY['Bharat Electronics Ltd', 'ONGC Videsh', 'Coal India Ltd', 'NTPC Limited', 'Power Grid Corp'])[floor(random() * 5 + 1)],
    (ARRAY['Siemens AG', 'General Electric', 'Honeywell Intl', 'ABB Ltd', 'Schneider Electric'])[floor(random() * 5 + 1)],
    (ARRAY['Industrial Machinery', 'Power Transformers', 'Control Systems', 'Electrical Cables', 'Generator Parts'])[floor(random() * 5 + 1)],
    (ARRAY['8501.52', '8504.23', '8537.10', '8544.49', '8503.00'])[floor(random() * 5 + 1)],
    (random() * 300000 + 10000)::DECIMAL(12,2),
    'USD',
    (random() * 3000 + 500)::DECIMAL(10,2),
    (ARRAY['FOB', 'CIF', 'DDP'])[floor(random() * 3 + 1)],
    random_status,
    random_compliance,
    (random() * 20000 + 1000)::DECIMAL(12,2),
    (random() * 10000 + 500)::DECIMAL(12,2),
    CURRENT_DATE + (random() * 20)::INTEGER,
    NOW() - (random() * 45)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- Analyst user - 40 shipments
FOR i IN 1..40 LOOP
  random_status := (ARRAY['in_transit', 'pending_clearance', 'cleared', 'delivered'])[floor(random() * 4 + 1)];

  INSERT INTO shipments (
    user_id, reference_no, origin_country, destination_country,
    shipper_name, consignee_name, product_name, hs_code,
    declared_value, currency, weight_kg, status, compliance_status,
    created_at
  ) VALUES (
    analyst_id,
    'TG-ANL-' || LPAD(i::TEXT, 5, '0'),
    (ARRAY['IN', 'CN', 'VN', 'TH'])[floor(random() * 4 + 1)],
    (ARRAY['US', 'EU', 'GB', 'AU'])[floor(random() * 4 + 1)],
    'Tech Mahindra Ltd',
    'IBM Corporation',
    (ARRAY['Software Services', 'IT Equipment', 'Network Hardware', 'Server Components'])[floor(random() * 4 + 1)],
    (ARRAY['8471.30', '8471.49', '8517.62', '8473.30'])[floor(random() * 4 + 1)],
    (random() * 200000 + 5000)::DECIMAL(12,2),
    'USD',
    (random() * 1000 + 50)::DECIMAL(10,2),
    random_status,
    'compliant',
    NOW() - (random() * 30)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- Viewer user - 30 shipments (read-only user, less data)
FOR i IN 1..30 LOOP
  INSERT INTO shipments (
    user_id, reference_no, origin_country, destination_country,
    shipper_name, consignee_name, product_name, hs_code,
    declared_value, currency, status, compliance_status,
    created_at
  ) VALUES (
    viewer_id,
    'TG-VWR-' || LPAD(i::TEXT, 5, '0'),
    'IN',
    (ARRAY['US', 'DE', 'GB'])[floor(random() * 3 + 1)],
    'Export Trading Co',
    'Import Partners Inc',
    'General Merchandise',
    '9999.00',
    (random() * 50000 + 1000)::DECIMAL(12,2),
    'USD',
    'cleared',
    'compliant',
    NOW() - (random() * 20)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- HS CLASSIFICATIONS - 150+ classifications
-- ============================================================================

-- Admin - 60 classifications
FOR i IN 1..60 LOOP
  INSERT INTO hs_classifications (
    user_id, product_description, suggested_hs_code, hs_chapter, hs_description,
    confidence_score, reasoning, status, created_at
  ) VALUES (
    admin_id,
    (ARRAY[
      'Industrial stainless steel pipes for water treatment',
      'Organic green tea leaves from Assam',
      'Cotton t-shirts with printed designs',
      'Automotive brake disc assemblies',
      'Lithium-ion battery cells 3.7V',
      'Polyester fabric for upholstery',
      'Pharmaceutical grade paracetamol tablets',
      'Frozen shrimp, peeled and deveined',
      'Leather wallet with multiple compartments',
      'LED display panels 55 inch',
      'Wooden furniture - dining table',
      'Ceramic tiles for flooring',
      'Copper wire, insulated',
      'Plastic containers for food storage',
      'Glass bottles for beverages'
    ])[floor(random() * 15 + 1)],
    (ARRAY['7304.41', '0902.10', '6109.10', '8708.30', '8507.60', '5407.61', '3004.90', '0306.17', '4202.31', '8528.52', '9403.60', '6908.90', '8544.49', '3924.10', '7010.90'])[floor(random() * 15 + 1)],
    (ARRAY['Chapter 73 - Iron and Steel', 'Chapter 09 - Coffee and Tea', 'Chapter 61 - Apparel Knitted', 'Chapter 87 - Vehicles', 'Chapter 85 - Electrical Machinery', 'Chapter 54 - Man-made Filaments', 'Chapter 30 - Pharmaceuticals', 'Chapter 03 - Fish', 'Chapter 42 - Leather Articles', 'Chapter 85 - Electrical Machinery', 'Chapter 94 - Furniture', 'Chapter 69 - Ceramic Products', 'Chapter 85 - Electrical Machinery', 'Chapter 39 - Plastics', 'Chapter 70 - Glass'])[floor(random() * 15 + 1)],
    'HS classification for international trade',
    (random() * 30 + 70)::DECIMAL(5,2),
    'Based on material composition, intended use, and manufacturing process. Classification determined per WCO guidelines.',
    (ARRAY['accepted', 'accepted', 'accepted', 'pending', 'rejected'])[floor(random() * 5 + 1)],
    NOW() - (random() * 90)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- Manager - 40 classifications
FOR i IN 1..40 LOOP
  INSERT INTO hs_classifications (
    user_id, product_description, suggested_hs_code, hs_chapter,
    confidence_score, reasoning, status, created_at
  ) VALUES (
    manager_id,
    'Industrial equipment component #' || i,
    (ARRAY['8501.52', '8504.23', '8537.10', '8544.49', '8503.00'])[floor(random() * 5 + 1)],
    'Chapter 85 - Electrical Machinery',
    (random() * 25 + 75)::DECIMAL(5,2),
    'Classified as electrical machinery based on function and specifications.',
    (ARRAY['accepted', 'accepted', 'pending'])[floor(random() * 3 + 1)],
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- Analyst - 35 classifications
FOR i IN 1..35 LOOP
  INSERT INTO hs_classifications (
    user_id, product_description, suggested_hs_code, hs_chapter,
    confidence_score, reasoning, status, created_at
  ) VALUES (
    analyst_id,
    'Tech product analysis #' || i,
    (ARRAY['8471.30', '8471.49', '8517.62', '8473.30'])[floor(random() * 4 + 1)],
    'Chapter 84/85 - Machinery',
    (random() * 20 + 80)::DECIMAL(5,2),
    'IT equipment classification per customs guidelines.',
    'accepted',
    NOW() - (random() * 45)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- DUTY CALCULATIONS - 100+ calculations
-- ============================================================================

FOR i IN 1..50 LOOP
  INSERT INTO duty_calculations (
    user_id, origin_country, destination_country, hs_code, product_description,
    declared_value, currency, duty_rate, duty_amount, vat_rate, vat_amount,
    other_fees, total_landed_cost, fta_applicable, fta_name, savings_vs_standard,
    created_at
  ) VALUES (
    admin_id,
    (ARRAY['IN', 'CN', 'VN', 'TH', 'MY'])[floor(random() * 5 + 1)],
    (ARRAY['US', 'DE', 'GB', 'FR', 'NL'])[floor(random() * 5 + 1)],
    (ARRAY['8471.30', '6109.10', '8708.30', '3004.90', '7304.41'])[floor(random() * 5 + 1)],
    'Product for duty calculation #' || i,
    (random() * 100000 + 5000)::DECIMAL(12,2),
    'USD',
    (random() * 15 + 2)::DECIMAL(5,2),
    (random() * 15000 + 500)::DECIMAL(12,2),
    (random() * 10 + 5)::DECIMAL(5,2),
    (random() * 8000 + 200)::DECIMAL(12,2),
    (random() * 500 + 50)::DECIMAL(12,2),
    (random() * 25000 + 1000)::DECIMAL(12,2),
    random() > 0.5,
    (ARRAY['USMCA', 'India-UAE CEPA', 'ASEAN FTA', 'India-Japan CEPA', NULL])[floor(random() * 5 + 1)],
    (random() * 5000)::DECIMAL(12,2),
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

FOR i IN 1..30 LOOP
  INSERT INTO duty_calculations (
    user_id, origin_country, destination_country, hs_code, product_description,
    declared_value, currency, duty_rate, duty_amount, vat_rate, vat_amount,
    total_landed_cost, fta_applicable, created_at
  ) VALUES (
    manager_id,
    'IN',
    (ARRAY['US', 'DE', 'AE'])[floor(random() * 3 + 1)],
    '8501.52',
    'Industrial machinery duty calc #' || i,
    (random() * 200000 + 20000)::DECIMAL(12,2),
    'USD',
    (random() * 10 + 3)::DECIMAL(5,2),
    (random() * 20000 + 1000)::DECIMAL(12,2),
    18.00,
    (random() * 10000 + 500)::DECIMAL(12,2),
    (random() * 35000 + 5000)::DECIMAL(12,2),
    random() > 0.6,
    NOW() - (random() * 45)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- DENIED PARTY SCREENINGS - 80+ screenings
-- ============================================================================

FOR i IN 1..40 LOOP
  INSERT INTO denied_party_screenings (
    user_id, party_name, party_country, search_type, result, risk_level,
    matched_list, match_details, created_at
  ) VALUES (
    admin_id,
    (ARRAY['ABC Trading Co', 'Global Exports Ltd', 'Tech Solutions Inc', 'Manufacturing Partners', 'Supply Chain Corp', 'Eastern Imports LLC', 'Western Distribution', 'Northern Logistics', 'Southern Trade Co', 'Pacific Rim Traders'])[floor(random() * 10 + 1)] || ' ' || i,
    (ARRAY['US', 'CN', 'RU', 'IR', 'DE', 'IN', 'AE', 'SG', 'JP', 'KR'])[floor(random() * 10 + 1)],
    (ARRAY['company', 'individual'])[floor(random() * 2 + 1)],
    (ARRAY['clear', 'clear', 'clear', 'clear', 'possible_match', 'match'])[floor(random() * 6 + 1)],
    (ARRAY['none', 'none', 'none', 'low', 'medium', 'high'])[floor(random() * 6 + 1)],
    CASE WHEN random() > 0.7 THEN (ARRAY['OFAC SDN', 'BIS Entity List', 'EU Sanctions', NULL])[floor(random() * 4 + 1)] ELSE NULL END,
    CASE WHEN random() > 0.7 THEN 'Potential match found - manual review recommended' ELSE NULL END,
    NOW() - (random() * 90)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- High risk screenings for demo
INSERT INTO denied_party_screenings (user_id, party_name, party_country, search_type, result, risk_level, matched_list, match_details, created_at)
VALUES
  (admin_id, 'Volkov Trading LLC', 'RU', 'company', 'match', 'critical', 'OFAC SDN List', 'Exact match found on OFAC Specially Designated Nationals List. Transaction prohibited.', NOW() - INTERVAL '2 days'),
  (admin_id, 'Dragon Shell Corporation', 'CN', 'company', 'match', 'high', 'BIS Entity List', 'Listed on Bureau of Industry and Security Entity List. Export license required.', NOW() - INTERVAL '5 days'),
  (admin_id, 'Northern Star Logistics', 'IR', 'company', 'match', 'critical', 'OFAC Iran Sanctions', 'Entity associated with Iranian shipping. Blocked under Iran sanctions.', NOW() - INTERVAL '7 days'),
  (manager_id, 'Suspicious Traders Inc', 'KP', 'company', 'match', 'critical', 'UN Sanctions', 'North Korea related entity. All transactions prohibited.', NOW() - INTERVAL '3 days');

FOR i IN 1..25 LOOP
  INSERT INTO denied_party_screenings (
    user_id, party_name, party_country, search_type, result, risk_level, created_at
  ) VALUES (
    manager_id,
    'Partner Company ' || i,
    (ARRAY['US', 'DE', 'GB', 'FR', 'JP'])[floor(random() * 5 + 1)],
    'company',
    'clear',
    'none',
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- TRADE DOCUMENTS - 300+ documents
-- ============================================================================

-- Get shipment IDs for admin
FOR ship_id IN (SELECT id FROM shipments WHERE user_id = admin_id LIMIT 60) LOOP
  -- Commercial Invoice
  INSERT INTO trade_documents (user_id, shipment_id, doc_type, doc_number, status, created_at)
  VALUES (admin_id, ship_id, 'commercial_invoice', 'CI-' || substr(ship_id::TEXT, 1, 8),
    (ARRAY['draft', 'generated', 'submitted', 'approved'])[floor(random() * 4 + 1)],
    NOW() - (random() * 30)::INTEGER * INTERVAL '1 day');

  -- Packing List
  INSERT INTO trade_documents (user_id, shipment_id, doc_type, doc_number, status, created_at)
  VALUES (admin_id, ship_id, 'packing_list', 'PL-' || substr(ship_id::TEXT, 1, 8),
    (ARRAY['draft', 'generated', 'approved'])[floor(random() * 3 + 1)],
    NOW() - (random() * 30)::INTEGER * INTERVAL '1 day');

  -- Bill of Lading (50% chance)
  IF random() > 0.5 THEN
    INSERT INTO trade_documents (user_id, shipment_id, doc_type, doc_number, status, created_at)
    VALUES (admin_id, ship_id, 'bill_of_lading', 'BL-' || substr(ship_id::TEXT, 1, 8),
      (ARRAY['draft', 'generated', 'submitted'])[floor(random() * 3 + 1)],
      NOW() - (random() * 25)::INTEGER * INTERVAL '1 day');
  END IF;

  -- Certificate of Origin (40% chance)
  IF random() > 0.6 THEN
    INSERT INTO trade_documents (user_id, shipment_id, doc_type, doc_number, status, created_at)
    VALUES (admin_id, ship_id, 'certificate_of_origin', 'COO-' || substr(ship_id::TEXT, 1, 8),
      (ARRAY['draft', 'generated', 'approved'])[floor(random() * 3 + 1)],
      NOW() - (random() * 20)::INTEGER * INTERVAL '1 day');
  END IF;
END LOOP;

-- Manager documents
FOR ship_id IN (SELECT id FROM shipments WHERE user_id = manager_id LIMIT 40) LOOP
  INSERT INTO trade_documents (user_id, shipment_id, doc_type, doc_number, status, created_at)
  VALUES (manager_id, ship_id, 'commercial_invoice', 'CI-MGR-' || substr(ship_id::TEXT, 1, 8), 'approved',
    NOW() - (random() * 20)::INTEGER * INTERVAL '1 day');
  INSERT INTO trade_documents (user_id, shipment_id, doc_type, doc_number, status, created_at)
  VALUES (manager_id, ship_id, 'packing_list', 'PL-MGR-' || substr(ship_id::TEXT, 1, 8), 'approved',
    NOW() - (random() * 20)::INTEGER * INTERVAL '1 day');
END LOOP;

-- ============================================================================
-- COMPLIANCE EXCEPTIONS - 50+ exceptions
-- ============================================================================

FOR i IN 1..25 LOOP
  INSERT INTO compliance_exceptions (
    user_id, shipment_id, exception_type, severity, description, status,
    assigned_to, created_at
  )
  SELECT
    admin_id,
    id,
    (ARRAY['missing_document', 'value_discrepancy', 'classification_mismatch', 'restricted_party', 'license_required', 'origin_verification'])[floor(random() * 6 + 1)],
    (ARRAY['low', 'low', 'medium', 'medium', 'high', 'critical'])[floor(random() * 6 + 1)],
    (ARRAY[
      'Commercial invoice value does not match declared customs value',
      'Missing certificate of origin for FTA qualification',
      'HS code classification needs review - possible misclassification',
      'Consignee name partial match on screening list',
      'Export license may be required for dual-use goods',
      'Country of origin documentation incomplete',
      'Packing list weight discrepancy exceeds tolerance',
      'Incoterm mismatch between invoice and B/L'
    ])[floor(random() * 8 + 1)],
    (ARRAY['open', 'open', 'in_review', 'resolved', 'waived'])[floor(random() * 5 + 1)],
    (ARRAY['Compliance Team', 'Trade Manager', 'Senior Analyst', NULL])[floor(random() * 4 + 1)],
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  FROM shipments
  WHERE user_id = admin_id
  ORDER BY random()
  LIMIT 1;
END LOOP;

FOR i IN 1..15 LOOP
  INSERT INTO compliance_exceptions (
    user_id, shipment_id, exception_type, severity, description, status, created_at
  )
  SELECT
    manager_id,
    id,
    (ARRAY['missing_document', 'value_discrepancy', 'classification_mismatch'])[floor(random() * 3 + 1)],
    (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)],
    'Compliance exception requiring review',
    (ARRAY['open', 'in_review', 'resolved'])[floor(random() * 3 + 1)],
    NOW() - (random() * 45)::INTEGER * INTERVAL '1 day'
  FROM shipments
  WHERE user_id = manager_id
  ORDER BY random()
  LIMIT 1;
END LOOP;

-- ============================================================================
-- NOTIFICATIONS - 100+ notifications
-- ============================================================================

FOR i IN 1..50 LOOP
  INSERT INTO notifications (
    user_id, title, message, type, read, created_at
  ) VALUES (
    admin_id,
    (ARRAY[
      'Shipment Cleared',
      'Document Approved',
      'Compliance Alert',
      'Screening Complete',
      'Duty Calculation Ready',
      'New Exception Created',
      'FTA Savings Identified',
      'Shipment Delayed'
    ])[floor(random() * 8 + 1)],
    (ARRAY[
      'Shipment TG-2026-00001 has cleared customs successfully.',
      'Commercial invoice CI-12345 has been approved.',
      'New compliance exception requires your attention.',
      'Denied party screening completed - no matches found.',
      'Duty calculation shows potential FTA savings of $2,500.',
      'Critical exception: Value discrepancy detected.',
      'USMCA qualification confirmed - 15% duty reduction.',
      'Shipment delayed at port of entry - documentation requested.'
    ])[floor(random() * 8 + 1)],
    (ARRAY['info', 'success', 'warning', 'error'])[floor(random() * 4 + 1)],
    random() > 0.4,
    NOW() - (random() * 30)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

FOR i IN 1..30 LOOP
  INSERT INTO notifications (user_id, title, message, type, read, created_at)
  VALUES (
    manager_id,
    (ARRAY['Shipment Update', 'Document Status', 'Compliance Review'])[floor(random() * 3 + 1)],
    'Notification message for manager user #' || i,
    (ARRAY['info', 'success', 'warning'])[floor(random() * 3 + 1)],
    random() > 0.3,
    NOW() - (random() * 20)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- AUDIT LOGS - 200+ entries
-- ============================================================================

FOR i IN 1..100 LOOP
  INSERT INTO audit_logs (
    user_id, action, entity_type, entity_id, details, created_at
  ) VALUES (
    admin_id,
    (ARRAY['create_shipment', 'update_shipment', 'classify_hs', 'screen_party', 'calculate_duty', 'generate_document', 'resolve_exception', 'export_report', 'update_settings', 'login'])[floor(random() * 10 + 1)],
    (ARRAY['shipment', 'classification', 'screening', 'document', 'exception', 'report'])[floor(random() * 6 + 1)],
    gen_random_uuid(),
    jsonb_build_object(
      'action_by', 'admin@tradeguard.com',
      'ip_address', '192.168.1.' || floor(random() * 255 + 1)::TEXT,
      'details', 'Audit log entry #' || i
    ),
    NOW() - (random() * 90)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

FOR i IN 1..60 LOOP
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    manager_id,
    (ARRAY['create_shipment', 'update_shipment', 'generate_document', 'login'])[floor(random() * 4 + 1)],
    (ARRAY['shipment', 'document'])[floor(random() * 2 + 1)],
    gen_random_uuid(),
    jsonb_build_object('action_by', 'manager@tradeguard.com'),
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

FOR i IN 1..40 LOOP
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    analyst_id,
    (ARRAY['classify_hs', 'calculate_duty', 'export_report', 'login'])[floor(random() * 4 + 1)],
    (ARRAY['classification', 'calculation', 'report'])[floor(random() * 3 + 1)],
    gen_random_uuid(),
    jsonb_build_object('action_by', 'analyst@tradeguard.com'),
    NOW() - (random() * 45)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- PRODUCTS - 100+ products
-- ============================================================================

FOR i IN 1..50 LOOP
  INSERT INTO products (
    user_id, name, description, hs_code, hs_confidence, country_of_origin,
    weight_kg, value_usd, category, is_restricted, created_at
  ) VALUES (
    admin_id,
    (ARRAY['Industrial Valve', 'Steel Pipe', 'Electric Motor', 'Control Panel', 'Sensor Module', 'Pump Assembly', 'Bearing Set', 'Gasket Kit', 'Filter Element', 'Coupling Device'])[floor(random() * 10 + 1)] || ' Type-' || i,
    'High-quality industrial component for manufacturing applications',
    (ARRAY['8481.80', '7304.41', '8501.52', '8537.10', '9031.80', '8413.70', '8482.10', '8484.10', '8421.23', '8483.60'])[floor(random() * 10 + 1)],
    (random() * 25 + 75)::DECIMAL(5,2),
    (ARRAY['IN', 'CN', 'DE', 'JP', 'US'])[floor(random() * 5 + 1)],
    (random() * 100 + 1)::DECIMAL(10,2),
    (random() * 5000 + 100)::DECIMAL(12,2),
    (ARRAY['Machinery', 'Electronics', 'Industrial', 'Automotive'])[floor(random() * 4 + 1)],
    random() > 0.9,
    NOW() - (random() * 180)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

FOR i IN 1..30 LOOP
  INSERT INTO products (
    user_id, name, description, hs_code, country_of_origin,
    value_usd, category, created_at
  ) VALUES (
    manager_id,
    'Power Equipment Part #' || i,
    'Electrical power generation component',
    (ARRAY['8501.52', '8504.23', '8503.00'])[floor(random() * 3 + 1)],
    'IN',
    (random() * 10000 + 500)::DECIMAL(12,2),
    'Power Generation',
    NOW() - (random() * 120)::INTEGER * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================================
-- TRADE FINANCE - 20+ instruments
-- ============================================================================

FOR i IN 1..15 LOOP
  INSERT INTO trade_finance (
    user_id, shipment_id, instrument_type, reference_number, lc_type,
    amount, currency, beneficiary_name, beneficiary_bank, issuing_bank,
    expiry_date, status, created_at
  )
  SELECT
    admin_id,
    id,
    (ARRAY['letter_of_credit', 'letter_of_credit', 'bank_guarantee', 'documentary_collection'])[floor(random() * 4 + 1)],
    'LC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
    (ARRAY['irrevocable', 'confirmed', 'transferable'])[floor(random() * 3 + 1)],
    (random() * 500000 + 50000)::DECIMAL(12,2),
    'USD',
    (ARRAY['Tata Exports Ltd', 'Reliance Industries', 'Sun Pharma', 'Mahindra Ltd'])[floor(random() * 4 + 1)],
    (ARRAY['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'])[floor(random() * 4 + 1)],
    (ARRAY['Citibank NA', 'HSBC Holdings', 'Deutsche Bank', 'JPMorgan Chase'])[floor(random() * 4 + 1)],
    CURRENT_DATE + (random() * 180 + 30)::INTEGER,
    (ARRAY['draft', 'submitted', 'approved', 'active', 'utilized'])[floor(random() * 5 + 1)],
    NOW() - (random() * 60)::INTEGER * INTERVAL '1 day'
  FROM shipments
  WHERE user_id = admin_id
  ORDER BY random()
  LIMIT 1;
END LOOP;

RAISE NOTICE 'Comprehensive seed data created successfully!';
RAISE NOTICE 'Admin: 80 shipments, 60 classifications, 50 calculations, 40 screenings';
RAISE NOTICE 'Manager: 50 shipments, 40 classifications, 30 calculations, 25 screenings';
RAISE NOTICE 'Analyst: 40 shipments, 35 classifications';
RAISE NOTICE 'Viewer: 30 shipments';
RAISE NOTICE 'Total: 200+ shipments, 135 classifications, 80 calculations, 65+ screenings, 300+ documents';

END $$;
