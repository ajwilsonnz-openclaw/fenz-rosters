module.exports = {
  name: 'fenz-ot',
  script: '/home/ubuntu/fenz-ot-prototype/.next/standalone/server.js',
  cwd: '/home/ubuntu/fenz-ot-prototype/.next/standalone',
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot',
    DIRECT_URL: 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot',
    PORT: '3005',
  },
  autorestart: true,
  watch: false,
};