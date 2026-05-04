import { supabase } from '../../../lib/supabase';

const TEST_USERS = [
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
    console.log('--- SETTING UP MATRIX AVAILABILITY ---');
    const targetDate = '2026-05-15';

    // Get FF IDs
    const { data: ffs } = await supabase.from('firefighters').select('id, email').in('email', TEST_USERS);
    if (!ffs) return;

    console.log(`Setting ${ffs.length} users to Available for ${targetDate}...`);

    for (const ff of ffs) {
        // Clear old availability
        await supabase.from('availability').delete().eq('firefighter_id', ff.id).eq('date', targetDate);
        
        // Insert new available status
        await supabase.from('availability').insert({
            firefighter_id: ff.id,
            date: targetDate,
            shift_type: 'Day',
            preferences: { stations: [] }
        });
    }

    console.log('Availability ready!');
}

main();
