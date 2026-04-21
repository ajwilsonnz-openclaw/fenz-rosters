import { Pool } from 'pg';

async function seed() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:fenz_dev_pass@localhost:5433/fenz_ot',
    ssl: false,
  });

  console.log('🌱 Clearing and reseeding...');
  await pool.query('TRUNCATE areas CASCADE');
  await pool.query('TRUNCATE watch_anchors, firefighters, system_settings CASCADE');
  console.log('  Cleared');

  const wa = await pool.query("INSERT INTO areas (name) VALUES ('Waitemata') RETURNING id");
  const ak = await pool.query("INSERT INTO areas (name) VALUES ('Auckland') RETURNING id");
  const cm = await pool.query("INSERT INTO areas (name) VALUES ('Counties Manukau') RETURNING id");

  const stations: [string, number, boolean?, string?][] = [
    ['Albany', wa.rows[0].id], ['Devonport', wa.rows[0].id], ['East Coast Bays', wa.rows[0].id],
    ['Silverdale', wa.rows[0].id], ['Warkworth', wa.rows[0].id], ['Birkenhead', wa.rows[0].id],
    ['Takapuna', wa.rows[0].id], ['Glenfield', wa.rows[0].id], ['Northcote', wa.rows[0].id],
    ['Auckland City', ak.rows[0].id, true, 'CBR'], ['Ponsonby', ak.rows[0].id],
    ['Grey Lynn', ak.rows[0].id], ['Newmarket', ak.rows[0].id], ['Mount Eden', ak.rows[0].id],
    ['Epsom', ak.rows[0].id], ['One Tree Hill', ak.rows[0].id], ['Remuera', ak.rows[0].id],
    ['St Heliers', ak.rows[0].id], ['Parnell', ak.rows[0].id], ['Onehunga', ak.rows[0].id],
    ['Mt Roskill', ak.rows[0].id], ['Ellerslie', ak.rows[0].id], ['Henderson', ak.rows[0].id],
    ['Avondale', ak.rows[0].id], ['Glen Eden', ak.rows[0].id], ['Te Atatu', ak.rows[0].id],
    ['Titirangi', ak.rows[0].id], ['West Harbour', ak.rows[0].id],
    ['Manurewa', cm.rows[0].id], ['Papakura', cm.rows[0].id], ['Otara', cm.rows[0].id],
    ['Mangere', cm.rows[0].id], ['Howick', cm.rows[0].id], ['Botany', cm.rows[0].id],
    ['Manukau', cm.rows[0].id], ['Papatoetoe', cm.rows[0].id], ['Oneroa', cm.rows[0].id],
    ['Mt Wellington', cm.rows[0].id], ['Otahuhu', cm.rows[0].id], ['Waiuku', cm.rows[0].id],
  ];

  const ids: Record<string, number> = {};
  for (const row of stations) {
    const [name, areaId, isSpec, specType] = row;
    const r = await pool.query(
      'INSERT INTO stations (name, area_id, is_specialist, specialist_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, areaId, isSpec || false, specType || null]
    );
    ids[name] = r.rows[0].id;
  }
  console.log(`  ✅ ${Object.keys(ids).length} stations`);

  const dists: Record<string, number> = {
    'Devonport': 15, 'East Coast Bays': 10, 'Takapuna': 6, 'Silverdale': 4,
    'Warkworth': 26, 'Northcote': 12, 'Birkenhead': 11, 'Ponsonby': 22,
    'Newmarket': 18, 'Mount Eden': 20, 'Henderson': 27, 'Avondale': 25,
    'Glen Eden': 31, 'Te Atatu': 24, 'Titirangi': 28, 'West Harbour': 21,
  };
  for (const [t, d] of Object.entries(dists)) {
    if (ids[t]) {
      await pool.query('INSERT INTO station_distances (station_id, other_station_id, distance_km) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [ids['Albany'], ids[t], d]);
      await pool.query('INSERT INTO station_distances (station_id, other_station_id, distance_km) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [ids[t], ids['Albany'], d]);
    }
  }
  console.log('  ✅ Distances');

  await pool.query("INSERT INTO watch_anchors (watch, anchor_date, note) VALUES ('Green', '2026-01-31', 'Saturday'), ('Red', '2026-02-02', 'Monday'), ('Brown', '2026-02-04', 'Wednesday'), ('Blue', '2026-02-06', 'Friday')");
  console.log('  ✅ Watch anchors');

  const ffs = [
    ['Wiremu','Hemara','Green','Albany','FF',5,2,{driver:true,not_rookie:true}],
    ['Sarah','Mitchell','Green','Devonport','QFF',3,1,{driver:true,not_rookie:true}],
    ['Tane','Rawiri','Green','East Coast Bays','SFF',8,4,{driver:true,not_rookie:true}],
    ['Emma','Chen','Green','Albany','SO',2,1,{driver:true,not_rookie:true,prt:true}],
    ['Jordan','Park','Green','Silverdale','FF',1,0,{driver:false,not_rookie:false}],
    ['Liam','OBrien','Red','Auckland City','FF',4,2,{driver:true,not_rookie:true}],
    ['Aroha','Te Rangi','Red','Ponsonby','QFF',6,3,{driver:true,not_rookie:true}],
    ['Marcus','Williams','Red','Grey Lynn','FF',2,1,{driver:false,not_rookie:true}],
    ['Hemi','Ngata','Red','St Heliers','SFF',7,3,{driver:true,not_rookie:true,command_unit:true}],
    ['Priya','Sharma','Red','Auckland City','SO',1,0,{driver:true,not_rookie:true,prt:true,type4:true}],
    ['Kahu','Makiha','Brown','Henderson','FF',3,2,{driver:true,not_rookie:true}],
    ['Rebecca','Taylor','Brown','Avondale','QFF',5,2,{driver:true,not_rookie:true}],
    ['Dan','Reid','Brown','Glen Eden','FF',2,1,{driver:false,not_rookie:true}],
    ['Nikau','Tangaroa','Brown','Grey Lynn','SFF',9,5,{driver:true,not_rookie:true}],
    ['Grace','Whittaker','Brown','Te Atatu','SSO',0,0,{driver:true,not_rookie:true,command_unit:true,type4:true}],
    ['Tommy','Ahu','Blue','Howick','FF',6,3,{driver:true,not_rookie:true}],
    ['Fiona','Cameron','Blue','Botany','QFF',4,2,{driver:true,not_rookie:true}],
    ['Sam','Tong','Blue','Manurewa','SFF',7,4,{driver:true,not_rookie:true,prt:true}],
    ['Mere','Whare','Blue','Mangere','FF',1,0,{driver:false,not_rookie:false}],
    ['Alex','Brown','Blue','Otara','SO',3,1,{driver:true,not_rookie:true,type4:true}],
  ];

  for (const [f,l,w,st,r,od,on,q] of ffs) {
    await pool.query(
      'INSERT INTO firefighters (first_name,last_name,email,station_id,watch,rank,ot_count_days,ot_count_nights,is_active,qualifications) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)',
      [f,l,`${String(f).toLowerCase()}.${String(l).toLowerCase().replace(/'/g,'')}@fenz.slack.com`, ids[st], w, r, od, on, JSON.stringify(q)]
    );
  }
  console.log(`  ✅ ${ffs.length} firefighters`);

  await pool.query("INSERT INTO system_settings (key, value, description) VALUES ('ot_offer_mode', '\"mandatory\"', 'mandatory or accept_decline'), ('relievers_enabled', 'true', 'Whether to deploy district relievers'), ('max_continuous_hours', '24', 'Max continuous hours'), ('min_rest_hours', '8', 'Min rest hours')");
  console.log('  ✅ Settings');

  const r = await pool.query('SELECT (SELECT COUNT(*) FROM stations) as s, (SELECT COUNT(*) FROM firefighters) as f, (SELECT COUNT(*) FROM watch_anchors) as w');
  console.log(`\n📊 DB: ${r.rows[0].s} stations, ${r.rows[0].f} fighters, ${r.rows[0].w} anchors`);

  await pool.end();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
