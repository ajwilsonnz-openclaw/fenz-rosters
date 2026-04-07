export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { runFullAllocation } from '@/engine/allocation-engine';


function formatQuals(quals: any): string {
  if (!quals) return "General";
  if (Array.isArray(quals)) return quals.join(", ") || "General";
  if (typeof quals === "object") {
    const keys = Object.entries(quals).filter(([,v]) => v).map(([k]) => k === "not_rookie" ? "Non-Rookie" : k.replace(/_/g, " "));
    return keys.length > 0 ? keys.join(", ") : "General";
  }
  return "General";
}
function getWatchColor(watch?: string) {
  switch (watch) {
    case 'Green': return 'text-green-400';
    case 'Red': return 'text-red-400';
    case 'Brown': return 'text-amber-400';
    case 'Blue': return 'text-blue-400';
    default: return 'text-white';
  }
}

async function getStations() {
  try {
    const res = await query('SELECT id, name FROM stations ORDER BY name');
    return res.rows;
  } catch {
    return [];
  }
}

async function getPendingRequests() {
  try {
    const res = await query(`
      SELECT otr.*, s.name as station_name
      FROM ot_requests otr
      LEFT JOIN stations s ON otr.station_id = s.id
      WHERE otr.status = 'pending'
      ORDER BY otr.date DESC
    `);
    return res.rows;
  } catch {
    return [];
  }
}

async function getFirefighters() {
  try {
    const res = await query(`
      SELECT
        f.id, f.first_name, f.last_name, f.watch, f.rank,
        f.ot_count_days, f.ot_count_nights,
        f.qualifications,
        s.name as station_name
      FROM firefighters f
      LEFT JOIN stations s ON s.id = f.station_id
      WHERE f.is_active = true
      ORDER BY
        CASE f.watch WHEN 'Green' THEN 1 WHEN 'Red' THEN 2 WHEN 'Brown' THEN 3 WHEN 'Blue' THEN 4 END,
        f.last_name
    `);
    return res.rows;
  } catch {
    return [];
  }
}

async function getRecentAllocations() {
  try {
    const res = await query(`
      SELECT
        oa.id,
        f.id as firefighter_id,
        f.first_name, f.last_name, f.watch, f.rank,
        f.ot_count_days, f.ot_count_nights,
        f.qualifications,
        s.name as station_name,
        to_char(otr.date, 'YYYY-MM-DD') as date,
        otr.shift_type,
        oa.status
      FROM ot_assignments oa
      JOIN firefighters f ON oa.firefighter_id = f.id
      JOIN ot_requests otr ON oa.ot_request_id = otr.id
      JOIN stations s ON otr.station_id = s.id
      ORDER BY f.ot_count_days ASC, f.ot_count_nights ASC
      LIMIT 50
    `);
    return res.rows;
  } catch {
    return [];
  }
}

export default async function OfficerPage() {
  const stations = await getStations();
  const pendingRequests = await getPendingRequests();
  const recentAllocations = await getRecentAllocations();
  const firefighters = await getFirefighters();

  async function createOT(formData: FormData) {
    'use server';
    const stationId = parseInt(formData.get('station_id') as string);
    const date = formData.get('date') as string;
    const shiftType = formData.get('shift_type') as 'Day' | 'Night';
    const specialistType = formData.get('specialist_type') as string || null;

    await query(
      `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0, NOW(), NOW())`,
      [stationId, date, shiftType, specialistType || null, 1, JSON.stringify([])]
    );
    revalidatePath('/officer');
  }

  async function runAllocation() {
    'use server';
    const results = await runFullAllocation();
    console.log('Allocation complete:', JSON.stringify(results));
    revalidatePath('/officer');
    revalidatePath('/');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
          <h1 className="text-3xl font-bold">👨‍🚒 Officer OT Management</h1>
        </div>

        {/* Create OT Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create OT Shift</h2>
          <form id="create-ot-form" action={createOT} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Station</label>
              <select name="station_id" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" required>
                <option value="">Select station...</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input type="date" name="date" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Shift Type</label>
              <select name="shift_type" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" required>
                <option value="Day">Day (10h)</option>
                <option value="Night">Night (14h)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Create OT Request
              </button>
            </div>
          </form>
          <div className="mt-4 md:col-span-4 flex items-center gap-3 flex-wrap">
            <label className="text-sm text-gray-400">Qualification required:</label>
            <select name="specialist_type" form="create-ot-form" className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm">
              <option value="">None (any firefighter)</option>
              <option value="PRT">PRT</option>
              <option value="Type 4">Type 4</option>
              <option value="CBR">CBR</option>
              <option value="Command Unit">Command Unit</option>
              <option value="Hazmat">Hazmat</option>
            </select>
            <span className="text-xs text-gray-500">In future: station-specific options</span>
          </div>
        </div>

        {/* Run Allocation Button */}
        <form action={runAllocation} className="mb-6">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg">
            🚀 Run Allocation Engine
          </button>
        </form>

        {/* Pending OT Requests */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pending OT Requests ({pendingRequests.length})</h2>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests. Create one above.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2">Station</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Shift</th>
                  <th className="text-left py-2">Slots</th>
                  <th className="text-left py-2">Filled</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(r => (
                  <tr key={r.id} className="border-b border-gray-800/50">
                    <td className="py-2">{r.station_name || 'Unknown'}</td>
                    <td className="py-2">{new Date(r.date).toLocaleDateString('en-NZ')}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${r.shift_type === 'Day' ? 'bg-amber-900/50 text-amber-300' : 'bg-indigo-900/50 text-indigo-300'}`}>
                        {r.shift_type}
                      </span>
                    </td>
                    <td className="py-2">{r.number_of_slots}</td>
                    <td className="py-2">{r.number_filled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Allocation Report with Reasoning */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">📊 Allocation Report</h2>
          <p className="text-gray-400 text-sm mb-4">Who got picked and WHY — sorted by OT count (lowest first for fairness)</p>
          {recentAllocations.length === 0 ? (
            <p className="text-gray-500">No allocations yet. Run the engine above.</p>
          ) : (
            <div className="space-y-2">
              {recentAllocations.map((a, i) => (
                <div key={a.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{a.first_name} {a.last_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${a.status === 'assigned' ? 'bg-yellow-900/50 text-yellow-300' : a.status === 'accepted' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {a.status}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${getWatchColor(a.watch)}`}>{a.ot_count_days || 0} OT</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                    <span>⌚ {a.watch}</span>
                    <span>→ {a.station_name}</span>
                    <span>📍 {a.shift_type}</span>
                    <span>📅 {new Date(a.date).toLocaleDateString('en-NZ')}</span>
                    <span>🏅 {formatQuals(a.qualifications)}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="text-emerald-400">✓</span> {a.reason || 'Selected to balance OT load across watches'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Firefighters with Full Detail */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">👥 All Firefighters — Full Detail View</h2>
          <p className="text-gray-400 text-sm mb-4">See everything: qualifications, OT counts, watch — useful for stress testing the system</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {firefighters.map(ff => (
              <div key={ff.id} className="bg-gray-800/80 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{ff.first_name} {ff.last_name}</span>
                  <span className={`text-sm font-bold ${getWatchColor(ff.watch)}`}>{ff.watch}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Rank:</span> {ff.rank}</div>
                  <div><span className="text-gray-500">Station:</span> <br/>{ff.station_name || 'N/A'}</div>
                  <div><span className="text-gray-500">OT Days:</span> <span className="text-yellow-400">{ff.ot_count_days || 0}</span></div>
                  <div><span className="text-gray-500">OT Nights:</span> <span className="text-indigo-400">{ff.ot_count_nights || 0}</span></div>
                </div>
                {ff.qualifications && Object.entries(ff.qualifications as Record<string, boolean>).some(([, v]) => v) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(ff.qualifications as Record<string, boolean>).map(([k, v]) => 
                      v ? <span key={k} className="px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded text-xs">{k === 'not_rookie' ? 'Non-Rookie' : k.replace(/_/g, ' ')}</span> : null
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

