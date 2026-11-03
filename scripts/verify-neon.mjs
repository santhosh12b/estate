import { getSql } from '../api/_db.js';

console.log('--- Gubera Vasal Neon PostgreSQL Verification ---');
try {
  const sql = getSql();
  const ping = await sql`SELECT NOW() as current_time, current_database() as db, version() as pg_version`;
  console.log('✅ Connection Successful!');
  console.log('Database:', ping[0].db);
  console.log('Server Time:', ping[0].current_time);
  console.log('Version:', ping[0].pg_version.split(' ')[0], ping[0].pg_version.split(' ')[1]);

  const countRes = await sql`SELECT count(*)::int as lead_count FROM enquiries`;
  console.log('Total Enquiries in Neon:', countRes[0].lead_count);
  console.log('✅ Neon Database is 100% operational!');
} catch (err) {
  console.error('❌ Neon Verification Error:', err.message);
  process.exit(1);
}

