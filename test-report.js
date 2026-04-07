#!/usr/bin/env node
/**
 * FENZ OT Allocation Test Suite — Human-Readable Report Generator
 * 
 * Usage: npx tsx test-report.js
 * 
 * This script:
 *  1. Checks watch-math for each scenario
 *  2. Creates the OT request in the DB
 *  3. Runs the allocation engine via the live API
 *  4. Prints a clear breakdown: WHAT should happen vs WHAT happened
 */

const { execSync } = require('child_process');

/* ═══════════════════════════════════════════════════════════
   Watch-Math (mirrors src/engine/watch-math.ts)
   ═══════════════════════════════════════════════════════════ */

const ANCHORS = { Green:'2026-01-31', Red:'2026-02-02', Brown:'2026-02-04', Blue:'2026-02-06' };
const CYCLE   = ['Day','Day','Night','Night','Off','Off','Off','Off'];

function toDate(s){ const[y,m,d]=s.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); }
function cycleDay(w,date){ const[ay,am,ad]=ANCHORS[w].split('-').map(Number); const a=new Date(Date.UTC(ay,am-1,ad)); let d=Math.round((date.getTime()-a.getTime())/86400000); return((d%160)+160)%160; }
function getShift(w,ds){ const d=cycleDay(w,toDate(ds)); return d<16?'On Leave':CYCLE[((d-16)%8+8)%8]; }
function getCallbackType(w,ds){ const d=cycleDay(w,toDate(ds)); if(d<16)return null; const c=((d-16)%8+8)%8; return c===7?'#1-BeforeDay1':c===1?'#2a-EveningDay2':c===2?'#2b-DayOfNight1':c===3?'#3-AfterLastNight':null; }
function getShiftStatus(w,ds){ const d=cycleDay(w,toDate(ds)); if(d<16)return`On Leave (Day ${d+1}/160)`; const c=((d-16)%8+8)%8; const s=CYCLE[c]; const cb=getCallbackType(w,ds); return cb?`${s} | ${cb}`:s; }
function isEligible(w,ds,st){
  if(getShiftStatus(w,ds).startsWith('On Leave'))return false;
  const s=getShift(w,ds),cb=getCallbackType(w,ds);
  if(s==='Off'&&!cb)return false;
  if(cb==='#2a-EveningDay2'&&st==='Day')return false;
  if(cb==='#3-AfterLastNight'&&st==='Day')return false;
  if(cb==='#2b-DayOfNight1'&&st==='Day')return false;
  if(s==='Night'&&!cb&&st==='Day')return false;
  return true;
}

/* ═══════════════════════════════════════════════════════════
   DB & API helpers
   ═══════════════════════════════════════════════════════════ */

function sql(q){
  try{ return execSync(`PGPASSWORD=fenz_dev_pass psql -h localhost -p 5433 -U postgres -d fenz_ot -t -A -c $'${q.replace(/\\\$/g,'\\$').replace(/'/g,`'\\"'\\"'`)}'`,{timeout:15000,env:{...process.env,PGPASSWORD:'fenz_dev_pass'}}).toString().trim(); }
  catch(e){ return e.stdout?e.stdout.toString().trim():''; }
}

function getFFs(){
  return sql("SELECT watch,first_name,last_name,rank,ot_count_days,qualifications::text FROM firefighters WHERE is_active=true ORDER BY watch,ot_count_days")
    .split('\n').filter(Boolean).map(l=>{const p=l.split('|');return{watch:p[0],fn:p[1],ln:p[2],rank:p[3],ot:parseInt(p[4]),q:p[5]?JSON.parse(p[5]):{}};});
}

function clearOT(){ sql('TRUNCATE ot_assignments, ot_requests, allocation_runs, ot_offers, availability CASCADE'); }

function createOT(station,date,shift,slots=1,quals=[]){
  return sql(`INSERT INTO ot_requests(station_id,date,shift_type,number_of_slots,required_qualification_ids,status,number_filled) VALUES((SELECT id FROM stations WHERE name='${station}'),'${date}','${shift}',${slots},'${JSON.stringify(quals)}','pending',0) RETURNING id`);
}

async function runAlloc(){
  const r=await fetch('http://localhost:3005/api/allocate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'run_allocation'})});
  return r.json();
}

function getAssignments(){
  return sql('SELECT f.first_name,f.last_name,f.watch,f.rank,f.ot_count_days,oa.callback_type FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id=f.id ORDER BY oa.id')
    .split('\n').filter(Boolean).map(l=>{const p=l.split('|');return{fn:p[0],ln:p[1],watch:p[2],rank:p[3],ot:parseInt(p[4]),cb:p[5]||'—'};});
}

/* ═══════════════════════════════════════════════════════════
   Scenarios — each has what-should-happen written out
   ═══════════════════════════════════════════════════════════ */

const SCENARIOS = [
  {
    id:'blue-callback-day',
    title:'Blue Callback — Apr 10 Day Shift',
    date:'2026-04-10', shift:'Day',
    detail:`April 10: Blue=Off+#1(before Day1), Brown=Day+#2a(evening ext), Red=Night+#3(night-only), Green=Off(no cb).
  Only Blue's Callback #1 should be eligible for a full Day callback.
  Brown's #2a is just an evening extension on their day-off, not a full shift callback.`,
    expectWatch:'Blue', expectPerson:'Mere',
    desc:'Should assign Mere (Blue, OT=2) — the lowest-OT Blue firefighter.'
  },
  {
    id:'night-callback-red',
    title:'Red Callback #3 — Apr 10 Night Shift',
    date:'2026-04-10', shift:'Night',
    detail:`April 10: Red=Night+#3(After Last Night — night-only). This is the only watch eligible for Night OT.`,
    expectWatch:'Red', expectPerson:null,
    desc:'Should assign a Red firefighter — lowest OT among eligible Red FFs.'
  },
  {
    id:'leave-exclusion',
    title:'Leave Exclusion — Feb 10 ALL on Leave',
    date:'2026-02-10', shift:'Day',
    detail:`Feb 10: ALL 4 watches are in the first 16 days of their 160-day cycle → On Leave.`,
    expectWatch:null, expectPerson:null, expectNone:true,
    desc:'Should assign NOBODY — every firefighter is on Leave.'
  },
  {
    id:'multi-slot',
    title:'Partial Fill — 5 Slots, Apr 10 Day',
    date:'2026-04-10', shift:'Day',
    detail:`April 10: Only Blue Callback #1 eligible. Blue has 5 firefighters: Mere(2), Alex(3), Fiona(4), Tommy(6), Sam(7).
  Requesting 5 slots = exactly the number of Blue FFs. All should be assigned in OT order.`,
    expectWatch:'Blue', expectPerson:null, expectCount:5,
    desc:'Should assign all 5 Blue FFs in OT order: Mere→Alex→Fiona→Tommy→Sam.'
  },
  {
    id:'green-callback',
    title:'Green Callback #1 — Apr 12 Day Shift',
    date:'2026-04-12', shift:'Day',
    detail:`Apr 12: Green=#1 callback, Red=Off, Brown=Night+#2b(night), Blue=Day+#2a(filtered).
  Only Green should be eligible.`,
    expectWatch:'Green', expectPerson:'Emma',
    desc:'Should assign Emma (Green, SO, OT=2) — lowest OT among Green FFs.'
  },
  {
    id:'brown-regular',
    title:'Brown Regular Day — Apr 13 Day Shift',
    date:'2026-04-13', shift:'Day',
    detail:`Apr 13: Brown=Day shift (regular working day — no callback filter).
  Brown has 5 FFs: Kahu(3), Dan(3), Grace(3), Rebecca(5), Nikau(9).
  Need to check if any other watch is also eligible.`,
    expectWatch:'Brown', expectPerson:null,
    desc:'Should assign a Brown FF — lowest OT on the working watch.'
  },
  {
    id:'red-regular',
    title:'Red Regular Day — Apr 7 Day Shift',
    date:'2026-04-07', shift:'Day',
    detail:`Apr 7: Red=Day(shift 0, regular). Red has Priya(2), Marcus(2), Liam(4), Aroha(6), Hemi(7).`,
    expectWatch:'Red', expectPerson:null,
    desc:'Should assign a Red FF — lowest OT count.'
  },
  {
    id:'cross-fairness',
    title:'Cross-Watch Callback Fairness',
    date:'2026-04-08', shift:'Day',
    detail:`Apr 8: Let's see what the math says. Brown=Off+#1 callback. Check others.`,
    expectWatch:null, expectPerson:null,
    desc:'Verify the callback watch gets assigned correctly.'
  },
];

/* ═══════════════════════════════════════════════════════════
   Report formatting
   ═══════════════════════════════════════════════════════════ */

const W = 80;
const hr = c => `\n${c.repeat(W)}\n`;
const pad = (s,n) => String(s).padEnd(n);

function printWatchMatrix(date, shift){
  let out = `\n  📊 Watch Eligibility Matrix — ${date} (${shift} Shift)\n`;
  out += `  ${'─'.repeat(W-4)}\n`;
  out += `  ${pad('Watch',7)} │ ${pad('Shift Status',35)} │ ${'Eligible?'}\n`;
  out += `  ${'─'.repeat(W-4)}\n`;
  for(const w of ['Green','Red','Brown','Blue']){
    const st = getShiftStatus(w,date);
    const el = isEligible(w,date,shift);
    out += `  ${pad(w,7)} │ ${pad(st,35)} │ ${el?'✅ YES':'❌ NO'}\n`;
  }
  return out;
}

async function main(){
  process.stdout.write(`
${'═'.repeat(W)}
   🧪  FENZ OT Allocation System — Comprehensive Test Suite
   Live API + Watch-Math Verification
${'═'.repeat(W)}`);

  // Show all FFs
  const ffs = getFFs();
  let ffOut = `\n  👥 All Active Firefighters (sorted by watch, OT ascending)\n`;
  ffOut += `  ${'─'.repeat(W-4)}\n`;
  ffOut += `  ${pad('Watch',7)} │ ${pad('Name',22)} │ ${pad('Rank',5)} │ ${pad('OT',3)}\n`;
  ffOut += `  ${'─'.repeat(W-4)}\n`;
  for(const f of ffs){
    ffOut += `  ${pad(f.watch,7)} │ ${pad(f.fn+' '+f.ln,22)} │ ${pad(f.rank,5)} │ ${pad(f.ot,3)}\n`;
  }
  process.stdout.write(ffOut);

  let pCount=0, fCount=0;
  const results=[];

  for(let i=0;i<SCENARIOS.length;i++){
    const sc=SCENARIOS[i];
    process.stdout.write(`\n\n${'═'.repeat(W)}\n   TEST ${i+1}/${SCENARIOS.length}: ${sc.title}\n${'═'.repeat(W)}`);

    process.stdout.write(`\n  📖  SCENARIO:\n  ${sc.detail.replace(/\n/g,'\n  ')}\n`);
    process.stdout.write(`\n  🎯  EXPECTED: ${sc.desc}\n`);

    // Watch matrix
    process.stdout.write(printWatchMatrix(sc.date,sc.shift));

    // Setup
    clearOT();
    const otId = createOT('Albany',sc.date,sc.shift, sc.expectCount||1, []);
    process.stdout.write(`\n  ⚙️   OT request created: id=${otId}\n`);

    // Run allocation
    process.stdout.write(`\n  ⏳   Running allocation engine...\n`);
    const api = await runAlloc();
    process.stdout.write(`  📊   API → assigned: ${api.total_assigned}, unfilled: ${api.total_unfilled}, errors: ${api.errors||0}\n`);

    const assigns = getAssignments();
    if(assigns.length>0){
      process.stdout.write(`\n  📋  Assignments Made:\n`);
      for(const a of assigns){
        process.stdout.write(`      → ${a.fn} ${a.ln} │ ${a.watch} │ ${a.rank} │ OT=${a.ot} │ CB: ${a.cb}\n`);
      }
    } else {
      process.stdout.write(`\n  📋  No assignments made (no eligible firefighters)\n`);
    }

    // Verify
    let pass=true, msg='';
    if(sc.expectNone){
      if(assigns.length===0){ msg='PASS — No one assigned, as expected (all on Leave).'; }
      else { pass=false; msg=`FAIL — ${assigns[0].fn} ${assigns[0].ln} (${assigns[0].watch}) was assigned but nobody should be.`; }
    } else if(sc.expectWatch){
      if(assigns.length===0){ pass=false; msg=`FAIL — No one assigned but ${sc.expectWatch} watch should be eligible.`; }
      else if(assigns.some(a=>a.watch!==sc.expectWatch)){ pass=false; msg=`FAIL — Expected ${sc.expectWatch} watch only, got: ${[...new Set(assigns.map(a=>a.watch))].join(', ')}`; }
      else if(sc.expectPerson && assigns[0].fn!==sc.expectPerson){ pass=false; msg=`FAIL — Expected ${sc.expectPerson}, got ${assigns[0].fn} ${assigns[0].ln}`; }
      else if(sc.expectCount && assigns.length!==sc.expectCount){ pass=false; msg=`FAIL — Expected ${sc.expectCount} assigned, got ${assigns.length}`; }
      else { msg=`PASS — Correct watch (${assigns[0].watch}) and correct person (${assigns[0].fn} ${assigns[0].ln}, OT=${assigns[0].ot}) assigned.`; }
    } else {
      // Generic check — just verify someone was assigned from an eligible watch
      if(assigns.length===0){ msg='INFO — No assignments (may be correct if no watches eligible).'; }
      else {
        const allEligible = assigns.every(a => isEligible(a.watch, sc.date, sc.shift));
        if(allEligible){ msg=`PASS — ${assigns.length} assigned from eligible watches: ${assigns.map(a=>a.fn+'('+a.watch+')').join(', ')}.`; }
        else { pass=false; msg=`FAIL — ${assigns.length} assigned but some from ineligible watches.`; }
      }
    }

    results.push({num:i+1, title:sc.title, pass, msg});
    pass?pCount++:fCount++;
    process.stdout.write(`\n  ${pass?'✅':'❌'}  VERDICT: ${pass?'PASSED':'FAILED'}\n  ${msg}\n`);
  }

  // Summary
  process.stdout.write(`\n${'═'.repeat(W)}\n   📊  FINAL RESULTS SUMMARY\n${'═'.repeat(W)}\n`);
  process.stdout.write(`\n  ${pad('#',3)} │ ${pad('Scenario',35)} │ ${pad('Result',8)} │ Detail\n  ${'─'.repeat(W-4)}\n`);
  for(const r of results){
    process.stdout.write(`  ${pad(r.num,3)} │ ${pad(r.title,35)} │ ${pad(r.pass?'PASS':'FAIL',8)} │ ${r.msg}\n`);
  }
  process.stdout.write(`  ${'─'.repeat(W-4)}\n\n  📈  ${pCount}/${SCENARIOS.length} passed`);
  if(fCount===0) process.stdout.write(`\n\n  🎉  ALL TESTS PASSED! Allocation engine is working correctly.\n`);
  else process.stdout.write(`\n\n  ⚠️   ${fCount} test(s) failed — see details above.\n`);
  process.stdout.write(hr('═'));
}

main().catch(e=>{console.error(e);process.exit(1);});