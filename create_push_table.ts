import { query } from './src/lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createPushTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id SERIAL PRIMARY KEY,
                firefighter_id INTEGER REFERENCES firefighters(id) ON DELETE CASCADE,
                subscription JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_ff_id_idx ON push_subscriptions(firefighter_id);
        `);
        console.log("push_subscriptions table created successfully!");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        process.exit(0);
    }
}

createPushTable();
