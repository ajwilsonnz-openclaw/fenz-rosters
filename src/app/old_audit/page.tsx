export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import Link from 'next/link';

async function getFirefighters() {
  try {
    const res = await query('SELECT id, first_name, last_name FROM firefighters WHERE is_active = true ORDER BY first_name');
    return res.rows;
  } catch {
    return [];
  }
}

async function getAuditLog(ffId?: number | null) {
  try {
    const params: any[] = [];
    let whereClause = '';
    if (ffId) {
      params.push(ffId);
      whereClause = 'WHERE old_value->>\'ff\' = $1 OR new_value->>\'ff\' = $1';
    }

    const res = await query(`
      SELECT 
        acl.id,
        acl.action,
        acl.entity_type,
        acl.entity_id,
        acl.old_value,
        acl.new_value,
        acl.reason,
        acl.created_at,
        f.first_name,
        f.last_name
      FROM audit_logs acl
      LEFT JOIN firefighters f ON acl.old_value->>'ff' = f.id::text OR acl.new_value->>'ff' = f.id::text
      ${whereClause}
      ORDER BY acl.created_at DESC
      LIMIT 100
    `, params);

    // If we got results without a filter, dedupe by ID
    if (!ffId && res.rows.length > 0) {
      return res.rows.slice(0, 20);
    }
    return res.rows;
  } catch (e) {
    console.error('Audit query error:', e);
    return [];
  }
}

async function getOTCountLog(ffId?: number | null) {
  try {
    const params: any[] = [];
    let whereClause = '';
    if (ffId) {
      params.push(ffId);
      whereClause = 'WHERE ocl.firefighter_id = $1';
    }

    const res = await query(`
      SELECT 
        ocl.id,
        ocl.firefighter_id,
        ocl.counter_type,
        ocl.old_value,
        ocl.new_value,
        ocl.change_reason,
        ocl.changed_at,
        f.first_name,
        f.last_name,
        f.watch
      FROM ot_count_log ocl
      JOIN firefighters f ON ocl.firefighter_id = f.id
      ${whereClause}
      ORDER BY ocl.changed_at DESC
      LIMIT 50
    `, params);
    return res.rows;
  } catch {
    return [];
  }
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ ff?: string }> }) {
  const params = await searchParams;
  const ffFilter = params?.ff ? parseInt(params.ff, 10) : null;
  const firefighters = await getFirefighters();
  const auditLog = await getAuditLog(ffFilter);
  const otCountLog = await getOTCountLog(ffFilter);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
          <h1 className="text-3xl font-bold">📋 Audit Trail</h1>
        </div>

        {/* Filter */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Filter by firefighter</h3>
          <div className="flex flex-wrap gap-1">
            <Link href="/audit" className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">All</Link>
          {firefighters.map(ff => (
            <Link
              key={ff.id}
              href={`/audit?ff=${ff.id}`}
              className={`px-2 py-1 rounded text-xs transition-colors ${ffFilter === Number(ff.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            >
              {ff.first_name} {ff.last_name?.charAt(0)}.
            </Link>
          ))}
          </div>
        </div>

        {/* OT Count Changes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">OT Counter Changes ({otCountLog.length})</h2>
          {otCountLog.length === 0 ? (
            <p className="text-gray-500">No OT changes yet. Run the allocation engine from the Officer page.</p>
          ) : (
            <div className="space-y-2">
              {otCountLog.map(log => (
                <div key={log.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.counter_type === 'days' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                    <span className="font-medium">{log.first_name} {log.last_name}</span>
                    <span className="text-xs text-gray-500">({log.watch})</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      {log.counter_type}: <span className="text-red-400 line-through">{log.old_value}</span> → <span className="text-green-400 font-semibold">{log.new_value}</span>
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(log.changed_at).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General Audit Log */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">General Audit Log ({auditLog.length})</h2>
          {auditLog.length === 0 ? (
            <p className="text-gray-500">No audit entries yet.</p>
          ) : (
            <div className="space-y-2">
              {auditLog.map(log => (
                <div key={log.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{log.action}</span>
                      <span className="text-xs text-gray-500 ml-2">→ {log.entity_type} #{log.entity_id}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString('en-NZ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Unknown'}
                    </span>
                  </div>
                  {log.reason && (
                    <div className="text-xs text-gray-400 mt-1">{log.reason}</div>
                  )}
                  <div className="flex gap-4 mt-1 text-xs">
                    {log.old_value && (
                      <span className="text-gray-500">Old: <pre className="inline">{JSON.stringify(log.old_value).slice(0, 100)}</pre></span>
                    )}
                    {log.new_value && (
                      <span className="text-gray-500">New: <pre className="inline">{JSON.stringify(log.new_value).slice(0, 100)}</pre></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

