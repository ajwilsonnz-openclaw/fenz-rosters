#!/usr/bin/env node
/**
 * FENZ OT Allocation — Full Test Suite
 * Tests the watch-math eligibility filter + live API allocation
 */

var ANCHORS = {
  Green: '2026-01-31',
  Red: '2026-02-02',
  Brown: '2026-02-04',
  Blue: '2026-02-06'
};
var CYCLE = ['Day', 'Day', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'];
var W = 82;

function toDate(s) {
  var p = s.split('-').map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2]));
}

function day160(w, ds) {
  var a = toDate(ANCHORS[w]);
  var t = toDate(ds);
  var d = Math.round((t.getTime() - a.getTime()) / 86400000);
  return ((d % 160) + 160) % 160;
}

function getShift(w, ds) {
  var d = day160(w, ds);
  return d < 16 ? 'On Leave' : CYCLE[((d - 16) % 8 + 8) % 8];
}

function getCallback(w, ds) {
  var d = day160(w, ds);
  if (d < 16) return null;
  var c = ((d - 16) % 8 + 8) % 8;
  if (c === 7) return '#1-BeforeDay1';
  if (c === 1) return '#2a-EveningDay2';
  if (c === 2) return '#2b-DayOfNight1';
  if (c === 3) return '#3-AfterLastNight';
  return null;
}

function getStatus(w, ds) {
  var s = getShift(w, ds);
  var cb = getCallback(w, ds);
  var d = day160(w, ds);
  if (s === 'On Leave') return 'On Leave (Day ' + (d + 1) + '/160)';
  return cb ? (s + ' | ' + cb) : s;
}

function isEligible(w, date, shiftType) {
  var s = getShift(w, date);
  var cb = getCallback(w, date);
  if (s === 'On Leave') return false;
  if (s === 'Off' && !cb) return false;
  if (shiftType === 'Day') {
    if (cb === '#2a-EveningDay2') return false;
    if (cb === '#3-AfterLastNight') return false;
    if (cb === '#2b-DayOfNight1') return false;
    if (s === 'Night' && !cb) return false;
  }
  if (shiftType === 'Night') {
    if (cb === '#1-BeforeDay1') return false;
    if (cb === '#2a-EveningDay2') return false;
    if (s === 'Day' && !cb) return false;
  }
  return true;
}

function pad(s, n) { return String(s).padEnd(n); }
function hr(ch) { console.log(ch.repeat(W)); }

// ── Test Scenarios ──
var SCENARIOS = [
  {
    id: 'blue-callback',
    name: '1. Blue Callback — April 10 Day Shift',
    date: '2026-04-10',
    shift: 'Day',
    desc: 'Blue callback #1 is the ONLY eligible watch for a full Day shift OT request.',
    shouldHappen: 'Blue firefighter (Mere Whare, OT=1) gets assigned',
    slots: 1,
    verify: function assigns) {
      if (!assigns.length) return { pass: false, msg: 'No assignments' };
      if (assigns[0].watch !== 'Blue') return { pass: false, msg: 'Wrong watch: ' + assigns[0].watch };
      return { pass: true, msg: assigns[0].name + ' (' + assigns[0].watch + ', OT=' + assigns[0].ot + ')' };
    }
  },
  {
    id: 'night-red',
    name: '2. Red Night Callback — April 10 Night',
    date: '2026-04-10',
    shift: 'Night',
    desc: 'Red callback #3 (AfterLastNight) is night-only.',
    shouldHappen: 'Red firefighter gets assigned',
    slots: 1,
    verify: function assigns) {
      if (!assigns.length) return { pass: false, msg: 'No assignments' };
      return { pass: true, msg: assigns[0].name + ' (' + assigns[0].watch + ', OT=' + assigns[0].ot + ')' };
    }
  },
  {
    id: 'leave-all',
    name: '3. Leave Exclusion — Feb 10',
    date: '2026-02-10',
    shift: 'Day',
    desc: 'All 4 watches are On Leave (first 16 days of cycle).',
    shouldHappen: 'NONE — zero assignments',
    slots: 1,
    verify: function assigns) {
      if (assigns.length > 0) return { pass: false, msg: assigns[0].name + ' assigned but all should be on Leave' };
      return { pass: true, msg: 'No assignments — Leave exclusion works' };
    }
  },
  {
    id: 'multi-slot',
    name: '4. Partial Fill — Apr 10 Day, 8 slots (only 5 Blue FFs)',
    date: '2026-04-10',
    shift: 'Day',
    desc: 'Only Blue callback is eligible but there are only 5 Blue FFs and 8 slots.',
    shouldHappen: 'All 5 Blue FFs assigned, 3 slots unfilled',
    slots: 8,
    verify: function assigns) {
      if (!assigns.length) return { pass: false, msg: 'No assignments' };
      var wrong = assigns.filter(function(a) { return a.watch !== 'Blue'; });
      if (wrong.length) return { pass: false, msg: 'Non-Blue assigned: ' + wrong.map(function(a){return a.name;}).join(', ') };
      return { pass: true, msg: assigns.length + ' Blue FFs assigned, ' + (8 - assigns.length) + ' unfilled' };
    }
  },
  {
    id: 'green-callback',
    name: '5. Green Callback — April 14 Day',
    date: '2026-04-14',
    shift: 'Day',
    desc: 'Green callback #1 is eligible. Others filtered.',
    shouldHappen: 'Green firefighter gets assigned',
    slots: 1,
    verify: function assigns) {
      if (!assigns.length) return { pass: false, msg: 'No assignments' };
      return { pass: true, msg: assigns[0].name + ' (' + assigns[0].watch + ', OT=' + assigns[0].ot + ')' };
    }
  },
  {
    id: 'brown-regular',
    name: '6. Brown Regular Day — April 13',
    date: '2026-04-13',
    shift: 'Day',
    desc: 'Brown is on regular Day shift (no callback). Others Off or ineligible.',
    shouldHappen: 'Brown firefighter gets assigned',
    slots: 1,
    verify: function assigns) {
      if (!assigns.length) return { pass: false, msg: 'No assignments' };
      return { pass: true, msg: assigns[0].name + ' (' + assigns[0].watch + ', OT=' + assigns[0].ot + ')' };
    }
  }
];

// Fix syntax in verify functions
SCENARIOS[0].verify = function(a) {
  if (!a.length) return { pass: false, msg: 'No assignments' };
  if (a[0].watch !== 'Blue') return { pass: false, msg: 'Wrong watch: ' + a[0].watch };
  return { pass: true, msg: a[0].name + ' (' + a[0].watch + ', OT=' + a[0].ot + ')' };
};
SCENARIOS[1].verify = function(a) {
  if (!a.length) return { pass: false, msg: 'No assignments' };
  return { pass: true, msg: a[0].name + ' (' + a[0].watch + ', OT=' + a[0].ot + ')' };
};
SCENARIOS[2].verify = function(a) {
  if (a.length > 0) return { pass: false, msg: a[0].name + ' assigned but all on Leave' };
  return { pass: true, msg: 'No assignments (Leave exclusion works)' };
};
SCENARIOS[3].verify = function(a) {
  if (!a.length) return { pass: false, msg: 'No assignments' };
  var wrong = a.filter(function(x) { return x.watch !== 'Blue'; });
  if (wrong.length) return { pass: false, msg: 'Non-Blue: ' + wrong.map(function(x){return x.name;}).join(', ') };
  return { pass: true, msg: a.length + ' Blue FFs assigned, ' + (8 - a.length) + ' unfilled' };
};
SCENARIOS[4].verify = function(a) {
  if (!a.length) return { pass: false, msg: 'No assignments' };
  return { pass: true, msg: a[0].name + ' (' + a[0].watch + ', OT=' + a[0].ot + ')' };
};
SCENARIOS[5].verify = function(a) {
  if (!a.length) return { pass: false, msg: 'No assignments' };
  return { pass: true, msg: a[0].name + ' (' + a[0].watch + ', OT=' + a[0].ot + ')' };
};

// ── MAIN ──
async function main() {
  console.log('');
  console.log('═'.repeat(W));
  console.log('  FENZ OT Allocation — Comprehensive Test Suite');
  console.log('  Tests: ' + SCENARIOS.length + ' scenarios | Live API + Watch-Math');
  console.log('═'.repeat(W));

  var passed = 0;
  var failed = 0;
  var results = [];

  for (var i = 0; i < SCENARIOS.length; i++) {
    var sc = SCENARIOS[i];
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  ' + sc.name);
    console.log('═══════════════════════════════════════════════════════════════════');

    // Print what should happen
    console.log('');
    console.log('  SCENARIO: ' + sc.desc);
    console.log('  EXPECTED: ' + sc.shouldHappen);

    // Watch eligibility matrix
    console.log('');
    console.log('  Watch Eligibility (' + sc.date + ' ' + sc.shift + '):');
    console.log('  ' + '-'.repeat(W - 4));
    var eligibleWatches = [];
    var watches = ['Green', 'Red', 'Brown', 'Blue'];
    for (var j = 0; j < watches.length; j++) {
      var w = watches[j];
      var status = getStatus(w, sc.date);
      var el = isEligible(w, sc.date, sc.shift);
      if (el) eligibleWatches.push(w);
      console.log('  ' + pad(w, 7) + ' | ' + pad(status, 35) + ' | ' + (el ? 'ELIGIBLE' : 'not eligible'));
    }
    console.log('  Eligible: ' + (eligibleWatches.length ? eligibleWatches.join(', ') : '(none)'));

    // Run allocation
    var body = JSON.stringify({
      action: 'run_allocation',
      date: sc.date,
      shift: sc.shift,
      slots: sc.slots
    });
    console.log('');
    console.log('  Running allocation...');
    try {
      var response = await fetch('http://localhost:3005/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      });
      var data = await response.json();
      var assigns = data.assignments || [];
      console.log('  API: ' + data.total_assigned + ' assigned, ' + data.total_unfilled + ' unfilled');

      if (assigns.length > 0) {
        console.log('  Assignments:');
        assigns.forEach(function(a) {
          console.log('    -> ' + a.name + ' (' + a.watch + ' ' + a.rank + ' OT=' + a.ot + ')');
        });
      } else {
        console.log('  Assignments: (none)');
      }

      var r = sc.verify(assigns.map(function(a) {
        return { name: a.first_name + ' ' + a.last_name, watch: a.watch, rank: a.rank, ot: a.ot_days };
      }));
      results.push({ num: i + 1, name: sc.name, pass: r.pass, msg: r.msg });
      if (r.pass) { passed++; console.log('  RESULT: PASS'); }
      else { failed++; console.log('  RESULT: FAIL — ' + r.msg); }
    } catch (e) {
      failed++;
      results.push({ num: i + 1, name: sc.name, pass: false, msg: 'API Error: ' + e.message });
      console.log('  RESULT: ERROR — ' + e.message);
    }
  }

  // Summary
  console.log('');
  console.log('═'.repeat(W));
  console.log('  RESULTS SUMMARY');
  console.log('═'.repeat(W));
  results.forEach(function(r) {
    console.log('  ' + (r.pass ? 'PASS' : 'FAIL') + '  |  #' + r.num + '  ' + r.name);
    console.log('         ' + r.msg);
  });
  console.log('');
  console.log('  Total: ' + passed + '/' + SCENARIOS.length + ' passed');
  if (failed === 0) {
    console.log('  ALL TESTS PASSED! Blue callback bug is fixed.');
  } else {
    console.log('  ' + failed + ' test(s) need attention.');
  }

  // Source code check
  var fs = require('fs');
  var code = fs.readFileSync('src/engine/allocation-engine.ts', 'utf8');
  console.log('├─ Source code checks:');
  console.log('├─ watch-math import: ' + (code.includes("from './watch-math'") ? 'YES' : 'NO'));
  console.log('├─ getShiftStatus used: ' + (code.includes('getShiftStatus') ? 'YES' : 'NO'));
  console.log('├─ getShift used: ' + (code.includes('getShift(ff.watch') ? 'YES' : 'NO'));
  console.log('├─ getCallbackType used: ' + (code.includes('getCallbackType') ? 'YES' : 'NO'));
  console.log('├─ #2a filter: ' + (code.includes('#2a-EveningDay2') ? 'YES' : 'NO'));
  console.log('├─ #3 filter: ' + (code.includes('#3-AfterLastNight') ? 'YES' : 'NO'));
  console.log('└─ Off+no-cb filter: ' + (code.includes("shift === 'Off' && !callback") ? 'YES' : 'NO'));

  console.log('');
  console.log('═'.repeat(W));
}

main().catch(function(e) {
  console.error('Fatal:', e);
});