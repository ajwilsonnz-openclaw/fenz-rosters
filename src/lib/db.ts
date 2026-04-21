import { Pool } from 'pg';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    });
  }
  return _pool;
}

export async function query(text: string, params?: any[]) { console.log("[DB]", text.substring(0, 80));
  const pool = getPool();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text: text.substring(0, 60), duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  const client = await getPool().connect();
  return client;
}