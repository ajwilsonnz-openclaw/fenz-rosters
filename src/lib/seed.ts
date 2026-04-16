// FENZ Overtime Seed Script
// Populates 29 stations across 3 districts, full distance table, watch anchors, 48 firefighters

import { query } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // --- 1. Clear existing data (FK-safe order) ---
  await query(`DELETE FROM ot_count_log`);
  await query(`DELETE FROM audit_logs`);
  await query(`DELETE FROM ot_assignments`);
  await query(`DELETE FROM ot_offers`);
  await query(`DELETE FROM ot_requests`);
  await query(`DELETE FROM availability`);
  await query(`DELETE FROM allocation_runs`);
  await query(`DELETE FROM district_relievers`);
  await query(`DELETE FROM station_distances`);
  await query(`DELETE FROM watch_anchors`);
  await query(`DELETE FROM firefighters`);
  await query(`DELETE FROM stations`);
  await query(`DELETE FROM areas`);
  await query(`DELETE FROM system_settings`);

  console.log('  ✅ Cleared existing data');

  // --- 2. Areas ---
  const areaWaitemata = await query(`INSERT INTO areas (name) VALUES ('Waitemata') RETURNING id`);
  const areaAuckland = await query(`INSERT INTO areas (name) VALUES ('Auckland') RETURNING id`);
  const areaCountiesManukau = await query(`INSERT INTO areas (name) VALUES ('Counties Manukau') RETURNING id`);

  const waitemataId = areaWaitemata.rows[0].id;
  const aucklandId = areaAuckland.rows[0].id;
  const countiesManukauId = areaCountiesManukau.rows[0].id;

  console.log('  ✅ Areas created');

  // --- 3. Stations (29 total) ---
  const stationDefs: { name: string; areaId: number }[] = [
    // Waitemata (11)
    { name: 'Albany', areaId: waitemataId },
    { name: 'Birkenhead', areaId: waitemataId },
    { name: 'Devonport', areaId: waitemataId },
    { name: 'East Coast Bays', areaId: waitemataId },
    { name: 'Glen Eden', areaId: waitemataId },
    { name: 'Henderson', areaId: waitemataId },
    { name: 'Silverdale', areaId: waitemataId },
    { name: 'Takapuna', areaId: waitemataId },
    { name: 'Te Atatu', areaId: waitemataId },
    { name: 'Titirangi', areaId: waitemataId },
    { name: 'West Harbour', areaId: waitemataId },
    // Auckland (11)
    { name: 'Auckland City', areaId: aucklandId },
    { name: 'Avondale', areaId: aucklandId },
    { name: 'Balmoral', areaId: aucklandId },
    { name: 'Ellerslie', areaId: aucklandId },
    { name: 'Grey Lynn', areaId: aucklandId },
    { name: 'Mount Roskill', areaId: aucklandId },
    { name: 'Mount Wellington', areaId: aucklandId },
    { name: 'Onehunga', areaId: aucklandId },
    { name: 'Parnell', areaId: aucklandId },
    { name: 'Remuera', areaId: aucklandId },
    { name: 'St Heliers', areaId: aucklandId },
    // Counties Manukau (7)
    { name: 'Howick', areaId: countiesManukauId },
    { name: 'Mangere', areaId: countiesManukauId },
    { name: 'Manurewa', areaId: countiesManukauId },
    { name: 'Otahuhu', areaId: countiesManukauId },
    { name: 'Otara', areaId: countiesManukauId },
    { name: 'Papatoetoe', areaId: countiesManukauId },
    { name: 'Papakura', areaId: countiesManukauId },
  ];

  const stationIds: Record<string, number> = {};
  for (const def of stationDefs) {
    const res = await query(
      `INSERT INTO stations (name, area_id, is_specialist, specialist_type) 
       VALUES ($1, $2, false, NULL) 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
      [def.name, def.areaId]
    );
    stationIds[def.name] = res.rows[0].id;
  }

  // Sync district column with area name
  await query(`UPDATE stations s SET district = a.name FROM areas a WHERE s.area_id = a.id`);

  console.log(`  ✅ ${Object.keys(stationIds).length} stations created`);

  // --- 4. Station Distances (from OSRM + Adam's verified Waitemata data) ---
  const distancePath = path.resolve(process.cwd(), 'data/station_distances.json');
  const distanceData: { station: string; distances: Record<string, number>; area: string }[] = JSON.parse(
    fs.readFileSync(distancePath, 'utf-8')
  );

  let distCount = 0;
  for (const entry of distanceData) {
    const fromId = stationIds[entry.station];
    if (!fromId) continue;
    for (const [dstKey, km] of Object.entries(entry.distances)) {
      // Convert key back to station name (lowercase_underscore → Title Case)
      const dstName = Object.keys(stationIds).find(
        n => n.toLowerCase().replace(/ /g, '_') === dstKey
      );
      if (!dstName || dstName === entry.station) continue;
      const toId = stationIds[dstName];
      if (!toId) continue;
      await query(
        `INSERT INTO station_distances (station_id, other_station_id, distance_km)
         VALUES ($1, $2, $3) ON CONFLICT (station_id, other_station_id) DO UPDATE SET distance_km = $3`,
        [fromId, toId, km]
      );
      distCount++;
    }
  }

  console.log(`  ✅ ${distCount} station distances populated`);

  // --- 5. Watch Anchors ---
  await query(`INSERT INTO watch_anchors (watch, anchor_date, note) VALUES 
    ('Green', '2026-01-31', 'Saturday anchor'),
    ('Red', '2026-02-02', 'Monday anchor'),
    ('Brown', '2026-02-04', 'Wednesday anchor'),
    ('Blue', '2026-02-06', 'Friday anchor'),
    ('Yellow', '2026-02-01', 'Mon-Fri only, placeholder anchor')
  `);

  console.log('  ✅ Watch anchors created');

  // --- 6. Firefighters (12 per watch, 48 total) ---
  // 4 OT counters: cbD=callback days, cbN=callback nights, ncD=noncallback days, ncN=noncallback nights
  const firefighters = [
    // ═══ GREEN WATCH (12) ═══
    // Waitemata (5)
    { first: 'Wiremu', last: 'Hemara', watch: 'Green', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Sarah', last: 'Mitchell', watch: 'Green', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 2, ncN: 1 },
    { first: 'Tane', last: 'Rawiri', watch: 'Green', station: 'East Coast Bays', rank: 'SFF', quals: { driver: true, not_rookie: true }, cbD: 5, cbN: 3, ncD: 3, ncN: 1 },
    { first: 'Emma', last: 'Chen', watch: 'Green', station: 'Albany', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Jordan', last: 'Park', watch: 'Green', station: 'Silverdale', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Auckland (4)
    { first: 'Nina', last: 'Kowalski', watch: 'Green', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Rangi', last: 'Tuhoe', watch: 'Green', station: 'Grey Lynn', rank: 'QFF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'David', last: 'Wu', watch: 'Green', station: 'Grey Lynn', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, cbD: 1, cbN: 1, ncD: 2, ncN: 0 },
    { first: 'Lisa', last: 'Campbell', watch: 'Green', station: 'Te Atatu', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Counties Manukau (3)
    { first: 'Ben', last: 'Tafua', watch: 'Green', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 3, ncN: 1 },
    { first: 'Jade', last: 'Renata', watch: 'Green', station: 'Mangere', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Sam', last: 'Kapoor', watch: 'Green', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },

    // ═══ RED WATCH (12) ═══
    // Auckland (5)
    { first: 'Liam', last: 'OBrien', watch: 'Red', station: 'Auckland City', rank: 'FF', quals: { driver: true, not_rookie: true, CBR: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Aroha', last: 'Te Rangi', watch: 'Red', station: 'Grey Lynn', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Marcus', last: 'Williams', watch: 'Red', station: 'Grey Lynn', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Hemi', last: 'Ngata', watch: 'Red', station: 'St Heliers', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, cbD: 5, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Priya', last: 'Sharma', watch: 'Red', station: 'Auckland City', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true, CBR: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Waitemata (4)
    { first: 'Jake', last: 'Morrison', watch: 'Red', station: 'Takapuna', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Maia', last: 'Henare', watch: 'Red', station: 'Birkenhead', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Chris', last: 'Evans', watch: 'Red', station: 'Albany', rank: 'SFF', quals: { driver: true, not_rookie: true }, cbD: 6, cbN: 3, ncD: 2, ncN: 1 },
    { first: 'Mereana', last: 'Kahu', watch: 'Red', station: 'Silverdale', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 0 },
    // Counties Manukau (3)
    { first: 'Tyler', last: 'Patel', watch: 'Red', station: 'Manurewa', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Anika', last: 'Singh', watch: 'Red', station: 'Papakura', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Rawiri', last: 'Tamati', watch: 'Red', station: 'Howick', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },

    // ═══ BROWN WATCH (12) ═══
    // Waitemata (4) — changed Henderson/Glen Eden/Te Atatu to Waitemata FFs
    { first: 'Kahu', last: 'Makiha', watch: 'Brown', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 1, ncD: 1, ncN: 1 },
    { first: 'Rebecca', last: 'Taylor', watch: 'Brown', station: 'Glen Eden', rank: 'QFF', quals: { driver: true, not_rookie: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Luke', last: 'Tanner', watch: 'Brown', station: 'Devonport', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Hinewai', last: 'Ruru', watch: 'Brown', station: 'Takapuna', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    // Auckland (5)
    { first: 'Dan', last: 'Reid', watch: 'Brown', station: 'Avondale', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Nikau', last: 'Tangaroa', watch: 'Brown', station: 'Grey Lynn', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, cbD: 7, cbN: 4, ncD: 2, ncN: 1 },
    { first: 'Grace', last: 'Whittaker', watch: 'Brown', station: 'Balmoral', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, cbD: 0, cbN: 0, ncD: 0, ncN: 0 },
    { first: 'Pete', last: 'Douglas', watch: 'Brown', station: 'Ellerslie', rank: 'SFF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Whina', last: 'Cooper', watch: 'Brown', station: 'Silverdale', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Counties Manukau (3)
    { first: 'Matt', last: 'Young', watch: 'Brown', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 5, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Aria', last: 'Matene', watch: 'Brown', station: 'Mangere', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Ross', last: 'McIntyre', watch: 'Brown', station: 'Manurewa', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },

    // ═══ BLUE WATCH (12) ═══
    // Counties Manukau (5)
    { first: 'Tommy', last: 'Ahu', watch: 'Blue', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Fiona', last: 'Cameron', watch: 'Blue', station: 'Howick', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Sam', last: 'Tong', watch: 'Blue', station: 'Manurewa', rank: 'SFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 5, cbN: 3, ncD: 2, ncN: 1 },
    { first: 'Mere', last: 'Whare', watch: 'Blue', station: 'Mangere', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    { first: 'Alex', last: 'Brown', watch: 'Blue', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    // Waitemata (4)
    { first: 'Zoe', last: 'Fletcher', watch: 'Blue', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Tipene', last: 'Rata', watch: 'Blue', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Kate', last: 'Sullivan', watch: 'Blue', station: 'Silverdale', rank: 'SFF', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Rongo', last: 'Parata', watch: 'Blue', station: 'Takapuna', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 3, cbN: 1, ncD: 1, ncN: 1 },
    // Auckland (3)
    { first: 'Oliver', last: 'Hunt', watch: 'Blue', station: 'Grey Lynn', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Marama', last: 'Te Awa', watch: 'Blue', station: 'Henderson', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 0 },
    { first: 'Gary', last: 'Chen', watch: 'Blue', station: 'St Heliers', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
  ];

  for (const ff of firefighters) {
    const otDays = ff.cbD + ff.ncD;
    const otNights = ff.cbN + ff.ncN;
    await query(
      `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, 
       ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights,
       ot_count_noncallback_days, ot_count_noncallback_nights, is_active, qualifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        ff.first,
        ff.last,
        `${ff.first.toLowerCase()}.${ff.last.toLowerCase().replace(/'/g, '')}@fenz.slack.com`,
        stationIds[ff.station],
        ff.watch,
        ff.rank,
        otDays,
        otNights,
        ff.cbD,
        ff.cbN,
        ff.ncD,
        ff.ncN,
        true,
        JSON.stringify(ff.quals),
      ]
    );
  }

  console.log(`  ✅ ${firefighters.length} firefighters seeded`);

  // --- 7. System Settings ---
  await query(`INSERT INTO system_settings (key, value, description) VALUES 
    ('ot_offer_mode', '"mandatory"', 'mandatory or accept_decline'),
    ('relievers_enabled', 'true', 'Whether to auto-deploy district relievers'),
    ('non_callback_approach', '"single_pool"', 'single_pool or watch_tiered'),
    ('max_continuous_hours', '24', 'Maximum continuous work hours'),
    ('min_rest_hours', '8', 'Minimum rest between shifts'),
    ('max_hours_before_mandatory_rest', '67', 'Hours before mandatory 2 days off')
  `);

  console.log('  ✅ System settings created');
  console.log('🎉 Database seeded successfully!');

  return {
    stations: Object.keys(stationIds).length,
    firefighters: firefighters.length,
    areas: 3,
  };
}
