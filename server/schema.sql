-- =======================================================================
-- GUBERA VASAL REAL ESTATE — SUPABASE DATABASE SCHEMA
-- =======================================================================
-- Copy and paste this script directly into your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard -> Project -> SQL Editor -> New Query
-- =======================================================================

-- 1. Create Enquiries / Leads Table
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  enquiry_code text unique not null,
  full_name text not null,
  phone_number text not null,
  email text,
  preferred_location text default 'Coimbatore',
  property_type text default 'Gated Community Plots',
  budget text default '₹20 Lakhs – ₹35 Lakhs',
  message text,
  status text default 'New Lead' check (
    status in (
      'New Lead', 
      'Contacted', 
      'Site Visit Scheduled', 
      'Site Visit Completed', 
      'Token Advance Received', 
      'Booked', 
      'Closed / Dropped'
    )
  ),
  source text default 'Website Form',
  notes text,
  ip_address text,
  user_agent text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Create Projects / Layouts Table (Dynamic Catalog)
create table if not exists public.projects (
  id text primary key,
  name text not null,
  location text not null,
  property_type text default 'Gated Community Plots' not null,
  description text,
  starting_price text not null,
  plot_sizes text default '1.75 to 8.0 Cents' not null,
  loan_eligibility text default '80% to 90% Bank Loan Approved' not null,
  image_url text not null,
  status text default 'Available' check (status in ('Available', 'Fast Selling', 'Ready for Construction', 'Coming Soon', 'Sold Out')),
  is_featured boolean default true,
  has_video_tour boolean default true,
  video_url text,
  video_title text,
  display_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Create Performance Indexes for Fast Queries
create index if not exists idx_enquiries_created_at on public.enquiries (created_at desc);
create index if not exists idx_enquiries_status on public.enquiries (status);
create index if not exists idx_enquiries_phone on public.enquiries (phone_number);
create index if not exists idx_projects_location on public.projects (location);
create index if not exists idx_projects_status on public.projects (status);

-- 4. Automatic updated_at Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply triggers
drop trigger if exists on_enquiries_updated on public.enquiries;
create trigger on_enquiries_updated
  before update on public.enquiries
  for each row execute function public.handle_updated_at();

drop trigger if exists on_projects_updated on public.projects;
create trigger on_projects_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- 5. Row Level Security (RLS) Configuration
alter table public.enquiries enable row level security;
alter table public.projects enable row level security;

-- Policies for enquiries:
-- Anyone (anon/public) can insert new enquiries through backend API
drop policy if exists "Enable insert for all users" on public.enquiries;
create policy "Enable insert for all users"
  on public.enquiries for insert
  with check (true);

-- Only authenticated users (admins/service role) can view enquiries
drop policy if exists "Enable read for service role and authenticated users" on public.enquiries;
create policy "Enable read for service role and authenticated users"
  on public.enquiries for select
  using (auth.role() in ('authenticated', 'service_role'));

-- Policies for projects:
-- Public read access to active projects
drop policy if exists "Enable read access for all users" on public.projects;
create policy "Enable read access for all users"
  on public.projects for select
  using (true);

-- Only admins / service role can modify projects
drop policy if exists "Enable full access for service role" on public.projects;
create policy "Enable full access for service role"
  on public.projects for all
  using (auth.role() in ('authenticated', 'service_role'));

-- 6. Seed Initial Gubera Vasal Layouts Data
insert into public.projects (
  id, name, location, property_type, description, starting_price, plot_sizes, loan_eligibility, image_url, status, is_featured, has_video_tour, video_title, display_order
) values
(
  'prop-1',
  'Gubera Vasal Royal Gardens',
  'Saravanampatti, Coimbatore',
  'Gated Community Plots',
  'Premium DTCP & RERA approved layout situated 5 mins from IT Corridor. Features wide 40ft blacktop roads, underground drainage, and clear individual patta.',
  '₹28 Lakhs',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  'Fast Selling',
  true,
  true,
  'Saravanampatti Layout Drone View',
  1
),
(
  'prop-2',
  'Gubera Enclave — Phase 2',
  'Avinashi Road, Coimbatore',
  'Commercial & Residential Plots',
  'High-appreciation plots located right off the National Highway with immediate access to airport, colleges, and hospitals. Ready for immediate villa construction.',
  '₹42 Lakhs',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80',
  'Available',
  true,
  true,
  'Avinashi Road Layout Aerial Walkthrough',
  2
),
(
  'prop-3',
  'Green Meadows County',
  'Kovaipudur, Coimbatore',
  'Gated Community Plots',
  'Picturesque foothill residential township with sweet Siruvani water connection, 24/7 security gate, solar streetlights, and landscaped parks.',
  '₹22 Lakhs',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'Available',
  true,
  true,
  'Kovaipudur Valley Layout Walkthrough',
  3
),
(
  'prop-4',
  'Grand Crest Avenue',
  'Trichy Road (Sulur), Coimbatore',
  'Gated Community Plots',
  'Strategically planned gated layout close to upcoming bypass and industrial growth corridor with high rental yield and fast capital appreciation.',
  '₹19 Lakhs',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  'Fast Selling',
  true,
  true,
  'Sulur Trichy Road Drone Inspection',
  4
),
(
  'prop-5',
  'Coconut Grove Layout',
  'Pollachi Road, Pollachi',
  'Gated Community Plots',
  'Lush green fertile soil layout surrounded by coconut groves on the Pollachi development corridor. Clear title with DTCP approval and 30ft avenue tree roads.',
  '₹16.5 Lakhs',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
  'Available',
  true,
  true,
  'Pollachi Coconut Grove Layout Aerial Tour',
  5
),
(
  'prop-6',
  'Lakeview Emerald City',
  'Singanallur, Coimbatore',
  'Gated Community Plots',
  'Prime central residential layout with proximity to railway stations, schools, and shopping malls. Fully compounded layout with individual water taps.',
  '₹35 Lakhs',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Ready for Construction',
  true,
  true,
  'Singanallur Layout Overview',
  6
),
(
  'prop-7',
  'Avinashi Smart City — Phase 1',
  'Avinashi, Tirupur Corridor',
  'Commercial & Residential Plots',
  'Upcoming mega township on the fast-growing Coimbatore-Avinashi-Tirupur expressway. Ideal for early-bird investors seeking maximum capital growth.',
  'Pre-Launch Pricing',
  '1.75 to 8.0 Cents',
  '80% to 90% Bank Loan Approved',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Coming Soon',
  true,
  true,
  'Avinashi Pre-Launch Aerial View',
  7
)
on conflict (id) do update set
  name = excluded.name,
  location = excluded.location,
  property_type = excluded.property_type,
  description = excluded.description,
  starting_price = excluded.starting_price,
  plot_sizes = excluded.plot_sizes,
  loan_eligibility = excluded.loan_eligibility,
  image_url = excluded.image_url,
  status = excluded.status,
  is_featured = excluded.is_featured,
  has_video_tour = excluded.has_video_tour,
  video_title = excluded.video_title,
  display_order = excluded.display_order;
