import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { loadAllFirefighters, loadDistanceMatrix, allocateForOTRequest } from '@/engine/allocation-engine';
import { getShift, getCallbackType } from '@/engine/watch-math';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getPool();
  const ffs = await loadAllFirefighters(pool);
  const dm = await loadDistanceMatrix(pool);

  const albanyId = 3510;
  const req = {
    station_id: albanyId,
    station_name: 'Albany',
    district: 'Waitemata',
    date: '2026-04-07',
    shift_type: 'Day' as const,
    slots: 3,
    specialist_type: null as string | null,
  };

  const results = await allocateForOTRequest([req], ffs, dm, new Set());
  const albany = results.find(r => r.station_name === 'Albany')!;

  const evans = ffs.filter(f => f.first_name === 'Chris' && f.last_name === 'Evans');
  const evansRaw = evans.map(e => ({
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    district: e.district,
    watch: e.watch,
    shift: getShift(e.watch as any, new Date('2026-04-07')),
    callback: getCallbackType(e.watch as any, new Date('2026-04-07')),
    homeStationId: e.station_id,
    homeStation: e.station_name,
  }));

  const albanyHomeFFs = ffs.filter(f => f.station_id === albanyId);

  return NextResponse.json({
    evans: evansRaw,
    albanyHomeFFs: albanyHomeFFs.map(f => ({
      id: f.id,
      name: `${f.first_name} ${f.last_name}`,
      watch: f.watch,
      shift: getShift(f.watch as any, new Date('2026-04-07')),
      callback: getCallbackType(f.watch as any, new Date('2026-04-07')),
    })),
    assigned: albany.assignedFirefighters.map(a => ({
      ff_id: a.firefighter_id,
      name: a.firefighter_name,
      rank: a.rank,
      phase: a.cascadePhase,
      threshold: a.threshold,
    })),
  });
}