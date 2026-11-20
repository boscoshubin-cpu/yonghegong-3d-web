'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || process.env.SANSA3D_PORT || 18766);
const host = process.env.HOST || process.env.SANSA3D_HOST || '0.0.0.0';
const root = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.hdr': 'application/octet-stream',
  '.wasm': 'application/wasm'
};

const STATIC_CACHE_EXTS = new Set(['.mp3', '.wav', '.png', '.jpg', '.jpeg', '.webp', '.glb', '.gltf', '.bin', '.wasm']);

/* ================= 基础公网防刷与限流 ================= */
const ipBuckets = new Map();
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}
function checkRateLimit(req, limitPerMin) {
  const ip = getClientIp(req);
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + 60000 };
    ipBuckets.set(ip, b);
  }
  b.count++;
  return b.count <= limitPerMin;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, b] of ipBuckets.entries()) {
    if (now > b.resetAt) ipBuckets.delete(ip);
  }
}, 120000).unref();

function cleanText(str, maxLen) {
  return String(str || '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

function writeSse(res, eventName, payload) {
  if (!res || res.writableEnded) return;
  try {
    res.write('event: ' + eventName + '\n');
    res.write('data: ' + JSON.stringify(payload) + '\n\n');
  } catch (e) {}
}

/* ================= A. 全员实时同屏世界服务 (50人/殿自动分殿) ================= */
const MAX_PER_HALL = 50;
const worldSse = new Map();     // uid -> res
const worldPlayers = new Map(); // uid -> { uid, hall, nickname, gender, robe, x, z, rotY, pose }

function pickHall() {
  const counts = new Map();
  for (const p of worldPlayers.values()) {
    counts.set(p.hall, (counts.get(p.hall) || 0) + 1);
  }
  for (let i = 1; i <= 20; i++) {
    const name = '大殿' + i;
    if ((counts.get(name) || 0) < MAX_PER_HALL) return name;
  }
  return '大殿1';
}

function playersInHall(hall, excludeUid) {
  const list = [];
  for (const p of worldPlayers.values()) {
    if (p.hall === hall && p.uid !== excludeUid) list.push(p);
  }
  return list;
}

function countInHall(hall) {
  let n = 0;
  for (const p of worldPlayers.values()) if (p.hall === hall) n++;
  return n;
}

function broadcastHall(hall, excludeUid, eventName, payload) {
  for (const p of worldPlayers.values()) {
    if (p.hall === hall && p.uid !== excludeUid) {
      writeSse(worldSse.get(p.uid), eventName, payload);
    }
  }
}

/* ================= B. 雍和宫求姻缘 · 在线实时配对服务 (SSE + JSON) ================= */
const sseClients = new Map();
const waitingQueue = [];
const activeRooms = new Map();
const userRoomMap = new Map();

function sendSse(uid, eventName, payload) {
  writeSse(sseClients.get(uid), eventName, payload);
}

function broadcastStats() {
  const payload = { online: Math.max(sseClients.size, worldPlayers.size), waiting: waitingQueue.length };
  for (const uid of sseClients.keys()) sendSse(uid, 'stats', payload);
}

function removeFromQueue(uid) {
  const idx = waitingQueue.findIndex(u => u.uid === uid);
  if (idx !== -1) waitingQueue.splice(idx, 1);
}

function leaveRoom(uid) {
  const rid = userRoomMap.get(uid);
  if (!rid) return;
  userRoomMap.delete(uid);
  const room = activeRooms.get(rid);
  if (!room) return;
  activeRooms.delete(rid);
  for (const u of room.users) {
    if (u.uid !== uid) {
      userRoomMap.delete(u.uid);
      sendSse(u.uid, 'partner_left', { roomId: rid });
    }
  }
}

function isGenderCompatible(a, b) {
  const aOk = !a.seekGender || a.seekGender === '不限' || a.seekGender === b.gender;
  const bOk = !b.seekGender || b.seekGender === '不限' || b.seekGender === a.gender;
  return aOk && bOk;
}

function scoreMatch(a, b) {
  let score = 78;
  const common = (a.hobbies || []).filter(h => (b.hobbies || []).includes(h));
  if (a.city && b.city && a.city.trim() === b.city.trim()) score += 12;
  score += Math.min(9, common.length * 4);
  return { score: Math.min(99, score), common };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 32 * 1024) { req.destroy(); reject(new Error('Body too large')); }
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function jsonOut(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  let urlObj;
  try {
    urlObj = new URL(req.url, 'http://localhost');
  } catch (e) {
    res.writeHead(400); res.end('Bad URL'); return;
  }
  const pathname = urlObj.pathname;

  if (pathname === '/health') {
    jsonOut(res, 200, {
      status: 'ok',
      service: 'yonghegong-3d-web',
      worldOnline: worldPlayers.size,
      fateOnline: sseClients.size,
      waiting: waitingQueue.length,
      rooms: activeRooms.size,
      uptimeSec: Math.floor(process.uptime())
    });
    return;
  }

  /* ---- 全员实时同屏接口 ---- */
  if (pathname === '/api/world/events' && req.method === 'GET') {
    const uid = cleanText(urlObj.searchParams.get('uid'), 64);
    if (!uid) { jsonOut(res, 400, { error: 'missing uid' }); return; }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(': connected\n\n');

    const prev = worldPlayers.get(uid);
    const hall = prev ? prev.hall : pickHall();
    const pObj = {
      uid,
      hall,
      nickname: cleanText(urlObj.searchParams.get('nickname'), 16) || '有缘香客',
      gender: urlObj.searchParams.get('gender') === '女' ? '女' : '男',
      robe: cleanText(urlObj.searchParams.get('robe'), 16) || 'saffron',
      x: Math.max(-24, Math.min(24, Number(urlObj.searchParams.get('x')) || 0)),
      z: Math.max(-22, Math.min(26, Number(urlObj.searchParams.get('z')) || 12)),
      rotY: Math.PI,
      pose: 'idle'
    };

    worldSse.set(uid, res);
    worldPlayers.set(uid, pObj);

    const hCount = countInHall(hall);
    writeSse(res, 'world_init', {
      hall,
      hallCount: hCount,
      totalOnline: worldPlayers.size,
      players: playersInHall(hall, uid)
    });
    broadcastHall(hall, uid, 'player_join', {
      player: pObj,
      hallCount: hCount,
      totalOnline: worldPlayers.size
    });

    const hb = setInterval(() => {
      if (res.writableEnded) { clearInterval(hb); return; }
      try { res.write(': ping\n\n'); } catch (e) {}
    }, 20000);

    req.on('close', () => {
      clearInterval(hb);
      if (worldSse.get(uid) === res) {
        worldSse.delete(uid);
        const cur = worldPlayers.get(uid);
        worldPlayers.delete(uid);
        if (cur) {
          broadcastHall(cur.hall, uid, 'player_leave', {
            uid,
            hallCount: countInHall(cur.hall),
            totalOnline: worldPlayers.size
          });
        }
      }
    });
    return;
  }

  if (pathname === '/api/world/state' && req.method === 'POST') {
    if (!checkRateLimit(req, 150)) { jsonOut(res, 429, { error: 'too many requests' }); return; }
    try {
      const body = await readJsonBody(req);
      const uid = cleanText(body.uid, 64);
      const p = worldPlayers.get(uid);
      if (p) {
        if (typeof body.x === 'number' && Number.isFinite(body.x)) p.x = Math.max(-24, Math.min(24, body.x));
        if (typeof body.z === 'number' && Number.isFinite(body.z)) p.z = Math.max(-22, Math.min(26, body.z));
        if (typeof body.rotY === 'number' && Number.isFinite(body.rotY)) p.rotY = body.rotY;
        if (body.pose) p.pose = cleanText(body.pose, 16) || 'idle';
        if (body.robe) p.robe = cleanText(body.robe, 16) || p.robe;
        if (body.nickname) p.nickname = cleanText(body.nickname, 16) || p.nickname;
        broadcastHall(p.hall, uid, 'player_update', p);
      }
      jsonOut(res, 200, { ok: true });
    } catch (e) {
      jsonOut(res, 400, { error: 'invalid payload' });
    }
    return;
  }

  if (pathname === '/api/world/greet' && req.method === 'POST') {
    if (!checkRateLimit(req, 40)) { jsonOut(res, 429, { error: 'too many requests' }); return; }
    try {
      const body = await readJsonBody(req);
      const fromUid = cleanText(body.fromUid, 64);
      const toUid = cleanText(body.toUid, 64);
      const fromName = cleanText(body.fromName, 16) || '有缘香客';
      if (toUid && worldSse.has(toUid)) {
        writeSse(worldSse.get(toUid), 'player_greet', { fromUid, fromName });
      }
      jsonOut(res, 200, { ok: true });
    } catch (e) {
      jsonOut(res, 400, { error: 'invalid payload' });
    }
    return;
  }

  /* ---- 求姻缘在线配对接口 ---- */
  if (pathname === '/api/fate/events' && req.method === 'GET') {
    const uid = cleanText(urlObj.searchParams.get('uid'), 64);
    if (!uid) { jsonOut(res, 400, { error: 'missing uid' }); return; }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(': connected\n\n');
    sseClients.set(uid, res);
    broadcastStats();

    const hb = setInterval(() => {
      if (res.writableEnded) { clearInterval(hb); return; }
      try { res.write(': ping\n\n'); } catch (e) {}
    }, 20000);

    req.on('close', () => {
      clearInterval(hb);
      if (sseClients.get(uid) === res) sseClients.delete(uid);
      removeFromQueue(uid);
      leaveRoom(uid);
      broadcastStats();
    });
    return;
  }

  if (pathname === '/api/fate/join' && req.method === 'POST') {
    if (!checkRateLimit(req, 30)) { jsonOut(res, 429, { error: 'too many requests' }); return; }
    try {
      const body = await readJsonBody(req);
      const uid = cleanText(body.uid, 64);
      if (!uid) { jsonOut(res, 400, { error: 'missing uid' }); return; }
      removeFromQueue(uid);
      leaveRoom(uid);

      const user = {
        uid,
        nickname: cleanText(body.nickname, 16) || '京城有缘人',
        gender: body.gender === '女' ? '女' : '男',
        seekGender: ['男', '女', '不限'].includes(body.seekGender) ? body.seekGender : '不限',
        city: cleanText(body.city, 12) || '北京',
        hobbies: Array.isArray(body.hobbies)
          ? body.hobbies.map(x => cleanText(x, 10)).filter(Boolean).slice(0, 6)
          : [],
        wish: cleanText(body.wish, 48) || '愿得一人心，携手共白首',
        joinedAt: Date.now()
      };

      let bestIdx = -1;
      let bestMeta = null;
      for (let i = 0; i < waitingQueue.length; i++) {
        const cand = waitingQueue[i];
        if (cand.uid === uid) continue;
        if (!isGenderCompatible(user, cand)) continue;
        const meta = scoreMatch(user, cand);
        if (!bestMeta || meta.score > bestMeta.score) {
          bestIdx = i;
          bestMeta = meta;
        }
      }

      if (bestIdx !== -1) {
        const partner = waitingQueue.splice(bestIdx, 1)[0];
        const roomId = 'fate_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        activeRooms.set(roomId, { id: roomId, users: [user, partner] });
        userRoomMap.set(user.uid, roomId);
        userRoomMap.set(partner.uid, roomId);

        const sameCity = user.city === partner.city;
        const reason = sameCity
          ? '同在' + user.city + (bestMeta.common.length ? ' · 共好「' + bestMeta.common.slice(0, 2).join('、') + '」' : ' · 同刻入宫祈缘')
          : (bestMeta.common.length ? '共好「' + bestMeta.common.slice(0, 2).join('、') + '」· 千里同心' : '同刻在雍和宫求缘 · 缘起当下');

        const payloadForPartner = { roomId, partner: user, commonHobbies: bestMeta.common, score: bestMeta.score, reason };
        const payloadForUser = { roomId, partner, commonHobbies: bestMeta.common, score: bestMeta.score, reason };

        sendSse(partner.uid, 'matched', payloadForPartner);
        sendSse(user.uid, 'matched', payloadForUser);
        broadcastStats();
        jsonOut(res, 200, { status: 'matched', ...payloadForUser });
        return;
      }

      waitingQueue.push(user);
      broadcastStats();
      jsonOut(res, 200, { status: 'waiting', waiting: waitingQueue.length, online: Math.max(sseClients.size, worldPlayers.size) });
    } catch (e) {
      jsonOut(res, 400, { error: 'invalid payload' });
    }
    return;
  }

  if (pathname === '/api/fate/leave' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const uid = cleanText(body.uid, 64);
      removeFromQueue(uid);
      leaveRoom(uid);
      broadcastStats();
      jsonOut(res, 200, { ok: true });
    } catch (e) {
      jsonOut(res, 400, { error: 'invalid payload' });
    }
    return;
  }

  if (pathname === '/api/fate/action' && req.method === 'POST') {
    if (!checkRateLimit(req, 60)) { jsonOut(res, 429, { error: 'too many requests' }); return; }
    try {
      const body = await readJsonBody(req);
      const uid = cleanText(body.uid, 64);
      const act = cleanText(body.action, 24) || 'ribbon';
      const rid = userRoomMap.get(uid);
      const room = rid && activeRooms.get(rid);
      if (room) {
        const sender = room.users.find(u => u.uid === uid);
        for (const u of room.users) {
          if (u.uid !== uid) sendSse(u.uid, 'partner_action', { action: act, from: sender ? sender.nickname : '有缘人' });
        }
      }
      jsonOut(res, 200, { ok: true });
    } catch (e) {
      jsonOut(res, 400, { error: 'invalid payload' });
    }
    return;
  }

  if (pathname === '/api/fate/chat' && req.method === 'POST') {
    if (!checkRateLimit(req, 60)) { jsonOut(res, 429, { error: 'too many requests' }); return; }
    try {
      const body = await readJsonBody(req);
      const uid = cleanText(body.uid, 64);
      const text = cleanText(body.text, 120);
      const rid = userRoomMap.get(uid);
      const room = rid && activeRooms.get(rid);
      if (room && text) {
        const sender = room.users.find(u => u.uid === uid);
        for (const u of room.users) {
          if (u.uid !== uid) sendSse(u.uid, 'chat', { from: sender ? sender.nickname : '有缘人', text, ts: Date.now() });
        }
      }
      jsonOut(res, 200, { ok: true });
    } catch (e) {
      jsonOut(res, 400, { error: 'invalid payload' });
    }
    return;
  }

  // 静态文件服务
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
  const file = path.join(root, safePath);
  if (!file.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  const baseName = path.basename(file);
  if (baseName === 'server.cjs' || baseName === 'Dockerfile' || baseName === 'docker-compose.yml' || baseName === 'ecosystem.config.cjs' || baseName === 'render.yaml' || baseName === 'package.json') {
    res.writeHead(404); res.end('Not Found'); return;
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not Found'); return; }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': STATIC_CACHE_EXTS.has(ext) ? 'public, max-age=604800' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin'
    });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
});

function shutdown() {
  for (const res of sseClients.values()) { try { res.end(); } catch (e) {} }
  for (const res of worldSse.values()) { try { res.end(); } catch (e) {} }
  sseClients.clear();
  worldSse.clear();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(port, host, () => {
  console.log('北京 · 雍和宫 3D 实时同屏与求姻缘服务已启动  http://' + host + ':' + port + '/');
});
