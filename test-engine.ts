import { config } from 'dotenv';
config({ path: '.env.local' });
import { supabase } from './src/lib/supabase';
import { runAllocationEngine } from './src/engine/allocation-engine-v2';

async function main() {
    console.log('--- TESTING RUN ENGINE FOR 11TH MAY ---');
    // Assuming shift is Day or Night, let's test Day
    const date = '2026-05-11';
    
    // Create a fake ot_request if none exists
    const { data: req } = await supabase.from('ot_requests').insert({
        date,
        shift_type: 'Day',
        station_id: 1420, // Auckland City
        number_of_slots: 1,
        number_filled: 0,
        specialist_type: 'FF',
        status: 'pending'
    }).select().single();

    if (req) {
        console.log('Created request for Auckland City (1420)');
    }

    const { data: distData } = await supabase.from('station_distances').select('*');
    const distMatrix: Record<number, Record<number, number>> = {};
    distData?.forEach((d: any) => {
        const distObj: Record<number, number> = {};
        const distances = typeof d.distances === 'string' ? JSON.parse(d.distances) : d.distances;
        for (const [targetIdStr, km] of Object.entries(distances)) {
          distObj[Number(targetIdStr)] = Number(km);
        }
        distMatrix[d.station_id] = distObj;
    });

    console.log('DistMatrix for 1485 -> 1420 (Albany to Auckland City):', distMatrix[1485]?.[1420]);
    console.log('DistMatrix keys for 1485:', Object.keys(distMatrix[1485] || {}));

}

main().catch(console.error);
