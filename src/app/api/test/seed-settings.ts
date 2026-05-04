import { supabase } from '../../../lib/supabase';

const DEFAULT_SETTINGS = [
    { key: 'day_shift_start_time', value: '09:00', description: 'Time the Day round starts' },
    { key: 'night_shift_start_time', value: '21:00', description: 'Time the Night round starts' },
    { key: 'response_window_minutes', value: '60', description: 'Minutes to respond to a round' },
    { key: 'is_engine_active', value: 'true', description: 'Global engine master switch' },
    // Firefighter Callback Issuing Schedule
    { key: 'ff_cb1_issue_day', value: 'N2', description: 'Day to issue FF CB#1' },
    { key: 'ff_cb2a_issue_day', value: 'D1', description: 'Day to issue FF CB#2a' },
    { key: 'ff_cb2b_issue_day', value: 'D1', description: 'Day to issue FF CB#2b' },
    { key: 'ff_cb3_issue_day', value: 'N1', description: 'Day to issue FF CB#3' },
    // Officer Callback Issuing Schedule
    { key: 'off_cb1_issue_day', value: 'N2', description: 'Day to issue Off CB#1' },
    { key: 'off_cb2a_issue_day', value: 'D1', description: 'Day to issue Off CB#2a' },
    { key: 'off_cb2b_issue_day', value: 'D1', description: 'Day to issue Off CB#2b' },
    { key: 'off_cb3_issue_day', value: 'N1', description: 'Day to issue Off CB#3' }
];

async function seed() {
    console.log('Seeding system settings...');
    
    // Cleanup old keys
    const oldKeys = ['ff_day_issue_day', 'ff_night_issue_day', 'off_day_issue_day', 'off_night_issue_day'];
    for (const key of oldKeys) {
        await supabase.from('system_settings').delete().eq('key', key);
    }

    for (const setting of DEFAULT_SETTINGS) {
        const { data: existing } = await supabase.from('system_settings').select('id').eq('key', setting.key).single();
        if (!existing) {
            console.log(`Inserting ${setting.key}...`);
            await supabase.from('system_settings').insert(setting);
        } else {
            console.log(`${setting.key} already exists.`);
        }
    }
    console.log('Done!');
}

seed();
