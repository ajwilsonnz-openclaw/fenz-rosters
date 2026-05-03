import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Adjust based on your Supabase client location

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { offerId, action, reason } = body;

        if (!offerId || !action) {
            return NextResponse.json({ success: false, error: 'Missing offerId or action' }, { status: 400 });
        }

        // 1. Fetch the offer and its associated request/firefighter details
        const { data: offer, error: offerErr } = await supabase
            .from('ot_offers')
            .select('*, ot_requests(*), firefighters(*)')
            .eq('id', offerId)
            .single();

        if (offerErr || !offer) {
            throw new Error(offerErr?.message || 'Offer not found');
        }

        // Double check it hasn't expired or already been answered
        if (offer.status !== 'sent') {
            return NextResponse.json({ success: false, error: `Offer is already ${offer.status}` }, { status: 400 });
        }

        const req = Array.isArray(offer.ot_requests) ? offer.ot_requests[0] : offer.ot_requests;
        const ff = Array.isArray(offer.firefighters) ? offer.firefighters[0] : offer.firefighters;

        if (action === 'accept') {
            // --- ACCEPTANCE FLOW ---

            // A. Update Offer Status
            await supabase.from('ot_offers')
                .update({ status: 'accepted', responded_at: new Date().toISOString() })
                .eq('id', offerId);

            // B. Create Official Assignment
            const metadata = offer.metadata || {};
            await supabase.from('ot_assignments').insert({
                ot_request_id: req.id,
                firefighter_id: offer.firefighter_id,
                status: 'accepted',
                distance_km: metadata.distance_km || 0,
                callback_type: metadata.cascadePhase || 'unknown',
                must_might_wont: metadata.must_might_wont || 'must',
                assigned_at: new Date().toISOString(),
                accepted_at: new Date().toISOString()
            });

            // C. Update OT Counters
            const isDay = req.shift_type === 'Day';
            const isCb = metadata.cascadePhase?.includes('cb') || metadata.cascadePhase?.includes('callback');
            const updates: any = {};

            if (isDay) updates.ot_count_days = (ff.ot_count_days || 0) + 1;
            else updates.ot_count_nights = (ff.ot_count_nights || 0) + 1;

            if (isCb) {
                if (isDay) updates.ot_count_callback_days = (ff.ot_count_callback_days || 0) + 1;
                else updates.ot_count_callback_nights = (ff.ot_count_callback_nights || 0) + 1;
            } else {
                if (isDay) updates.ot_count_noncallback_days = (ff.ot_count_noncallback_days || 0) + 1;
                else updates.ot_count_noncallback_nights = (ff.ot_count_noncallback_nights || 0) + 1;
            }

            await supabase.from('firefighters').update(updates).eq('id', ff.id);

            // D. Close the Vacancy (Update number_filled)
            const newFilled = (req.number_filled || 0) + 1;
            const newStatus = newFilled >= req.number_of_slots ? 'allocated' : 'pending';
            await supabase.from('ot_requests')
                .update({ number_filled: newFilled, status: newStatus })
                .eq('id', req.id);

            return NextResponse.json({ success: true, message: 'Shift accepted.' });

        } else if (action === 'decline') {
            // --- DECLINE FLOW ---

            // A. Update Offer Status
            await supabase.from('ot_offers')
                .update({
                    status: 'declined',
                    decline_reason: reason || 'No reason provided',
                    responded_at: new Date().toISOString()
                })
                .eq('id', offerId);

            // B. THE BACKFILL LOOP: Instantly re-trigger the engine for this date/shift
            // Because we just marked the offer as 'declined', the engine's exclusion logic 
            // will automatically skip this firefighter and send the offer to the next person.

            // Make a local fetch call back to our own allocation API
            const baseUrl = request.nextUrl.origin;
            try {
                await fetch(`${baseUrl}/api/allocate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'run_allocation',
                        date: req.date,
                        shift_type: req.shift_type
                    })
                });
                console.log(`[Rejection Loop] Engine spun up for ${req.date} ${req.shift_type} to find replacement.`);
            } catch (triggerErr) {
                console.error('[Rejection Loop] Failed to trigger backend engine:', triggerErr);
                // We don't throw here, because the decline itself was successful.
            }

            return NextResponse.json({ success: true, message: 'Shift declined. Engine re-triggered.' });

        } else {
            return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Offers Respond API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}