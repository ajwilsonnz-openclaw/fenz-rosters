import { supabase } from '@/lib/supabase';
import { getCycleIndex, getShift, canDoOT, Watch } from './watch-math';
import webPush from 'web-push';

// Configure Web Push if keys are present
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:test@fireandemergency.nz',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// --- RESTORED TYPES FOR COMPATIBILITY ---
export interface OTRequest {
  id: number;
  station_id: number;
  station_name?: string;
  district: string;
  date: string;
  shift_type: 'Day' | 'Night';
  slots: number;
  specialist_type: string | null;
  required_rank: string;
  required_qualifications: string[];
}

export interface Firefighter {
  id: number;
  first_name: string;
  last_name: string;
  rank: string;
  watch: Watch;
  station_id: number;
  station_name: string;
  district: string;
  area_id: number;
  qualifications: Record<string, boolean>;
  ot_count_days: number;
  ot_count_nights: number;
  preferences: {
    districts: string[];
    stations: number[];
  };
}

export type DistanceMatrix = Record<number, Record<number, number>>;

export { canDoOT };

// --- RESTORED ALLOCATE V2 FOR COMPATIBILITY ---
export async function allocateV2(
    requests: OTRequest[],
    firefighters: Firefighter[],
    distances: DistanceMatrix,
    busyFFs: Set<number> = new Set(),
    exclusions: Record<number, Set<number>> = {},
    availableFFMap?: Map<number, Set<string>>
  ) {
    const results = [];
  
    for (const req of requests) {
      const candidates = firefighters.filter(ff => {
        if (busyFFs.has(ff.id)) return false;
        if (exclusions[req.id]?.has(ff.id)) return false;
        
        // Check availability
        if (availableFFMap && !availableFFMap.has(ff.id)) return false;
        
        // Basic match
        return ff.rank === req.required_rank || (req.required_rank === 'SO_OR_SSO' && (ff.rank === 'SO' || ff.rank === 'SSO'));
      });
  
      const sorted = candidates.sort((a, b) => {
        const aDist = distances[a.station_id]?.[req.station_id] || 999;
        const bDist = distances[b.station_id]?.[req.station_id] || 999;
        return aDist - bDist;
      });
  
      results.push({
        requestId: req.id,
        station_name: req.station_name,
        assignedFirefighters: sorted.slice(0, req.slots).map(f => ({
          firefighter_id: f.id,
          name: `${f.first_name} ${f.last_name}`,
          distance: distances[f.station_id]?.[req.station_id] || 0,
          cascadePhase: 'optimal',
          threshold: 'Must'
        }))
      });
    }
  
    return results;
}

// --- HARSH & EFFICIENT ROUND LOGIC ---

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
                const { data: sub } = await supabase.from('push_subscriptions').select('subscription').eq('firefighter_id', offer.firefighter_id).single();
                if (sub?.subscription) {
                    webPush.sendNotification(sub.subscription, JSON.stringify({
                        title: 'Roster Update',
                        body: 'Your accepted shift is being re-optimized. You may receive a new offer shortly.',
                        url: '/offers'
                    })).catch(e => {});
                }
            }
        }
        const offerIds = currentOffers.map(o => o.id);
        await supabase.from('ot_offers').update({ status: 'withdrawn' }).in('id', offerIds);
        const reqIds = Array.from(new Set(currentOffers.map(o => o.ot_request_id)));
        await supabase.from('ot_assignments').delete().in('ot_request_id', reqIds);
    }

    return await runAllocationEngine(date, shift);
}

export async function runAllocationEngine(targetDate: string, targetShift: 'Day' | 'Night') {
    const { data: requests } = await supabase
        .from('ot_requests')
        .select('*, stations(name, district)')
        .eq('date', targetDate)
        .eq('shift_type', targetShift);

    if (!requests || requests.length === 0) return null;

    const { data: firefighters } = await supabase.from('firefighters').select('*').eq('is_active', true);
    if (!firefighters) return null;

    const assignments: any[] = [];
    const usedFFs = new Set<number>();

    for (const req of requests) {
        const eligible = firefighters.filter(ff => {
            if (usedFFs.has(ff.id)) return false;
            return canDoOT(ff, targetDate, targetShift).pass;
        });

        const sorted = eligible.sort((a, b) => {
            const aDist = a.district_id === req.stations.district ? 0 : 1;
            const bDist = b.district_id === req.stations.district ? 0 : 1;
            if (aDist !== bDist) return aDist - bDist;
            return ((targetShift === 'Day' ? a.ot_count_days : a.ot_count_nights) || 0) - ((targetShift === 'Day' ? b.ot_count_days : b.ot_count_nights) || 0);
        });

        const best = sorted[0];
        if (best) {
            assignments.push({ req, ff: best });
            usedFFs.add(best.id);
        }
    }

    for (const a of assignments) {
        await supabase.from('ot_offers').insert({
            ot_request_id: a.req.id,
            firefighter_id: a.ff.id,
            status: 'sent',
            offered_at: new Date().toISOString()
        });

        const { data: sub } = await supabase.from('push_subscriptions').select('subscription').eq('firefighter_id', a.ff.id).single();
        if (sub?.subscription) {
            webPush.sendNotification(sub.subscription, JSON.stringify({
                title: 'New OT Offer',
                body: `New offer for ${a.req.stations.name}`,
                url: '/offers'
            })).catch(e => {});
        }
    }
    return assignments.length;
}

export async function handleOfferResponse(offerId: number, response: 'accepted' | 'declined') {
    const { data: offer } = await supabase.from('ot_offers').update({ status: response }).eq('id', offerId).select('*, ot_requests!inner(date, shift_type)').single();
    if (!offer) return;

    const req = offer.ot_requests;
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