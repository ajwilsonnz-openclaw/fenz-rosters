const { Pool } = require('pg');
const pool = new Pool({connectionString: 'postgres://postgres:fenz_dev_pass@localhost:5433/fenz_ot', ssl:false});
async function test() {
  await pool.query('TRUNCATE ot_count_log, ot_assignments, ot_requests CASCADE');
  // Create request
  const req = await pool.query(
    `INSERT INTO ot_requests (station_id, date, shift_type, status, number_of_slots, number_filled) VALUES ($1, $2, $3, 'pending', $4, 0) RETURNING id`,
    [1055, new Date('2026-04-10'), 'Day', 1]
  );
  const reqId = req.rows[0].id;
  console.log('Req ID:', reqId);
  
  // Test assignment insert exactly like engine does with null callback
  const callback = null;
  const threshold = 'must';
  const dist = 0;
  const hours = 10;
  const assign = await pool.query(
    `INSERT INTO ot_assignments (ot_request_id, firefighter_id, status, distance_km, callback_type, must_might_wont, hours_allocated, assigned_at)
     VALUES ($1, $2, 'assigned', $3, $4, $5, $6, NOW()) RETURNING id`,
    [reqId, 372, dist, callback, threshold, hours]
  );
  console.log('Assignment OK:', assign.rows[0].id);
  console.log('SUCCESS - null callback works');
  
  pool.end();
}
test().catch(e => { console.log('FAIL:', e.message); pool.end(); });
