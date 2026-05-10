import { config } from 'dotenv';
config({ path: '.env.local' });
import { supabase } from './src/lib/supabase';

async function main() {
    console.log('--- DB INSPECTION ---');

    // 1. Fetch Stations
    const { data: stations, error: stErr } = await supabase.from('stations').select('id, name').order('id');
    if (stErr) console.error('Stations Error:', stErr);
    else console.log(`Stations (${stations?.length}):`, stations?.slice(0, 5), '...');

    // 2. Fetch Station Distances
    const { data: dist, error: distErr } = await supabase.from('station_distances').select('*').limit(2);
    if (distErr) console.error('Distances Error:', distErr);
    else console.log('Station Distances (first 2):', JSON.stringify(dist, null, 2));

    process.exit(0);
}

main().catch(console.error);
