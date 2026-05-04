import { supabase } from '../../../lib/supabase';
import { runAllocationEngine } from '../../../engine/allocation-engine-v2';

const TEST_EMAILS = [
    'adam.wilson@fireandemergency.nz',
    'matthew.peters@fireandemergency.nz',
    'sarah.jenkins@fireandemergency.nz',
    'james.smith@fireandemergency.nz',
    'emma.brown@fireandemergency.nz',
    'david.wilson@fireandemergency.nz',
    'lisa.taylor@fireandemergency.nz',
    'robert.jones@fireandemergency.nz',
    'emily.davis@fireandemergency.nz',
    'michael.miller@fireandemergency.nz',
    'jessica.wilson@fireandemergency.nz',
    'william.moore@fireandemergency.nz'
];

async function main() {
    console.log('--- STARTING FULL ROUND-BASED TEST ---');
    const targetDate = '2026-05-15';

    // 1. Setup Availability
    console.log('Searching for Matrix users in DB...');
    const { data: ffs } = await supabase.from('firefighters').select('id, email').in('email', TEST_EMAILS);
    
    if (!ffs || ffs.length === 0) {
        console.error('CRITICAL: No matrix users found in database. Check the emails in src/app/api/test/run-full-test.ts');
        return;
    }

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

    // 2. Trigger Engine
    console.log('\n--- TRIGGERING ALLOCATION ENGINE ---');
    try {
        const result = await runAllocationEngine(targetDate, 'Day');
        if (result && Array.isArray(result)) {
            console.log(`\nSUCCESS!`);
            console.log(`Potential assignments found: ${result.length}`);
            console.log('\nCheck your Matrix page now. You should see red badges on the phones.');
        } else {
            console.log('\nEngine ran but no allocations were made. Make sure there are OT requests for 2026-05-15.');
        }
    } catch (err) {
        console.error('\nEngine error:', err);
    }
}

main();
