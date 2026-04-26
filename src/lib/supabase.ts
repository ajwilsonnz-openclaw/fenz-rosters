import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.fenz.app';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MzE1MzAzLCJleHAiOjE5MzI5OTUzMDN9.vpjufyjBtmqAidqiRWOkz4N5iTG6q1cca34R5Mtd1XQ';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const getSupabaseAdmin = () => createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
