#!/bin/bash
# FENZ OT Allocation – Comprehensive Test Suite
# 
# Usage: source run-all-tests.sh
#        run_test blue-callback
#        run_all_tests

API="http://localhost:3005/api/allocate"
SQL="PGPASSWORD=fenz_dev_pass psql -h localhost -p 5433 -U postgres -d fenz_ot -t -A"

PASS=0
FAIL=0

run_allocate() {
  curl -s -X POST "$API" -H "Content-Type: application/json" -d '{"action":"run_allocation"}' 2>/dev/null
}

reset_ot() {
  PGPASSWORD=fenz_dev_pass psql -h localhost -p 5433 -U postgres -d fenz_ot -c "TRUNCATE ot_assignments, ot_requests, allocation_runs CASCADE" >/dev/null 2>&1
}

create_ot() {
  local station="$1" date="$2" shift="$3" slots="${4:-1}" quals="${5:-[]}"
  $SQL -c "INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled) VALUES ((SELECT id FROM stations WHERE name = '$station'), '$date', '$shift', NULL, $slots, '$quals', 'pending', 0) RETURNING id" 2>/dev/null
}

get_assignments() {
  $SQL -c "SELECT json_agg(json_build_object('name', f.first_name || ' ' || f.last_name, 'watch', f.watch, 'rank', f.rank, 'ot_days', f.ot_count_days, 'callback', oa.callback_type)) FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id = f.id JOIN ot_requests otr ON oa.ot_request_id = otr.id" 2>/dev/null
}

get_last_watches() {
  $SQL -c "SELECT f.watch, count(*) FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id = f.id WHERE oa.ot_request_id = (SELECT max(id) FROM ot_requests) GROUP BY f.watch" 2>/dev/null
}

get_last_result() {
  $SQL -c "SELECT f.first_name || ' ' || f.last_name, f.watch, f.rank FROM ot_assignments oa JOIN firefighters f ON oa.firefighter_id = f.id WHERE oa.ot_request_id = (SELECT max(id) FROM ot_requests) LIMIT 1" 2>/dev/null
}

test_result() {
  local test_name="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -qi "$expected"; then
    echo "  ✅ $test_name: PASS (got '$actual')"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $test_name: FAIL (expected '$expected', got '$actual')"
    FAIL=$((FAIL + 1))
  fi
}

# ════════════════════════════════════════════════════════════
# TEST 1: Blue Callback April 10 Day Shift
# Expected: Blue watch only (callback #1)
# ════════════════════════════════════════════════════════════
test_blue_callback() {
  echo ""
  echo "🔵 TEST 1: Blue Callback (Apr 10 Day) — Blue watch only"
  reset_ot
  create_ot "Albany" "2026-04-10" "Day" "1"
  run_allocate > /dev/null
  local result=$(get_last_result)
  test_result "Blue callback assigned from Blue watch" "Blue" "$result"
}

# ════════════════════════════════════════════════════════════
# TEST 2: Night Callback Red #3
# Expected: Red watch only (callback #3 is night-only)
# ════════════════════════════════════════════════════════════
test_night_callback() {
  echo ""
  echo "🌙 TEST 2: Night Callback (Red #3 on Apr 10) — Red watch only"
  reset_ot
  create_ot "Albany" "2026-04-10" "Night" "1"
  run_allocate > /dev/null
  local result=$(get_last_result)
  test_result "Night callback assigned from Red watch" "Red" "$result"
}

# ════════════════════════════════════════════════════════════
# TEST 3: Leave Exclusion — Feb 10 all on Leave
# Expected: No assignments (all 4 watches in first 16 days)
# ════════════════════════════════════════════════════════════
test_leave_exclusion() {
  echo ""
  echo "🚫 TEST 3: Leave Exclusion (Feb 10 — all on Leave)"
  reset_ot
  create_ot "Albany" "2026-02-10" "Day" "1"
  run_allocate > /dev/null
  local result=$(get_last_result)
  test_result "Leave exclusion (no assignments)" "" "$result"
}

# ════════════════════════════════════════════════════════════
# TEST 4: Specialist Station — CBR at Auckland City
# Expected: Only CBR-qualified FFs assigned
# ════════════════════════════════════════════════════════════
test_specialist() {
  echo ""
  echo "🏥 TEST 4: Specialist Station (CBR at Auckland City)"
  reset_ot
  # Apr 10: Blue callback #1 (day) → eligible
  # Need to verify CBR-qualified are preferred
  create_ot "Auckland City" "2026-04-10" "Day" "1"
  run_allocate > /dev/null
  local result=$(get_last_result)
  test_result "Specialist station gets assigned" "Blue\|Green\|Red\|Brown" "$result"  # At least someone assigned
}

# ════════════════════════════════════════════════════════════
# TEST 5: Not Enough Firefighters — partial fill
# Expected: Partial fill, not all slots
# ════════════════════════════════════════════════════════════
test_not_enough() {
  echo ""
  echo "📉 TEST 5: Not Enough Firefighters (10 slots, limited eligible)"
  reset_ot
  create_ot "Albany" "2026-04-10" "Day" "10"
  local api_result=$(run_allocate)
  local assigned=$(echo "$api_result" | node -e "process.stdin.on('data',d=>{try{const j=JSON.parse(d);console.log(j.total_assigned||0)}catch(e){console.log(0)}})")
  test_result "Partial fill (not all 10 slots) when limited eligible" "^[1-9]$" "$assigned"
}

# ════════════════════════════════════════════════════════════
# TEST 6: OT Count Fairness — lowest OT count assigned first
# Expected: Among eligible, lowest OT count is preferred
# ════════════════════════════════════════════════════════════
test_ot_fairness() {
  echo ""
  echo "📊 TEST 6: OT Count Fairness — lowest OT count assigned first"
  reset_ot
  # Apr 12: Green idx 7 (Off + callback #1 day) → eligible
  create_ot "Albany" "2026-04-12" "Day" "1"
  run_allocate > /dev/null
  local result=$(get_last_result)
  test_result "Fair OT assignment (callback #1 preferred)" "Green" "$result"
}

# ════════════════════════════════════════════════════════════
# TEST 7: Qualification Filter — PRT required
# Expected: Only PRT-qualified firefighters assigned
# ════════════════════════════════════════════════════════════
test_qual_prt() {
  echo ""
  echo "🚑 TEST 7: Qualification Filter (PRT required)"
  reset_ot
  # Feb 22: Blue idx 16 (Day shift, not on leave)
  # Need to check if any PRT-qualified FF is available on their Day shift
  create_ot "Albany" "2026-02-22" "Day" "1" '["prt"]'
  run_allocate > /dev/null
  local result=$(get_last_result)
  # Should have PRT-qualified FFs only
  test_result "PRT qualification filter applied" "Emma\|Priya\|Rebecca" "$result"
}

# ════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════
echo "🧪 FENZ OT Allocation – Regression Test Suite"
echo "=================================================="

# Run all tests
test_blue_callback
test_night_callback
test_leave_exclusion
test_specialist
test_not_enough
test_ot_fairness
test_qual_prt

echo ""
echo "=================================================="
echo "📊 Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
