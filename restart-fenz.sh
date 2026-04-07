#!/bin/bash
# restart-fenz.sh - Atomically reseed and restart the FENZ OT prototype
set -e

cd /home/ubuntu/fenz-ot-prototype

echo "🔄 FENZ OT Prototype - Reseed + Restart"
echo "========================================"

# 1. Kill old server
OLD_PID=$(lsof -ti :3005 2>/dev/null || true)
if [ -n "$OLD_PID" ]; then
  echo "⚠️  Killing old server (PID $OLD_PID)..."
  kill $OLD_PID 2>/dev/null || kill -9 $OLD_PID 2>/dev/null
  sleep 2
  echo "   Server stopped."
else
  echo "   No server running on port 3005."
fi

# 2. Clear and reseed the database
# Clear and seed in one step (seed-fix.ts does TRUNCATE CASCADE)
echo "🌱 Seeding database (this wipes + re-seeds)..."
npx tsx seed-fix.ts 2>&1 | grep -v "^executed" || true

# 3. Start the server
echo "🚀 Starting server on port 3005..."
setsid npx next start -p 3005 > /tmp/fenz-next.log 2>&1 &
SERVER_PID=$!

# 4. Wait for server to be ready
echo "   Waiting for server..."
for i in $(seq 1 10); do
  sleep 1
  if curl -s http://127.0.0.1:3005/ > /dev/null 2>&1; then
    echo "✅ Server ready (PID $SERVER_PID) after ${i}s"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ Server failed to start. Check /tmp/fenz-next.log"
    exit 1
  fi
done

echo ""
echo "📊 Verification:"
echo "  - Home: $(curl -s http://127.0.0.1:3005/ | grep -o 'FENZ Overtime Allocation' | head -1)"
echo "  - Firefighters: $(curl -s http://127.0.0.1:3005/firefighter | grep -oP '[A-Z][a-z]+ [A-Z][a-z]+' | sort -u | wc -l) unique names"
echo "  - Detail view: $(curl -s 'http://127.0.0.1:3005/firefighter?ff=$(curl -s http://127.0.0.1:3005/firefighter | grep -oP "href=\"/firefighter\?ff=\K\d+" | head -1)' | grep -oP '[A-Z][a-z]+ [A-Z][a-z]+' | head -1)"
