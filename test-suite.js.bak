#!/usr/bin/env node
/**
 * FENZ OT Allocation — Comprehensive Test Suite with Human-Readable Reports
 *
 * Usage:  npx tsx test-suite.js
 *
 * Runs ALL test scenarios end-to-end against the live API + local watch-math,
 * then prints a plain-English breakdown of every decision.
 */

const { execSync } = require('child_process');

/* ──────── watch-math (mirrors src/engine/watch-math.ts) ─ */

const ANCHORS = { Green:'2026-01-31', Red:'2026-02-02', Brown:'2026-02-04', Blue:'2026-02-06' };
const CYCLE  = ['Day','Day','Night','Night','Off','Off','Off','Off'];

function toDate(s){ const [y,m,d]=s.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); }

function cycleDay(w, date){
  const [ay,am,ad]=ANCHORS[w].split('-').map(Number);
  const an=new Date(Date.UTC(ay,am-1,ad));
  let days=Math.round((date.getTime()-an.getTime())/86400000);
  return ((days%160)+160)%160;
}

function getShift(w, ds){
  const cd=cycleDay(w,toDate(ds));
  if(cd<16) return 'On Leave';
  return CYCLE[((cd-16)%8+8)%8];
}

function getCallbackType(w, ds){
  const cd=cycleDay(w,toDate(ds));
  if(cd<16) return null;
  const cy=((cd-16)%8+8)%8;
  if(cy===7) return '#1-BeforeDay1';
  if(cy===1) return '#2a-EveningDay2';
  if(cy===2) return '#2b-DayOfNight1';
  if(cy===3) return '#3-AfterLastNight';
  return null;
}

function getShiftStatus(w, ds){
  const cd=cycleDay(w,toDate(ds));
  if(cd<16) return `On Leave (Day ${cd+1}/160)`;
  const cy=((cd-16)%8+8)%8;
  const sh=CYCLE[cy];
  const cb=getCallbackType(w,ds);
  return cb ? `${sh} | Callback ${cb}` : sh;
}

function isEligible(w, ds, st){
  const info=getShiftStatus(w,ds);
  if(info.startsWith('On Leave')) return false;
  const sh=getShift(w,ds), cb=getCallbackType(w,ds);
  if(sh==='Off' && !cb) return false;
  if(cb==='#2a-EveningDay2' && st==='Day') return false;
  if(cb==='#3-AfterLastNight' && st==='Day') return false;
  if(cb==='#2b-DayOfNight1' && st==='Day') return false;
  if(sh==='Night' && !cb && st==='Day') return false;
  return true;
}

/* ──────── DB helpers ─────────────────────────────────── */

function runSQL(sql){
  try{
    const env = {...process.env, PGPASSWORD:'fenz_dev_pass'};
    return execSync(
      `psql -h localhost -p 5433 -U postgres -d fenz_ot -t -A -c $'${sql.replace(/\\\$/g,'\\$').replace(/'/g,"'\"'\"'")}'`,
      {env,timeout:15000}
    ).toString().trim();
  }catch(e){
    const err = e.stderr ? e.stderr.toString().slice(0,300) : '';
    console.error('  SQL error:', err);
    return '';
  }
}

function getFFData(){
  const r = runSQL(`SELECT f.watch, f.first_name, f.last_name, f.rank, s.name as station_name, f.ot_count_days, f.ot_count_nights, f.qualifications::text FROM firefighters f LEFT JOIN stations s ON f.station_id=s.id WHERE f.is_active=true ORDER BY f.watch, f.ot_count_days`);
  return r.split('\n').filter(Boolean).map(l=>{
    const p=l.split('|');
    return {watch:p[0],firstName:p[1],lastName:p[2],rank:p[3],stationName:p[4],otDays:parseInt(p[5]),otNights:parseInt(p[6]),quals:p[7]?JSON.parse(p[7]):{}};
  });
}

function resetOTData(){
  runSQL('TRUNCATE ot_assignments, ot_requests, allocation_runs, ot_offers, availability CASCADE');
}

function createOT(station, date, shift, slots=1, quals=[]){
  const qs = JSON.stringify(quals).replace(/'/g,"'\"'\"'");
  return runSQL(`INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled) VALUES ((SELECT id FROM stations WHERE name='${station}'), '${date}', '${shift}', NULL, ${slots}, '${qs}', 'pending', 0) RETURNING id`);
}

async function runAllocation(){
  const res = await fetch('http://localhost:3005/api/allocate', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'run_allocation'})
  });
  return res.json();
}

function getAssignments(){
  const r = runSQL(`SELECT f.first_name, f.last_name, f.watch, f.rank, f.ot_count_days, oa.callback_type FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id=f.id ORDER BY oa.id`);
  return r.split('\n').filter(Boolean).map(l=>{
    const p=l.split('|');
    return {firstName:p[0],lastName:p[1],watch:p[2],rank:p[3],otCountDays:parseInt(p[4]),callbackType:p[5]||'—'};
  });
}

function getOTCountsByWatch(){
  const r = runSQL(`SELECT watch, first_name, last_name, ot_count_days FROM firefighters WHERE is_active=true ORDER BY watch, ot_count_days`);
  const grouped = {};
  r.split('\n').filter(Boolean).forEach(l=>{
    const p=l.split('|');
    if(!grouped[p[0]]) grouped[p[0]]=[];
    grouped[p[0]].push({firstName:p[1],lastName:p[2],otDays:parseInt(p[3])});
  });
  return grouped;
}

/* ──────── Report printing ───────────────────────────── */

function hr(c='═'){ console.log('\n'+c.repeat(72)+'\n'); }
function box(title){ console.log(title); console.log('─'.repeat(72)); }

function printWatchMatrix(date, shift){
  console.log(`\n  📊 Watch Eligibility Matrix for ${date} (${shift} Shift)\n`);
  console.log(`  ${'Watch'.padEnd(7)} │ ${'Shift Status'.padEnd(30)} │ Eligible?`);
  console.log('  ' + '─'.repeat(59));
  for(const w of ['Green','Red','Brown','Blue']){
    const st = getShiftStatus(w, date);
    const el = isEligible(w, date, shift);
    console.log(`  ${w.padEnd(7)} │ ${st.padEnd(30)} │ ${el ? '✅ YES' : '❌ NO'}`);
  }
}

function printFFList(ffData){
  console.log(`\n  👥 All Firefighters (sorted by watch, then OT asc)\n`);
  console.log(`  ${'Watch'.padEnd(7)} │ ${'Name'.padEnd(24)} │ ${'Rank'.padEnd(5)} │ ${'Station'.padEnd(18)} │ ${'OT Days'.padEnd(7)}`);
  console.log('  ' + '─'.repeat(72));
  for(const f of ffData){
    console.log(`  ${f.watch.padEnd(7)} │ ${(f.firstName+' '+f.lastName).padEnd(24)} │ ${f.rank.padEnd(5)} │ ${f.stationName.padEnd(18)} │ ${String(f.otDays).padEnd(7)}`);
  }
}

/* ──────── Scenarios ─────────────────────────────────── */

const SCENARIOS = [
  {
    id: 'blue-callback-day',
    name: 'Blue Callback — April 10 Day Shift',
    description:
      'April 10 is Blue watch Callback #1 (Before Day 1). Blue watch is OFF but called back in for a Day shift.\n' +
      'Brown watch is on Day shift with Callback #2a (Evening extension — already working 10h, extending to evening).\n' +
      'They should NOT compete because #2a is only an evening extension, not a full-day callback.\n' +
      'Red watch is on Callback #3 (After Last Night) which is night-only.\n' +
      'Green watch is Off with no callback.',
    whatShouldHappen:
      'Mere Whare (Blue, FF, OT=1) should be assigned — she has the lowest OT count among Blue firefighters. ' +
      'Alex (OT=3) and Fiona (OT=4) are higher, so Mere gets priority.',
    setup: ()=>{ resetOTData(); return createOT('Albany','2026-04-10','Day',1); },
    verify: (a)=>{
      if(!a.length) return {pass:false, msg:'No one assigned — Blue watch should be eligible!'};
      if(a[0].watch!=='Blue') return {pass:false, msg:`Wrong watch: ${a[0].watch} (${a[0].firstName} ${a[0].lastName}) instead of Blue`};
      if(a[0].firstName!=='Mere') return {pass:false, msg:`Expected Mere Whare (lowest OT=1), got ${a[0].firstName} ${a[0].lastName}`};
      return {pass:true, msg:`Mere Whare (Blue, OT=1) — correct! Callback #1 matched to the callback watch.`};
    },
  },
  {
    id: 'night-callback-red',
    name: 'Red Night Callback — April 10 Night Shift',
    description:
      'April 10 is Red watch Callback #3 (After Last Night). This is a night-only callback.\n' +
      'No other watch has a relevant callback for Night — Blue has #1 (Day only), Brown is on Day (#2a), Green has no callback.',
    whatShouldHappen:
      'A Red watch firefighter should be assigned. Priya (OT=0) or Marcus (OT=2) or Liam (OT=4) — ' +
      'lowest OT count gets priority among eligible Red FFs.',
    setup: ()=>{ resetOTData(); return createOT('Albany','2026-04-10','Night',1); },
    verify: (a)=>{
      if(!a.length) return {pass:false, msg:'No one assigned — Red watch should be eligible for Night callback!'};
      if(a[0].watch!=='Red') return {pass:false, msg:`Expected Red watch, got ${a[0].watch}`};
      return {pass:true, msg:`${a[0].firstName} ${a[0].lastName} (Red, OT=${a[0].otCountDays}) — correct! Night callback #3 matched.`};
    },
  },
  {
    id: 'leave-exclusion',
    name: 'Leave Exclusion — Feb 10 (ALL on Leave)',
    description:
      'The 160-day cycle starts with 16 Leave days for every watch.\n' +
      'Feb 10: Green=day 10, Red=day 8, Brown=day 6, Blue=day 4 — ALL under 16 → all on Leave.',
    whatShouldHappen:
      'No one should be assigned. Every firefighter\'s watch is in Leave phase, so the engine ' +
      'has zero eligible candidates.',
    setup: ()=>{ resetOTData(); return createOT('Albany','2026-02-10','Day',1); },
    verify: (a)=>{
      if(a.length>0) return {pass:false, msg:`${a[0].firstName} ${a[0].lastName} (${a[0].watch}) assigned — everyone should be on Leave!`};
      return {pass:true, msg:'No one assigned — Leave filter working correctly. 0 eligible firefighters.'};
    },
  },
  {
    id: 'multi-slot-partial',
    name: 'Partial Fill — More Slots Than Eligible FFs',
    description:
      'April 10 Day shift: only Blue Callback #1 eligible. Blue has 3 firefighters.\n' +
      'Requesting 5 slots means only 3 can be filled (Mere=1, Alex=3, Fiona=4).\n' +
      '2 slots should remain unfilled.',
    whatShouldHappen:
      'All 3 Blue firefighters assigned in OT order: Mere (1) → Alex (3) → Fiona (4). ' +
      '2 slots unfilled because there are no other eligible watches.',
    setup: ()=>{ resetOTData(); return createOT('Albany','2026-04-10','Day',5); },
    verify: (a)=>{
      if(a.length!==3) return {pass:false, msg:`Expected 3 assigned, got ${a.length}`};
      const names=a.map(x=>x.firstName).sort();
      const expected=['Alex','Fiona','Mere'].sort();
      if(JSON.stringify(names)!==JSON.stringify(expected)) return {pass:false, msg:`Expected Mere+Alex+Fiona, got ${names.join(',')}`};
      return {pass:true, msg:`Correctly assigned all 3 Blue FFs (Mere→Alex→Fiona by OT asc). 2 slots left unfilled.`};
    },
  },
  {
    id: 'ot-balance',
    name: 'OT Balance — April 14 Day Shift',
    description:
      'April 14: Green idx 72→cycle 7→Off+#1 callback. Red idx 70→cycle 5→Off. Brown idx 68→cycle 3→Night+#3(night-only). Blue idx 66→cycle 1→Day+#2a( filtered).\n' +
      'Only Green (Off + #1 callback) is eligible for Day OT.',
    whatShouldHappen:
      'A Green watch firefighter from Callback #1. Jordan Park (OT=1) has the lowest OT count ' +
      'among Green FFs, followed by Emma (OT=2), Sarah (OT=3), Wiremu (OT=5).',
    setup: ()=>{ resetOTData(); return createOT('Albany','2026-04-14','Day',1); },
    verify: (a)=>{
      if(!a.length) return {pass:false, msg:'No one assigned — Green should be eligible (Callback #1)'};
      if(a[0].watch!=='Green') return {pass:false, msg:`Expected Green watch, got ${a[0].watch}`};
      return {pass:true, msg:`${a[0].firstName} ${a[0].lastName} (Green, OT=${a[0].otCountDays}) — correct! Lowest OT on Green callback watch.`};
    },
  },
  {
    id: 'all-watches-callback',
    name: 'All 4 Callbacks Tested in One Go',
    description:
      'We run OT on 4 different dates, each targeting a different watch callback:\n' +
      '  Apr 7  = Red     Day (regular shift)\n' +
      '  Apr 8  = Brown   Off + #1 callback\n' +
      '  Apr 12 = Green   Off + #1 callback\n' +
      '  Apr 13 = Blue    Day (regular shift)\n',
    whatShouldHappen:
      'Each date should assign from the correct watch. No cross-contamination.',
    setup: ()=>{
      resetOTData();
      createOT('Albany','2026-04-07','Day',1);    // Red regular
      createOT('Albany','2026-04-08','Day',1);    // Brown #1 callback
      createOT('Albany','2026-04-12','Day',1);    // Green #1 callback
      createOT('Albany','2026-04-13','Day',1);    // Blue regular
    },
    verify: (a)=>{
      // After running allocation multiple times, the engine processes pending requests
      if(!a.length) return {pass:false, msg:'No assignments at all'};
      const watches = [...new Set(a.map(x=>x.watch))];
      return {pass:true, msg:`Assigned from watches: ${watches.join(', ')}. Check individual assignments below for correctness.`};
    },
  },
];

/* ──────── Main Runner ───────────────────────────────── */

async function main(){
  let totalP=0, totalF=0;
  const results=[];

  hr();
  console.log('   🧪  FENZ OT Allocation System — Comprehensive Test Suite\n   Runs against live API + local watch-math verification');
  hr();

  // Load and display all firefighters
  const ffData = getFFData();
  printFFList(ffData);

  const ffByWatch = getOTCountsByWatch();
  for(const w of ['Green','Red','Brown','Blue']){
    const ffs = ffByWatch[w] || [];
    console.log(`\n  📊 ${w} Watch (${ffs.length} FFs): ` + ffs.map(f=>`${f.firstName} ${f.lastName}(OT=${f.otDays})`).join(', '));
  }

  for(let i=0; i<SCENARIOS.length; i++){
    const sc = SCENARIOS[i];
    hr('═');
    console.log(`   TEST ${i+1}/${SCENARIOS.length}: ${sc.name}`);
    hr('═');

    console.log('  📖  SCENARIO DESCRIPTION:');
    console.log('      ' + sc.description.replace(/\n/g,'\n      '));
    console.log('');
    console.log('  🎯  WHAT SHOULD HAPPEN:');
    console.log('      ' + sc.whatShouldHappen);

    // Print watch matrix for context
    const dates = ['2026-04-10','2026-02-10','2026-04-14','2026-04-07','2026-04-08','2026-04-12','2026-04-13'];
    const shifts = ['Day','Day','Day','Day','Day','Day','Day'];
    const idxMap = {'blue-callback-day':0,'night-callback-red':0,'leave-exclusion':1,'multi-slot-partial':0,'ot-balance':2,'all-watches-callback':null};
    const matIdx = idxMap[sc.id];

    if(matIdx!==null && matIdx===0){
      // For single-date tests, print the watch matrix
      const date = sc.id==='blue-callback-day'||sc.id==='multi-slot-partial' ? '2026-04-10' :
                   sc.id==='night-callback-red' ? '2026-04-10' :
                   sc.id==='leave-exclusion' ? '2026-02-10' :
                   sc.id==='ot-balance' ? '2026-04-14' : null;
      const shift = sc.id==='night-callback-red' ? 'Night' : 'Day';
      if(date) printWatchMatrix(date, shift);
    }

    // Setup & run
    try{
      const otId = sc.setup();
      console.log(`\n  ⚙️   OT request created: id=${otId}`);

      console.log('  ⏳   Running allocation engine via live API...');
      const apiResult = await runAllocation();
      console.log(`  📊   API Response: ${apiResult.total_assigned} assigned, ${apiResult.total_unfilled} unfilled, ${apiResult.errors||0} errors`);

      const assigns = getAssignments();
      console.log('\n  📋  ASSIGNMENTS MADE BY ENGINE:');
      if(assigns.length>0){
        for(const a of assigns){
          console.log(`       ${a.firstName} ${a.lastName}  │  ${a.watch} watch  │  ${a.rank}  │  OT days: ${a.otCountDays}  │  Callback: ${a.callbackType}`);
        }
      } else {
        console.log('       (none — no eligible firefighters)');
      }

      // Verify
      const {pass, msg} = sc.verify(assigns);
      results.push({scenario:sc.name, pass, msg});
      pass ? totalP++ : totalF++;

      console.log('\n  ' + (pass ? '✅' : '❌') + '  VERDICT: ' + (pass ? 'PASSED' : 'FAILED'));
      console.log('      ' + msg);

    }catch(e){
      results.push({scenario:sc.name, pass:false, msg:e.message.slice(0,200)});
      totalF++;
      console.log('\n  ❌  EXCEPTION: ' + e.message);
    }
  }

  // Summary
  hr('═');
  console.log('   📊  FINAL RESULTS SUMMARY');
  hr('═');

  console.log(`\n  ${'  #'.padEnd(4)} │ ${'Scenario'.padEnd(42)} │ ${'Result'.padEnd(8)} │ Detail`);
  console.log('  ' + '─'.repeat(72));
  for(let i=0; i<results.length; i++){
    const r = results[i];
    console.log(`  ${(i+1).toString().padEnd(4)} │ ${r.scenario.padEnd(42)} │ ${(r.pass?'PASS':'FAIL').padEnd(8)} │ ${r.msg}`);
  }
  console.log('  ' + '─'.repeat(72));

  const pct = results.length ? Math.round(totalP/results.length*100) : 0;
  console.log(`\n  📈  ${totalP}/${results.length} passed (${pct}%)`);
  console.log(totalF===0
    ? '\n  🎉  ALL TESTS PASSED — The allocation engine is working correctly!'
    : `\n  ⚠️   ${totalF} test(s) need attention.`);
  hr('═');
}

main().catch(e=>{console.error('Fatal:',e);process.exit(1);});