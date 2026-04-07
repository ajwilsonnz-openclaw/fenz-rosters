// FENZ Overtime Seed Script
// Populates all 35 stations, areas, distances, watch anchors, 20+ firefighters, system settings

import { query } from '../lib/db';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // --- 1. Areas ---
  await query(`DELETE FROM watch_anchors`);
  await query(`DELETE FROM station_distances`);
  await query(`DELETE FROM ot_assignments`);
  await query(`DELETE FROM ot_offers`);
  await query(`DELETE FROM ot_requests`);
  await query(`DELETE FROM ot_count_log`);
  await query(`DELETE FROM audit_logs`);
  await query(`DELETE FROM availability`);
  await query(`DELETE FROM allocation_runs`);
  await query(`DELETE FROM district_relievers`);
  await query(`DELETE FROM firefighters`);
  await query(`DELETE FROM stations`);
  await query(`DELETE FROM areas`);
  await query(`DELETE FROM watch_anchors`);
  await query(`DELETE FROM system_settings`);

  console.log('  ✅ Cleared existing data');

  // Areas
  const areaWaitemata = await query(`INSERT INTO areas (name) VALUES ('Waitemata') RETURNING id`);
  const areaAuckland = await query(`INSERT INTO areas (name) VALUES ('Auckland') RETURNING id`);
  const areaCountiesManukau = await query(`INSERT INTO areas (name) VALUES ('Counties Manukau') RETURNING id`);

  const waitemataId = areaWaitemata.rows[0].id;
  const aucklandId = areaAuckland.rows[0].id;
  const countiesManukauId = areaCountiesManukau.rows[0].id;

  console.log('  ✅ Areas created');

  // --- 2. Stations ---
  const stationMap: Record<string, { name: string; areaId: number; specialist?: boolean; specialistType?: string }> = {
    // Waitemata (North Shore + West)
    'Albany': { name: 'Albany', areaId: waitemataId },
    'Avondale': { name: 'Avondale', areaId: aucklandId },
    'Birkenhead': { name: 'Birkenhead', areaId: waitemataId },
    'Devonport': { name: 'Devonport', areaId: waitemataId },
    'East Coast Bays': { name: 'East Coast Bays', areaId: waitemataId },
    'Glen Eden': { name: 'Glen Eden', areaId: aucklandId },
    'Grey Lynn': { name: 'Grey Lynn', areaId: aucklandId },
    'Henderson': { name: 'Henderson', areaId: aucklandId },
    'Ponsonby': { name: 'Ponsonby', areaId: aucklandId },
    'Silverdale': { name: 'Silverdale', areaId: waitemataId },
    'Te Atatu': { name: 'Te Atatu', areaId: aucklandId },
    'Titirangi': { name: 'Titirangi', areaId: aucklandId },
    'Warkworth': { name: 'Warkworth', areaId: waitemataId },
    'West Harbour': { name: 'West Harbour', areaId: aucklandId },
    
    // Auckland (Central City)
    'Parnell': { name: 'Parnell', areaId: aucklandId },
    'Remuera': { name: 'Remuera', areaId: aucklandId },
    'St Heliers': { name: 'St Heliers', areaId: aucklandId },

    // Counties Manukau (South)
    'Balmoral': { name: 'Balmoral', areaId: countiesManukauId },
    'Ellerslie': { name: 'Ellerslie', areaId: aucklandId },
    'Howick': { name: 'Howick', areaId: countiesManukauId },
    'Mangere': { name: 'Mangere', areaId: countiesManukauId },
    'Manurewa': { name: 'Manurewa', areaId: countiesManukauId },
    'Mt Roskill': { name: 'Mt Roskill', areaId: aucklandId },
    'Mt Wellington': { name: 'Mt Wellington', areaId: countiesManukauId },
    'Onehunga': { name: 'Onehunga', areaId: aucklandId },
    'Oneroa': { name: 'Oneroa', areaId: countiesManukauId },
    'Otahuhu': { name: 'Otahuhu', areaId: countiesManukauId },
    'Otara': { name: 'Otara', areaId: countiesManukauId },
    'Papakura': { name: 'Papakura', areaId: countiesManukauId },
    'Waiuku': { name: 'Waiuku', areaId: countiesManukauId },

    // Specialist stations (Adam to confirm — marking known ones)
    'Auckland City': { name: 'Auckland City', areaId: aucklandId, specialist: true, specialistType: 'CBR' },
    
    // Reliever roles (out of scope but tracked)
    'District Reliever': { name: 'District Reliever', areaId: aucklandId },
    'Station Reliever': { name: 'Station Reliever', areaId: aucklandId },
  };

  const stationIds: Record<string, number> = {};
  for (const [, data] of Object.entries(stationMap)) {
    const res = await query(
      `INSERT INTO stations (name, area_id, is_specialist, specialist_type) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
      [data.name, data.areaId, data.specialist || false, data.specialistType || null]
    );
    stationIds[data.name] = res.rows[0].id;
  }

  console.log(`  ✅ ${Object.keys(stationIds).length} stations created`);

  // --- 3. Station Distances ---
  // Albany's confirmed distances (from Adam's screenshot)
  const albanyDistances: Record<string, number> = {
    'Devonport': 15, 'East Coast Bays': 10, 'Glen Eden': 31,
    'Henderson': 27, 'Howick': 28, 'Silverdale': 4,
    'Takapuna': 6, 'Te Atatu': 24, 'Warkworth': 26,
    'West Harbour': 21,
  };
  
  // Also add bidirectional distances
  for (const [target, dist] of Object.entries(albanyDistances)) {
    if (stationIds[target]) {
      await query(
        `INSERT INTO station_distances (station_id, other_station_id, distance_km)
         VALUES ($1, $2, $3) ON CONFLICT (station_id, other_station_id) DO UPDATE SET distance_km = $3`,
        [stationIds['Albany'], stationIds[target], dist]
      );
      await query(
        `INSERT INTO station_distances (station_id, other_station_id, distance_km)
         VALUES ($1, $2, $3) ON CONFLICT (station_id, other_station_id) DO UPDATE SET distance_km = $3`,
        [stationIds[target], stationIds['Albany'], dist]
      );
    }
  }

  // Set all missing distances to 0 (Adam will fill later)
  const allStationIds = Object.values(stationIds);
  for (const fromId of allStationIds) {
    for (const toId of allStationIds) {
      if (fromId !== toId) {
        await query(
          `INSERT INTO station_distances (station_id, other_station_id, distance_km)
           VALUES ($1, $2, 0) 
           ON CONFLICT (station_id, other_station_id) DO NOTHING`,
          [fromId, toId]
        );
      }
    }
  }

  console.log('  ✅ Station distances populated');

  // --- 4. Watch Anchors ---
  await query(`INSERT INTO watch_anchors (watch, anchor_date, note) VALUES 
    ('Green', '2026-01-31', 'Saturday anchor'),
    ('Red', '2026-02-02', 'Monday anchor'),
    ('Brown', '2026-02-04', 'Wednesday anchor'),
    ('Blue', '2026-02-06', 'Friday anchor'),
    ('Yellow', NULL, 'Mon-Fri only, no anchor')
  `);

  console.log('  ✅ Watch anchors created');

  // --- 5. Firefighters (5 per watch, 20 total) ---
  const firefighters = [
    // Green Watch
    { first: 'Wiremu', last: 'Hemara', watch: 'Green', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true, can_ride_up: false }, otDays: 5, otNights: 2 },
    { first: 'Sarah', last: 'Mitchell', watch: 'Green', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true, can_ride_up: true }, otDays: 3, otNights: 1 },
    { first: 'Tane', last: 'Rawiri', watch: 'Green', station: 'East Coast Bays', rank: 'SFF', quals: { driver: true, not_rookie: true, can_ride_up: true }, otDays: 8, otNights: 4 },
    { first: 'Emma', last: 'Chen', watch: 'Green', station: 'Albany', rank: 'SO', quals: { driver: true, not_rookie: true, can_ride_up: true, prt: true }, otDays: 2, otNights: 1 },
    { first: 'Jordan', last: 'Park', watch: 'Green', station: 'Silverdale', rank: 'FF', quals: { driver: false, not_rookie: false, can_ride_up: false, prt: true }, otDays: 1, otNights: 0 },
    
    // Red Watch
    { first: 'Liam', last: 'OBrien', watch: 'Red', station: 'Auckland City', rank: 'FF', quals: { driver: true, not_rookie: true, can_ride_up: false }, otDays: 4, otNights: 2 },
    { first: 'Aroha', last: 'Te Rangi', watch: 'Red', station: 'Parnell', rank: 'QFF', quals: { driver: true, not_rookie: true, can_ride_up: true }, otDays: 6, otNights: 3 },
    { first: 'Marcus', last: 'Williams', watch: 'Red', station: 'Remuera', rank: 'FF', quals: { driver: false, not_rookie: true, can_ride_up: false }, otDays: 2, otNights: 1 },
    { first: 'Hemi', last: 'Ngata', watch: 'Red', station: 'St Heliers', rank: 'SFF', quals: { driver: true, not_rookie: true, can_ride_up: true, command_unit: true }, otDays: 7, otNights: 3 },
    { first: 'Priya', last: 'Sharma', watch: 'Red', station: 'Auckland City', rank: 'SO', quals: { driver: true, not_rookie: true, can_ride_up: true, prt: true, type4: true }, otDays: 1, otNights: 0 },

    // Brown Watch
    { first: 'Kahu', last: 'Makiha', watch: 'Brown', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, can_ride_up: false, prt: true }, otDays: 3, otNights: 2 },
    { first: 'Rebecca', last: 'Taylor', watch: 'Brown', station: 'Glen Eden', rank: 'QFF', quals: { driver: true, not_rookie: true, can_ride_up: true }, otDays: 5, otNights: 2 },
    { first: 'Dan', last: 'Reid', watch: 'Brown', station: 'Avondale', rank: 'FF', quals: { driver: false, not_rookie: true, can_ride_up: false }, otDays: 2, otNights: 1 },
    { first: 'Nikau', last: 'Tangaroa', watch: 'Brown', station: 'Grey Lynn', rank: 'SFF', quals: { driver: true, not_rookie: true, can_ride_up: true }, otDays: 9, otNights: 5 },
    { first: 'Grace', last: 'Whittaker', watch: 'Brown', station: 'Te Atatu', rank: 'SSO', quals: { driver: true, not_rookie: true, can_ride_up: true, command_unit: true, type4: true }, otDays: 0, otNights: 0 },

    // Blue Watch
    { first: 'Tommy', last: 'Ahu', watch: 'Blue', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true, can_ride_up: false }, otDays: 6, otNights: 3 },
    { first: 'Fiona', last: 'Cameron', watch: 'Blue', station: 'Balmoral', rank: 'QFF', quals: { driver: true, not_rookie: true, can_ride_up: true }, otDays: 4, otNights: 2 },
    { first: 'Sam', last: 'Tong', watch: 'Blue', station: 'Manurewa', rank: 'SFF', quals: { driver: true, not_rookie: true, can_ride_up: true, prt: true }, otDays: 7, otNights: 4 },
    { first: 'Mere', last: 'Whare', watch: 'Blue', station: 'Mangere', rank: 'FF', quals: { driver: false, not_rookie: false, can_ride_up: false }, otDays: 1, otNights: 0 },
    { first: 'Alex', last: 'Brown', watch: 'Blue', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, can_ride_up: true, type4: true }, otDays: 3, otNights: 1 },
  ];

  for (const ff of firefighters) {
    await query(
      `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        ff.first,
        ff.last,
        `${ff.first.toLowerCase()}.${ff.last.toLowerCase().replace(/'/g, '')}@fenz.slack.com`,
        stationIds[ff.station],
        ff.watch,
        ff.rank,
        ff.otDays,
        ff.otNights,
        true,
        JSON.stringify(ff.quals),
      ]
    );
  }

  console.log(`  ✅ ${firefighters.length} firefighters seeded`);

  // --- 6. System Settings ---
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
