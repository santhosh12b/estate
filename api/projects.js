import { getSql } from './_db.js';
import { defaultProperties } from '../src/data/properties.js';

// Auto-create table and seed default layouts if table is empty
async function ensureProjectsTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      sub_location TEXT,
      property_type TEXT DEFAULT 'Gated Community Plots' NOT NULL,
      description TEXT,
      starting_price TEXT NOT NULL,
      price_per_cent TEXT,
      plot_sizes TEXT DEFAULT '1.75 to 8.0 Cents' NOT NULL,
      sqft_range TEXT DEFAULT '762 – 3,485 Sq.Ft',
      loan_eligibility TEXT DEFAULT '80% to 90% Bank Loan Approved by All Major Banks' NOT NULL,
      image_url TEXT NOT NULL,
      gallery JSONB DEFAULT '[]'::jsonb,
      highlights JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'Available',
      is_featured BOOLEAN DEFAULT true,
      has_video_tour BOOLEAN DEFAULT true,
      video_url TEXT,
      video_title TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_order ON projects (display_order ASC, created_at DESC);`;

  // Check if table is empty, seed with initial curated layouts if so
  const countRes = await sql`SELECT count(*)::int as count FROM projects;`;
  if (countRes[0]?.count === 0 && Array.isArray(defaultProperties) && defaultProperties.length > 0) {
    for (let i = 0; i < defaultProperties.length; i++) {
      const p = defaultProperties[i];
      await sql`
        INSERT INTO projects (
          id, name, location, sub_location, property_type, description,
          starting_price, price_per_cent, plot_sizes, sqft_range,
          loan_eligibility, image_url, gallery, highlights, status,
          is_featured, has_video_tour, video_url, video_title, display_order
        ) VALUES (
          ${p.id || `prop-${i + 1}`}, ${p.name}, ${p.location}, ${p.subLocation || null},
          ${p.propertyType || 'Gated Community Plots'}, ${p.description || null},
          ${p.startingPrice}, ${p.pricePerCent || null}, ${p.plotSizes || p.plotSizeCents || '1.75 to 8.0 Cents'},
          ${p.sqftRange || p.area || '762 – 3,485 Sq.Ft'}, ${p.loanEligibility || '80% to 90% Bank Loan Approved by All Major Banks'},
          ${p.imageUrl}, ${JSON.stringify(p.gallery || [])}::jsonb, ${JSON.stringify(p.highlights || p.features || [])}::jsonb,
          ${p.status || 'Available'}, ${p.isFeatured ?? p.featured ?? true}, ${p.hasVideoTour ?? true},
          ${p.videoUrl || null}, ${p.videoTitle || null}, ${i}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getSql();

  // -------------------------------------------------------------
  // 1. GET: Fetch All Plots & Layouts (Public)
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      let rows;
      try {
        rows = await sql`
          SELECT 
            id, name, location, sub_location as "subLocation",
            property_type as "propertyType", description,
            starting_price as "startingPrice", price_per_cent as "pricePerCent",
            plot_sizes as "plotSizes", sqft_range as "sqftRange",
            loan_eligibility as "loanEligibility", image_url as "imageUrl",
            gallery, highlights, status, is_featured as "isFeatured",
            has_video_tour as "hasVideoTour", video_url as "videoUrl",
            video_title as "videoTitle", display_order as "displayOrder",
            created_at as "createdAt"
          FROM projects
          ORDER BY display_order ASC, created_at DESC;
        `;
      } catch (err) {
        if (err.message?.includes('does not exist') || err.code === '42P01') {
          await ensureProjectsTable(sql);
          rows = await sql`
            SELECT 
              id, name, location, sub_location as "subLocation",
              property_type as "propertyType", description,
              starting_price as "startingPrice", price_per_cent as "pricePerCent",
              plot_sizes as "plotSizes", sqft_range as "sqftRange",
              loan_eligibility as "loanEligibility", image_url as "imageUrl",
              gallery, highlights, status, is_featured as "isFeatured",
              has_video_tour as "hasVideoTour", video_url as "videoUrl",
              video_title as "videoTitle", display_order as "displayOrder",
              created_at as "createdAt"
            FROM projects
            ORDER BY display_order ASC, created_at DESC;
          `;
        } else {
          throw err;
        }
      }

      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (err) {
      console.error('Error fetching projects from Neon:', err);
      // Fallback gracefully to default properties
      return res.status(200).json({
        success: true,
        count: defaultProperties.length,
        data: defaultProperties,
        fallback: true
      });
    }
  }

  // Admin authentication check for write operations
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'] || req.query.key;
  if (adminKey && providedKey !== adminKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid admin key.'
    });
  }

  // -------------------------------------------------------------
  // 2. POST: Create New Plot / Layout
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    const body = req.body || {};
    const name = (body.name || '').trim();
    const location = (body.location || 'Coimbatore').trim();
    const startingPrice = (body.startingPrice || 'Contact For Price').trim();
    const imageUrl = (body.imageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80').trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a layout name.' });
    }

    const id = body.id || `prop-${Date.now().toString(36)}`;
    const subLocation = (body.subLocation || '').trim() || null;
    const propertyType = (body.propertyType || 'Gated Community Plots').trim();
    const description = (body.description || '').trim() || null;
    const pricePerCent = (body.pricePerCent || '').trim() || null;
    const plotSizes = (body.plotSizes || '1.75 to 8.0 Cents').trim();
    const sqftRange = (body.sqftRange || '762 – 3,485 Sq.Ft').trim();
    const loanEligibility = (body.loanEligibility || '80% to 90% Bank Loan Approved by All Major Banks').trim();
    const status = (body.status || 'Available').trim();
    const videoUrl = (body.videoUrl || '').trim() || null;
    const videoTitle = (body.videoTitle || `${name} — Drone Tour & Walkthrough`).trim();
    const hasVideoTour = Boolean(videoUrl || body.hasVideoTour);
    const isFeatured = body.isFeatured ?? true;
    const highlights = Array.isArray(body.highlights) ? body.highlights : [
      '80% to 90% Bank Loan Approved',
      'DTCP & RERA Approved Layout',
      '33ft / 30ft Blacktop Tar Roads',
      'Individual Revenue Patta Transfer'
    ];

    try {
      try {
        await sql`
          INSERT INTO projects (
            id, name, location, sub_location, property_type, description,
            starting_price, price_per_cent, plot_sizes, sqft_range,
            loan_eligibility, image_url, gallery, highlights, status,
            is_featured, has_video_tour, video_url, video_title
          ) VALUES (
            ${id}, ${name}, ${location}, ${subLocation}, ${propertyType}, ${description},
            ${startingPrice}, ${pricePerCent}, ${plotSizes}, ${sqftRange},
            ${loanEligibility}, ${imageUrl}, ${JSON.stringify(body.gallery || [])}::jsonb,
            ${JSON.stringify(highlights)}::jsonb, ${status}, ${isFeatured},
            ${hasVideoTour}, ${videoUrl}, ${videoTitle}
          );
        `;
      } catch (err) {
        if (err.message?.includes('does not exist') || err.code === '42P01') {
          await ensureProjectsTable(sql);
          await sql`
            INSERT INTO projects (
              id, name, location, sub_location, property_type, description,
              starting_price, price_per_cent, plot_sizes, sqft_range,
              loan_eligibility, image_url, gallery, highlights, status,
              is_featured, has_video_tour, video_url, video_title
            ) VALUES (
              ${id}, ${name}, ${location}, ${subLocation}, ${propertyType}, ${description},
              ${startingPrice}, ${pricePerCent}, ${plotSizes}, ${sqftRange},
              ${loanEligibility}, ${imageUrl}, ${JSON.stringify(body.gallery || [])}::jsonb,
              ${JSON.stringify(highlights)}::jsonb, ${status}, ${isFeatured},
              ${hasVideoTour}, ${videoUrl}, ${videoTitle}
            );
          `;
        } else {
          throw err;
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Plot layout created successfully!',
        data: { id, name }
      });
    } catch (err) {
      console.error('Create project error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // -------------------------------------------------------------
  // 3. PATCH/PUT: Update Existing Plot / Layout (Video URL, Price, Status, etc.)
  // -------------------------------------------------------------
  if (req.method === 'PATCH' || req.method === 'PUT') {
    const body = req.body || {};
    const id = body.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing layout ID.' });
    }

    try {
      await sql`
        UPDATE projects
        SET 
          name = COALESCE(${body.name ?? null}, name),
          location = COALESCE(${body.location ?? null}, location),
          sub_location = COALESCE(${body.subLocation ?? null}, sub_location),
          property_type = COALESCE(${body.propertyType ?? null}, property_type),
          description = COALESCE(${body.description ?? null}, description),
          starting_price = COALESCE(${body.startingPrice ?? null}, starting_price),
          price_per_cent = COALESCE(${body.pricePerCent ?? null}, price_per_cent),
          plot_sizes = COALESCE(${body.plotSizes ?? null}, plot_sizes),
          sqft_range = COALESCE(${body.sqftRange ?? null}, sqft_range),
          loan_eligibility = COALESCE(${body.loanEligibility ?? null}, loan_eligibility),
          image_url = COALESCE(${body.imageUrl ?? null}, image_url),
          status = COALESCE(${body.status ?? null}, status),
          video_url = COALESCE(${body.videoUrl ?? null}, video_url),
          video_title = COALESCE(${body.videoTitle ?? null}, video_title),
          has_video_tour = COALESCE(${body.videoUrl !== undefined ? Boolean(body.videoUrl) : null}, has_video_tour),
          updated_at = NOW()
        WHERE id = ${id};
      `;

      return res.status(200).json({
        success: true,
        message: 'Plot layout updated successfully!'
      });
    } catch (err) {
      console.error('Update project error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // -------------------------------------------------------------
  // 4. DELETE: Remove Plot / Layout
  // -------------------------------------------------------------
  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing layout ID.' });
    }

    try {
      await sql`DELETE FROM projects WHERE id = ${id};`;
      return res.status(200).json({
        success: true,
        message: 'Plot layout deleted successfully.'
      });
    } catch (err) {
      console.error('Delete project error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
