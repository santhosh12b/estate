-- =======================================================================
-- GUBERA VASAL REAL ESTATE — NEON POSTGRESQL SCHEMA
-- =======================================================================
-- Run this script in the Neon SQL Editor:
-- 1. Log in to https://console.neon.tech
-- 2. Select your project ("gubera-vasal")
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste this code and click "Run"
-- =======================================================================

-- 1. Create Enquiries / Leads Table
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

-- 2. Create Index on created_at for instantaneous lead queries
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON enquiries (phone_number);
CREATE INDEX IF NOT EXISTS idx_enquiries_location ON enquiries (preferred_location);

-- 3. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trigger_enquiries_updated_at ON enquiries;
CREATE TRIGGER trigger_enquiries_updated_at
BEFORE UPDATE ON enquiries
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

