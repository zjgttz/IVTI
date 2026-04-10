// IVTI 本地开发服务器
// - 零依赖，仅用 Node.js 原生 http / fs / path 模块
// - 后续可把 handleStatsPost / handleStatsSummary 原样搬到
//   阿里云函数计算 (FC) / 腾讯云 SCF / 微信云开发云函数
// 启动： node server/index.js
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const STATS_FILE = path.join(__dirname, 'stats.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

// -------- 存储层（本地文件模拟数据库）--------
function loadStats() {
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  } catch (_) {
    return { records: [] };
  }
}
function saveStats(data) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
}

// -------- 基础限流（每 IP 每分钟 30 次）--------
const rateLimit = new Map();
function checkRate(ip, limit = 30) {
  const win = Math.floor(Date.now() / 60000);
  const key = ip + ':' + win;
  const count = (rateLimit.get(key) || 0) + 1;
  rateLimit.set(key, count);
  if (rateLimit.size > 1000) {
    for (const k of rateLimit.keys()) {
      if (!k.endsWith(':' + win)) rateLimit.delete(k);
    }
  }
  return count <= limit;
}

// -------- JSON 响应辅助 --------
function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

// -------- 静态文件服务（含路径穿越防护）--------
function serveStatic(req, res) {
  let pathname = decodeURIComponent(url.parse(req.url).pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

// -------- POST /api/stats --------
function handleStatsPost(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  if (!checkRate(ip)) { sendJSON(res, 429, { error: 'rate_limited' }); return; }

  let body = '';
  let tooLarge = false;
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 10_000) { tooLarge = true; req.destroy(); }
  });
  req.on('end', () => {
    if (tooLarge) { sendJSON(res, 413, { error: 'too_large' }); return; }
    try {
      const payload = JSON.parse(body);
      if (typeof payload.type !== 'string' || typeof payload.scores !== 'object' || payload.scores === null) {
        throw new Error('bad schema');
      }
      const stats = loadStats();
      stats.records.push({
        t: Date.now(),
        type: payload.type.slice(0, 32),
        scores: payload.scores,
        ua: (req.headers['user-agent'] || '').slice(0, 200),
      });
      saveStats(stats);
      sendJSON(res, 200, { ok: true });
    } catch (_) {
      sendJSON(res, 400, { error: 'bad_request' });
    }
  });
}

// -------- GET /api/stats/summary --------
function handleStatsSummary(_req, res) {
  const stats = loadStats();
  const types = {};
  for (const r of stats.records) {
    types[r.type] = (types[r.type] || 0) + 1;
  }
  sendJSON(res, 200, { total: stats.records.length, types });
}

// -------- 路由 --------
const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;

  if (req.method === 'POST' && pathname === '/api/stats') {
    return handleStatsPost(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/stats/summary') {
    return handleStatsSummary(req, res);
  }
  if (req.method === 'GET') {
    return serveStatic(req, res);
  }
  res.writeHead(405); res.end();
});

server.listen(PORT, () => {
  console.log('IVTI dev server listening on http://localhost:' + PORT);
});
