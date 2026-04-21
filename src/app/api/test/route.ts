import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { loadAllFirefighters, loadDistanceMatrix, allocateV2, type Firefighter } from '@/engine/allocation-engine-v2';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test scenario — v2 engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SCENARIO = {
  id: 'v2-comprehensive',
  name: 'Comprehensive v2 — FF + SO + SSO across 3 districts',
  date: '2026-04-07',
  shift: 'Day' as const,
  stations: [
    // FF stations
    { stationName: 'Albany',        district: 'Waitemata',          slots: 3, required_rank: 'FF',       specialist: null  },
    { stationName: 'Devonport',     district: 'Waitemata',          slots: 2, required_rank: 'FF',       specialist: null  },
    // SSO stations
    { stationName: 'Silverdale',    district: 'Waitemata',          slots: 2, required_rank: 'SSO',      specialist: 'prt' },
    { stationName: 'Takapuna',      district: 'Waitemata',          slots: 2, required_rank: 'SSO',      specialist: null  },
    // SO stations
    { stationName: 'Papakura',      district: 'Counties Manukau',   slots: 3, required_rank: 'SO',       specialist: null  },
    { stationName: 'Manurewa',      district: 'Counties Manukau',   slots: 2, required_rank: 'SO',       specialist: null  },
    { stationName: 'Otahuhu',       district: 'Counties Manukau',   slots: 2, required_rank: 'SO',       specialist: null  },
    // SSO station
    { stationName: 'Papatoetoe',    district: 'Counties Manukau',   slots: 2, required_rank: 'SSO',      specialist: null  },
    // SO stations
    { stationName: 'Grey Lynn',     district: 'Auckland',          slots: 2, required_rank: 'SO',       specialist: null  },
    { stationName: 'Remuera',       district: 'Auckland',          slots: 2, required_rank: 'SO',       specialist: null  },
    // SSO stations
    { stationName: 'Avondale',      district: 'Auckland',          slots: 2, required_rank: 'SSO',      specialist: null  },
    { stationName: 'Mount Roskill', district: 'Auckland',          slots: 2, required_rank: 'SSO',      specialist: null  },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function parseNzDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

async function applyHomeStationQuals(ffs: Firefighter[]): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: number; specialist_type: string }>(
    `SELECT id, specialist_type FROM stations WHERE specialist_type IS NOT NULL`);
  const stationSpecTypes: Record<number, string> = {};
  for (const r of rows) stationSpecTypes[r.id] = r.specialist_type;
  for (const ff of ffs) {
    const homeSpec = stationSpecTypes[ff.station_id];
    if (homeSpec && !ff.qualifications[homeSpec]) ff.qualifications[homeSpec] = true;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function POST(request: NextRequest) {
  try {
    const date = parseNzDate(SCENARIO.date);

    // Reset + reseed
    const pool = getPool();
    await pool.query(`SET session_replication_role = replica`);
    for (const t of ['ot_count_log','audit_logs','ot_offers','availability',
      'district_relievers','ot_assignments','ot_requests','allocation_runs',
      'station_distances','system_settings','watch_anchors','areas','firefighters','stations']) {
      await pool.query(`DELETE FROM ${t}`).catch(() => {});
    }
    await seedDatabase();

    // Resolve station IDs
    const stationIdMap: Record<string, number> = {};
    const stationDistrictMap: Record<string, string> = {};
    const stationRankMap: Record<string, string> = {};
    const stationSpecMap: Record<string, string | null> = {};
    for (const sc of SCENARIO.stations) {
      const res = await pool.query(
        `SELECT s.id, a.name as district FROM stations s JOIN areas a ON s.area_id = a.id WHERE s.name = $1`,
        [sc.stationName]);
      if (res.rows.length === 0) throw new Error(`Station "${sc.stationName}" not found`);
      stationIdMap[sc.stationName] = res.rows[0].id;
      stationDistrictMap[sc.stationName] = res.rows[0].district;
      stationRankMap[sc.stationName] = sc.required_rank;
      stationSpecMap[sc.stationName] = sc.specialist;
    }

    // Load data
    let allFirefighters = await loadAllFirefighters(pool);
    await applyHomeStationQuals(allFirefighters);
    const distanceMatrix = await loadDistanceMatrix(pool);

    // Build OT requests (v2 format)
    const requests = SCENARIO.stations.map(st => ({
      station_id: stationIdMap[st.stationName],
      station_name: st.stationName,
      district: stationDistrictMap[st.stationName],
      date: date.toISOString().split('T')[0],
      shift_type: SCENARIO.shift,
      slots: st.slots,
      specialist_type: st.specialist,
      required_rank: st.required_rank as 'FF' | 'SO' | 'SSO' | 'SO_OR_SSO',
      required_qualifications: st.specialist ? [st.specialist] : [],
    }));

    // Run v2 allocation
    const stationResults = await allocateV2(requests, allFirefighters, distanceMatrix, new Set());

    // Build summaries
    let totalAssigned = 0;
    let totalSlots = 0;
    const allPhases = new Set<string>();
    const assignmentMap = new Map<number, { stationName: string; distance: number; phase: string; threshold: string; group: number }>();
    const GROUP_NAMES: Record<number, string> = {
      1: 'FF in-district callback', 2: 'FF in-district non-callback',
      3: 'FF OOD-adj callback',     4: 'FF OOD-adj non-callback',
      5: 'FF OOD-dist callback',    6: 'FF OOD-dist non-callback',
      7: 'SO pool', 8: 'SSO pool', 9: 'SSO→SO overflow',
    };

    for (const sr of stationResults) {
      totalAssigned += sr.assignedFirefighters.length;
      for (const af of sr.assignedFirefighters) {
        assignmentMap.set(af.firefighter_id, {
          stationName: sr.station_name,
          distance: af.distance,
          phase: af.cascadePhase,
          threshold: af.threshold,
          group: af.assignedAtGroup,
        });
        allPhases.add(af.cascadePhase);
      }
    }
    for (const sc of SCENARIO.stations) totalSlots += sc.slots;

    // ── Watch summary ────────────────────────────────────────────────────────
    const { getShift, getCallbackType } = await import('@/engine/watch-math');
    const WATCH_ORDER = ['Red', 'Green', 'Brown', 'Blue'];
    const dateStr = date.toISOString().split('T')[0];
    const watchSummary: Record<string, { label: string; type: string; callback: string | null; shift: string; eligible: number; assigned: number }> = {};

    for (const watch of WATCH_ORDER) {
      const watchFFs = allFirefighters.filter(ff => ff.watch === watch);
      const shift = getShift(watch as any, date);
      const callback = getCallbackType(watch as any, date);
      const shiftLabel = shift === 'Off' ? 'Off' : shift === 'Day' ? 'Day shift' : 'Night shift';
      const watchType = callback ? 'callback' : shift === 'Off' ? 'non-callback' : 'leave';

      let eligible = 0;
      for (const ff of watchFFs) {
        const shiftForFF = getShift(ff.watch as any, date);
        if (shiftForFF !== 'Off') continue;
        eligible++;
      }

      watchSummary[watch] = {
        label: watch,
        type: watchType,
        callback: callback || null,
        shift: shiftLabel,
        eligible,
        assigned: Array.from(assignmentMap.entries()).filter(([id]) => watchFFs.some(f => f.id === id)).length,
      };
    }

    // ── Station breakdown ────────────────────────────────────────────────────
    const stationBreakdown = stationResults.map(sr => {
      const sc = SCENARIO.stations.find(s => s.stationName === sr.station_name)!;
      return {
        stationName: sr.station_name,
        district: stationDistrictMap[sr.station_name],
        slots: sr.slots,
        specialist: sr.specialist,
        requiredRank: sr.required_rank,
        filled: sr.assignedFirefighters.length,
        complete: sr.assignedFirefighters.length >= sr.slots,
        phasesUsed: sr.phasesUsed,
        assigned: sr.assignedFirefighters.map(af => {
          const ff = allFirefighters.find(f => f.id === af.firefighter_id)!;
          return {
            name: af.firefighter_name,
            district: ff?.district || '?',
            rank: af.rank,
            watch: ff?.watch || '?',
            distance: af.distance,
            threshold: af.threshold,
            group: af.assignedAtGroup,
            phase: af.cascadePhase,
            homeStation: af.home_station,
            cbDays: ff?.ot_count_callback_days || 0,
            cbNights: ff?.ot_count_callback_nights || 0,
            ncDays: ff?.ot_count_noncallback_days || 0,
            ncNights: ff?.ot_count_noncallback_nights || 0,
          };
        }),
      };
    });

    // ── Phase coverage ───────────────────────────────────────────────────────
    const phaseCoverage: Record<string, number> = {};
    for (const phase of Object.values(GROUP_NAMES)) phaseCoverage[phase] = 0;
    for (const sr of stationResults) {
      for (const af of sr.assignedFirefighters) {
        phaseCoverage[af.cascadePhase] = (phaseCoverage[af.cascadePhase] || 0) + 1;
      }
    }

    // ── All FF detail list ───────────────────────────────────────────────────
    const PHASE_PRIORITY: Record<string, number> = {
      'ff-callback': 1, 'ff-noncallback': 2, 'ood-adj-cb': 3, 'ood-adj-nc': 4,
      'ood-dist-cb': 5, 'ood-dist-nc': 6, 'so': 7, 'sso': 8, 'sso-overflow': 9, unassigned: 98,
    };

    const allFirefightersDetail = allFirefighters.map(ff => {
      const a = assignmentMap.get(ff.id);
      const quals = Object.keys(ff.qualifications).filter(k => ff.qualifications[k]);
      return {
        id: ff.id,
        name: `${ff.first_name} ${ff.last_name}`,
        district: ff.district,
        watch: ff.watch,
        rank: ff.rank,
        homeStation: ff.station_name,
        otStation: a?.stationName || '',
        distance: a?.distance || 0,
        cbDays: ff.ot_count_callback_days,
        cbNights: ff.ot_count_callback_nights,
        ncDays: ff.ot_count_noncallback_days,
        ncNights: ff.ot_count_noncallback_nights,
        isAssigned: !!a,
        phase: a?.phase || 'unassigned',
        threshold: a?.threshold || 'unassigned',
        group: a?.group || 0,
        quals,
      };
    });

    allFirefightersDetail.sort((a, b) => {
      if (a.isAssigned !== b.isAssigned) return a.isAssigned ? -1 : 1;
      const pd = (PHASE_PRIORITY[a.phase] || 99) - (PHASE_PRIORITY[b.phase] || 99);
      if (pd !== 0) return pd;
      return (a.cbDays + a.cbNights) - (b.cbDays + b.cbNights);
    });

    return NextResponse.json({
      scenarioId: SCENARIO.id,
      scenarioName: SCENARIO.name,
      date: SCENARIO.date,
      shift: SCENARIO.shift,
      totalSlots,
      totalAssigned,
      fillRate: totalSlots > 0 ? Math.round((totalAssigned / totalSlots) * 100) : 0,
      phasesUsed: Array.from(allPhases),
      phaseCoverage,
      stationBreakdown,
      allFirefightersDetail,
      watchSummary,
      seedSummary: {
        totalFirefighters: allFirefighters.length,
        totalStations: SCENARIO.stations.length,
        totalSlots,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}