import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
    console.log('--- FIXING DATABASE SCHEMA FOR BATCHING ---');

    // 1. Create ot_batches table
    console.log('Creating ot_batches table...');
    const { error: batchErr } = await supabase.rpc('execute_sql', { 
        sql: `CREATE TABLE IF NOT EXISTS ot_batches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
            date DATE NOT NULL, 
            shift_type TEXT NOT NULL, 
            status TEXT DEFAULT 'active'
        );`
    });

    if (batchErr) {
        console.error('Error creating table. Note: You may need to enable the execute_sql RPC in Supabase.');
        console.error(batchErr);
    }

    // 2. Add batch_id to ot_offers
    console.log('Adding batch_id column to ot_offers...');
    await supabase.rpc('execute_sql', { 
        sql: `ALTER TABLE ot_offers ADD COLUMN IF NOT EXISTS batch_id UUID;`
    });

    console.log('Done! Now try running the God Test again.');
}

main();
