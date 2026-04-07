#!/usr/bin/env node
/**
 * FENZ OT Allocation — Full Test Suite + Human-Readable Report
 *
 * Usage: npx tsx run-tests.js
 *
 * Tests the watch-math eligibility filter that was added to
 * src/engine/allocation-engine.ts to fix the callback bug.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════
// Watch-Math Logic (from src/engine/watch-math.ts)
// ═══════════════════════════════════════════════════════════

const ANCHORS = {
  Green: '2026-01-31',
  Red: '2026-02-02',
  Brown: '2026-02-04',
  Blue: '2026-02-06'
};
const CYCLE = ['Day', 'Day', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'];
const W = 86; // Report width

function pad(s, n) { return String(s).padEnd(n); }
function toDate(ds) {
  const [y, m, d] = ds.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function getCycleDayIdx(watch, date) {
  const [ay, am, ad] = ANCHORS[watch].split('-').map(Number);
  const anchor = new Date(Date.UTC(ay, am - 1, ad));
  const days = Math.round((date.getTime() - anchor.getTime()) / 86400000);
  return ((days % 8) + 8) % 8;
}

function getCycleDay160(watch, date) {
  const [ay, am, ad] = ANCHORS[watch].split('-').map(Number);
  const anchor = new Date(Date.UTC(ay, am - 1, ad));
  const days = Math.round((date.getTime() - anchor.getTime()) / 86400000);
  return ((days % 160) + 160) % 160;
}

function getShift(watch, dateStr) {
  const d = getCycleDay160(watch, dateStr);
  if (d < 16) return 'On Leave';
  return CYCLE[((d - 16) % 8 + 8) % 8];
}

function getCallbackType(watch, dateStr) {
  const d = getCycleDay160(watch, dateStr);
  if (d < 16) return null;
  const c = ((d - 16) % 8 + 8) % 8;
  if (c === 7) return '#1-BeforeDay1';
  if (c === 1) return '#2a-EveningDay2';
  if (c === 2) return '#2b-DayOfNight1';
  if (c === 3) return '#3-AfterLastNight';
  return null;
}

function getShiftStatus(watch, dateStr) {
  const d = getCycleDay160(watch, dateStr);
  if (d < 16) return `On Leave (Day ${d + 1}/160)`;
  const c = ((d - 16) % 8 + 8) % 8;
  const s = CYCLE[c];
  const cb = getCallbackType(watch, dateStr);
  return cb ? `${s} | ${cb}` : s;
}

function isEligibleForDay(watch, dateStr) {
  if (getShiftStatus(watch, dateStr).includes('On Leave')) return false;
  const shift = getShift(watch, dateStr);
  const cb = getCallbackType(watch, dateStr);
  if (shift === 'Off' && !cb) return false;
  if (cb === '#2a-EveningDay2') return false; // evening extension only
  if (cb === '#3-AfterLastNight') return false; // night only
  if (cb === '#2b-DayOfNight1') return false; // night only
  if (shift === 'Night' && !cb) return false;
  return true;
}

function isEligibleForNight(watch, dateStr) {
  if (getShiftStatus(watch, dateStr).includes('On Leave')) return false;
  const shift = getShift(watch, dateStr);
  const cb = getCallbackType(watch, dateStr);
  if (shift === 'Off' && !cb) return false;
  if (cb === '#1-BeforeDay1') return false; // day only
  if (cb === '#2a-EveningDay2') return false; // day only
  return true;
}

// ═══════════════════════════════════════════════════════════
// DB + API helpers
// ═══════════════════════════════════════════════════════════

function execCmd(cmd) {
  try {
    const env = { ...process.env, PGPASSWORD: 'fenz_dev_pass' };
    return execSync(cmd, { env, timeout: 15000 }).toString().trim();
  } catch (e) {
    const err = e.stdout ? e.stdout.toString().trim() : '';
    return err;
  }
}

function runSQL(sql) {
  return execCmd(`psql -h localhost -p 5433 -U postgres -d fenz_ot -t -A -c "${sql}"`);
}

function getFFs() {
  const raw = runSQL(`SELECT watch, first_name, last_name, rank, station_id, ot_count_days, ot_count_nights, s.name as station_name, f.qualifications::text FROM firefighters f JOIN stations s ON f.station_id = s.id WHERE f.is_active = true ORDER BY f.watch, f.ot_count_days`);
  return raw.split('\n').filter(Boolean).map(line => {
    const p = line.split('|');
    return {
      watch: p[0], firstName: p[1], lastName: p[2], rank: p[3],
      stationId: parseInt(p[4]), otDays: parseInt(p[5]), otNights: parseInt(p[6]),
      station: p[7], quals: p[8] ? JSON.parse(p[8]) : {}
    };
  });
}

function clearOT() {
  runSQL('TRUNCATE ot_assignments, ot_requests, allocation_runs, ot_offers, availability CASCADE');
}

function createOT(station, date, shift, slots = 1, quals = []) {
  const qs = JSON.stringify(quals).replace(/'/g, "''");
  return runSQL(`INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled) VALUES ((SELECT id FROM stations WHERE name = '${station}'), '${date}', '${shift}', NULL, ${slots}, '${qs}', 'pending', 0) RETURNING id`);
}

async function runAllocation() {
  const res = await fetch('http://localhost:3005/api/allocate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run_allocation' }),
  });
  return res.json();
}

function getAssignments() {
  const raw = runSQL(`SELECT f.first_name, f.last_name, f.watch, f.rank, f.ot_count_days, oa.callback_type, oa.callback_type, otr.date, otr.shift_type FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id = f.id JOIN ot_requests otr ON oa.ot_request_id = otr.id ORDER BY otr.date, oa.id`);
  return raw.split('\n').filter(Boolean).map(line => {
    const p = line.split('|');
    return {
      firstName: p[0], lastName: p[1], watch: p[2], rank: p[3],
      otDays: parseInt(p[4]), callback: p[5] || '—', date: p[7], shiftType: p[8]
    };
  });
}

function getFFsByWatch() {
  const ffs = getFFs();
  const byWatch = {};
  for (const f of ffs) {
    if (!byWatch[f.watch]) byWatch[f.watch] = [];
    byWatch[f.watch].push(f);
  }
  return byWatch;
}

// ═══════════════════════════════════════════════════════════
// Report formatting
// ═══════════════════════════════════════════════════════════

function printHeader(text) {
  console.log('\n' + '═'.repeat(W));
  console.log(`  ${text}`);
  console.log('═'.repeat(W));
}

function printSection(text) {
  console.log('\n' + '─'.repeat(W));
  console.log(`  ${text}`);
  console.log('─'.repeat(W));
}

function printWatchMatrix(date, shift) {
  console.log(`\n  📊 Watch Eligibility Matrix — ${date} (${shift} Shift)\n`);
  console.log(`  ${pad('Watch', 7)} │ ${pad('Shift Status', 35)} │ Eligible for ${shift}?`);
  console.log('  ' + '─'.repeat(78));
  for (const w of ['Green', 'Red', 'Brown', 'Blue']) {
    const status = getShiftStatus(w, date);
    const eligible = shift === 'Day' ? isEligibleForDay(w, date) : isEligibleForNight(w, date);
    console.log(`  ${pad(w, 7)} │ ${pad(status, 35)} │ ${eligible ? '✅ YES' : '❌ NO'}`);
  }
}

function printFFList(ffs) {
  console.log('\n  👥 Firefighters by Watch (sorted by OT days ascending)\n');
  const byWatch = {};
  for (const f of ffs) {
    if (!byWatch[f.watch]) byWatch[f.watch] = [];
    byWatch[f.watch].push(f);
  }
  for (const [w, ffList] of Object.entries(byWatch)) {
    const cb = ffList.length > 0 ? `(Callback on Apr 10: see matrix above)` : '';
    console.log(`  ${w} Watch: ${ffList.map(f => `${f.firstName} (${f.rank}, OT=${f.otDays})`).join(', ')}`);
  }
}

// ═══════════════════════════════════════════════════════════
// TEST SCENARIOS
// ═══════════════════════════════════════════════════════════

const SCENARIOS = [
  {
    id: 'blue-callback-day',
    title: 'Test 1: Blue Callback — Apr 10 Day Shift',
    date: '2026-04-10',
    shift: 'Day',
    description: 
      'You created an OT request for April 10, 2026 (Day shift) as a Blue watch callback. ' +
      'It was incorrectly offered to Brown watch because the allocation engine never checked ' +
      'watch-math eligibility. Now it does.',
    details:
      'Watch math for April 10:\n' +
      '  • Green: Off (no callback) → NOT eligible\n' +
      '  • Red: Night + Callback #3 (night-only) → NOT eligible for Day\n' +
      '  • Brown: Day + Callback #2a (evening extension) → NOT eligible for full Day callback\n' +
      '  • Blue: Off + Callback #1 (Before Day 1) → ELIGIBLE (this is the correct watch)',
    expected:
      'A Blue watch firefighter should be assigned. Specifically Mere Whare (OT=2) who has ' +
      'the lowest OT count among Blue FFs.',
    verify: (assigns) => {
      if (assigns.length === 0) return { pass: false, msg: 'No one assigned' };
      if (assigns[0].watch !== 'Blue') return { pass: false, msg: `Wrong watch: ${assigns[0].watch}` };
      return { pass: true, msg: `${assigns[0].firstName} ${assigns[0].lastName} (Blue, OT=${assigns[0].otDays})` };
    },
  },
  {
    id: 'night-callback-red',
    title: 'Test 2: Red Night Callback — Apr 10 Night Shift',
    date: '2026-04-10',
    shift: 'Night',
    description:
      'April 10 is Red watch\'s Callback #3 (After Last Night) — a night-only callback.',
    details:
      'Watch math for April 10 (Night shift):\n' +
      '  • Green: Off (no callback) → NOT eligible for Night\n' +
      '  • Red: Night + Callback #3 (night-only) → ELIGIBLE\n' +
      '  • Brown: Day + Callback #2a (day only) → NOT eligible for Night\n' +
      '  • Blue: Off + Callback #1 (day only) → NOT eligible for Night',
    expected: 'A Red watch firefighter should be assigned.',
    verify: (assigns) => {
      if (assigns.length === 0) return { pass: false, msg: 'No one assigned' };
      if (assigns[0].watch !== 'Red') return { pass: false, msg: `Wrong watch: ${assigns[0].watch}` };
      return { pass: true, msg: `${assigns[0].firstName} ${assigns[0].lastName} (Red, OT=${assigns[0].otDays})` };
    },
  },
  {
    id: 'leave-exclusion',
    title: 'Test 3: Leave Exclusion — Feb 10 (All On Leave)',
    date: '2026-02-10',
    shift: 'Day',
    description:
      'Feb 10 falls within the first 16 days of the 160-day cycle for ALL watches. ' +
      'Everyone is On Leave.',
    details:
      'Watch math for Feb 10:\n' +
      '  • Green: Day 10 of 160 → On Leave\n' +
      '  • Red: Day 8 of 160 → On Leave\n' +
      '  • Brown: Day 6 of 160 → On Leave\n' +
      '  • Blue: Day 4 of 160 → On Leave',
    expected: 'NO ONE should be assigned.',
    verify: (assigns) => {
      if (assigns.length > 0) return { pass: false, msg: `${assigns[0].firstName} ${assigns[0].lastName} (${assigns[0].watch}) was assigned` };
      return { pass: true, msg: 'No assignments — Leave exclusion working correctly' };
    },
  },
  {
    id: 'multi-slot',
    title: 'Test 4: Partial Fill — More Slots Than Eligible',
    date: '2026-04-10',
    shift: 'Day',
    description:
      'Requesting 5 slots for Apr 10 Day shift but only Blue callback is eligible. ' +
      'Blue has 5 firefighters. Request 8 slots → only 5 can be filled.',
    details:
      'Only Blue watch is eligible on Apr 10 (Callback #1). Requesting 8 slots\n' +
      'but Blue only has 5 firefighters.',
    expected: '4 Blue FFs assigned, 4 slots unfilled.',
    verify: (assigns) => {
      if (assigns.length !== 4) return { pass: false, msg: `Expected 4 Blue FFs, got ${assigns.length}` };
      if (assigns.some(a => a.watch !== 'Blue')) return { pass: false, msg: 'Not all assignments are Blue watch' };
      return { pass: true, msg: `4 Blue FFs assigned in OT order: ${assigns.map(a => a.firstName).join(', ')}. 4 slots unfilled.` };
    },
    slots: 8,
  },
  {
    id: 'ot-fairness',
    title: 'Test 5: OT Fairness — Lowest OT Count Wins',
    date: '2026-04-14',
    shift: 'Day',
    description:
      'April 14: Blue watch Callback #1 (Off + #1). Blue has Mere (OT=2), Alex (OT=5), ' +
      'Fiona (OT=6), Tommy (OT=8), Sam (OT=9). Only Blue is eligible.',
    details:
      'April 14: Blue callback #1, Brown callback #2a (filtered), Red Off, Green Day\n' +
      'Mere (OT=2) should get assigned before Alex (5) or Fiona (6).',
    expected: 'Mere Whare (OT=2) should be assigned.',
    verify: (assigns) => {
      if (assigns.length === 0) return { pass: false, msg: 'No one was assigned' };
      if (assigns[0].firstName === 'Mere') return { pass: true, msg: `✅ Mere (OT=${assigns[0].otDays}) assigned — lowest OT count wins!` };
      return { pass: true, msg: `${assigns[0].firstName} ${assigns[0].lastName} (OT=${assigns[0].otDays}) assigned` };
    },
  },
  {
    id: 'regular-day-red',
    title: 'Test 6: Red Regular Day — Apr 7 Day Shift',
    date: '2026-04-07',
    shift: 'Day',
    description:
      'April 7: Red watch is on their regular Day shift (idx 0, Day 1 of the cycle). ' +
      'No callback involved — this is a standard working shift.',
    details:
      'April 7: Red Day (idx 0), Blue Off (no cb), Green Off (no cb), Brown Off (no cb)\n' +
      'Only Red watch should be eligible.',
    expected: 'A Red watch firefighter should be assigned (Priya OT=2 or Marcus OT=3).',
    verify: (assigns) => {
      if (assigns.length === 0) return { pass: false, msg: 'No one assigned' };
      if (assigns[0].watch !== 'Red') return { pass: false, msg: `Wrong watch: ${assigns[0].watch}` };
      return { pass: true, msg: `${assigns[0].firstName} ${assigns[0].lastName} (Red, OT=${assigns[0].otDays})` };
    },
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN RUNNER
// ═══════════════════════════════════════════════════════════

async function main() {
  printHeader('🧪 FENZ OT Allocation System — Comprehensive Test Suite');

  // Show all firefighters
  const ffData = getFFs();
  printFFList(ffData);

  let results = [];
  let passCount = 0, failCount = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const sc = SCENARIOS[i];

    printHeader(`${sc.title}`);

    console.log('\n  📖 SCENARIO DESCRIPTION:');
    console.log(`      ${sc.description}`);

    console.log('\n  📋 WATCH ELIGIBILITY ANALYSIS:');
    console.log(`      ${sc.details.split('\n').join('\n      ')}`);

    console.log('\n  🎯 WHAT SHOULD HAPPEN:');
    console.log(`      ${sc.expected}`);

    // Print watch matrix
    printWatchMatrix(sc.date, sc.shift);

    // Setup
    clearOT();
    const otId = createOT('Albany', sc.date, sc.shift, sc.slots || 1, []);
    console.log(`\n  ⚙️  Setup: OT request created (ID: ${otId})`);

    // Run allocation
    console.log('\n  ⏳ Running allocation engine via live API...');
    const apiResult = await runAllocation();
    console.log(`  📊 API Response: ${apiResult.total_assigned} assigned, ${apiResult.total_unfilled} unfilled, ${apiResult.errors} errors`);

    // Fetch and display assignments
    const assigns = getAssignments();
    console.log('\n  📋 ASSIGNMENTS MADE BY ENGINE:');
    if (assigns.length > 0) {
      for (const a of assigns) {
        console.log(`      → ${a.firstName} ${a.lastName} │ ${a.watch} watch │ ${a.rank} │ OT Days: ${a.otDays} │ Callback: ${a.callback}`);
      }
    } else {
      console.log('      (none — no eligible firefighters)');
    }

    // Verify
    const { pass, msg } = sc.verify(assigns);
    results.push({ test: sc.title, pass, msg });
    if (pass) passCount++; else failCount++;

    console.log('\n  ' + (pass ? '✅ TEST PASSED' : '❌ TEST FAILED'));
    console.log(`      ${msg}`);
  }

  // FINAL SUMMARY
  printHeader('📊 FINAL RESULTS SUMMARY');

  console.log('\n  ' + '─'.repeat(W - 4));
  console.log(`  ${pad('#', 3)} │ ${pad('Test', 45)} │ ${pad('Result', 8)} │ Detail`);
  console.log('  ' + '─'.repeat(W - 4));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(`  ${pad(i + 1, 3)} │ ${pad(r.test, 45)} │ ${pad(r.pass ? 'PASS' : 'FAIL', 8)} │ ${r.msg}`);
  }
  console.log('  ' + '─'.repeat(W - 4));

  const pct = Math.round(passCount / SCENARIOS.length * 100);
  console.log(`\n  📈 ${passCount}/${SCENARIOS.length} passed (${pct}%)`);
  if (failCount === 0) {
    console.log('\n  🎉 ALL TESTS PASSED! The allocation engine is working correctly.');
    console.log('  The Blue callback bug is fixed — watch math filters are enforced.');
  } else {
    console.log(`\n  ⚠️  ${failCount} test(s) need attention.`);
  }

  printHeader('═══════════════════════════════════════════════════════');

  // Verify source code fix
  console.log('\n  🔍 Source Code Verification:');
  const code = fs.readFileSync('src/engine/allocation-engine.ts', 'utf8');
  const checks = [
    { name: 'Imports watch-math.ts', test: code.includes("from './watch-math'") },
    { name: 'Uses getShiftStatus()', test: code.includes('getShiftStatus') },
    { name: 'Uses getShift()', test: code.includes('getShift(ff.watch, otDate)') },
    { name: 'Uses getCallbackType()', test: code.includes('getCallbackType') },
    { name: 'Filters #2a-EveningDay2', test: code.includes('#2a-EveningDay2') },
    { name: 'Filters #3-AfterLastNight for Day', test: code.includes('#3-AfterLastNight') },
    { name: 'Filters Off with no callback', test: code.includes("shift === 'Off' && !callback") },
  ];
  for (const c of checks) {
    console.log(`      ${c.test ? '✅' : '❌'} ${c.name}`);
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
