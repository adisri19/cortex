import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://kiddo_user:kiddo_pass@localhost:5432/kiddo';

export const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('[DB Pool Error]', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Optional query logging
    // console.log('[DB Query]', { text, duration, rows: res.rowCount });
    return res;
  } catch (err: any) {
    console.error('[DB Query Error]', { text, error: err.message || err });
    throw err;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}
