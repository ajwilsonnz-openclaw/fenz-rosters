import { supabase } from '../../../lib/supabase';

async function main() {
    console.log('--- CREATING TEST SCENARIO ---');

    // 1. Get real station IDs
    const { data: stations } = await supabase.from('stations').select('id, name').limit(3);
    if (!stations || stations.length < 3) {
        console.error('Not enough stations found in DB.');
        return;
    }

    const futureDate = '2026-05-15';
    
    // 2. Create OT Requests
    const requests = [
        { 
            station_id: stations[0].id, 
            date: futureDate, 
            shift_type: 'Day', 
            specialist_type: 'FF', 
            number_of_slots: 1,
            status: 'pending'
        },
        { 
            station_id: stations[1].id, 
            date: futureDate, 
            shift_type: 'Day', 
            specialist_type: 'SO', 
            number_of_slots: 1,
            status: 'pending'
        },
        { 
            station_id: stations[2].id, 
            date: futureDate, 
            shift_type: 'Day', 
            specialist_type: 'FF', 
            number_of_slots: 1,
            status: 'pending'
        }
    ];

    console.log('Inserting OT requests...');
    const { data: reqs, error } = await supabase.from('ot_requests').insert(requests).select();
    
    if (error) {
        console.error('Error creating requests:', error);
        return;
    }

    console.log(`Created ${reqs.length} OT requests for ${futureDate} at ${stations.map(s => s.name).join(', ')}.`);
}

main();
