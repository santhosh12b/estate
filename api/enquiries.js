import { neon } from '@neondatabase/serverless';

function generateEnquiryCode() {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GV-${dateStr}-${randomStr}`;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl = process.env.DATABASE_URL;
  const isDbConfigured = Boolean(
    databaseUrl && !databaseUrl.includes('user:password') && !databaseUrl.includes('placeholder')
  );

  // -------------------------------------------------------------
  // 1. GET: Fetch Enquiries (Protected by Admin Key)
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    const adminKey = process.env.ADMIN_API_KEY;
    const providedKey = req.headers['x-admin-key'] || req.query.key;

    if (adminKey && providedKey !== adminKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing admin key.'
      });
    }

    if (!isDbConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Database not yet configured. Set DATABASE_URL in Vercel.',
        count: 0,
        data: []
      });
    }

    try {
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT 
          id, enquiry_code, full_name, phone_number, email,
          preferred_location, property_type, budget, message,
          status, source, created_at
        FROM enquiries
        ORDER BY created_at DESC
        LIMIT 100;
      `;
      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (err) {
      console.error('Error fetching enquiries from Neon:', err);
      return res.status(500).json({
        success: false,
        error: `Database query failed: ${err.message}`
      });
    }
  }

  // -------------------------------------------------------------
  // 2. POST: Submit New Enquiry Lead
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    const body = req.body || {};
    const fullName = (body.fullName || body.full_name || '').trim();
    const phoneNumber = (body.phoneNumber || body.phone_number || '').trim();
    const email = (body.email || '').trim() || null;
    const preferredLocation = (body.preferredLocation || body.preferred_location || 'Coimbatore').trim();
    const propertyType = (body.propertyType || body.property_type || 'Gated Community Plots').trim();
    const budget = (body.budget || 'Flexible').trim();
    const message = (body.message || '').trim() || null;
    const source = (body.source || 'Website Form').trim();

    // Basic Validation
    if (!fullName || fullName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your full name (minimum 2 characters).'
      });
    }

    const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid phone number.'
      });
    }

    const enquiryCode = generateEnquiryCode();
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';

    // If Neon database is configured, insert directly
    if (isDbConfigured) {
      try {
        const sql = neon(databaseUrl);
        const rows = await sql`
          INSERT INTO enquiries (
            enquiry_code, full_name, phone_number, email,
            preferred_location, property_type, budget, message,
            status, source, ip_address, user_agent
          ) VALUES (
            ${enquiryCode}, ${fullName}, ${phoneNumber}, ${email},
            ${preferredLocation}, ${propertyType}, ${budget}, ${message},
            'New Lead', ${source}, ${ipAddress}, ${userAgent}
          )
          RETURNING id, enquiry_code, created_at;
        `;

        return res.status(201).json({
          success: true,
          enquiryCode,
          id: rows[0]?.id,
          message: 'Enquiry submitted successfully to Gubera Vasal!',
          database: 'Neon PostgreSQL'
        });
      } catch (err) {
        console.error('Neon Database Insert Error:', err);
        return res.status(500).json({
          success: false,
          error: `Failed to save enquiry in database: ${err.message}`
        });
      }
    }

    // Graceful fallback if DATABASE_URL is not yet added in Vercel env
    return res.status(200).json({
      success: true,
      enquiryCode,
      message: 'Enquiry captured successfully! (Neon DATABASE_URL pending configuration)',
      simulated: true
    });
  }

  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`
  });
}
