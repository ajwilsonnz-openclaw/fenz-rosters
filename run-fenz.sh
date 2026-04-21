#!/bin/bash
cd /home/ubuntu/fenz-ot-prototype/.next/standalone
export NODE_ENV=production
export DATABASE_URL='postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot'
export DIRECT_URL='postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot'
export PORT=3005
exec node server.js >> /tmp/fenz2.log 2>&1