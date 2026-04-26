export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

async function getFirefighters() {
  try {
    const res = await query(`
      SELECT f.*, s.name as station_name
      FROM firefighters f
      LEFT JOIN stations s ON f.station_id = s.id
      WHERE f.is_active = true
      ORDER BY f.watch, f.first_name
    `);
    return res.rows;
  } catch {
    return [];
  }
}

async function getFirefighterAssignments(ffId: number) {
  try {
    const res = await query(`
      SELECT oa.*, otr.date, otr.shift_type, s.name as station_name
      FROM ot_assignments oa
      JOIN ot_requests otr ON oa.ot_request_id = otr.id
      JOIN stations s ON otr.station_id = s.id
      WHERE oa.firefighter_id = $1
      ORDER BY oa.assigned_at DESC
    `, [ffId]);
    return res.rows;
  } catch {
    return [];
  }
}

export default async function FirefighterPage({ searchParams }: { searchParams: Promise<{ ff?: string }> }) {
  const params = await searchParams;
  const firefighters = await getFirefighters();
  const selectedId = params?.ff ? parseInt(params.ff, 10) : null;
  const selectedFF = selectedId ? firefighters.find(f => Number(f.id) === selectedId) ?? null : null;
  const assignments = selectedId ? await getFirefighterAssignments(selectedId) : [];

  async function updateAssignment(formData: FormData) {
    'use server';
    const assignmentId = parseInt(formData.get('assignment_id') as string);
    const action = formData.get('action') as 'accept' | 'decline';

    if (action === 'accept') {
      await query(
        `UPDATE ot_assignments SET status = 'accepted', accepted_at = NOW() WHERE id = $1`,
        [assignmentId]
      );
      // Increment firefighter's OT count
      await query(
        `UPDATE firefighters SET ot_count_days = ot_count_days + 1,
         ot_count_log = jsonb_build_array(jsonb_build_object('action','accepted','assignment_id',$1,'date',NOW())) || COALESCE(ot_count_log, '[]')
         WHERE id = (SELECT firefighter_id FROM ot_assignments WHERE id = $1)`,
        [assignmentId]
      );
    } else if (action === 'decline') {
      await query(
        `UPDATE ot_assignments SET status = 'declined', declined_reason = $2 WHERE id = $1`,
        [assignmentId, formData.get('decline_reason') as string || 'Not available']
      );
    }

    // Also log in audit trail
    await query(
      `INSERT INTO audit_logs (firefighter_id, action, old_value, new_value, description)
       SELECT firefighter_id, $2::text, status, $2, 'Firefighter ' || $2 || ' assignment for ' || ot_id
       FROM ot_assignments WHERE id = $1`,
      [assignmentId, action]
    );

    revalidatePath('/firefighter');
    revalidatePath('/audit');
    revalidatePath('/');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
          <h1 className="text-3xl font-bold">📱 Firefighter Simulator</h1>
        </div>

        {/* Firefighter Selector */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Select a Firefighter</h2>
          <div className="flex flex-wrap gap-2">
            {firefighters.map(ff => (
              <Link
                key={ff.id}
                href={`/firefighter?ff=${ff.id}`}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  Number(ff.id) === selectedId 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {ff.first_name} {ff.last_name?.charAt(0)}.
                <span className="text-xs text-gray-400 ml-1">({ff.watch})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Selected Firefighter Details */}
        {selectedFF && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{selectedFF.first_name} {selectedFF.last_name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Watch</div>
                  <div className={`text-lg font-semibold ${getWatchColor(selectedFF.watch)}`}>{selectedFF.watch}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Rank</div>
                  <div className="text-lg font-semibold">{selectedFF.rank}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Home Station</div>
                  <div className="text-lg font-semibold">{selectedFF.station_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">OT Count</div>
                  <div className="flex gap-3">
                    <div><span className="text-amber-400 font-bold">{selectedFF.ot_count_days}</span><span className="text-xs text-gray-500"> D</span></div>
                    <div><span className="text-indigo-400 font-bold">{selectedFF.ot_count_nights}</span><span className="text-xs text-gray-500"> N</span></div>
                  </div>
                </div>
              </div>
              {selectedFF.qualifications && (
                <div className="mt-4">
                  <div className="text-gray-400 text-sm mb-1">Qualifications</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedFF.qualifications).filter(([_, v]) => v).map(([k, _]) => (
                      <span key={k} className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-semibold">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* OT Assignments */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">OT Assignments ({assignments.length})</h2>
              {assignments.length === 0 ? (
                <p className="text-gray-500">No OT assignments yet. Run allocation from the Officer page.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map(a => (
                    <div key={a.id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{a.station_name}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(a.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {' • '}
                            <span className={`font-semibold ${a.shift_type === 'Day' ? 'text-amber-400' : 'text-indigo-400'}`}>
                              {a.shift_type} Shift
                            </span>
                          </div>
                        </div>
                        <div>
                          {a.status === 'assigned' && (
                            <div className="space-x-2">
                              <form action={updateAssignment} className="inline">
                                <input type="hidden" name="assignment_id" value={a.id} />
                                <input type="hidden" name="action" value="accept" />
                                <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-semibold transition-colors">
                                  ✅ Accept
                                </button>
                              </form>
                              <form action={updateAssignment} className="inline">
                                <input type="hidden" name="assignment_id" value={a.id} />
                                <input type="hidden" name="action" value="decline" />
                                <input type="hidden" name="decline_reason" value="Not available" />
                                <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold transition-colors">
                                  ❌ Decline
                                </button>
                              </form>
                            </div>
                          )}
                          {a.status !== 'assigned' && (
                            <span className={`px-3 py-1 rounded text-sm font-semibold ${
                              a.status === 'accepted' ? 'bg-green-900/50 text-green-300' :
                              a.status === 'declined' ? 'bg-red-900/50 text-red-300' :
                              'bg-gray-700 text-gray-400'
                            }`}>
                              {a.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-gray-500">
                        <span>Distance: {a.distance_km || 0}km</span>
                        <span>Hours: {a.hours_allocated}h</span>
                        <span>Status: {a.must_might_wont}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedFF && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-2">👆</div>
            <p className="text-gray-400">Select a firefighter above to see their details and OT offers.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getWatchColor(watch: string): string {
  const colors: Record<string, string> = {
    Green: 'text-green-400',
    Red: 'text-red-400',
    Brown: 'text-amber-400',
    Blue: 'text-blue-400',
    Yellow: 'text-yellow-400',
  };
  return colors[watch] || 'text-white';
}

