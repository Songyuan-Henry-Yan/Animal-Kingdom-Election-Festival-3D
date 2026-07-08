/**
 * Animal Kingdom Election Festival — classroom room server.
 *
 *   npm run build     (once, to create dist/)
 *   npm run server    → students open  http://<your-LAN-IP>:8787  and join!
 *
 * Also works next to `npm run dev` (the game auto-connects to port 8787).
 * Deploying online? Any Node host works — set PORT, use wss:// behind TLS.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { createFestival } from './room.mjs';

const PORT = Number(process.env.PORT || 8787);
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

const hasDist = fs.existsSync(path.join(DIST, 'index.html'));

const server = http.createServer((req, res) => {
  if (!hasDist) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<h1>🌳 Festival room server is running!</h1><p>No <code>dist/</code> build found — run <code>npm run build</code> to serve the game from here, or keep using <code>npm run dev</code> in another terminal (the game connects to this server automatically).</p>');
    return;
  }
  const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.normalize(path.join(DIST, reqPath));
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html'); // single-page app fallback
  }
  const type = TYPES[path.extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  fs.createReadStream(filePath).pipe(res);
});

const festival = createFestival((handle, msg) => {
  if (handle.readyState === handle.OPEN) handle.send(JSON.stringify(msg));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (raw) => {
    if (raw.length > 64_000) return;
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    try { festival.message(ws, msg); } catch (err) {
      console.error('message error:', err);
    }
  });
  ws.on('close', () => festival.disconnect(ws));
  ws.on('error', () => festival.disconnect(ws));
});

// Position snapshots ~10x/second; dead-connection sweep every 15s.
setInterval(() => festival.tick(), 100);
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { festival.disconnect(ws); ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 15_000);

server.listen(PORT, () => {
  const nets = os.networkInterfaces();
  const lan = [];
  for (const list of Object.values(nets)) {
    for (const n of list ?? []) {
      if (n.family === 'IPv4' && !n.internal) lan.push(n.address);
    }
  }
  console.log('');
  console.log('🌳 Animal Kingdom Election Festival — room server is up!');
  console.log(`   Local:   http://localhost:${PORT}`);
  for (const ip of lan) console.log(`   Class:   http://${ip}:${PORT}   ← write this on the board`);
  console.log(hasDist
    ? '   Serving the built game from dist/ — students just open the link above.'
    : '   (no dist/ yet — run `npm run build`, or run `npm run dev` alongside me)');
  console.log('   Rooms are in-memory only. Close me and every room is gone. 🍃');
});
