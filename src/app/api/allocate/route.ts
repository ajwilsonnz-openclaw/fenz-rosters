import { query, getPool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { loadAllFirefighters, loadDistanceMatrix, allocateForOTRequest, type OTRequest } from '@/engine/allocation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.action === 'create_request') {
      const res = await query(
        `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0, NOW(), NOW()) RETURNING *`,
        [body.station_id, body.date, body.shift_type, body.specialist_type || null, body.number_of_slots || 1, JSON.stringify(body.required_qualification_ids || [])]
      );
      return NextResponse.json({ success: true, request: res.rows[0] });
    }

    if (body.action === 'run_allocation') {
      const pool = getPool();
      const allFFs = await loadAllFirefighters(pool);
      const distMatrix = await loadDistanceMatrix(pool);
      const otReq: OTRequest[] = [{
        station_id: 1055,
        station_name: 'Albany',
        district: 'Waitemata',
        date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        shift_type: 'Day',
        slots: 3,
        specialist_type: null,
      }];
      const stationResults = await allocateForOTRequest(otReq, allFFs, distMatrix, new Set());
      return NextResponse.json({ success: true, stationResults });
    }

    if (body.action === 'manual_assign') {
      const { requestId, firefighterId, distance, status, declineReason } = body;
      const res = await query(
        `INSERT INTO ot_assignments (ot_request_id, firefighter_id, distance_km, status, assigned_at, declined_reason)
         VALUES ($1, $2, $3, $4, NOW(), $5)
         RETURNING *`,
        [requestId, firefighterId, distance || 0, status || 'assigned', declineReason || null]
      );
      
      // If we are assigning, increment number_filled on the request
      if ((status || 'assigned') !== 'declined') {
        await query(`UPDATE ot_requests SET number_filled = number_filled + 1 WHERE id = $1`, [requestId]);
      }
      
      return NextResponse.json({ success: true, assignment: res.rows[0] });
    }

    if (body.action === 'update_assignment') {
      const { assignmentId, assignmentAction, declineReason } = body;
      if (assignmentAction === 'accept') {
        await query(`UPDATE ot_assignments SET status = 'accepted', accepted_at = NOW() WHERE id = $1`, [assignmentId]);
        return NextResponse.json({ success: true, status: 'accepted' });
      }
      if (assignmentAction === 'decline') {
        await query(`UPDATE ot_assignments SET status = 'declined', declined_reason = $2 WHERE id = $1`, [assignmentId, declineReason || '']);
        return NextResponse.json({ success: true, status: 'declined' });
      }
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Allocate API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}