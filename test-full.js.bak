// Test the full cascade engine end-to-end
const { Pool } = require('pg');

async function main() {
  const { allocateForOTRequest, loadAllFirefighters, loadDistanceMatrix } = require('./src/engine/allocation-engine');
  const pool = new Pool({ connectionString: 'postgres://postgres:fenz_dev_pass@localhost:5433/fenz_ot', ssl: false });

  // Clean slate
  await pool.query('TRUNCATE ot_count_log, ot_assignments, ot_requests, allocation_runs CASCADE');

  // Create OT request
  const reqResult = await pool.query(
    `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, required_qualification_ids, status, number_of_slots, number_filled)
     VALUES ($1, $2::date, $3, NULLIF($4, ''), $5::jsonb, 'pending', $6, 0) RETURNING id`,
    [1055, '2026-04-10', 'Day', '', '[]', 1]
  );
  const requestId = reqResult.rows[0].id;
  console.log('OT Request created:', requestId);

  // Run allocation
  const allFirefighters = await loadAllFirefighters();
  console.log('Firefighters loaded:', allFirefighters.length);
  const distances = await loadDistanceMatrix();
  console.log('Distances loaded');
  
  const otRequest = {
    id: requestId,
    station_id: 1055,
    station_name: 'Albany',
    station_district: null,
    area_id: 1,
    date: '2026-04-10',
    shift_type: 'Day',
    specialist_type: null,
    required_qualification_ids: [],
    status: 'pending',
    number_of_slots: 1,
    number_filled: 0,
  };

  try {
    const { results, allTraces } = await allocateForOTRequest(otRequest, allFirefighters, distances, new Set());
    console.log('Results:', results.length);
    for (const r of results) {
      console.log('  →', r.firefighter_name, `(${r.watch})`, r.rank, '|', r.must_might_wont, '|', r.distance_km, 'km |', r.cascade_phase);
    }
  } catch (e) {
    console.log('ALLOCATION ERROR:', e.message);
    console.log('Stack:', e.stack);
  }

  pool.end();
}

main().catch(e => { console.log('FAIL:', e.message); process.exit(1); });
