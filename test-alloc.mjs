import { Pool } from 'pg';
import { runAllocation } from '/home/ubuntu/fenz-ot-prototype/src/engine/allocation-engine.ts';

const pool = new Pool({ host: '127.0.0.1', port: 5432, database: 'fenz_ot', user: 'postgres', password: 'postgres' });

try {
  const requests = [
    { station_id: 1485, station_name: 'Albany', district: 'Waitemata', date: '2026-04-22', shift_type: 'Day', slots: 2, specialist_type: null }
  ];
  const result = await runAllocation(requests, pool);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await pool.end();
}
