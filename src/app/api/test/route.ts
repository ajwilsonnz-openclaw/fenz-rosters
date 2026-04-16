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
const SCENARIO_CONFIG = {
  id: 'waitemata-day',
  name: 'Waitemata Day — 5 Stations',
  date: '2026-04-10',
  shift: 'Day' as const,
  stations: [
    { stationName: 'Albany', slots: 3, specialist: null },
    { stationName: 'Devonport', slots: 2, specialist: null },
    { stationName: 'Silverdale', slots: 2, specialist: null },
    { stationName: 'Takapuna', slots: 2, specialist: null },
    { stationName: 'East Coast Bays', slots: 2, specialist: null },
  ],
};

// Known-result test: Simple 1-station, 2-slot scenario
// On 2026-04-10: Blue=#1 callback, Green=Off(no CB)
// Expected: 2 Blue callback FF assigned, sorted by lowest OT then distance
const KNOWN_RESULT_SIMPLE = {
  id: 'known-result-simple',
  name: 'Known Result — Albany 2-slot',
  date: '2026-04-10',
  shift: 'Day' as const,
  stations: [
    { stationName: 'Albany', slots: 2, specialist: null },
  ],
  expectedAssignments: [
    { name: 'Zoe Fletcher', watch: 'Blue', threshold: 'must', reason: 'Blue CB FF, Albany→Albany 0km, cbD=1 (tied lowest)' },
    { name: 'Marama Te Awa', watch: 'Blue', threshold: 'must', reason: 'Blue CB FF, Henderson→Albany 19km, cbD=1 (tied lowest, nearest after Zoe)' },
  ],
};

// Complex known-result: 3 stations, specialist requirement, cross-phase allocation
// Tests: callback district restriction, specialist qualification filtering,
//        cross-station assignedIds tracking
//
// Seed OT data (Blue Waitemata FF-rank, cbD values):
//   Zoe Fletcher     (FF,  Albany,     cbD=1, prt)
//   Marama Te Awa    (QFF, Henderson,  cbD=1, prt)
//   Kate Sullivan    (SFF, Silverdale, cbD=2, prt+type4)
//   Tipene Rata      (QFF, Devonport,  cbD=3)
//
// Station processing order:
//   1. Albany (2 slots, no spec) → cbD sort: Zoe(1,0km)+Marama(1,19km) [tied, distance breaks]
//   2. Silverdale (1 slot, prt)  → remaining with prt: Kate(Silverdale→0km, cbD=2)
//   3. Takapuna (1 slot, no spec)→ remaining: Tipene(Devonport→15km, cbD=3)
const KNOWN_RESULT_COMPLEX = {
  id: 'known-result-complex',
  name: 'Known Result — 3 Stations + Specialist',
  date: '2026-04-10',
  shift: 'Day' as const,
  stations: [
    { stationName: 'Albany', slots: 2, specialist: null },
    { stationName: 'Silverdale', slots: 1, specialist: 'prt' },
    { stationName: 'Takapuna', slots: 1, specialist: null },
  ],
  expectedAssignments: [
    { name: 'Zoe Fletcher', station: 'Albany', watch: 'Blue', phase: 'ff-callback', reason: 'Blue CB FF, Albany→Albany 0km, cbD=1' },
    { name: 'Marama Te Awa', station: 'Albany', watch: 'Blue', phase: 'ff-callback', reason: 'Blue CB FF, Henderson→Albany 19km, cbD=1' },
    { name: 'Kate Sullivan', station: 'Silverdale', watch: 'Blue', phase: 'ff-callback', reason: 'Blue CB FF, Silverdale→Silverdale 0km, cbD=2, has prt' },
    { name: 'Tipene Rata', station: 'Takapuna', watch: 'Blue', phase: 'ff-callback', reason: 'Blue CB FF, Devonport→Takapuna 15km, cbD=3' },
  ],
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
  // Blue = Before Day1 + Callback, Green = Non-Callback
  if (watch === 'Blue' && callback === '#1-BeforeDay1') {
    return { label: 'Before Day 1 (Callback)', eligible: true, reason: 'Blue #1 — eligible for Callback pool' };
  }
  if (callback) {
    return { label: `On Duty (${callback})`, eligible: true, reason: `Callback: ${callback}` };
  }
  if (watch === 'Green' && shift === 'Off') {
    return { label: 'Non-Callback', eligible: true, reason: 'Green Off — eligible for Non-Callback pool' };
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
  traceLogs?: any[];
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

      // Fix trace log mismatch: record steal events in both stations' traces
      if (!spec.traceLogs) spec.traceLogs = [];
      spec.traceLogs.push({ phase: 'specialist-steal', logs: [{
        type: 'assign', message: `STOLEN: ${stolen.name} from ${bestSteal.fromStation.stationName}`,
        detail: `${stolen.watch} | needs ${spec.specialist} | dist=${bestSteal.dist}km`
      }]});
      if (!bestSteal.fromStation.traceLogs) bestSteal.fromStation.traceLogs = [];
      bestSteal.fromStation.traceLogs.push({ phase: 'specialist-steal', logs: [{
        type: 'skip', message: `LOST: ${stolen.name} stolen by ${spec.stationName}`,
        detail: `Required ${spec.specialist} qualification`
      }]});
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
      // NOTE: Do NOT wipe qualifications — they come from seed data and should persist
      return NextResponse.json({ success: true, message: 'OT counts reset' });
    }

    // Select scenario based on request body
    const scenarioId = body.scenario || 'default';
    const scenarioMap: Record<string, { id: string; name: string; date: string; shift: 'Day' | 'Night'; stations: { stationName: string; slots: number; specialist: string | null }[]; expectedAssignments?: { name: string }[] }> = {
      'default': SCENARIO_CONFIG,
      'known-result': KNOWN_RESULT_SIMPLE,
      'known-result-simple': KNOWN_RESULT_SIMPLE,
      'known-result-complex': KNOWN_RESULT_COMPLEX,
    };
    const SCENARIO = scenarioMap[scenarioId] || SCENARIO_CONFIG;
    const expectedAssignments = SCENARIO.expectedAssignments || null;

    const date = parseNzDate(SCENARIO.date);
    await pool.query('TRUNCATE ot_assignments, ot_requests, allocation_runs CASCADE');
    await pool.query('UPDATE firefighters SET want_to_work_day = true, want_to_work_night = true');

    // Resolve station IDs and districts by name
    const stationIdMap: Record<string, number> = {};
    const stationDistrictMap: Record<string, string> = {};
    for (const sc of SCENARIO.stations) {
      const res = await pool.query(
        'SELECT s.id, a.name as district FROM stations s JOIN areas a ON s.area_id = a.id WHERE s.name = $1',
        [sc.stationName]
      );
      if (res.rows.length === 0) throw new Error(`Station "${sc.stationName}" not found in DB`);
      stationIdMap[sc.stationName] = res.rows[0].id;
      stationDistrictMap[sc.stationName] = res.rows[0].district;
    }

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
      const stationId = stationIdMap[station.stationName];
      totalSlots += station.slots;

      // Insert OT request
      const otReq = await pool.query(
        `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *`,
        [stationId, date.toISOString().split('T')[0], SCENARIO.shift, station.specialist, station.slots, 'pending']
      );
      const otRequestId = otReq.rows[0].id;

      // FIX #2: record available OT with expanded slots
      for (let s = 0; s < station.slots; s++) {
        availableOvertimes.push({ stationName: station.stationName, slots: 1, specialist: station.specialist, reqId: otRequestId });
      }

      const request = {
        id: otRequestId,
        station_id: stationId,
        station_name: station.stationName,
        station_district: stationDistrictMap[station.stationName],
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

      // DEBUG: collect trace logs
      const traceLogs: any[] = [];
      for (const t of allTraces) {
        traceLogs.push({ phase: t.phase, logs: t.traceLog });
      }

      for (const r of results) assignedIds.add(r.firefighter_id);
      totalAssigned += results.length;
      allTraces.forEach(t => allPhases.add(t.phase));

      stationResults.push({
        stationName: station.stationName,
        stationId: stationId,
        slots: station.slots,
        specialist: station.specialist,
        traceLogs,
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
        cbDays: ff.ot_count_callback_days ?? 0,
        cbNights: ff.ot_count_callback_nights ?? 0,
        ncDays: ff.ot_count_noncallback_days ?? 0,
        ncNights: ff.ot_count_noncallback_nights ?? 0,
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
      'ff-callback': 1, 'ff-noncallback': 2, 'ood-ff-callback': 3, 'ood-ff-noncallback': 4,
      'so-callback': 5, 'sso-callback': 6, 'so-noncallback': 7, 'sso-noncallback': 8,
      'specialist-steal': 9, unassigned: 98, locked_out: 99,
    };

    allFirefightersDetail.sort((a, b) => {
      const aGroup = a.isAssigned ? 0 : (a.isEligible ? 1 : 2);
      const bGroup = b.isAssigned ? 0 : (b.isEligible ? 1 : 2);
      if (aGroup !== bGroup) return aGroup - bGroup;
      const phaseDiff = (PHASE_PRIORITY[a.cascadePhase] || 99) - (PHASE_PRIORITY[b.cascadePhase] || 99);
      if (phaseDiff !== 0) return phaseDiff;
      return (a.otDays + a.otNights) - (b.otDays + b.otNights);
    });

    // Known-result validation
    let knownResultCheck = null;
    if (expectedAssignments) {
      const actualNames = stationResults.flatMap(sr => sr.assignedFirefighters.map(af => af.name));
      const expectedNames = expectedAssignments.map(e => e.name);
      const passed = expectedNames.every((name, idx) => actualNames[idx] === name);
      knownResultCheck = {
        passed,
        expected: expectedAssignments,
        actual: actualNames,
        mismatches: expectedNames.map((name, idx) => ({
          position: idx,
          expected: name,
          actual: actualNames[idx] || '(empty)',
          match: actualNames[idx] === name,
        })).filter(m => !m.match),
      };
    }

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
      ...(knownResultCheck ? { knownResultCheck } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
