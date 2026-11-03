import { getSql } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes('user:password')) {
    return res.status(400).json({
      success: false,
      error: 'DATABASE_URL is not configured in Vercel environment variables. Please add your Neon connection string.'
    });
  }

  // Security check: require ADMIN_API_KEY if defined in environment
  const expectedKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'] || req.query.key;
  if (expectedKey && providedKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid admin key.' });
  }

  try {
    const sql = getSql();

    // 1. Create enquiries table
    await sql`
      CREATE TABLE IF NOT EXISTS enquiries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        enquiry_code VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone_number VARCHAR(25) NOT NULL,
        email VARCHAR(150),
        preferred_location VARCHAR(100) DEFAULT 'Coimbatore',
        property_type VARCHAR(100) DEFAULT 'Gated Community Plots',
        budget VARCHAR(100) DEFAULT '₹20 Lakhs – ₹35 Lakhs',
        message TEXT,
        status VARCHAR(50) DEFAULT 'New Lead',
        source VARCHAR(50) DEFAULT 'Website Form',
        ip_address VARCHAR(64),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Create index for fast lead ordering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);
    `;

    return res.status(200).json({
      success: true,
      message: 'Neon PostgreSQL database tables and indexes initialized successfully for Gubera Vasal!'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

