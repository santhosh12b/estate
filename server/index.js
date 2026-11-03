import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// -------------------------------------------------------------
// 1. Supabase Client Setup
// -------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes('your-project') && 
  !SUPABASE_KEY.includes('your-key')
);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase Client initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase Client:', err.message);
  }
} else {
  console.warn('⚠️ Supabase credentials not configured. Running in Fallback / Mock Storage mode.');
}

// In-memory fallback storage when Supabase is not configured yet
const memoryEnquiries = [];

// -------------------------------------------------------------
// 2. Middlewares
// -------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, Render health checks)
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev & production to avoid blocking Vercel preview deploys
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

app.use(express.json({ limit: '500kb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiter for Enquiry Submissions (prevent spam bots)
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 enquiries per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes or call our advisory desk.'
  }
});

// -------------------------------------------------------------
// 3. Helper Functions
// -------------------------------------------------------------
function generateEnquiryCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ENQ-${dateStr}-${randomSuffix}`;
}

// Fallback layout listings if projects table is empty
const defaultProjects = [
  {
    id: 'prop-1',
    name: 'Gubera Vasal Royal Gardens',
    location: 'Saravanampatti, Coimbatore',
    propertyType: 'Gated Community Plots',
    description: 'Premium DTCP & RERA approved layout situated 5 mins from IT Corridor. Features wide 40ft blacktop roads, underground drainage, and clear individual patta.',
    startingPrice: '₹28 Lakhs',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    status: 'Fast Selling',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Saravanampatti Layout Drone View'
  },
  {
    id: 'prop-2',
    name: 'Gubera Enclave — Phase 2',
    location: 'Avinashi Road, Coimbatore',
    propertyType: 'Commercial & Residential Plots',
    description: 'High-appreciation plots located right off the National Highway with immediate access to airport, colleges, and hospitals. Ready for immediate villa construction.',
    startingPrice: '₹42 Lakhs',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80',
    status: 'Available',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Avinashi Road Layout Aerial Walkthrough'
  },
  {
    id: 'prop-3',
    name: 'Green Meadows County',
    location: 'Kovaipudur, Coimbatore',
    propertyType: 'Gated Community Plots',
    description: 'Picturesque foothill residential township with sweet Siruvani water connection, 24/7 security gate, solar streetlights, and landscaped parks.',
    startingPrice: '₹22 Lakhs',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    status: 'Available',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Kovaipudur Valley Layout Walkthrough'
  },
  {
    id: 'prop-4',
    name: 'Grand Crest Avenue',
    location: 'Trichy Road (Sulur), Coimbatore',
    propertyType: 'Gated Community Plots',
    description: 'Strategically planned gated layout close to upcoming bypass and industrial growth corridor with high rental yield and fast capital appreciation.',
    startingPrice: '₹19 Lakhs',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    status: 'Fast Selling',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Sulur Trichy Road Drone Inspection'
  },
  {
    id: 'prop-5',
    name: 'Coconut Grove Layout',
    location: 'Pollachi Road, Pollachi',
    propertyType: 'Gated Community Plots',
    description: 'Lush green fertile soil layout surrounded by coconut groves on the Pollachi development corridor. Clear title with DTCP approval and 30ft avenue tree roads.',
    startingPrice: '₹16.5 Lakhs',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    status: 'Available',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Pollachi Coconut Grove Layout Aerial Tour'
  },
  {
    id: 'prop-6',
    name: 'Lakeview Emerald City',
    location: 'Singanallur, Coimbatore',
    propertyType: 'Gated Community Plots',
    description: 'Prime central residential layout with proximity to railway stations, schools, and shopping malls. Fully compounded layout with individual water taps.',
    startingPrice: '₹35 Lakhs',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    status: 'Ready for Construction',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Singanallur Layout Overview'
  },
  {
    id: 'prop-7',
    name: 'Avinashi Smart City — Phase 1',
    location: 'Avinashi, Tirupur Corridor',
    propertyType: 'Commercial & Residential Plots',
    description: 'Upcoming mega township on the fast-growing Coimbatore-Avinashi-Tirupur expressway. Ideal for early-bird investors seeking maximum capital growth.',
    startingPrice: 'Pre-Launch Pricing',
    plotSizes: '1.75 to 8.0 Cents',
    loanEligibility: '80% to 90% Bank Loan Approved',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    status: 'Coming Soon',
    featured: true,
    hasVideoTour: true,
    videoTitle: 'Avinashi Pre-Launch Aerial View'
  }
];

// -------------------------------------------------------------
// 4. API Endpoints
// -------------------------------------------------------------

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Gubera Vasal Real Estate API',
    version: '1.0.0',
    status: 'online',
    database: isSupabaseConfigured ? 'Supabase (PostgreSQL)' : 'In-Memory Fallback',
    documentation: {
      healthCheck: 'GET /health',
      submitEnquiry: 'POST /api/enquiries',
      getProjects: 'GET /api/projects',
      listEnquiries: 'GET /api/enquiries (Requires Admin Key)'
    }
  });
});

// Health check endpoint (Render uses /health)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured
  });
});

// POST /api/enquiries — Record new lead
app.post('/api/enquiries', enquiryLimiter, async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      preferredLocation,
      propertyType,
      budget,
      message,
      source = 'Website Form'
    } = req.body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer full name is required.'
      });
    }

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required.'
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid phone number with at least 10 digits.'
      });
    }

    const enquiryCode = generateEnquiryCode();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const newEnquiry = {
      enquiry_code: enquiryCode,
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      email: email ? email.trim() : null,
      preferred_location: preferredLocation || 'Coimbatore',
      property_type: propertyType || 'Gated Community Plots',
      budget: budget || 'Flexible',
      message: message ? message.trim() : '',
      status: 'New Lead',
      source,
      ip_address: typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : null,
      user_agent: userAgent.slice(0, 255)
    };

    // 2. Insert into Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('enquiries')
        .insert([newEnquiry])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return res.status(201).json({
        success: true,
        message: 'Your enquiry has been successfully recorded. Our senior advisory desk will contact you shortly.',
        enquiryId: enquiryCode,
        data: {
          id: data.id,
          enquiryCode: data.enquiry_code,
          createdAt: data.created_at
        }
      });
    }

    // 3. Fallback Storage when Supabase not configured
    memoryEnquiries.unshift({
      ...newEnquiry,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString()
    });

    console.log(`[Lead Captured - In Memory] ${enquiryCode} | ${fullName} | ${phoneNumber} | ${preferredLocation}`);

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been successfully recorded. Our advisory desk will contact you shortly.',
      enquiryId: enquiryCode,
      storage: 'fallback'
    });

  } catch (err) {
    console.error('Error handling enquiry submission:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your enquiry. Please contact us directly.'
    });
  }
});

// GET /api/enquiries — Protected Admin endpoint to view leads
app.get('/api/enquiries', async (req, res) => {
  const adminKey = req.headers['x-admin-key'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  const configuredAdminKey = process.env.ADMIN_SECRET_KEY || 'gubera2026admin';

  if (!adminKey || adminKey !== configuredAdminKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Provide a valid x-admin-key header.'
    });
  }

  const { status, limit = 50, offset = 0 } = req.query;

  try {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('enquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      return res.json({
        success: true,
        total: count,
        count: data.length,
        enquiries: data
      });
    }

    // Fallback in-memory
    let filtered = memoryEnquiries;
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    return res.json({
      success: true,
      total: filtered.length,
      count: filtered.length,
      enquiries: filtered.slice(Number(offset), Number(offset) + Number(limit))
    });
  } catch (err) {
    console.error('Error querying enquiries:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve enquiries.'
    });
  }
});

// GET /api/projects — Fetch layouts/projects
app.get('/api/projects', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location,
          propertyType: p.property_type,
          description: p.description,
          startingPrice: p.starting_price,
          plotSizes: p.plot_sizes,
          loanEligibility: p.loan_eligibility,
          imageUrl: p.image_url,
          status: p.status,
          featured: p.is_featured,
          hasVideoTour: p.has_video_tour,
          videoTitle: p.video_title,
          videoUrl: p.video_url
        }));
        return res.json({ success: true, projects: formatted, source: 'supabase' });
      }
    }

    // Fallback to default layouts
    return res.json({ success: true, projects: defaultProjects, source: 'default' });
  } catch (err) {
    console.warn('Projects fetch error, falling back to default:', err.message);
    return res.json({ success: true, projects: defaultProjects, source: 'fallback' });
  }
});

// -------------------------------------------------------------
// 5. Global Error & 404 Handlers
// -------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal server error occurred.'
  });
});

// -------------------------------------------------------------
// 6. Start Server
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Gubera Vasal API Server running on port ${PORT} [${NODE_ENV}]`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📍 Enquiries API: http://localhost:${PORT}/api/enquiries`);
});
