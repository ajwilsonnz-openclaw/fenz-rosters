import { supabase } from '@/lib/supabase';
import { canDoOT, runAllocationEngine } from './allocation-engine-v2';
import { sendPushNotification } from '@/lib/notifications';

/**
 * TRIGGER GLOBAL RERUN
 * Server-only service to handle the "Wipe and Restart" orchestration.
 */
export async function triggerGlobalRerun(date: string, shift: 'Day' | 'Night') {
    console.log(`--- [HARSH RERUN] Restarting Allocation for ${date} [${shift}] ---`);

    const { data: currentOffers } = await supabase
        .from('ot_offers')
        .select('*, ot_requests!inner(date, shift_type), firefighters(id, email)')
        .eq('ot_requests.date', date)
        .eq('ot_requests.shift_type', shift)
        .in('status', ['sent', 'accepted']);

    if (currentOffers && currentOffers.length > 0) {
        for (const offer of currentOffers) {
            if (offer.status === 'accepted') {
                await sendPushNotification(
                    offer.firefighter_id,
                    'Roster Update',
                    'Your accepted shift is being re-optimized. You may receive a new offer shortly.'
                );
            }
        }
        const offerIds = currentOffers.map(o => o.id);
        await supabase.from('ot_offers').update({ status: 'withdrawn' }).in('id', offerIds);
        
        const reqIds = Array.from(new Set(currentOffers.map(o => o.ot_request_id)));
        await supabase.from('ot_assignments').delete().in('ot_request_id', reqIds);
    }

    const assignments = await runAllocationEngine(date, shift);
    
    if (assignments && assignments.length > 0) {
        for (const a of assignments) {
            await supabase.from('ot_offers').insert({
                ot_request_id: a.req.id,
                firefighter_id: a.ff.id,
                status: 'sent',
                offered_at: new Date().toISOString(),
                metadata: a.metadata
            });

            await sendPushNotification(
                a.ff.id,
                'New OT Offer',
                `New offer for ${a.req.stations.name}`
            );
        }
    }
}

/**
 * HANDLE OFFER RESPONSE
 * Server-only service to check for round completion.
 */
export async function handleOfferResponse(offerId: number, response: 'accepted' | 'declined') {
    const { data: offer } = await supabase.from('ot_offers')
        .update({ status: response, responded_at: new Date().toISOString() })
        .eq('id', offerId)
        .select('*, ot_requests!inner(*)')
        .single();
        
    if (!offer) return;

    const req = offer.ot_requests;

    if (response === 'accepted') {
        // 1. Create the confirmed assignment
        await supabase.from('ot_assignments').insert({
            ot_request_id: offer.ot_request_id,
            firefighter_id: offer.firefighter_id,
            status: 'accepted',
            distance_km: offer.metadata?.distance_km || 0,
            assigned_at: offer.offered_at,
            accepted_at: new Date().toISOString(),
            callback_type: offer.metadata?.cascadePhase,
            must_might_wont: offer.metadata?.must_might_wont || 'must'
        });

        // 2. Update the request count and status
        const newFilled = (req.number_filled || 0) + 1;
        await supabase.from('ot_requests').update({ 
            number_filled: newFilled,
            status: newFilled >= (req.number_of_slots || 1) ? 'filled' : 'pending'
        }).eq('id', offer.ot_request_id);
    }

    const { data: pending } = await supabase.from('ot_offers')
        .select('id, ot_requests!inner(date, shift_type)')
        .eq('ot_requests.date', req.date)
        .eq('ot_requests.shift_type', req.shift_type)
        .eq('status', 'sent');

    if (!pending || pending.length === 0) {
        const { data: declines } = await supabase.from('ot_offers')
            .select('id, ot_requests!inner(date, shift_type)')
            .eq('ot_requests.date', req.date)
            .eq('ot_requests.shift_type', req.shift_type)
            .eq('status', 'declined');

        if (declines && declines.length > 0) {
            await triggerGlobalRerun(req.date, req.shift_type);
        }
    }
}
