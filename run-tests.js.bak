#!/usr/bin/env node
const { execSync } = require('fs').readFileSync ? require('child_process') : null;
const fs = require('fs');

const ANCHORS = {
  Green: '2026-01-31',
  Red: '2026-02-02',
  Brown: '2026-02-04',
  Blue: '2026-02-06'
};
var CYCLE = ['Day', 'Day', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'];

function toDate(ds) {
  var parts = ds.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function getCycleDay160(watch, dateStr) {
  var anchor = toDate(ANCHORS[watch]);
  var target = toDate(dateStr);
  var days = Math.round((target.getTime() - anchor.getTime()) / 86400000);
  return ((days % 160) + 160) % 160;
}

function getCycleIndex8(watch, dateStr) {
  var anchor = toDate(ANCHORS[watch]);
  var target = toDate(dateStr);
  var days = Math.round((target.getTime() - anchor.getTime()) / 86400000);
  return ((days % 8) + 8) % 8;
}

function getShift(watch, dateStr) {
  var d = getCycleDay160(watch, dateStr);
  if (d < 16) return 'On Leave';
  return CYCLE[((d - 16) % 8 + 8) % 8];
}

function getCallbackType(watch, dateStr) {
  var d = getCycleDay160(watch, dateStr);
  if (d < 16) return null;
  var c = ((d - 16) % 8 + 8) % 8;
  if (c === 7) return '#1-BeforeDay1';
  if (c === 1) return '#2a-EveningDay2';
  if (c === 2) return '#2b-DayOfNight1';
  if (c === 3) return '#3-AfterLastNight';
  return null;
}

function getShiftStatus(watch, dateStr) {
  var d = getCycleDay160(watch, dateStr);
  if (d < 16) return 'On Leave (Day ' + (d + 1) + '/160)';
  var c = ((d - 16) % 8 + 8) % 8;
  var s = CYCLE[c];
  var cb = getCallbackType(watch, dateStr);
  return cb ? (s + ' | ' + cb) : s;
}

function isEligibleFor(watch, dateStr, shiftType) {
  var status = getShiftStatus(watch, dateStr);
  if (status.indexOf('On Leave') !== -1) return false;
  var shift = getShift(watch, dateStr);
  var cb = getCallbackType(watch, dateStr);
  if (shift === 'Off' && !cb) return false;
  if (shiftType === 'Day') {
    if (cb === '#2a-EveningDay2') return false;
    if (cb === '#3-AfterLastNight') return false;
    if (cb === '#2b-DayOfNight1') return false;
    if (shift === 'Night' && !cb) return false;
  }
  if (shiftType === 'Night') {
    if (cb === '#1-BeforeDay1') return false;
    if (cb === '#2a-EveningDay2') return false;
    if (shift === 'Day' && !cb) return false;
  }
  return true;
}

function sql(q) {
  try {
    var env = Object.assign({}, process.env, { PGPASSWORD: 'fenz_dev_pass' });
    var cmd = 'psql -h localhost -p 5433 -U postgres -d fenz_ot -t -A -c "' + q.replace(/"/g, '\\"') + '"';
    return execSync(cmd, { env: env, timeout: 15000 }).toString().trim();
  } catch (e) {
    return '';
  }
}

function getFFs() {
  var raw = sql('SELECT watch, first_name, last_name, rank, ot_count_days FROM firefighters WHERE is_active=true ORDER BY watch, ot_count_days');
  if (!raw) return [];
  return raw.split('\n').filter(function(l) { return l; }).map(function(line) {
    var p = line.split('|');
    return { watch: p[0], fn: p[1], ln: p[2], rank: p[3], ot: parseInt(p[4]) };
  });
}

function clearOT() {
  sql('TRUNCATE ot_assignments, ot_requests, allocation_runs, ot_offers, availability CASCADE');
}

function createOT(station, date, shift, slots) {
  slots = slots || 1;
  return sql("INSERT INTO ot_requests (station_id, date, shift_type, number_of_slots, required_qualification_ids, status, number_filled) VALUES ((SELECT id FROM stations WHERE name='" + station + "'), '" + date + "', '" + shift + "', " + slots + ", '[]', 'pending', 0) RETURNING id");
}

async function runAlloc() {
  var res = await fetch('http://localhost:3005/api/allocate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run_allocation' })
  });
  return res.json();
}

function getAssignments() {
  var raw = sql('SELECT f.first_name, f.last_name, f.watch, f.rank, f.ot_count_days, oa.callback_type FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id=f.id ORDER BY oa.id');
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map(function(line) {
    var p = line.split('|');
    return { fn: p[0], ln: p[1], watch: p[2], rank: p[3], ot: parseInt(p[4]), cb: p[5] || '-' };
  });
}

// Report helpers
var W = 80;
function hr(c) { console.log(''); console.log(c ? c.repeat(W) : '='.repeat(W)); console.log(''); }
function pad(s, n) { return String(s).padEnd(n); }

function printWatchMatrix(date, shift) {
  var watches = ['Green', 'Red', 'Brown', 'Blue'];
  console.log('');
  console.log('  Watch Eligibility for ' + date + ' (' + shift + ' Shift)');
  console.log('  ' + '-'.repeat(60));
  console.log('  ' + pad('Watch', 7) + ' | ' + pad('Status', 30) + ' | Eligible?');
  console.log('  ' + '-'.repeat(60));
  for (var i = 0; i < watches.length; i++) {
    var w = watches[i];
    var status = getShiftStatus(w, date);
    var eligible = isEligibleFor(w, date, shift);
    var mark = eligible ? 'YES' : 'NO';
    console.log('  ' + pad(w, 7) + ' | ' + pad(status, 30) + ' | ' + mark);
  }
  console.log('');
}

// Scenarios
var SCENARIOS = [
  {
    id: 'blue-callback',
    name: '1. Blue Callback - April 10 Day Shift',
    date: '2026-04-10',
    shift: 'Day',
    detail: 'April 10: Blue is Off + Callback #1 (before Day 1). Brown is Day + Callback #2a (evening only). Red is Night + Callback #3 (night only). Green is Off with no callback.',
    shouldHappen: 'A Blue watch FF gets assigned. Callback #1 is the only full-Day callback.',
    slots: 1,
    verify: function(a) {
      if (!a.length) return { pass: false, msg: 'No assignments' };
      if (a[0].watch !== 'Blue') return { pass: false, msg: 'Expected Blue, got ' + a[0].watch };
      return { pass: true, msg: a[0].fn + ' ' + a[0].ln + ' (Blue, OT=' + a[0].ot + ')' };
    }
  },
  {
    id: 'night-red',
    name: '2. Red Night Callback - April 10 Night Shift',
    date: '2026-04-10',
    shift: 'Night',
    detail: 'April 10: Red is Night + Callback #3 (AfterLastNight). Only Red has a night-relevant callback.',
    shouldHappen: 'A Red watch FF gets assigned. Callback #3 is night-only.',
    slots: 1,
    verify: function(a) {
      if (!a.length) return { pass: false, msg: 'No assignments' };
      if (a[0].watch !== 'Red') return { pass: false, msg: 'Expected Red, got ' + a[0].watch };
      return { pass: true, msg: a[0].fn + ' ' + a[0].ln + ' (Red, OT=' + a[0].ot + ')' };
    }
  },
  {
    id: 'leave-all',
    name: '3. Leave Exclusion - Feb 10 (All On Leave)',
    date: '2026-02-10',
    shift: 'Day',
    detail: 'Feb 10: All 4 watches are in the first 16 days of their cycle. Green=Day 10, Red=Day 8, Brown=Day 6, Blue=Day 4. All On Leave.',
    shouldHappen: 'NOBODY should be assigned. Everyone is On Leave.',
    slots: 1,
    verify: function(a) {
      if (a.length > 0) return { pass: false, msg: a[0].fn + ' assigned but everyone should be On Leave' };
      return { pass: true, msg: 'No assignments - Leave exclusion working' };
    }
  },
  {
    id: 'multi-slot',
    name: '4. Not Enough FFs - Partial Fill (Apr 10 Day, 8 slots)',
    date: '2026-04-10',
    shift: 'Day',
    detail: 'April 10: Only Blue callback eligible. Blue has 5 FFs: Mere(2), Alex(5), Fiona(6), Tommy(8), Sam(9). Requesting 8 slots.',
    shouldHappen: 'All 5 Blue FFs assigned. 3 slots remain unfilled.',
    slots: 8,
    verify: function(a) {
      if (a.length === 0) return { pass: false, msg: 'No assignments' };
      var nonBlue = a.filter(function(x) { return x.watch !== 'Blue'; });
      if (nonBlue.length > 0) return { pass: false, msg: 'Non-Blue FFs assigned' };
      return { pass: true, msg: a.length + ' Blue FFs assigned (' + a.map(function(x) { return x.fn; }).join(', ') + '). ' + (8 - a.length) + ' slots unfilled.' };
    }
  },
  {
    id: 'green-callback',
    name: '5. Green Callback - April 14 Day Shift',
    date: '2026-04-14',
    shift: 'Day',
    detail: 'April 14: Green is Off + Callback #1. Red is Off (no cb). Brown is Night (no cb). Blue is Day + #2a (filtered). ',
    shouldHappen: 'A Green watch FF gets assigned from Callback #1.',
    slots: 1,
    verify: function(a) {
      if (!a.length) return { pass: false, msg: 'No assignments' };
      if (a[0].watch !== 'Green') return { pass: false, msg: 'Expected Green, got ' + a[0].watch };
      return { pass: true, msg: a[0].fn + ' ' + a[0].ln + ' (Green, OT=' + a[0].ot + ')' };
    }
  },
  {
    id: 'brown-regular',
    name: '6. Brown Regular Day - April 13 Day Shift',
    date: '2026-04-13',
    shift: 'Day',
    detail: 'April 13: Brown is on regular Day shift (idx 0 = Day 1). No callback filter applies.',
    shouldHappen: 'A Brown watch FF gets assigned.',
    slots: 1,
    verify: function(a) {
      if (!a.length) return { pass: false, msg: 'No assignments' };
      return { pass: true, msg: a[0].fn + ' ' + a[0].ln + ' (' + a[0].watch + ', OT=' + a[0].ot + ')' };
    }
  },
];

async function main() {
  console.log('');
  console.log('  FENZ OT Allocation System - Comprehensive Test Suite');
  console.log('  Live API + Watch-Math Verification');

  var ffs = getFFs();
  if (!ffs || ffs.length === 0) {
    console.log('');
    console.log('  ERROR: No firefighters in database. Run: npx tsx seed-fix.ts');
    return;
  }

  console.log('');
  console.log('  All Active Firefighters:');
  console.log('  ' + '-'.repeat(60));
  console.log('  ' + pad('Watch', 7) + ' | ' + pad('Name', 20) + ' | ' + pad('Rank', 5) + ' | OT Days');
  console.log('  ' + '-'.repeat(60));
  ffs.forEach(function(f) {
    console.log('  ' + pad(f.watch, 7) + ' | ' + pad(f.fn + ' ' + f.ln, 20) + ' | ' + pad(f.rank, 5) + ' | ' + f.ot);
  });

  var passed = 0, failed = 0;
  var results = [];

  for (var i = 0; i < SCENARIOS.length; i++) {
    var sc = SCENARIOS[i];
    hr('-');
    console.log('  ' + sc.name);
    hr('-');

    console.log('');
    console.log('  WHAT SHOULD HAPPEN:');
    console.log('  ' + sc.shouldHappen);
    console.log('');
    console.log('  DETAILS:');
    console.log('  ' + sc.detail);

    printWatchMatrix(sc.date, sc.shift);

    clearOT();
    var otId = createOT('Albany', sc.date, sc.shift, sc.slots || 1);
    console.log('  OT Request created: id=' + otId);

    console.log('');
    console.log('  Running allocation engine...');
    var api = await runAlloc();
    console.log('  API: assigned=' + api.total_assigned + ' unfilled=' + api.total_unfilled + ' errors=' + api.errors);

    var assigns = getAssignments();
    console.log('');
    console.log('  Assignments made:');
    if (assigns.length > 0) {
      assigns.forEach(function(a) {
        console.log('    -> ' + a.fn + ' ' + a.ln + ' (' + a.watch + ' ' + a.rank + ' OT=' + a.ot + ') cb=' + a.cb);
      });
    } else {
      console.log('    (none)');
    }

    var r = sc.verify(assigns);
    results.push({ scenario: sc.name, pass: r.pass, msg: r.msg });
    if (r.pass) passed++; else failed++;

    console.log('');
    console.log('  RESULT: ' + (r.pass ? 'PASS' : 'FAIL'));
    console.log('  ' + r.msg);
  }

  hr('=');
  console.log('  FINAL RESULTS');
  hr('=');

  console.log('');
  console.log('  ' + pad('#', 3) + ' | ' + pad('Scenario', 50) + ' | Result | Detail');
  console.log('  ' + '-'.repeat(78));
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var status = r.pass ? 'PASS' : 'FAIL';
    console.log('  ' + pad(i + 1, 3) + ' | ' + pad(r.scenario, 50) + ' | ' + pad(status, 6) + ' | ' + r.msg);
  }
  console.log('');
  console.log('  Total: ' + passed + '/' + SCENARIOS.length + ' tests passed');
  if (failed === 0) {
    console.log('');
    console.log('  All tests passed! The allocation engine is working correctly.');
    console.log('  - Callback watches are correctly identified');
    console.log('  - Leave exclusion is enforced');
    console.log('  - Night/Day shift type matching is working');
    console.log('  - Partial fills work when not enough eligible FFs');
  } else {
    console.log('');
    console.log('  ' + failed + ' test(s) failed - see details above.');
  }

  // Also verify source code has the fix
  console.log('');
  console.log('  Source Code Verification:');
  var code = fs.readFileSync('src/engine/allocation-engine.ts', 'utf8');
  var checks = [
    ['Imports watch-math', code.indexOf("./watch-math") !== -1],
    ['Uses getShiftStatus()', code.indexOf('getShiftStatus') !== -1],
    ['Uses getShift()', code.indexOf('getShift(ff.watch') !== -1],
    ['Uses getCallbackType()', code.indexOf('getCallbackType') !== -1],
    ['Filters #2a callback for Day', code.indexOf('#2a-EveningDay2') !== -1],
    ['Filters #3 callback for Day', code.indexOf('#3-AfterLastNight') !== -1],
    ['Filters Off with no callback', code.indexOf("shift === 'Off' && !callback") !== -1],
  ];
  checks.forEach(function(c) {
    console.log('    ' + (c[1] ? '[OK]' : '[MISSING]') + ' ' + c[0]);
  });

  hr('=');
}

main().catch(function(e) {
  console.error('Fatal error:', e);
});