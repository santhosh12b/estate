import { getSql } from '../api/_db.js';

console.log('--- Initializing "estate" Database in Neon ---');
try {
  const sql = getSql();
  
  // Test connection & database name
  const ping = await sql`SELECT NOW() as current_time, current_database() as db, version() as pg_version`;
  console.log('✅ Connected to Database:', ping[0].db);
  console.log('Server Time:', ping[0].current_time);
  console.log('PostgreSQL Version:', ping[0].pg_version.split(' ')[0], ping[0].pg_version.split(' ')[1]);

  // Create table
  console.log('\nCreating table "enquiries" in database "estate"...');
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
      status VARCHAR(50) DEFAULT 'New Lead' CHECK (
        status IN (
          'New Lead', 
          'Contacted', 
          'Site Visit Scheduled', 
          'Site Visit Completed', 
          'Token Advance Received', 
          'Booked', 
          'Closed / Dropped'
        )
      ),
      source VARCHAR(50) DEFAULT 'Website Form',
      ip_address VARCHAR(64),
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;
  console.log('✅ Table "enquiries" created successfully!');

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON enquiries (phone_number);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enquiries_location ON enquiries (preferred_location);`;
  console.log('✅ Indexes created successfully!');

  // Insert a test verification record
  const testCode = `GV-ESTATE-${Date.now().toString(36).toUpperCase()}`;
  const insert = await sql`
    INSERT INTO enquiries (
      enquiry_code, full_name, phone_number, email, preferred_location,
      property_type, budget, message, status, source
    ) VALUES (
      ${testCode}, 'Estate Verification Bot', '9842211223', 'verify@guberavasal.in',
      'Coimbatore', 'Gated Community Plots', '₹20 Lakhs – ₹35 Lakhs',
      'Verifying estate database creation', 'New Lead', 'Migration Script'
    ) RETURNING id, enquiry_code, created_at;
  `;
  console.log('✅ Test Lead Inserted in "estate" DB:', insert[0]);

  // Read back
  const readBack = await sql`SELECT count(*)::int as lead_count FROM enquiries`;
  console.log('✅ Enquiries Table Verified. Total Rows in "estate":', readBack[0].lead_count);

  // Clean up
  await sql`DELETE FROM enquiries WHERE enquiry_code = ${testCode};`;
  console.log('✅ Cleaned up test record.');

  console.log('\n🎉 DATABASE "estate" IS 100% INITIALIZED AND READY FOR PRODUCTION!');
} catch (err) {
  console.error('❌ Database Initialization Error:', err.message);
  process.exit(1);
}
