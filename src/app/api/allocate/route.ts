import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { runFullAllocation } from '@/engine/allocation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // If creating a new OT request
    if (body.action === 'create_request') {
      const res = await query(
        `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0, NOW(), NOW())
         RETURNING *`,
        [body.station_id, body.date, body.shift_type, body.specialist_type || null, body.number_of_slots || 1, JSON.stringify(body.required_qualification_ids || [])]
      );
      return NextResponse.json({ success: true, request: res.rows[0] });
    }

    // If running the full allocation engine
    if (body.action === 'run_allocation') {
      // Create a test OT request (use Albany station_id = 1055)
      const reqRes = await query(
        `INSERT INTO ot_requests (station_id, date, shift_type, number_of_slots, status, number_filled)
         VALUES (1055, CURRENT_DATE + 3, 'Day', 3, 'pending', 0)
         RETURNING id`
      );
      const reqId = reqRes?.rows?.[0]?.id;
      const results = await runFullAllocation();
      return NextResponse.json({ success: true, ...results });
    }

    // If updating an assignment (accept/decline)
    if (body.action === 'update_assignment') {
      const { assignmentId, action: assignmentAction, declineReason } = body;

      if (assignmentAction === 'accept') {
        await query(
          `UPDATE ot_assignments SET status = 'accepted', accepted_at = NOW() WHERE id = $1`,
          [assignmentId]
        );
        return NextResponse.json({ success: true, status: 'accepted' });
      }

      if (assignmentAction === 'decline') {
        await query(
          `UPDATE ot_assignments SET status = 'declined', declined_reason = $2 WHERE id = $1`,
          [assignmentId, declineReason || '']
        );
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
