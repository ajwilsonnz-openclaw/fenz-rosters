import { config } from 'dotenv';
config({ path: '.env.local' });
import { supabase } from './src/lib/supabase';

async function main() {
    console.log('--- TESTING DISTANCE FOR ADAM WILSON ---');

    // 1. Find Adam Wilson
    const { data: adam, error: err1 } = await supabase.from('firefighters').select('*, stations(*)').ilike('email', '%adam%').single();
    if (err1 || !adam) {
        console.log('Could not find Adam Wilson:', err1);
        return;
    }
    console.log(`Found Adam: ID=${adam.id}, StationID=${adam.station_id}, StationName=${adam.stations?.name}`);

    // 2. Fetch Distances for Adam's station
    const { data: distData, error: err2 } = await supabase.from('station_distances').select('*').eq('station_id', adam.station_id).single();
    if (err2 || !distData) {
        console.log('Could not find station distances for station ID', adam.station_id, ':', err2);
    } else {
        console.log(`Distances for ${adam.stations?.name}:`, distData.distances);
    }

    // 3. Let's fetch ALL station distances to see what keys they use
    const { data: allDist } = await supabase.from('station_distances').select('*').limit(1);
    console.log('Sample of all distances keys (from 1 random station):', JSON.stringify(allDist?.[0]?.distances));

    process.exit(0);
}

main().catch(console.error);
