import * as fs from 'fs';
import * as path from 'path';

const distancePath = path.resolve(process.cwd(), 'data/station_distances.json');
const distanceData: { station: string; distances: Record<string, number>; area: string }[] = JSON.parse(
  fs.readFileSync(distancePath, 'utf-8')
);

const stationDefs = [
  { id: 1485, name: 'Albany', areaName: 'Waitemata' },
  { id: 1482, name: 'Birkenhead', areaName: 'Waitemata' },
  { id: 1481, name: 'Devonport', areaName: 'Waitemata' },
  { id: 1483, name: 'East Coast Bays', areaName: 'Waitemata' },
  { id: 1464, name: 'Glen Eden', areaName: 'Waitemata' },
  { id: 1465, name: 'Henderson', areaName: 'Waitemata' },
  { id: 1490, name: 'Silverdale', areaName: 'Waitemata' },
  { id: 1480, name: 'Takapuna', areaName: 'Waitemata' },
  { id: 1466, name: 'Te Atatu', areaName: 'Waitemata' },
  { id: 1469, name: 'Titirangi', areaName: 'Waitemata' },
  { id: 1467, name: 'West Harbour', areaName: 'Waitemata' },
  { id: 1420, name: 'Auckland City', areaName: 'Auckland' },
  { id: 1460, name: 'Avondale', areaName: 'Auckland' },
  { id: 1461, name: 'Balmoral', areaName: 'Auckland' },
  { id: 1427, name: 'Ellerslie', areaName: 'Auckland' },
  { id: 1426, name: 'Grey Lynn', areaName: 'Auckland' },
  { id: 1462, name: 'Mount Roskill', areaName: 'Auckland' },
  { id: 1423, name: 'Mount Wellington', areaName: 'Auckland' },
  { id: 1422, name: 'Onehunga', areaName: 'Auckland' },
  { id: 1425, name: 'Parnell', areaName: 'Auckland' },
  { id: 1421, name: 'Remuera', areaName: 'Auckland' },
  { id: 1424, name: 'St Heliers', areaName: 'Auckland' },
  { id: 1432, name: 'Howick', areaName: 'Counties Manukau' },
  { id: 1435, name: 'Mangere', areaName: 'Counties Manukau' },
  { id: 1430, name: 'Manurewa', areaName: 'Counties Manukau' },
  { id: 1431, name: 'Otahuhu', areaName: 'Counties Manukau' },
  { id: 1433, name: 'Otara', areaName: 'Counties Manukau' },
  { id: 1434, name: 'Papatoetoe', areaName: 'Counties Manukau' },
  { id: 1438, name: 'Papakura', areaName: 'Counties Manukau' },
];

const nameToId: Record<string, number> = {};
stationDefs.forEach(s => { nameToId[s.name] = s.id; });

const ssoStations = new Set(['Silverdale', 'Takapuna', 'Henderson', 'Mount Wellington', 'Papatoetoe']);
const yellowWatchStations = new Set(['Silverdale', 'West Harbour', 'Titirangi']);
const standardWatches = ['Red', 'Green', 'Brown', 'Blue'];

let sql = `-- ==========================================
-- SCRIPT TO REBUILD DATABASE
-- ==========================================

-- 1. Wipe dependencies
DELETE FROM ot_count_log;
DELETE FROM audit_logs;
DELETE FROM ot_assignments;
DELETE FROM ot_offers;
DELETE FROM availability;
DELETE FROM firefighters;
DELETE FROM station_distances;
DELETE FROM stations;
DELETE FROM areas;

-- 2. Areas
INSERT INTO areas (id, name) VALUES (1, 'Waitemata');
INSERT INTO areas (id, name) VALUES (2, 'Auckland');
INSERT INTO areas (id, name) VALUES (3, 'Counties Manukau');

-- 3. Stations
`;

stationDefs.forEach(s => {
    const areaId = s.areaName === 'Waitemata' ? 1 : (s.areaName === 'Auckland' ? 2 : 3);
    sql += `INSERT INTO stations (id, name, area_id, district) VALUES (${s.id}, '${s.name}', ${areaId}, '${s.areaName}');\n`;
});

sql += `\n-- 4. Station Distances\n`;
distanceData.forEach(entry => {
    const fromId = nameToId[entry.station];
    if (!fromId) return;
    const distMap: Record<number, number> = {};
    for (const [dstKey, km] of Object.entries(entry.distances)) {
        const dstName = Object.keys(nameToId).find(n => n === dstKey) || Object.keys(nameToId).find(n => n.toLowerCase().replace(/ /g, '_') === dstKey.toLowerCase());
        if (!dstName || dstName === entry.station) continue;
        const toId = nameToId[dstName];
        if (!toId) continue;
        distMap[toId] = km;
    }
    sql += `INSERT INTO station_distances (station_id, district, distances) VALUES (${fromId}, '${entry.area}', '${JSON.stringify(distMap)}');\n`;
});

sql += `\n-- 5. Firefighters\n`;
stationDefs.forEach(station => {
    const isYellow = yellowWatchStations.has(station.name);
    const watches = isYellow ? ['Yellow'] : standardWatches;
    const officerRank = ssoStations.has(station.name) ? 'SSO' : 'SO';
    const sName = station.name.replace(/ /g, ''); // For names/emails without spaces
    
    watches.forEach(watch => {
        // Create 3 FFs
        for (let i = 1; i <= 3; i++) {
            const first = sName;
            const last = `${watch}_FF_${i}`;
            const email = `${sName.toLowerCase()}_${watch.toLowerCase()}_ff_${i}@fireandemergency.nz`;
            sql += `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights, is_active, qualifications) VALUES ('${first}', '${last}', '${email}', ${station.id}, '${watch}', 'FF', 0, 0, 0, 0, 0, 0, true, '{"driver": true, "not_rookie": true}');\n`;
        }
        
        // Create 1 Officer
        const first = sName;
        const last = `${watch}_${officerRank}`;
        const email = `${sName.toLowerCase()}_${watch.toLowerCase()}_${officerRank.toLowerCase()}@fireandemergency.nz`;
        sql += `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights, is_active, qualifications) VALUES ('${first}', '${last}', '${email}', ${station.id}, '${watch}', '${officerRank}', 0, 0, 0, 0, 0, 0, true, '{"driver": true, "not_rookie": true, "type4": true, "prt": true}');\n`;
    });
});

fs.writeFileSync('rebuild_database.sql', sql);
console.log('rebuild_database.sql generated.');
