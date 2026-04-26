export const dynamic = 'force-dynamic';

import { query } from '@/lib/db';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

async function getStations() {
  try {
    const res = await query('SELECT id, name FROM stations ORDER BY name');
    return res.rows;
  } catch { return []; }
}

// Random name generator
const FIRST_NAMES = [
  'Aiden','Beau','Cody','Damon','Ethan','Finn','Gavin','Hunter','Jake','Kai',
  'Lachlan','Mason','Niko','Oscar','Pete','Quinn','Riley','Sam','Tane','Ulric',
  'Vic','Wyatt','Xavier','Zane','Brendon','Callum','Dax','Ewan','Flynn','Jared',
  'Karl','Leo','Max','Noah','Paddy','Rhys','Stefan','Troy','Uri','Vince',
  'Will','Yusuf','Zak','Briar','Cruz','Dale','Eli','Fletcher','Grant','Hemi',
  'Ivan','Jasper','Kian','Lowry','Mika','Nephi','Orson','Paki','Rangi','Seth',
  'Tamati','Vaughn','Wes','Xander','York','Zion'
];

const LAST_NAMES = [
  'Adams','Brown','Carter','Davies','Edwards','Fletcher','Gray','Harris','Ingram',
  'Jonas','Kelly','Lynch','Mason','Nash','O\'Brien','Patel','Quinn','Roberts',
  'Smith','Taylor','Underwood','Vaughan','Williams','Xu','Young','Zhang',
  'Ariki','Broughton','Corlett','Delaney','Eruera','Frost','Gibbons','Hemara',
  'Ioane','Jensen','Kahu','Lawrence','Makiha','Ngata','Ormsby','Paora',
  'Reid','Stevens','Tangaroa','Ulu','Van Der Berg','Wood','Xie','Yates','Zwart'
];

const RANKS = ['FF','QFF','SFF','SO','SSO'];
const WATCHES = ['Green','Red','Brown','Blue'];
const QUAL_OPTIONS = ['driver','not_rookie','prt','command_unit','type4','hazmat','cbr'] as const;

type QualField = typeof QUAL_OPTIONS[number];

interface Qualifications {
  driver: boolean;
  not_rookie: boolean;
  prt?: boolean;
  command_unit?: boolean;
  type4?: boolean;
  hazmat?: boolean;
  cbr?: boolean;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateFirefighter(formData: FormData) {
  'use server';

  const count = Math.min(parseInt(formData.get('count') as string) || 1, 20);

  const stationIds = formData.getAll('stations') as string[];
  if (stationIds.length === 0) {
    const all = await query('SELECT id FROM stations');
    all.rows.forEach(r => stationIds.push(String(r.id)));
  }

  const selectedRanks = formData.getAll('ranks') as string[];
  const selectedWatches = formData.getAll('watches') as string[];

  const quals: Qualifications = {
    driver: formData.get('q_driver') === 'on',
    not_rookie: formData.get('q_not_rookie') === 'on',
    prt: formData.get('q_prt') === 'on',
    command_unit: formData.get('q_command_unit') === 'on',
    type4: formData.get('q_type4') === 'on',
    hazmat: formData.get('q_hazmat') === 'on',
    cbr: formData.get('q_cbr') === 'on',
  };

  let created = 0;
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let first: string, last: string, key: string;
    do {
      first = randomPick(FIRST_NAMES);
      last = randomPick(LAST_NAMES);
      key = `${first} ${last}`;
    } while (usedNames.has(key));
    usedNames.add(key);

    const rank = selectedRanks.length > 0 ? randomPick(selectedRanks) : randomPick(RANKS);
    const watch = selectedWatches.length > 0 ? randomPick(selectedWatches) : randomPick(WATCHES);
    const stationId = randomPick(stationIds);
    const otDays = randomInt(0, 10);
    const otNights = randomInt(0, 5);
    const email = `${first.toLowerCase()}.${last.toLowerCase().replace(/'/g, '')}@fenz.test`;

    const ranks = selectedRanks.length > 0 ? selectedRanks : RANKS;
    const watches = selectedWatches.length > 0 ? selectedWatches : WATCHES;

    try {
      await query(
        `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)`,
        [first, last, email, stationId, watch, rank, otDays, otNights, JSON.stringify(quals)]
      );
      created++;
    } catch (e: any) {
      console.error('Failed to create firefighter:', e.message);
    }
  }

  revalidatePath('/firefighter');
  revalidatePath('/officer');
  revalidatePath('/audit');
  revalidatePath('/generate');
  // Return undefined (server action must be void)
}

export default async function GeneratePage() {
  const stations = await getStations();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
          <h1 className="text-3xl font-bold">🎲 Firefighter Generator</h1>
        </div>
        <p className="text-gray-400 mb-6">Generate random firefighters for stress testing. Random names, but YOU control the details.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generator Settings</h2>
          <form action={generateFirefighter} className="space-y-6">

            {/* Count */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">How many to generate? (max 20 at a time)</label>
              <input type="number" name="count" min="1" max="20" defaultValue="5" className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white w-32" />
            </div>

            {/* Stations */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Allowed Stations (leave unchecked for all)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 max-h-40 overflow-y-auto p-2 bg-gray-800 rounded border border-gray-700">
                {stations.map(s => (
                  <label key={s.id} className="flex items-center gap-1 text-sm text-gray-300">
                    <input type="checkbox" name="stations" value={s.id} className="w-3 h-3" />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Ranks */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ranks (leave unchecked for all)</label>
              <div className="flex gap-4 flex-wrap">
                {RANKS.map(r => (
                  <label key={r} className="flex items-center gap-1 text-sm text-gray-300">
                    <input type="checkbox" name="ranks" value={r} className="w-3 h-3" />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Watches */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Watches (leave unchecked for all)</label>
              <div className="flex gap-4 flex-wrap">
                {WATCHES.map(w => (
                  <label key={w} className={`flex items-center gap-1 text-sm ${
                    w === 'Green' ? 'text-green-400' : w === 'Red' ? 'text-red-400' :
                    w === 'Brown' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    <input type="checkbox" name="watches" value={w} className="w-3 h-3" />
                    {w}
                  </label>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Qualifications (checked = ALL generated get these)</label>
              <div className="flex gap-4 flex-wrap">
                {[
                  ['q_driver', 'Driver'], ['q_not_rookie', 'Non-Rookie'], ['q_prt', 'PRT'],
                  ['q_command_unit', 'Command Unit'], ['q_type4', 'Type 4'], ['q_hazmat', 'Hazmat'],
                  ['q_cbr', 'CBR']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1 text-sm text-gray-300">
                    <input type="checkbox" name={key} className="w-3 h-3" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              🎲 Generate Firefighters
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/firefighter" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold mb-1">📱 Firefighter Simulator</h3>
            <p className="text-sm text-gray-400">Accept/Decline OT offers</p>
          </Link>
          <Link href="/audit" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold mb-1">📋 Audit Trail</h3>
            <p className="text-sm text-gray-400">View OT counter changes</p>
          </Link>
          <Link href="/officer" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold mb-1">👨‍🚒 Officer Tool</h3>
            <p className="text-sm text-gray-400">Create requests, run engine</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
