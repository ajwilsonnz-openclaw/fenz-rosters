import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { getShift, getCallbackType, getShiftStatus } from '@/engine/watch-math';
import {
  loadAllFirefighters,
  loadDistanceMatrix,
  allocateForOTRequest,
  type Firefighter,
  type DistanceMatrix,
  type AllocationResult,
} from '@/engine/allocation-engine';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ━━━ SINGLE MULTI-STATION SCENARIO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SCENARIO = {
  id: 'waitemata-day',
  name: 'Waitemata Day — 6 Stations',
  date: '2026-04-10',
  shift: 'Day' as const,
  stations: [
    { stationId: 1175, stationName: 'Albany', slots: 3, specialist: null },
    { stationId: 1176, stationName: 'Devonport', slots: 2, specialist: null },
    { stationId: 1178, stationName: 'Silverdale', slots: 2, specialist: 'prt' },
    { stationId: 1181, stationName: 'Takapuna', slots: 2, specialist: null },
    { stationId: 1197, stationName: 'Henderson', slots: 2, specialist: 'prt' },
    { stationId: 1200, stationName: 'Te Atatu', slots: 2, specialist: 'type4' },
  ] as const,
};

// ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseNzDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Human-friendly status labels for watch matrix */
function getHumanStatus(watch: string, shift: string, callback: string | null, shiftStatus: string, requestShiftType: string): { label: string; eligible: boolean; reason: string } {
  if (shiftStatus.includes('On Leave')) {
    return { label: 'On Leave', eligible: false, reason: 'On Leave' };
  }
  if (callback === '#2a-EveningDay2' && requestShiftType === 'Day') {
    return { label: 'Callback #2a', eligible: false, reason: '#2a EveningDay2 excludes Day' };
  }
  if (requestShiftType === 'Day' && callback === '#3-AfterLastNight') {
    return { label: 'Night Between', eligible: false, reason: 'Between Nights — Day OT excluded' };
  }
  if (requestShiftType === 'Night' && callback === '#2b-DayOfNight1') {
    return { label: 'Day Between', eligible: false, reason: 'Between Days — Night OT excluded' };
  }
  // FIX #1: Blue/#1 = "Before Day1" (Callback pool), Green/Off = "Non-Callback"
  if (callback === '#1-BeforeDay1') {
    return { label: 'Before Day 1', eligible: true, reason: 'Callback #1 — eligible for Callback pool' };
  }
  if (callback) {
    return { label: `On Duty (${callback})`, eligible: true, reason: `Callback: ${callback}` };
  }
  if (shift === 'Off') {
    return { label: 'Non-Callback', eligible: true, reason: 'Off duty — eligible for Non-Callback pool' };
  }
  if (shift === 'Day') {
    return { label: 'On Duty', eligible: true, reason: 'Day shift' };
  }
  if (shift === 'Night') {
    return { label: 'Night Shift', eligible: false, reason: 'Night shift' };
  }
  return { label: 'On Duty', eligible: true, reason: 'Off duty (available)' };
}

function computeWatchMatrix(date: Date, requestShiftType: 'Day' | 'Night') {
  const watches = ['Green', 'Red', 'Brown', 'Blue'] as const;
  return watches.map((watch) => {
    const shift = getShift(watch, date);
    const callback = getCallbackType(watch, date);
    const shiftStatus = getShiftStatus(watch, date);
    const { label, eligible, reason } = getHumanStatus(watch, shift, callback, shiftStatus, requestShiftType);
    return { watch, shift, statusLabel: label, onLeave: shiftStatus.includes('On Leave'), callback, eligible, reason };
  });
}

// ━━━ Specialist station lookup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StationRow {
  id: number;
  name: string;
  district: string | null;
}

/** Auto-qualify any FF for their home station's specialist type */
async function loadAndApplyHomeStationQuals(firefighters: Firefighter[]): Promise<void> {
  const { rows } = await pool.query('SELECT id, specialist_type FROM stations WHERE specialist_type IS NOT NULL');
  const stationSpecTypes: Record<number, string> = {};
  for (const r of rows) {
    stationSpecTypes[r.id] = r.specialist_type;
  }
  for (const ff of firefighters) {
    const homeSpec = stationSpecTypes[ff.station_id];
    if (homeSpec && !ff.qualifications[homeSpec]) {
      ff.qualifications[homeSpec] = true;
    }
  }
}

// ━━━ Specialist steal logic ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StationResult {
  stationName: string;
  stationId: number;
  slots: number;
  specialist: string | null;
  assignedFirefighters: {
    name: string; id: number; watch: string; rank: string;
    threshold: string; distance: number; homeStation: string;
    cascadePhase: string; callback: string | null;
    qualifications: string[];
    stolenFrom?: string;
  }[];
  phasesUsed: string[];
}

/**
 * After the cascade pass, check if any specialist stations are short.
 * Steal the closest-in-distance qualified firefighter from any other station
 * that is NOT a specialist station, AND where the donor station would still
 * have at least 1 firefighter left.
 */
function stealForSpecialists(
  stationResults: StationResult[],
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
): void {
  const specialistStations = stationResults.filter(sr => sr.specialist);
  for (const spec of specialistStations) {
    while (spec.assignedFirefighters.length < spec.slots) {
      let bestSteal: { fromStation: StationResult; ffIdx: number; dist: number } | null = null;

      for (const donor of stationResults) {
        if (donor.stationId === spec.stationId) continue;
        if (donor.assignedFirefighters.length <= 1) continue;
        if (donor.specialist) continue;

        for (let j = 0; j < donor.assignedFirefighters.length; j++) {
          const af = donor.assignedFirefighters[j];
          const ff = allFirefighters.find(f => f.id === af.id);
          if (!ff) continue;
          if (spec.specialist && !ff.qualifications?.[spec.specialist]) continue;

          const dist = distanceMatrix[ff.station_id]?.[spec.stationId] ?? 999;
          if (!bestSteal || dist < bestSteal.dist) {
            bestSteal = { fromStation: donor, ffIdx: j, dist };
          }
        }
      }

      if (!bestSteal) break;

      const stolen = bestSteal.fromStation.assignedFirefighters.splice(bestSteal.ffIdx, 1)[0];
      spec.assignedFirefighters.push({
        ...stolen,
        cascadePhase: 'specialist-steal',
        stolenFrom: bestSteal.fromStation.stationName,
      });
    }
  }
}

// ━━━ Fix #3: Cross-station OOD tracker (1 per watch total) ━━━━━━━━━━━━
// Populated in the test route and passed to allocateForOTRequest

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.action === 'reset_ot_counts') {
      await pool.query('UPDATE firefighters SET ot_count_days = 0, ot_count_nights = 0, ot_count_callback_days = 0, ot_count_callback_nights = 0, ot_count_noncallback_days = 0, ot_count_noncallback_nights = 0');
      await pool.query('TRUNCATE ot_assignments, ot_requests, allocation_runs CASCADE');
      await pool.query(`UPDATE firefighters SET qualifications = '{}' WHERE station_id IN (SELECT id FROM stations WHERE district != 'Waitemata')`);
      return NextResponse.json({ success: true, message: 'OT counts reset' });
    }

    const date = parseNzDate(SCENARIO.date);
    await pool.query('TRUNCATE ot_assignments, ot_requests, allocation_runs CASCADE');
    await pool.query('UPDATE firefighters SET want_to_work_day = true, want_to_work_night = true');

    // NOTE: OOD qualification overrides removed — engine now relies on seed data qualifications only.
    // Home-station specialist quals are applied below.
    const allFirefighters = await loadAllFirefighters();
    // FIX #5: Auto-qualify FF for home station specialist type
    await loadAndApplyHomeStationQuals(allFirefighters);

    const distanceMatrix = await loadDistanceMatrix();
    const assignedIds = new Set<number>();

    const watchMatrix = computeWatchMatrix(date, SCENARIO.shift);

    const stationResults: StationResult[] = [];
    let totalAssigned = 0;
    let totalSlots = 0;
    const allPhases = new Set<string>();

    // FIX #2: Collect all "Available Overtimes" — expanded per slot
    const availableOvertimes: { stationName: string; slots: number; specialist: string | null; reqId: number }[] = [];

    for (const station of SCENARIO.stations) {
      totalSlots += station.slots;

      // Insert OT request
      const otReq = await pool.query(
        `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *`,
        [station.stationId, date.toISOString().split('T')[0], SCENARIO.shift, station.specialist, station.slots, 'pending']
      );
      const otRequestId = otReq.rows[0].id;

      // FIX #2: record available OT with expanded slots
      for (let s = 0; s < station.slots; s++) {
        availableOvertimes.push({ stationName: station.stationName, slots: 1, specialist: station.specialist, reqId: otRequestId });
      }

      const request = {
        id: otRequestId,
        station_id: station.stationId,
        station_name: station.stationName,
        station_district: null as string | null,
        area_id: 1,
        date: date.toISOString().split('T')[0],
        shift_type: SCENARIO.shift as 'Day' | 'Night',
        specialist_type: station.specialist,
        required_qualification_ids: [] as string[],
        status: 'pending',
        number_of_slots: station.slots,
        number_filled: 0,
      };

      const { results, allTraces } = await allocateForOTRequest(
        request, allFirefighters, distanceMatrix, assignedIds
      );

      for (const r of results) assignedIds.add(r.firefighter_id);
      totalAssigned += results.length;
      allTraces.forEach(t => allPhases.add(t.phase));

      stationResults.push({
        stationName: station.stationName,
        stationId: station.stationId,
        slots: station.slots,
        specialist: station.specialist,
        assignedFirefighters: results.map(r => {
          const ff = allFirefighters.find(f => f.id === r.firefighter_id);
          return {
            name: r.firefighter_name, id: r.firefighter_id,
            watch: r.watch, rank: r.rank, threshold: r.must_might_wont,
            distance: r.distance_km, homeStation: ff?.station_name || '?',
            cascadePhase: r.cascade_phase, callback: r.callback_type,
            qualifications: ff ? Object.keys(ff.qualifications).filter(k => ff.qualifications[k]) : [],
          };
        }),
        phasesUsed: allTraces.map(t => t.phase),
      });
    }

    // Specialist steal pass
    stealForSpecialists(stationResults, allFirefighters, distanceMatrix);

    totalAssigned = stationResults.reduce((sum, sr) => sum + sr.assignedFirefighters.length, 0);

    // Build assignment map
    const assignmentMap = new Map<number, {
      stationName: string; distance: number; cascadePhase: string; callback: string | null;
      threshold: string; quals: string[]; stolenFrom?: string;
    }>();
    for (const sr of stationResults) {
      for (const af of sr.assignedFirefighters) {
        assignmentMap.set(af.id, {
          stationName: sr.stationName, distance: af.distance,
          cascadePhase: af.cascadePhase, callback: af.callback,
          threshold: af.threshold, quals: af.qualifications, stolenFrom: af.stolenFrom,
        });
      }
    }

    const allFirefightersDetail = allFirefighters.map(ff => {
      const shift = getShift(ff.watch, date);
      const callback = getCallbackType(ff.watch, date);
      const shiftStatus = getShiftStatus(ff.watch, date);
      const assignment = assignmentMap.get(ff.id);
      const isAssigned = !!assignment;
      const qualifications = Object.keys(ff.qualifications).filter(k => ff.qualifications[k]);

      let eligible = true;
      let cascadePhase = assignment?.cascadePhase || 'unassigned';
      if (shiftStatus.includes('On Leave')) {
        eligible = false; cascadePhase = 'locked_out';
      } else if (callback === '#3-AfterLastNight' && SCENARIO.shift === 'Day') {
        eligible = false; cascadePhase = 'locked_out';
      } else if (callback === '#2a-EveningDay2' && SCENARIO.shift === 'Day') {
        eligible = false; cascadePhase = 'locked_out';
      } else if (shift === 'Night' && !callback) {
        eligible = false; cascadePhase = 'locked_out';
      }

      const dist = assignment?.distance || 0;

      return {
        id: ff.id,
        name: `${ff.first_name} ${ff.last_name}`,
        watch: ff.watch,
        rank: ff.rank,
        homeStation: ff.station_name,
        otStation: assignment?.stationName || '—',
        distance: dist,
        otDays: ff.ot_count_days,
        otNights: ff.ot_count_nights,
        ncOtDays: ff.ot_count_noncallback_days,
        ncOtNights: ff.ot_count_noncallback_nights,
        isAssigned,
        isEligible: eligible,
        cascadePhase,
        callback: assignment?.callback || callback || null,
        quals: qualifications,
        stolenFrom: assignment?.stolenFrom || null,
        threshold: assignment?.threshold || '—',
      };
    });

    // Sort: Assigned first → Eligible unassigned → Ineligible
    const PHASE_PRIORITY: Record<string, number> = {
      callback: 1, 'non-callback': 2, 'out-of-district': 3,
      'specialist-steal': 3, SO: 4, SSO: 5, unassigned: 98, locked_out: 99,
    };

    allFirefightersDetail.sort((a, b) => {
      const aGroup = a.isAssigned ? 0 : (a.isEligible ? 1 : 2);
      const bGroup = b.isAssigned ? 0 : (b.isEligible ? 1 : 2);
      if (aGroup !== bGroup) return aGroup - bGroup;
      const phaseDiff = (PHASE_PRIORITY[a.cascadePhase] || 99) - (PHASE_PRIORITY[b.cascadePhase] || 99);
      if (phaseDiff !== 0) return phaseDiff;
      return (a.otDays + a.otNights) - (b.otDays + b.otNights);
    });

    return NextResponse.json({
      id: SCENARIO.id,
      name: SCENARIO.name,
      date: SCENARIO.date,
      shift: SCENARIO.shift,
      watchMatrix,
      totalSlots,
      totalAssigned,
      stationResults,
      allFirefightersDetail,
      phasesUsed: Array.from(allPhases),
      availableOvertimes,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
