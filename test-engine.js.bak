// Direct test of the engine with Next.js-like environment
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:fenz_dev_pass@localhost:5433/fenz_ot',
  ssl: false,
});

async function dbExecute(text, params) {
  return pool.query(text, params);
}

async function test() {
  // Truncate
  await pool.query('TRUNCATE ot_count_log, ot_assignments, ot_requests CASCADE');
  
  // 1. Test loadAllFirefighters
  const { rows } = await dbExecute(`
    SELECT f.*, s.name as station_name, s.district, s.area_id, a.name as area_name
    FROM firefighters f LEFT JOIN stations s ON f.station_id = s.id LEFT JOIN areas a ON s.area_id = a.id
    WHERE f.is_active = true
  `);
  console.log('Firefighters loaded:', rows.length);
  if (rows.length > 0) {
    console.log('Sample:', rows[0].first_name, rows[0].last_name, 'station:', rows[0].station_name, 'district:', rows[0].district);
  }

  // 2. Test loadDistanceMatrix
  const { rows: distRows } = await dbExecute(`SELECT station_id, other_station_id, distance_km FROM station_distances`);
  console.log('Distances loaded:', distRows.length);

  // 3. Create an OT request
  const reqResult = await dbExecute(
    `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, required_qualification_ids, status, number_of_slots, number_filled)
     VALUES ($1, $2::date, $3, NULLIF($4, ''), $5::jsonb, 'pending', $6, 0) RETURNING id`,
    [1055, '2026-04-10', 'Day', '', '[]', 1]
  );
  const requestId = reqResult.rows[0].id;
  console.log('Request created:', requestId);

  // 4. Test the exact engine assignment insert
  const assign = await dbExecute(
    `INSERT INTO ot_assignments (ot_request_id, firefighter_id, status, distance_km, callback_type, must_might_wont, hours_allocated, assigned_at)
     VALUES ($1::int, $2::int, 'assigned', $3::float, $4::varchar, $5::varchar, $6::int, NOW()) RETURNING id`,
    [requestId, 372, 0, null, 'must', 10]
  );
  console.log('Assignment created:', assign.rows[0].id);

  console.log('ALL TESTS PASSED');
  pool.end();
}

test().catch(e => {
  console.log('FAIL:', e.message);
  console.log('Code:', e.code);
  console.log('Where:', e.where);
  pool.end();
});
