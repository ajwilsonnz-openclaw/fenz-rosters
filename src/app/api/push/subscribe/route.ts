import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscription, firefighterId } = body;

        if (!subscription || !firefighterId) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        // Upsert subscription
        const { error } = await supabase.from('push_subscriptions').upsert({
            firefighter_id: firefighterId,
            subscription: subscription,
            created_at: new Date().toISOString()
        }, { onConflict: 'firefighter_id' });

        if (error) {
            console.error("DB Error saving subscription:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Push subscribe error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
