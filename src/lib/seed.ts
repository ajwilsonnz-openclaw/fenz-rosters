// FENZ Overtime Seed Script
// Populates all 35 stations, areas, distances, watch anchors, 20+ firefighters, system settings

import { query } from '../lib/db';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // --- 1. Areas ---
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

  // Areas
  const areaWaitemata = await query(`INSERT INTO areas (name) VALUES ('Waitemata') RETURNING id`);
  const areaAuckland = await query(`INSERT INTO areas (name) VALUES ('Auckland') RETURNING id`);
  const areaCountiesManukau = await query(`INSERT INTO areas (name) VALUES ('Counties Manukau') RETURNING id`);

  const waitemataId = areaWaitemata.rows[0].id;
  const aucklandId = areaAuckland.rows[0].id;
  const countiesManukauId = areaCountiesManukau.rows[0].id;

  console.log('  ✅ Areas created');

  // --- 2. Stations ---
  const stationMap: Record<string, { name: string; areaId: number; district?: string; specialist?: boolean; specialistType?: string }> = {
    // Waitemata (North Shore + West)
    'Albany': { name: 'Albany', areaId: waitemataId },
    'Avondale': { name: 'Avondale', areaId: aucklandId },
    'Birkenhead': { name: 'Birkenhead', areaId: waitemataId },
    'Devonport': { name: 'Devonport', areaId: waitemataId },
    'East Coast Bays': { name: 'East Coast Bays', areaId: waitemataId },
    'Glenfield': { name: 'Glenfield', areaId: waitemataId },
    'Glen Eden': { name: 'Glen Eden', areaId: aucklandId },
    'Grey Lynn': { name: 'Grey Lynn', areaId: aucklandId },
    'Henderson': { name: 'Henderson', areaId: aucklandId },
    'Ponsonby': { name: 'Ponsonby', areaId: aucklandId },
    'Silverdale': { name: 'Silverdale', areaId: waitemataId },
    'Takapuna': { name: 'Takapuna', areaId: waitemataId },
    'Te Atatu': { name: 'Te Atatu', areaId: aucklandId, specialist: true, specialistType: 'type4' },
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

  // Update district column to match area name
  await query(`UPDATE stations s SET district = a.name FROM areas a WHERE s.area_id = a.id`);
  console.log('  ✅ Station district column synced with areas');

  // --- 3. Station Distances ---
  // Waitemata internal distances (realistic Auckland North Shore)
  const waitemataDistances: Record<string, Record<string, number>> = {
    'Albany': { 'Birkenhead': 14, 'Devonport': 15, 'East Coast Bays': 10, 'Glenfield': 8, 'Silverdale': 4, 'Takapuna': 6, 'Warkworth': 26 },
    'Birkenhead': { 'Albany': 14, 'Devonport': 5, 'East Coast Bays': 12, 'Glenfield': 4, 'Silverdale': 18, 'Takapuna': 3, 'Warkworth': 40 },
    'Devonport': { 'Albany': 15, 'Birkenhead': 5, 'East Coast Bays': 13, 'Glenfield': 8, 'Silverdale': 19, 'Takapuna': 4, 'Warkworth': 41 },
    'East Coast Bays': { 'Albany': 10, 'Birkenhead': 12, 'Devonport': 13, 'Glenfield': 9, 'Silverdale': 14, 'Takapuna': 5, 'Warkworth': 36 },
    'Glenfield': { 'Albany': 8, 'Birkenhead': 4, 'Devonport': 8, 'East Coast Bays': 9, 'Silverdale': 12, 'Takapuna': 3, 'Warkworth': 34 },
    'Silverdale': { 'Albany': 4, 'Birkenhead': 18, 'Devonport': 19, 'East Coast Bays': 14, 'Glenfield': 12, 'Takapuna': 10, 'Warkworth': 22 },
    'Takapuna': { 'Albany': 6, 'Birkenhead': 3, 'Devonport': 4, 'East Coast Bays': 5, 'Glenfield': 3, 'Silverdale': 10, 'Warkworth': 32 },
    'Warkworth': { 'Albany': 26, 'Birkenhead': 40, 'Devonport': 41, 'East Coast Bays': 36, 'Glenfield': 34, 'Silverdale': 22, 'Takapuna': 32 },
  };

  // Cross-district distances from Waitemata to Auckland/CM stations
  const crossDistances: Record<string, Record<string, number>> = {
    'Albany': { 'Henderson': 27, 'Te Atatu': 24, 'Glen Eden': 31, 'Grey Lynn': 18, 'Ponsonby': 16, 'Auckland City': 18, 'Avondale': 22, 'St Heliers': 20, 'Howick': 28, 'Mangere': 30, 'Manurewa': 35, 'Otara': 32, 'Botany': 33, 'Papakura': 40, 'Remuera': 17, 'Parnell': 17 },
    'Takapuna': { 'Henderson': 20, 'Te Atatu': 17, 'Glen Eden': 24, 'Grey Lynn': 8, 'Ponsonby': 7, 'Auckland City': 9, 'Avondale': 14, 'St Heliers': 12, 'Howick': 22, 'Mangere': 24, 'Manurewa': 30, 'Otara': 26, 'Botany': 27, 'Papakura': 35, 'Remuera': 10, 'Parnell': 9 },
    'Devonport': { 'Henderson': 24, 'Te Atatu': 21, 'Glen Eden': 28, 'Grey Lynn': 12, 'Ponsonby': 10, 'Auckland City': 12, 'Avondale': 18, 'St Heliers': 15, 'Howick': 25, 'Mangere': 28, 'Manurewa': 33, 'Otara': 30, 'Botany': 31, 'Papakura': 38, 'Remuera': 13, 'Parnell': 12 },
  };

  // Insert Waitemata internal distances
  for (const [from, targets] of Object.entries(waitemataDistances)) {
    if (!stationIds[from]) continue;
    for (const [to, dist] of Object.entries(targets)) {
      if (!stationIds[to]) continue;
      await query(
        `INSERT INTO station_distances (station_id, other_station_id, distance_km)
         VALUES ($1, $2, $3) ON CONFLICT (station_id, other_station_id) DO UPDATE SET distance_km = $3`,
        [stationIds[from], stationIds[to], dist]
      );
    }
  }

  // Insert cross-district distances (bidirectional)
  for (const [from, targets] of Object.entries(crossDistances)) {
    if (!stationIds[from]) continue;
    for (const [to, dist] of Object.entries(targets)) {
      if (!stationIds[to]) continue;
      await query(
        `INSERT INTO station_distances (station_id, other_station_id, distance_km)
         VALUES ($1, $2, $3) ON CONFLICT (station_id, other_station_id) DO UPDATE SET distance_km = $3`,
        [stationIds[from], stationIds[to], dist]
      );
      await query(
        `INSERT INTO station_distances (station_id, other_station_id, distance_km)
         VALUES ($1, $2, $3) ON CONFLICT (station_id, other_station_id) DO UPDATE SET distance_km = $3`,
        [stationIds[to], stationIds[from], dist]
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
    ('Yellow', '2026-02-01', 'Mon-Fri only, placeholder anchor')
  `);

  console.log('  ✅ Watch anchors created');

  // --- 5. Firefighters (12 per watch, 48 total) ---
  // Distributed across all 3 districts with varied ranks, quals, and OT counts
  const firefighters = [
    // ═══ GREEN WATCH (12) ═══
    // Waitemata (5)
    { first: 'Wiremu', last: 'Hemara', watch: 'Green', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 5, otNights: 2 },
    { first: 'Sarah', last: 'Mitchell', watch: 'Green', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 3, otNights: 1 },
    { first: 'Tane', last: 'Rawiri', watch: 'Green', station: 'East Coast Bays', rank: 'SFF', quals: { driver: true, not_rookie: true }, otDays: 8, otNights: 4 },
    { first: 'Emma', last: 'Chen', watch: 'Green', station: 'Albany', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, otDays: 2, otNights: 1 },
    { first: 'Jordan', last: 'Park', watch: 'Green', station: 'Silverdale', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 1, otNights: 0 },
    // Auckland (4)
    { first: 'Nina', last: 'Kowalski', watch: 'Green', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 4, otNights: 2 },
    { first: 'Rangi', last: 'Tuhoe', watch: 'Green', station: 'Grey Lynn', rank: 'QFF', quals: { driver: true, not_rookie: true }, otDays: 6, otNights: 3 },
    { first: 'David', last: 'Wu', watch: 'Green', station: 'Ponsonby', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, otDays: 3, otNights: 1 },
    { first: 'Lisa', last: 'Campbell', watch: 'Green', station: 'Te Atatu', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, otDays: 1, otNights: 0 },
    // Counties Manukau (3)
    { first: 'Ben', last: 'Tafua', watch: 'Green', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 7, otNights: 3 },
    { first: 'Jade', last: 'Renata', watch: 'Green', station: 'Mangere', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 2, otNights: 1 },
    { first: 'Sam', last: 'Kapoor', watch: 'Green', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, otDays: 5, otNights: 2 },

    // ═══ RED WATCH (12) ═══
    // Auckland (5)
    { first: 'Liam', last: 'OBrien', watch: 'Red', station: 'Auckland City', rank: 'FF', quals: { driver: true, not_rookie: true, CBR: true }, otDays: 4, otNights: 2 },
    { first: 'Aroha', last: 'Te Rangi', watch: 'Red', station: 'Ponsonby', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 6, otNights: 3 },
    { first: 'Marcus', last: 'Williams', watch: 'Red', station: 'Grey Lynn', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 2, otNights: 1 },
    { first: 'Hemi', last: 'Ngata', watch: 'Red', station: 'St Heliers', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, otDays: 7, otNights: 3 },
    { first: 'Priya', last: 'Sharma', watch: 'Red', station: 'Auckland City', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true, CBR: true }, otDays: 1, otNights: 0 },
    // Waitemata (4)
    { first: 'Jake', last: 'Morrison', watch: 'Red', station: 'Takapuna', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 3, otNights: 1 },
    { first: 'Maia', last: 'Henare', watch: 'Red', station: 'Birkenhead', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 5, otNights: 2 },
    { first: 'Chris', last: 'Evans', watch: 'Red', station: 'Albany', rank: 'SFF', quals: { driver: true, not_rookie: true }, otDays: 8, otNights: 4 },
    { first: 'Mereana', last: 'Kahu', watch: 'Red', station: 'Silverdale', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, otDays: 2, otNights: 0 },
    // Counties Manukau (3)
    { first: 'Tyler', last: 'Patel', watch: 'Red', station: 'Manurewa', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 4, otNights: 2 },
    { first: 'Anika', last: 'Singh', watch: 'Red', station: 'Papakura', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 3, otNights: 1 },
    { first: 'Rawiri', last: 'Tamati', watch: 'Red', station: 'Botany', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true }, otDays: 1, otNights: 0 },

    // ═══ BROWN WATCH (12) ═══
    // Auckland (5)
    { first: 'Kahu', last: 'Makiha', watch: 'Brown', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 3, otNights: 2 },
    { first: 'Rebecca', last: 'Taylor', watch: 'Brown', station: 'Glen Eden', rank: 'QFF', quals: { driver: true, not_rookie: true }, otDays: 5, otNights: 2 },
    { first: 'Dan', last: 'Reid', watch: 'Brown', station: 'Avondale', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 2, otNights: 1 },
    { first: 'Nikau', last: 'Tangaroa', watch: 'Brown', station: 'Grey Lynn', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, otDays: 9, otNights: 5 },
    { first: 'Grace', last: 'Whittaker', watch: 'Brown', station: 'Te Atatu', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, otDays: 0, otNights: 0 },
    // Waitemata (4)
    { first: 'Luke', last: 'Tanner', watch: 'Brown', station: 'Devonport', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 4, otNights: 2 },
    { first: 'Hinewai', last: 'Ruru', watch: 'Brown', station: 'Takapuna', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 6, otNights: 3 },
    { first: 'Pete', last: 'Douglas', watch: 'Brown', station: 'East Coast Bays', rank: 'SFF', quals: { driver: true, not_rookie: true }, otDays: 3, otNights: 1 },
    { first: 'Whina', last: 'Cooper', watch: 'Brown', station: 'Warkworth', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, otDays: 1, otNights: 0 },
    // Counties Manukau (3)
    { first: 'Matt', last: 'Young', watch: 'Brown', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 7, otNights: 3 },
    { first: 'Aria', last: 'Matene', watch: 'Brown', station: 'Mangere', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 2, otNights: 1 },
    { first: 'Ross', last: 'McIntyre', watch: 'Brown', station: 'Manurewa', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, otDays: 5, otNights: 2 },

    // ═══ BLUE WATCH (12) ═══
    // Counties Manukau (5)
    { first: 'Tommy', last: 'Ahu', watch: 'Blue', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 6, otNights: 3 },
    { first: 'Fiona', last: 'Cameron', watch: 'Blue', station: 'Botany', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 4, otNights: 2 },
    { first: 'Sam', last: 'Tong', watch: 'Blue', station: 'Manurewa', rank: 'SFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 7, otNights: 4 },
    { first: 'Mere', last: 'Whare', watch: 'Blue', station: 'Mangere', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 1, otNights: 0 },
    { first: 'Alex', last: 'Brown', watch: 'Blue', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, otDays: 3, otNights: 1 },
    // Waitemata (4)
    { first: 'Zoe', last: 'Fletcher', watch: 'Blue', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 2, otNights: 1 },
    { first: 'Tipene', last: 'Rata', watch: 'Blue', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true }, otDays: 5, otNights: 2 },
    { first: 'Kate', last: 'Sullivan', watch: 'Blue', station: 'Silverdale', rank: 'SFF', quals: { driver: true, not_rookie: true, prt: true, type4: true }, otDays: 3, otNights: 1 },
    { first: 'Rongo', last: 'Parata', watch: 'Blue', station: 'Takapuna', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, otDays: 4, otNights: 2 },
    // Auckland (3)
    { first: 'Oliver', last: 'Hunt', watch: 'Blue', station: 'Ponsonby', rank: 'FF', quals: { driver: true, not_rookie: true }, otDays: 6, otNights: 3 },
    { first: 'Marama', last: 'Te Awa', watch: 'Blue', station: 'Henderson', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, otDays: 2, otNights: 0 },
    { first: 'Gary', last: 'Chen', watch: 'Blue', station: 'St Heliers', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, otDays: 1, otNights: 0 },
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
