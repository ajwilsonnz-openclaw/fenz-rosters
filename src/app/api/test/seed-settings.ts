import { supabase } from '../../../lib/supabase';

const DEFAULT_SETTINGS = [
    { key: 'engine_start_time', value: '09:00', description: 'Time the first round starts' },
    { key: 'response_window_minutes', value: '60', description: 'Minutes to respond to a round' },
    { key: 'max_rounds', value: '5', description: 'Max re-runs per batch' },
    { key: 'stability_weight', value: '80', description: 'Preference for existing accepted offers (0-100)' },
    { key: 'is_engine_active', value: 'true', description: 'Global engine master switch' }
];

async function seed() {
    console.log('Seeding system settings...');
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
