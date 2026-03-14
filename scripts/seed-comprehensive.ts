import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Helper to get random number in range
const randomNum = (min: number, max: number): number => Math.random() * (max - min) + min

// Data arrays
const originCountries = ['IN', 'CN', 'DE', 'US', 'JP', 'KR', 'TW', 'VN', 'TH', 'MY']
const destCountries = ['US', 'DE', 'GB', 'FR', 'NL', 'AE', 'SG', 'AU', 'CA', 'IT']
const shippers = [
  'Tata Global Exports Pvt Ltd', 'Reliance Industries Ltd', 'Infosys Technologies',
  'Sun Pharma International', 'Mahindra Logistics Ltd', 'Wipro Limited',
  'HCL Technologies', 'Bajaj Auto Ltd', 'Larsen & Toubro', 'Adani Enterprises'
]
const consignees = [
  'Amazon Inc', 'Walmart Global', 'Target Corporation', 'Best Buy Co', 'Apple Inc',
  'Microsoft Corp', 'Google LLC', 'Meta Platforms', 'Tesla Inc', 'Samsung Electronics'
]
const products = [
  'Pharmaceutical Tablets', 'Cotton Yarn', 'Auto Brake Pads', 'Electronic Circuit Boards',
  'Polished Diamonds', 'Stainless Steel Pipes', 'Leather Handbags', 'Basmati Rice',
  'Organic Spices', 'Machine Parts', 'Textile Fabrics', 'Solar Panels',
  'LED Lights', 'Computer Monitors', 'Mobile Accessories'
]
const hsCodes = [
  '3004.90', '5205.11', '8708.30', '8534.00', '7102.39', '7304.41', '4202.21',
  '1006.30', '0910.11', '8466.93', '5208.21', '8541.40', '9405.42', '8528.52', '8517.62'
]
const statuses = ['in_transit', 'pending_clearance', 'cleared', 'delivered', 'flagged']
const complianceStatuses = ['compliant', 'review_required', 'flagged']
const currencies = ['USD', 'EUR', 'GBP', 'INR']
const incoterms = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA']
const brokers = ['Global Customs Services Ltd', 'EuroTrade Customs Agency', 'Asia Pacific Customs Solutions', 'DHL Customs Brokerage']
const forwarders = ['DHL Global Forwarding', 'Kuehne + Nagel', 'DB Schenker', 'Maersk Logistics', 'FedEx Trade Networks']

async function seedComprehensiveData() {
  console.log('🚀 Starting comprehensive data seed...\n')

  // Get user IDs
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .in('email', ['admin@tradeguard.com', 'manager@tradeguard.com', 'analyst@tradeguard.com', 'viewer@tradeguard.com'])

  if (profileError || !profiles?.length) {
    console.error('❌ Error fetching profiles:', profileError)
    // Try auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    if (!authUsers?.users?.length) {
      console.error('❌ No users found. Please create test users first.')
      return
    }
    console.log('Found users in auth.users')
  }

  const users: Record<string, string> = {}
  profiles?.forEach(p => {
    const role = p.email.split('@')[0]
    users[role] = p.id
  })

  console.log('Found users:', Object.keys(users))

  // ============================================================================
  // SHIPMENTS - 200 total
  // ============================================================================
  console.log('\n📦 Creating shipments...')

  const shipmentData: any[] = []

  // Admin - 80 shipments
  for (let i = 1; i <= 80; i++) {
    shipmentData.push({
      user_id: users['admin'],
      reference_no: `TG-2026-${String(i).padStart(5, '0')}`,
      origin_country: randomItem(originCountries),
      destination_country: randomItem(destCountries),
      shipper_name: randomItem(shippers),
      consignee_name: randomItem(consignees),
      product_name: randomItem(products),
      hs_code: randomItem(hsCodes),
      declared_value: Math.round(randomNum(5000, 500000) * 100) / 100,
      currency: randomItem(currencies),
      weight_kg: Math.round(randomNum(100, 5000) * 100) / 100,
      incoterm: randomItem(incoterms),
      status: randomItem(statuses),
      compliance_status: randomItem(complianceStatuses),
      duty_amount: Math.round(randomNum(500, 25000) * 100) / 100,
      tax_amount: Math.round(randomNum(200, 15000) * 100) / 100,
      customs_broker: randomItem(brokers),
      freight_forwarder: randomItem(forwarders),
      estimated_delivery: new Date(Date.now() + randomNum(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Manager - 50 shipments
  for (let i = 1; i <= 50; i++) {
    shipmentData.push({
      user_id: users['manager'],
      reference_no: `TG-MGR-${String(i).padStart(5, '0')}`,
      origin_country: randomItem(['IN', 'CN', 'DE', 'JP', 'KR']),
      destination_country: randomItem(['US', 'DE', 'GB', 'AE', 'SG']),
      shipper_name: randomItem(['Bharat Electronics Ltd', 'ONGC Videsh', 'Coal India Ltd', 'NTPC Limited', 'Power Grid Corp']),
      consignee_name: randomItem(['Siemens AG', 'General Electric', 'Honeywell Intl', 'ABB Ltd', 'Schneider Electric']),
      product_name: randomItem(['Industrial Machinery', 'Power Transformers', 'Control Systems', 'Electrical Cables', 'Generator Parts']),
      hs_code: randomItem(['8501.52', '8504.23', '8537.10', '8544.49', '8503.00']),
      declared_value: Math.round(randomNum(10000, 300000) * 100) / 100,
      currency: 'USD',
      weight_kg: Math.round(randomNum(500, 3000) * 100) / 100,
      incoterm: randomItem(['FOB', 'CIF', 'DDP']),
      status: randomItem(statuses),
      compliance_status: randomItem(complianceStatuses),
      duty_amount: Math.round(randomNum(1000, 20000) * 100) / 100,
      tax_amount: Math.round(randomNum(500, 10000) * 100) / 100,
      created_at: new Date(Date.now() - randomNum(1, 45) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Analyst - 40 shipments
  for (let i = 1; i <= 40; i++) {
    shipmentData.push({
      user_id: users['analyst'],
      reference_no: `TG-ANL-${String(i).padStart(5, '0')}`,
      origin_country: randomItem(['IN', 'CN', 'VN', 'TH']),
      destination_country: randomItem(['US', 'DE', 'GB', 'AU']),
      shipper_name: 'Tech Mahindra Ltd',
      consignee_name: 'IBM Corporation',
      product_name: randomItem(['Software Services', 'IT Equipment', 'Network Hardware', 'Server Components']),
      hs_code: randomItem(['8471.30', '8471.49', '8517.62', '8473.30']),
      declared_value: Math.round(randomNum(5000, 200000) * 100) / 100,
      currency: 'USD',
      weight_kg: Math.round(randomNum(50, 1000) * 100) / 100,
      status: randomItem(['in_transit', 'pending_clearance', 'cleared', 'delivered']),
      compliance_status: 'compliant',
      created_at: new Date(Date.now() - randomNum(1, 30) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Viewer - 30 shipments
  for (let i = 1; i <= 30; i++) {
    shipmentData.push({
      user_id: users['viewer'],
      reference_no: `TG-VWR-${String(i).padStart(5, '0')}`,
      origin_country: 'IN',
      destination_country: randomItem(['US', 'DE', 'GB']),
      shipper_name: 'Export Trading Co',
      consignee_name: 'Import Partners Inc',
      product_name: 'General Merchandise',
      hs_code: '9999.00',
      declared_value: Math.round(randomNum(1000, 50000) * 100) / 100,
      currency: 'USD',
      status: 'cleared',
      compliance_status: 'compliant',
      created_at: new Date(Date.now() - randomNum(1, 20) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Insert shipments in batches
  for (let i = 0; i < shipmentData.length; i += 50) {
    const batch = shipmentData.slice(i, i + 50)
    const { error } = await supabase.from('shipments').insert(batch)
    if (error) console.error('Shipment insert error:', error.message)
    else console.log(`  ✓ Inserted shipments ${i + 1}-${Math.min(i + 50, shipmentData.length)}`)
  }

  // ============================================================================
  // HS CLASSIFICATIONS - 135 total
  // ============================================================================
  console.log('\n🏷️  Creating HS classifications...')

  const classificationDescriptions = [
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
  ]

  const classificationData: any[] = []

  // Admin - 60 classifications
  for (let i = 1; i <= 60; i++) {
    classificationData.push({
      user_id: users['admin'],
      product_description: randomItem(classificationDescriptions) + ` (Variant ${i})`,
      suggested_hs_code: randomItem(hsCodes),
      hs_chapter: `Chapter ${Math.floor(Math.random() * 97 + 1)} - Trade Classification`,
      hs_description: 'HS classification for international trade compliance',
      confidence_score: Math.round(randomNum(70, 99) * 100) / 100,
      reasoning: 'Based on material composition, intended use, and manufacturing process. Classification determined per WCO guidelines and customs regulations.',
      status: randomItem(['accepted', 'accepted', 'accepted', 'pending', 'rejected']),
      created_at: new Date(Date.now() - randomNum(1, 90) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Manager - 40 classifications
  for (let i = 1; i <= 40; i++) {
    classificationData.push({
      user_id: users['manager'],
      product_description: `Industrial equipment component #${i}`,
      suggested_hs_code: randomItem(['8501.52', '8504.23', '8537.10', '8544.49', '8503.00']),
      hs_chapter: 'Chapter 85 - Electrical Machinery',
      confidence_score: Math.round(randomNum(75, 98) * 100) / 100,
      reasoning: 'Classified as electrical machinery based on function and specifications.',
      status: randomItem(['accepted', 'accepted', 'pending']),
      created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Analyst - 35 classifications
  for (let i = 1; i <= 35; i++) {
    classificationData.push({
      user_id: users['analyst'],
      product_description: `Tech product analysis #${i}`,
      suggested_hs_code: randomItem(['8471.30', '8471.49', '8517.62', '8473.30']),
      hs_chapter: 'Chapter 84/85 - Machinery',
      confidence_score: Math.round(randomNum(80, 99) * 100) / 100,
      reasoning: 'IT equipment classification per customs guidelines.',
      status: 'accepted',
      created_at: new Date(Date.now() - randomNum(1, 45) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  for (let i = 0; i < classificationData.length; i += 50) {
    const batch = classificationData.slice(i, i + 50)
    const { error } = await supabase.from('hs_classifications').insert(batch)
    if (error) console.error('Classification insert error:', error.message)
    else console.log(`  ✓ Inserted classifications ${i + 1}-${Math.min(i + 50, classificationData.length)}`)
  }

  // ============================================================================
  // DUTY CALCULATIONS - 80 total
  // ============================================================================
  console.log('\n💰 Creating duty calculations...')

  const dutyData: any[] = []

  // Admin - 50 calculations
  for (let i = 1; i <= 50; i++) {
    const declaredValue = Math.round(randomNum(5000, 100000) * 100) / 100
    const dutyRate = Math.round(randomNum(2, 15) * 100) / 100
    const dutyAmount = Math.round(declaredValue * dutyRate / 100 * 100) / 100
    const vatRate = Math.round(randomNum(5, 20) * 100) / 100
    const vatAmount = Math.round((declaredValue + dutyAmount) * vatRate / 100 * 100) / 100
    const otherFees = Math.round(randomNum(50, 500) * 100) / 100

    dutyData.push({
      user_id: users['admin'],
      origin_country: randomItem(['IN', 'CN', 'VN', 'TH', 'MY']),
      destination_country: randomItem(['US', 'DE', 'GB', 'FR', 'NL']),
      hs_code: randomItem(hsCodes),
      product_description: `Product for duty calculation #${i}`,
      declared_value: declaredValue,
      currency: 'USD',
      duty_rate: dutyRate,
      duty_amount: dutyAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      other_fees: otherFees,
      total_landed_cost: declaredValue + dutyAmount + vatAmount + otherFees,
      fta_applicable: Math.random() > 0.5,
      fta_name: randomItem(['USMCA', 'India-UAE CEPA', 'ASEAN FTA', 'India-Japan CEPA', null]),
      savings_vs_standard: Math.round(randomNum(0, 5000) * 100) / 100,
      created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Manager - 30 calculations
  for (let i = 1; i <= 30; i++) {
    const declaredValue = Math.round(randomNum(20000, 200000) * 100) / 100
    const dutyAmount = Math.round(declaredValue * 0.08 * 100) / 100
    const vatAmount = Math.round(declaredValue * 0.18 * 100) / 100

    dutyData.push({
      user_id: users['manager'],
      origin_country: 'IN',
      destination_country: randomItem(['US', 'DE', 'AE']),
      hs_code: '8501.52',
      product_description: `Industrial machinery duty calc #${i}`,
      declared_value: declaredValue,
      currency: 'USD',
      duty_rate: 8,
      duty_amount: dutyAmount,
      vat_rate: 18,
      vat_amount: vatAmount,
      total_landed_cost: declaredValue + dutyAmount + vatAmount,
      fta_applicable: Math.random() > 0.6,
      created_at: new Date(Date.now() - randomNum(1, 45) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const { error: dutyError } = await supabase.from('duty_calculations').insert(dutyData)
  if (dutyError) console.error('Duty calculation insert error:', dutyError.message)
  else console.log(`  ✓ Inserted ${dutyData.length} duty calculations`)

  // ============================================================================
  // DENIED PARTY SCREENINGS - 70 total
  // ============================================================================
  console.log('\n🔍 Creating denied party screenings...')

  const screeningData: any[] = []
  const partyNames = [
    'ABC Trading Co', 'Global Exports Ltd', 'Tech Solutions Inc', 'Manufacturing Partners',
    'Supply Chain Corp', 'Eastern Imports LLC', 'Western Distribution', 'Northern Logistics',
    'Southern Trade Co', 'Pacific Rim Traders', 'Atlantic Commerce', 'European Suppliers'
  ]

  // Admin - 40 screenings
  for (let i = 1; i <= 40; i++) {
    const result = randomItem(['clear', 'clear', 'clear', 'clear', 'possible_match', 'match'])
    screeningData.push({
      user_id: users['admin'],
      party_name: `${randomItem(partyNames)} ${i}`,
      party_country: randomItem(['US', 'CN', 'DE', 'IN', 'AE', 'SG', 'JP', 'KR', 'GB', 'FR']),
      search_type: randomItem(['company', 'individual']),
      result: result,
      risk_level: result === 'clear' ? 'none' : randomItem(['low', 'medium', 'high']),
      matched_list: result !== 'clear' ? randomItem(['OFAC SDN', 'BIS Entity List', 'EU Sanctions', null]) : null,
      match_details: result !== 'clear' ? 'Potential match found - manual review recommended' : null,
      created_at: new Date(Date.now() - randomNum(1, 90) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Critical matches for demo
  screeningData.push(
    { user_id: users['admin'], party_name: 'Volkov Trading LLC', party_country: 'RU', search_type: 'company', result: 'match', risk_level: 'critical', matched_list: 'OFAC SDN List', match_details: 'Exact match found on OFAC Specially Designated Nationals List. Transaction prohibited.', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: users['admin'], party_name: 'Dragon Shell Corporation', party_country: 'CN', search_type: 'company', result: 'match', risk_level: 'high', matched_list: 'BIS Entity List', match_details: 'Listed on Bureau of Industry and Security Entity List. Export license required.', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: users['admin'], party_name: 'Northern Star Logistics', party_country: 'IR', search_type: 'company', result: 'match', risk_level: 'critical', matched_list: 'OFAC Iran Sanctions', match_details: 'Entity associated with Iranian shipping. Blocked under Iran sanctions.', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: users['manager'], party_name: 'Suspicious Traders Inc', party_country: 'KP', search_type: 'company', result: 'match', risk_level: 'critical', matched_list: 'UN Sanctions', match_details: 'North Korea related entity. All transactions prohibited.', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  )

  // Manager - 25 screenings
  for (let i = 1; i <= 25; i++) {
    screeningData.push({
      user_id: users['manager'],
      party_name: `Partner Company ${i}`,
      party_country: randomItem(['US', 'DE', 'GB', 'FR', 'JP']),
      search_type: 'company',
      result: 'clear',
      risk_level: 'none',
      created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const { error: screeningError } = await supabase.from('denied_party_screenings').insert(screeningData)
  if (screeningError) console.error('Screening insert error:', screeningError.message)
  else console.log(`  ✓ Inserted ${screeningData.length} denied party screenings`)

  // ============================================================================
  // PRODUCTS - 80 total
  // ============================================================================
  console.log('\n📦 Creating products...')

  const productData: any[] = []
  const productNames = [
    'Industrial Valve', 'Steel Pipe', 'Electric Motor', 'Control Panel', 'Sensor Module',
    'Pump Assembly', 'Bearing Set', 'Gasket Kit', 'Filter Element', 'Coupling Device'
  ]

  // Admin - 50 products
  for (let i = 1; i <= 50; i++) {
    productData.push({
      user_id: users['admin'],
      name: `${randomItem(productNames)} Type-${i}`,
      description: 'High-quality industrial component for manufacturing applications',
      hs_code: randomItem(hsCodes),
      hs_confidence: Math.round(randomNum(75, 99) * 100) / 100,
      country_of_origin: randomItem(['IN', 'CN', 'DE', 'JP', 'US']),
      weight_kg: Math.round(randomNum(1, 100) * 100) / 100,
      value_usd: Math.round(randomNum(100, 5000) * 100) / 100,
      category: randomItem(['Machinery', 'Electronics', 'Industrial', 'Automotive']),
      is_restricted: Math.random() > 0.9,
      created_at: new Date(Date.now() - randomNum(1, 180) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Manager - 30 products
  for (let i = 1; i <= 30; i++) {
    productData.push({
      user_id: users['manager'],
      name: `Power Equipment Part #${i}`,
      description: 'Electrical power generation component',
      hs_code: randomItem(['8501.52', '8504.23', '8503.00']),
      country_of_origin: 'IN',
      value_usd: Math.round(randomNum(500, 10000) * 100) / 100,
      category: 'Power Generation',
      created_at: new Date(Date.now() - randomNum(1, 120) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const { error: productError } = await supabase.from('products').insert(productData)
  if (productError) console.error('Product insert error:', productError.message)
  else console.log(`  ✓ Inserted ${productData.length} products`)

  // ============================================================================
  // COMPLIANCE EXCEPTIONS - 40 total
  // ============================================================================
  console.log('\n⚠️  Creating compliance exceptions...')

  // Get shipment IDs
  const { data: adminShipments } = await supabase.from('shipments').select('id').eq('user_id', users['admin']).limit(30)
  const { data: managerShipments } = await supabase.from('shipments').select('id').eq('user_id', users['manager']).limit(15)

  const exceptionTypes = ['missing_document', 'value_discrepancy', 'classification_mismatch', 'restricted_party', 'license_required', 'origin_verification']
  const severities = ['low', 'medium', 'high', 'critical']
  const exceptionStatuses = ['open', 'in_review', 'resolved', 'waived']
  const descriptions = [
    'Commercial invoice value does not match declared customs value',
    'Missing certificate of origin for FTA qualification',
    'HS code classification needs review - possible misclassification',
    'Consignee name partial match on screening list',
    'Export license may be required for dual-use goods',
    'Country of origin documentation incomplete',
    'Packing list weight discrepancy exceeds tolerance',
    'Incoterm mismatch between invoice and B/L'
  ]

  const exceptionData: any[] = []

  if (adminShipments) {
    for (let i = 0; i < Math.min(25, adminShipments.length); i++) {
      exceptionData.push({
        user_id: users['admin'],
        shipment_id: adminShipments[i].id,
        exception_type: randomItem(exceptionTypes),
        severity: randomItem(severities),
        description: randomItem(descriptions),
        status: randomItem(exceptionStatuses),
        assigned_to: randomItem(['Compliance Team', 'Trade Manager', 'Senior Analyst', null]),
        created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  if (managerShipments) {
    for (let i = 0; i < Math.min(15, managerShipments.length); i++) {
      exceptionData.push({
        user_id: users['manager'],
        shipment_id: managerShipments[i].id,
        exception_type: randomItem(exceptionTypes.slice(0, 3)),
        severity: randomItem(severities.slice(0, 3)),
        description: 'Compliance exception requiring review',
        status: randomItem(['open', 'in_review', 'resolved']),
        created_at: new Date(Date.now() - randomNum(1, 45) * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  const { error: exceptionError } = await supabase.from('compliance_exceptions').insert(exceptionData)
  if (exceptionError) console.error('Exception insert error:', exceptionError.message)
  else console.log(`  ✓ Inserted ${exceptionData.length} compliance exceptions`)

  // ============================================================================
  // NOTIFICATIONS - 80 total
  // ============================================================================
  console.log('\n🔔 Creating notifications...')

  const notificationTitles = [
    'Shipment Cleared', 'Document Approved', 'Compliance Alert', 'Screening Complete',
    'Duty Calculation Ready', 'New Exception Created', 'FTA Savings Identified', 'Shipment Delayed'
  ]
  const notificationMessages = [
    'Shipment TG-2026-00001 has cleared customs successfully.',
    'Commercial invoice CI-12345 has been approved.',
    'New compliance exception requires your attention.',
    'Denied party screening completed - no matches found.',
    'Duty calculation shows potential FTA savings of $2,500.',
    'Critical exception: Value discrepancy detected.',
    'USMCA qualification confirmed - 15% duty reduction.',
    'Shipment delayed at port of entry - documentation requested.'
  ]

  const notificationData: any[] = []

  // Admin - 50 notifications
  for (let i = 1; i <= 50; i++) {
    notificationData.push({
      user_id: users['admin'],
      title: randomItem(notificationTitles),
      message: randomItem(notificationMessages),
      type: randomItem(['info', 'success', 'warning', 'error']),
      read: Math.random() > 0.4,
      created_at: new Date(Date.now() - randomNum(1, 30) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Manager - 30 notifications
  for (let i = 1; i <= 30; i++) {
    notificationData.push({
      user_id: users['manager'],
      title: randomItem(['Shipment Update', 'Document Status', 'Compliance Review']),
      message: `Notification message for manager user #${i}`,
      type: randomItem(['info', 'success', 'warning']),
      read: Math.random() > 0.3,
      created_at: new Date(Date.now() - randomNum(1, 20) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const { error: notifError } = await supabase.from('notifications').insert(notificationData)
  if (notifError) console.error('Notification insert error:', notifError.message)
  else console.log(`  ✓ Inserted ${notificationData.length} notifications`)

  // ============================================================================
  // AUDIT LOGS - 200 total
  // ============================================================================
  console.log('\n📝 Creating audit logs...')

  const auditActions = ['create_shipment', 'update_shipment', 'classify_hs', 'screen_party', 'calculate_duty', 'generate_document', 'resolve_exception', 'export_report', 'update_settings', 'login']
  const entityTypes = ['shipment', 'classification', 'screening', 'document', 'exception', 'report']

  const auditData: any[] = []

  // Admin - 100 logs
  for (let i = 1; i <= 100; i++) {
    auditData.push({
      user_id: users['admin'],
      action: randomItem(auditActions),
      entity_type: randomItem(entityTypes),
      details: { action_by: 'admin@tradeguard.com', ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`, details: `Audit log entry #${i}` },
      created_at: new Date(Date.now() - randomNum(1, 90) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Manager - 60 logs
  for (let i = 1; i <= 60; i++) {
    auditData.push({
      user_id: users['manager'],
      action: randomItem(['create_shipment', 'update_shipment', 'generate_document', 'login']),
      entity_type: randomItem(['shipment', 'document']),
      details: { action_by: 'manager@tradeguard.com' },
      created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  // Analyst - 40 logs
  for (let i = 1; i <= 40; i++) {
    auditData.push({
      user_id: users['analyst'],
      action: randomItem(['classify_hs', 'calculate_duty', 'export_report', 'login']),
      entity_type: randomItem(['classification', 'calculation', 'report']),
      details: { action_by: 'analyst@tradeguard.com' },
      created_at: new Date(Date.now() - randomNum(1, 45) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  for (let i = 0; i < auditData.length; i += 50) {
    const batch = auditData.slice(i, i + 50)
    const { error } = await supabase.from('audit_logs').insert(batch)
    if (error) console.error('Audit log insert error:', error.message)
    else console.log(`  ✓ Inserted audit logs ${i + 1}-${Math.min(i + 50, auditData.length)}`)
  }

  // ============================================================================
  // TRADE DOCUMENTS - 240+ documents
  // ============================================================================
  console.log('\n📄 Creating trade documents...')

  const docTypes = ['commercial_invoice', 'packing_list', 'bill_of_lading', 'certificate_of_origin']
  const docStatuses = ['draft', 'generated', 'submitted', 'approved']

  const documentData: any[] = []

  if (adminShipments) {
    for (const shipment of adminShipments) {
      // Each shipment gets 2-4 documents
      documentData.push({
        user_id: users['admin'],
        shipment_id: shipment.id,
        doc_type: 'commercial_invoice',
        doc_number: `CI-${shipment.id.substring(0, 8)}`,
        status: randomItem(docStatuses),
        created_at: new Date(Date.now() - randomNum(1, 30) * 24 * 60 * 60 * 1000).toISOString()
      })
      documentData.push({
        user_id: users['admin'],
        shipment_id: shipment.id,
        doc_type: 'packing_list',
        doc_number: `PL-${shipment.id.substring(0, 8)}`,
        status: randomItem(docStatuses),
        created_at: new Date(Date.now() - randomNum(1, 30) * 24 * 60 * 60 * 1000).toISOString()
      })
      if (Math.random() > 0.5) {
        documentData.push({
          user_id: users['admin'],
          shipment_id: shipment.id,
          doc_type: 'bill_of_lading',
          doc_number: `BL-${shipment.id.substring(0, 8)}`,
          status: randomItem(['draft', 'generated', 'submitted']),
          created_at: new Date(Date.now() - randomNum(1, 25) * 24 * 60 * 60 * 1000).toISOString()
        })
      }
      if (Math.random() > 0.6) {
        documentData.push({
          user_id: users['admin'],
          shipment_id: shipment.id,
          doc_type: 'certificate_of_origin',
          doc_number: `COO-${shipment.id.substring(0, 8)}`,
          status: randomItem(['draft', 'generated', 'approved']),
          created_at: new Date(Date.now() - randomNum(1, 20) * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }
  }

  if (managerShipments) {
    for (const shipment of managerShipments) {
      documentData.push({
        user_id: users['manager'],
        shipment_id: shipment.id,
        doc_type: 'commercial_invoice',
        doc_number: `CI-MGR-${shipment.id.substring(0, 8)}`,
        status: 'approved',
        created_at: new Date(Date.now() - randomNum(1, 20) * 24 * 60 * 60 * 1000).toISOString()
      })
      documentData.push({
        user_id: users['manager'],
        shipment_id: shipment.id,
        doc_type: 'packing_list',
        doc_number: `PL-MGR-${shipment.id.substring(0, 8)}`,
        status: 'approved',
        created_at: new Date(Date.now() - randomNum(1, 20) * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  for (let i = 0; i < documentData.length; i += 50) {
    const batch = documentData.slice(i, i + 50)
    const { error } = await supabase.from('trade_documents').insert(batch)
    if (error) console.error('Document insert error:', error.message)
    else console.log(`  ✓ Inserted documents ${i + 1}-${Math.min(i + 50, documentData.length)}`)
  }

  // ============================================================================
  // TRADE FINANCE - 15 instruments
  // ============================================================================
  console.log('\n💳 Creating trade finance instruments...')

  const tradeFinanceData: any[] = []
  const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']
  const issuingBanks = ['Citibank NA', 'HSBC Holdings', 'Deutsche Bank', 'JPMorgan Chase']

  if (adminShipments) {
    for (let i = 0; i < Math.min(15, adminShipments.length); i++) {
      tradeFinanceData.push({
        user_id: users['admin'],
        shipment_id: adminShipments[i].id,
        instrument_type: randomItem(['letter_of_credit', 'letter_of_credit', 'bank_guarantee', 'documentary_collection']),
        reference_number: `LC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
        lc_type: randomItem(['irrevocable', 'confirmed', 'transferable']),
        amount: Math.round(randomNum(50000, 500000) * 100) / 100,
        currency: 'USD',
        beneficiary_name: randomItem(['Tata Exports Ltd', 'Reliance Industries', 'Sun Pharma', 'Mahindra Ltd']),
        beneficiary_bank: randomItem(banks),
        issuing_bank: randomItem(issuingBanks),
        expiry_date: new Date(Date.now() + randomNum(30, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: randomItem(['draft', 'submitted', 'approved', 'active', 'utilized']),
        created_at: new Date(Date.now() - randomNum(1, 60) * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  const { error: tfError } = await supabase.from('trade_finance').insert(tradeFinanceData)
  if (tfError) console.error('Trade finance insert error:', tfError.message)
  else console.log(`  ✓ Inserted ${tradeFinanceData.length} trade finance instruments`)

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60))
  console.log('✅ COMPREHENSIVE SEED DATA COMPLETE!')
  console.log('='.repeat(60))
  console.log(`
📊 Data Summary:
  • Shipments: 200 (Admin: 80, Manager: 50, Analyst: 40, Viewer: 30)
  • HS Classifications: 135 (Admin: 60, Manager: 40, Analyst: 35)
  • Duty Calculations: 80 (Admin: 50, Manager: 30)
  • Denied Party Screenings: 70+ (includes critical matches for demo)
  • Products: 80 (Admin: 50, Manager: 30)
  • Compliance Exceptions: 40 (Admin: 25, Manager: 15)
  • Notifications: 80 (Admin: 50, Manager: 30)
  • Audit Logs: 200 (Admin: 100, Manager: 60, Analyst: 40)
  • Trade Documents: 240+ (linked to shipments)
  • Trade Finance: 15 (Letters of Credit, Bank Guarantees)

🔑 Test Credentials:
  • admin@tradeguard.com / Password123!
  • manager@tradeguard.com / Manager2026
  • analyst@tradeguard.com / Analyst2026
  • viewer@tradeguard.com / Viewer2026
`)
}

// Run the seed
seedComprehensiveData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
