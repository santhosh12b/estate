import https from 'node:https';
import { Resolver } from 'node:dns/promises';
import { neon, neonConfig } from '@neondatabase/serverless';

// When running in local development on Windows or environments with lagging ISP DNS,
// use a resilient DNS resolver fallback so Neon connections never time out.
if (!process.env.VERCEL) {
  try {
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);

    neonConfig.fetchFunction = (url, options = {}) => {
      return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = https.request({
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: options.method || 'GET',
          headers: options.headers || {},
          lookup: (hostname, lookupOpts, callback) => {
            const cb = typeof lookupOpts === 'function' ? lookupOpts : callback;
            resolver.resolve4(hostname).then(
              ips => {
                if (lookupOpts?.all) {
                  cb(null, ips.map(ip => ({ address: ip, family: 4 })));
                } else {
                  cb(null, ips[0], 4);
                }
              },
              err => cb(err)
            );
          }
        }, (res) => {
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: new Headers(res.headers),
              text: async () => buf.toString('utf8'),
              json: async () => JSON.parse(buf.toString('utf8'))
            });
          });
        });

        req.on('error', reject);
        if (options.body) {
          req.write(options.body);
        }
        req.end();
      });
    };
  } catch (e) {
    console.warn('DNS resolver fallback initialization note:', e.message);
  }
}

export function getSql(connectionString) {
  const url = connectionString || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not set.');
  }
  return neon(url);
}

