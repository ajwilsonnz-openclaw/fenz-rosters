#!/usr/bin/env node
// PM2 startup script for FENZ OT server
process.env.DATABASE_URL = 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot';
process.env.DIRECT_URL = 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot';
process.env.PORT = '3005';
process.env.NODE_ENV = 'production';
require('./server.js');