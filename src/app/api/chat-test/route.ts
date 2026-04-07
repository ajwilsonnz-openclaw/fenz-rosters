import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getShift, getCallbackType, getShiftStatus } from '@/engine/watch-math';
import { loadAllFirefighters, loadDistanceMatrix, allocateForOTRequest } from '@/engine/allocation-engine';
import { buildCascadeDebugTrace } from '@/engine/allocation-debug';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function computeWatchMatrix(date: Date, requestShiftType: 'Day' | 'Night') {
  const watches = ['Green', 'Red', 'Brown', 'Blue'];
  return watches.map((watch) => {
    const shift = getShift(watch as any, date);
    const callback = getCallbackType(watch as any, date);
    const shiftStatus = getShiftStatus(watch as any, date);
    let eligible = false;
    let reason = '';
    if (shiftStatus.includes('On Leave')) { eligible = false; reason = 'On Leave'; }
    else if (shift === 'Off' && !callback) { reason = 'Off duty, non-callback'; }
    else if (callback === '#2a-EveningDay2' && requestShiftType === 'Day') { reason = '#2a excluded for Day'; }
    else if (requestShiftType === 'Day' && callback === '#3-AfterLastNight') { reason = '#3 night-only'; }
    else if (requestShiftType === 'Day' && callback === '#2b-DayOfNight1') { reason = '#2b night-only'; }
    else if (requestShiftType === 'Day' && shift === 'Night') { reason = 'Night shift, not Day'; }
    else if (requestShiftType === 'Night' && shift === 'Day' && !callback) { reason = 'Day shift, not Night'; }
    else if (!callback && shift !== 'Off') { reason = 'Regular working shift, non-callback'; }
    else { eligible = true; reason = 'Eligible'; }
    return { watch, shift: shiftStatus, onLeave: shiftStatus.includes('On Leave'), callback, eligible, reason };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, shift, stationId, slots, specialist }: { date: string; shift: 'Day' | 'Night'; stationId: number; slots: number; specialist?: string } = body;

    if (!date || !shift || !stationId || !slots) {
      return NextResponse.json({ error: 'Missing required fields: date, shift, stationId, slots' }, { status: 400 });
    }

    // Clean slate for single scenario
    await pool.query('TRUNCATE ot_count_log, ot_assignments, ot_requests, allocation_runs CASCADE');
    await pool.query('UPDATE firefighters SET ot_count_days = 0, ot_count_nights = 0');
    await pool.query('UPDATE firefighters SET want_to_work_day = true, want_to_work_night = true');

    const dateStr = date;
    const otReq = await pool.query(
      specialist
        ? `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, required_qualification_ids, status, number_of_slots, number_filled)
           VALUES ($1::int, $2::date, $3, $4::varchar, $5::jsonb, 'pending', $6::int, 0) RETURNING id`
        : `INSERT INTO ot_requests (station_id, date, shift_type, status, number_of_slots, number_filled)
           VALUES ($1::int, $2::date, $3, 'pending', $4::int, 0) RETURNING id`,
      specialist
        ? [Number(stationId), dateStr, shift, specialist, JSON.stringify([specialist]), Number(slots)]
        : [Number(stationId), dateStr, shift, Number(slots)]
    );
    const requestId = otReq.rows[0].id;

    const allFirefighters = await loadAllFirefighters();
    const distances = await loadDistanceMatrix();
    const assignedThisRun = new Set<number>();

    const otRequest = {
      id: Number(requestId),
      station_id: Number(stationId),
      station_name: '',
      station_district: null,
      area_id: 1,
      date,
      shift_type: shift,
      specialist_type: specialist || null,
      required_qualification_ids: specialist ? [specialist] : [],
      status: 'pending',
      number_of_slots: Number(slots),
      number_filled: 0,
    };

    const { results, allTraces } = await allocateForOTRequest(otRequest, allFirefighters, distances, assignedThisRun);
    const debugTrace = await buildCascadeDebugTrace(allFirefighters, distances, { date, shift_type: shift, station_id: Number(stationId), number_of_slots: Number(slots) });

    const actualPhases = results.map((r: any) => r.cascade_phase || 'callback');
    const uniquePhases = [...new Set(actualPhases)];
    const watchMatrix = computeWatchMatrix(parseDateStr(date), shift);

    return NextResponse.json({
      id: `custom-${date}-${shift}`,
      name: `${shift} ${date}`,
      passed: true,
      assignmentsCount: results.length,
      expectedSlots: Number(slots),
      assigned: results.map((r: any) => ({
        name: r.firefighter_name,
        watch: r.watch,
        rank: r.rank,
        threshold: r.must_might_wont,
        distance: r.distance_km,
        cascadePhase: r.cascade_phase || 'callback',
      })),
      allFirefightersDetail: debugTrace.candidates,
      watchMatrix,
      debugTrace,
      phasesUsed: uniquePhases,
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
