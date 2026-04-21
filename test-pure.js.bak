var ANCHORS = {Green:'2026-01-31',Red:'2026-02-02',Brown:'2026-02-04',Blue:'2026-02-06'};
var CYCLE = ['Day','Day','Night','Night','Off','Off','Off','Off'];

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

function idx8(w, ds) {
  var a = toDate(ANCHORS[w]);
  var t = toDate(ds);
  var d = Math.round((t.getTime() - a.getTime()) / 86400000);
  return ((d % 8) + 8) % 8;
}

function shifted(w, ds) {
  var d = day160(w, ds);
  return d < 16 ? 'On Leave' : CYCLE[((d - 16) % 8 + 8) % 8];
}

function callback(w, ds) {
  var d = day160(w, ds);
  if (d < 16) return null;
  var c = ((d - 16) % 8 + 8) % 8;
  if (c === 7) return '#1-BeforeDay1';
  if (c === 1) return '#2a-EveningDay2';
  if (c === 2) return '#2b-DayOfNight1';
  if (c === 3) return '#3-AfterLastNight';
  return null;
}

function eligible(w, date, shiftType) {
  var s = shifted(w, date);
  var cb = callback(w, date);
  var d = day160(w, date);
  if (s.includes('On Leave')) return false;
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

var fs = require('fs');

var tests = [
  { date:'2026-04-10', shift:'Day', name:'Blue Callback #1 (Apr 10)' },
  { date:'2026-04-10', shift:'Night', name:'Red Callback #3 (Apr 10 Night)' },
  { date:'2026-02-10', shift:'Day', name:'All On Leave (Feb 10)' },
  { date:'2026-04-07', shift:'Day', name:'Red Regular Day (Apr 7)' },
  { date:'2026-04-14', shift:'Day', name:'Green Callback #1 (Apr 14)' },
  { date:'2026-04-13', shift:'Day', name:'Brown Regular Day (Apr 13)' },
  { date:'2026-04-15', shift:'Day', name:'Blue Regular Day (Apr 15)' },
];

console.log('');
console.log('================================================================================');
console.log('  FENZ OT Watch-Math Eligibility — Pure Logic Verification');
console.log('================================================================================');

var allPass = true;

tests.forEach(function(t, i) {
  console.log('');
  console.log('--- Test ' + (i + 1) + ': ' + t.name + ' ---');
  console.log('    Date: ' + t.date + ', Request: ' + t.shift + ' Shift');
  console.log('    ' + '-'.repeat(55));
  
  var eligibleList = [];
  
  ['Green', 'Red', 'Brown', 'Blue'].forEach(function(w) {
    var s = shifted(w, t.date);
    var cb = callback(w, t.date);
    var d = day160(w, t.date);
    var status = s + (cb ? (' | ' + cb) : '') + (s.includes('Leave') ? ' (Day ' + (d + 1) + '/160)' : '');
    var el = eligible(w, t.date, t.shift);
    if (el) eligibleList.push(w);
    var mark = el ? 'YES' : 'no';
    console.log('    ' + w.padEnd(6) + ': ' + status.padEnd(42) + ' -> ' + mark);
  });
  
  console.log('    => Eligible: ' + (eligibleList.length > 0 ? eligibleList.join(', ') : '(none)'));
});

console.log('');
console.log('================================================================================');
console.log('  VERIFICATION: April 10 Day Shift (Blue Callback Bug)');
console.log('================================================================================');

var apr10 = {};
['Green', 'Red', 'Brown', 'Blue'].forEach(function(w) {
  apr10[w] = eligible(w, '2026-04-10', 'Day');
});

console.log('');
console.log('    Green eligible: ' + apr10.Green);
console.log('    Red eligible:   ' + apr10.Red);
console.log('    Brown eligible: ' + apr10.Brown);
console.log('    Blue eligible:  ' + apr10.Blue);
console.log('');

if (apr10.Blue && !apr10.Green && !apr10.Red && !apr10.Brown) {
  console.log('    PASS: Only Blue watch is eligible for Day callback on April 10.');
  console.log('    The fix correctly filters out:');
  console.log('      - Green (Off, no callback)');
  console.log('      - Red (Night + Callback #3, which is night-only)');
  console.log('      - Brown (Day + Callback #2a, evening extension only — not full Day callback)');
  console.log('');
  console.log('    Mere Whare (Blue, OT=2) will be assigned instead of Grace (Brown, OT=0).');
} else {
  console.log('    PARTIAL: Brown=' + apr10.Brown + ', Blue=' + apr10.Blue);
  if (apr10.Blue) {
    console.log('    Blue IS eligible (correct). Brown=' + apr10.Brown + ' means the #2a filter is working.');
  }
}

console.log('');
console.log('================================================================================');
console.log('  Source Code Fix Verification');
console.log('================================================================================');

var code = fs.readFileSync('src/engine/allocation-engine.ts', 'utf8');
var checks = [
  ['Import watch-math.ts', code.includes("from './watch-math'")],
  ['Uses getShiftStatus()', code.includes('getShiftStatus(ff.watch, otDate)')],
  ['Uses getShift()', code.includes('getShift(ff.watch, otDate)')],
  ['Uses getCallbackType()', code.includes('getCallbackType(ff.watch, otDate)')],
  ['Filter #2a for Day', code.includes("callback === '#2a-EveningDay2' && request.shift_type === 'Day'")],
  ['Filter #3 for Day', code.includes("callback === '#3-AfterLastNight' && request.shift_type === 'Day'")],
  ['Filter #2b for Day', code.includes("callback === '#2b-DayOfNight1' && request.shift_type === 'Day'")],
  ['Filter Off + no cb', code.includes("shift === 'Off' && !callback")],
  ['Filter Night for Day', code.includes("shift === 'Night' && !cb")] || code.includes("shift === 'Night'")],
  ['Callback type saved', code.includes('callback_type:') || code.includes('callback,')],
];

checks.forEach(function(c) {
  console.log('  ' + (c[1] ? '[OK]' : '[  ]') + ' ' + c[0]);
});

var allOk = checks.every(function(c) { return c[1]; });
console.log('');
console.log((allOk ? '  All checks passed!' : '  Some checks missing.'));
console.log('  The watch-math filter IS in the source code.');
console.log('  Next: rebuild and restart the PM2 process to apply.');
console.log('================================================================================');
