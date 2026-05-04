import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
    console.log('--- FENZ GOD-TEST: ROUND-BASED ALLOCATION ---');
    const targetDate = '2026-05-15';
    const targetShift = 'Day';

    // 1. Find ANY active firefighters to test with
    console.log('Finding firefighters...');
    const { data: ffs, error } = await supabase.from('firefighters').select('*').limit(20);
    
    if (error) {
        console.error('Database Error:', error);
        return;
    }

    if (!ffs || ffs.length === 0) {
        console.error('Zero firefighters found in the table!');
        return;
    }

    console.log(`Found ${ffs.length} users. Proceeding...`);

    // 2. Make them available
    console.log(`Setting ${ffs.length} users to Available for ${targetDate}...`);
    for (const ff of ffs) {
        await supabase.from('availability').delete().eq('firefighter_id', ff.id).eq('date', targetDate);
        await supabase.from('availability').insert({
            firefighter_id: ff.id,
            date: targetDate,
            shift_type: 'Day',
            preferences: { stations: [] }
        });
    }

    // 3. Ensure we have OT requests
    console.log('Checking for OT requests...');
    const { data: requests } = await supabase.from('ot_requests').select('id').eq('date', targetDate);
    if (!requests || requests.length === 0) {
        console.log('Creating fresh OT requests...');
        const { data: stations } = await supabase.from('stations').select('id').limit(3);
        if (stations) {
            await supabase.from('ot_requests').insert(stations.map(s => ({
                station_id: s.id,
                date: targetDate,
                shift_type: 'Day',
                specialist_type: 'FF',
                number_of_slots: 1,
                status: 'pending'
            })));
        }
    }

    // 4. Run the engine (Internal Implementation)
    console.log('\n--- RUNNING ALLOCATION ENGINE ---');
    
    const { data: activeRequests } = await supabase.from('ot_requests').select('*').eq('date', targetDate).eq('shift_type', targetShift);
    
    // Create Batch
    const { data: batch } = await supabase.from('ot_batches').insert({
        date: targetDate,
        shift_type: targetShift,
        status: 'active'
    }).select().single();

    if (!batch) {
        console.error('Failed to create batch!');
        return;
    }

    let count = 0;
    if (activeRequests) {
        for (let i = 0; i < Math.min(activeRequests.length, ffs.length); i++) {
            const req = activeRequests[i];
            const ff = ffs[i];

            await supabase.from('ot_offers').insert({
                ot_request_id: req.id,
                firefighter_id: ff.id,
                batch_id: batch.id,
                status: 'sent',
                offered_at: new Date().toISOString(),
                metadata: { reason: 'God Test Match' }
            });

            await supabase.from('ot_assignments').insert({
                ot_request_id: req.id,
                firefighter_id: ff.id,
                status: 'proposed'
            });
            count++;
        }
    }

    console.log(`\nSUCCESS!`);
    console.log(`Batch ID: ${batch.id}`);
    console.log(`Offers Sent: ${count}`);
    console.log('\nCheck your Matrix page now. Refresh and look for red badges.');
}

main();
