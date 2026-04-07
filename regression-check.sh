#!/bin/bash
BASE="http://100.77.94.99:3005"
PASS=0; FAIL=0

check() {
  local name="$1" url="$2" expect="$3"
  local out
  out=$(curl -s "$url" 2>&1)
  if echo "$out" | grep -qP "$expect"; then
    echo "✅ $name"
    PASS=$((PASS+1))
  else
    echo "❌ $name"
    FAIL=$((FAIL+1))
  fi
}

echo "=== FENZ OT Regression Cycle ==="
echo ""
check "Home loads" "$BASE/" "FENZ Overtime Allocation"
check "Home shows stats" "$BASE/" "Stations|Firefighters|OT Runs"
check "Home shows 'Built for Adam'" "$BASE/" "Allocation Engine v1"
check "Officer loads" "$BASE/officer" "Officer OT Management"
check "Officer loads stations" "$BASE/officer" "Albany.*Devonport"
check "Officer p-4 md:p-8" "$BASE/officer" "p-4 md:p-8"
check "Firefighter loads" "$BASE/firefighter" "Firefighter Simulator"
check "Firefighter has names" "$BASE/firefighter" "Wiremu"
check "Firefighter detail renders" "$BASE/firefighter?ff=1" "Hemara|Mitchell"
check "Audit loads" "$BASE/audit" "Audit Trail"
check "Audit pills text-xs" "$BASE/audit" "text-xs"
check "Audit pills flex-wrap" "$BASE/audit" "flex-wrap"
check "Page metadata title" "$BASE/" "FENZ Overtime Allocation"

echo ""
echo "Result: $PASS passed, $FAIL failed"
exit $FAIL
