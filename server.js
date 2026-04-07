const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3005', 10);
const hostname = '0.0.0.0';

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    const path = parse(req.url, true);
    await handle(req, res, path);
  }).listen(port, hostname, () => {
    console.log(`> FENZ OT Running on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
