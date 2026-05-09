import * as fs from 'fs';

const stations = [
  { id: 1485, name: 'Albany' },
  { id: 1482, name: 'Birkenhead' },
  { id: 1481, name: 'Devonport' },
  { id: 1483, name: 'East Coast Bays' },
  { id: 1464, name: 'Glen Eden' },
  { id: 1465, name: 'Henderson' },
  { id: 1490, name: 'Silverdale' },
  { id: 1480, name: 'Takapuna' },
  { id: 1466, name: 'Te Atatu' },
  { id: 1469, name: 'Titirangi' },
  { id: 1467, name: 'West Harbour' },
  { id: 1420, name: 'Auckland City' },
  { id: 1460, name: 'Avondale' },
  { id: 1461, name: 'Balmoral' },
  { id: 1427, name: 'Ellerslie' },
  { id: 1426, name: 'Grey Lynn' },
  { id: 1462, name: 'Mount Roskill' },
  { id: 1423, name: 'Mount Wellington' },
  { id: 1422, name: 'Onehunga' },
  { id: 1425, name: 'Parnell' },
  { id: 1421, name: 'Remuera' },
  { id: 1424, name: 'St Heliers' },
  { id: 1432, name: 'Howick' },
  { id: 1435, name: 'Mangere' },
  { id: 1430, name: 'Manurewa' },
  { id: 1431, name: 'Otahuhu' },
  { id: 1433, name: 'Otara' },
  { id: 1434, name: 'Papatoetoe' },
  { id: 1438, name: 'Papakura' },
];

const ssoStations = new Set(['Silverdale', 'Takapuna', 'Henderson', 'Mount Wellington', 'Papatoetoe']);
const yellowWatchStations = new Set(['Silverdale', 'West Harbour', 'Titirangi']);
const standardWatches = ['Red', 'Green', 'Brown', 'Blue'];

let sql = `-- ==========================================
-- SCRIPT TO RESEED FIREFIGHTERS
-- ==========================================

-- 1. Wipe dependencies
DELETE FROM ot_count_log;
DELETE FROM audit_logs;
DELETE FROM ot_assignments;
DELETE FROM ot_offers;
DELETE FROM availability;
DELETE FROM firefighters;

-- 2. Insert Firefighters
`;

stations.forEach(station => {
    const isYellow = yellowWatchStations.has(station.name);
    const watches = isYellow ? ['Yellow'] : standardWatches;
    const officerRank = ssoStations.has(station.name) ? 'SSO' : 'SO';
    const sName = station.name.replace(/ /g, ''); // For names/emails without spaces
    
    watches.forEach(watch => {
        // Create 3 FFs
        for (let i = 1; i <= 3; i++) {
            const first = sName;
            const last = `FF_${i}`;
            const email = `${sName.toLowerCase()}_${watch.toLowerCase()}_ff_${i}@fireandemergency.nz`;
            sql += `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights, is_active, qualifications) VALUES ('${first}', '${last}', '${email}', ${station.id}, '${watch}', 'FF', 0, 0, 0, 0, 0, 0, true, '{"driver": true, "not_rookie": true}');\n`;
        }
        
        // Create 1 Officer
        const first = sName;
        const last = officerRank;
        const email = `${sName.toLowerCase()}_${watch.toLowerCase()}_${officerRank.toLowerCase()}@fireandemergency.nz`;
        sql += `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights, is_active, qualifications) VALUES ('${first}', '${last}', '${email}', ${station.id}, '${watch}', '${officerRank}', 0, 0, 0, 0, 0, 0, true, '{"driver": true, "not_rookie": true, "type4": true, "prt": true}');\n`;
    });
});

fs.writeFileSync('reseed_firefighters.sql', sql);
console.log('reseed_firefighters.sql generated.');
