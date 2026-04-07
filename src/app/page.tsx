export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { query } from '@/lib/db';

async function getStats() {
  try {
    const [stations, firefighters, otRuns, pendingOT] = await Promise.all([
      query('SELECT COUNT(*) as count FROM stations'),
      query('SELECT COUNT(*) as count FROM firefighters WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM allocation_runs'),
      query("SELECT COUNT(*) as count FROM ot_requests WHERE status = 'pending'"),
    ]);
    return {
      stations: parseInt(stations.rows[0]?.count || '0'),
      firefighters: parseInt(firefighters.rows[0]?.count || '0'),
      otRuns: parseInt(otRuns.rows[0]?.count || '0'),
      pendingOT: parseInt(pendingOT.rows[0]?.count || '0'),
    };
  } catch {
    return { stations: 0, firefighters: 0, otRuns: 0, pendingOT: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🚒 FENZ Overtime Prototype</h1>
        <p className="text-gray-400 mb-8">Allocation Engine v1 — Built for Adam</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.stations}</div>
            <div className="text-gray-400 text-sm mt-1">Stations</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.firefighters}</div>
            <div className="text-gray-400 text-sm mt-1">Firefighters</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.otRuns}</div>
            <div className="text-gray-400 text-sm mt-1">OT Runs</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.pendingOT}</div>
            <div className="text-gray-400 text-sm mt-1">Pending OT</div>
          </div>
        </div>

        {/* Navigation */}
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/officer" className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="text-2xl mb-2">👨‍🚒</div>
            <h3 className="font-semibold text-lg">Officer Tool</h3>
            <p className="text-gray-400 text-sm mt-1">Create OT shifts, run allocation, see results & reports</p>
          </Link>
          <Link href="/firefighter" className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500 transition-colors">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-lg">Firefighter Sim</h3>
            <p className="text-gray-400 text-sm mt-1">Simulate accepting/declining OT offers</p>
          </Link>
          <Link href="/audit" className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-500 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-lg">Audit Trail</h3>
            <p className="text-gray-400 text-sm mt-1">View full history of OT counter changes</p>
          </Link>
          <Link href="/generate" className="block bg-purple-900/30 border border-purple-800 rounded-xl p-6 hover:border-purple-500 transition-colors">
            <div className="text-2xl mb-2">🎲</div>
            <h3 className="font-semibold text-lg">Firefighter Generator</h3>
            <p className="text-gray-400 text-sm mt-1">Generate random firefighters for stress testing</p>
          </Link>
          <Link href="/test" className="block bg-indigo-900/30 border border-indigo-800 rounded-xl p-6 hover:border-indigo-500 transition-colors">
            <div className="text-2xl mb-2">🧪</div>
            <h3 className="font-semibold text-lg">Test Dashboard</h3>
            <p className="text-gray-400 text-sm mt-1">Run allocation engine tests with pass/fail results</p>
          </Link>
        </div>

        {/* Seed Button */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Database</h2>
          <p className="text-gray-400 text-sm mb-4">Seed the database with 40 stations, 20 firefighters, and watch anchors.</p>
          <SeedButton />
        </div>
      </div>
    </div>
  );
}

function SeedButton() {
  async function seed(formData: FormData) {
    'use server';
    const fs = require('fs');
    const { Pool } = require('pg');
    const seedScript = fs.readFileSync('/home/ubuntu/fenz-ot-prototype/seed-fix.ts', 'utf-8');
    // Execute the seed via tsx
    const { execSync } = require('child_process');
    try {
      const result = execSync('npx tsx seed-fix.ts', { cwd: '/home/ubuntu/fenz-ot-prototype', encoding: 'utf-8' });
      console.log('Seed result:', result);
    } catch (error: any) {
      console.error('Seed error:', error.stderr);
    }
    // Revalidate all pages
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/officer');
    revalidatePath('/firefighter');
    revalidatePath('/audit');
  }

  return (
    <form action={seed}>
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
        🌱 Seed Database
      </button>
    </form>
  );
}

