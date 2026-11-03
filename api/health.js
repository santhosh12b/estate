import { getSql } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl = process.env.DATABASE_URL || 
    process.env.POSTGRES_URL || 
    process.env.NEON_URL || 
    process.env.STORAGE_URL;
  const databaseConfigured = Boolean(
    databaseUrl && !databaseUrl.includes('user:password')
  );

  let dbStatus = 'not_configured';
  let latencyMs = null;

  if (databaseConfigured) {
    try {
      const start = Date.now();
      const sql = getSql();
      await sql`SELECT 1 as ping`;
      latencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Gubera Vasal API',
    database: {
      provider: 'Neon PostgreSQL (Serverless)',
      status: dbStatus,
      latency: latencyMs !== null ? `${latencyMs}ms` : undefined,
    },
    timestamp: new Date().toISOString()
  });
}

