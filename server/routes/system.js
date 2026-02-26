/**
 * System Routes - MedTech Compliance Suite
 * Cockpit-style multi-site administration, system info, and server monitoring.
 * Admin/Developer access only.
 */
const express = require('express');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');
const { authenticate } = require('../middleware/auth');
const { logAuditEntry } = require('../middleware/audit');

const router = express.Router();
const START_TIME = Date.now();
let requestCount = 0;
let errorCount = 0;

// Count requests for metrics
router.use((req, res, next) => {
  requestCount++;
  const orig = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode >= 400) errorCount++;
    return orig(data);
  };
  next();
});

function adminOnly(req, res, next) {
  if (req.user.role !== 'Admin' && req.user.role !== 'Developer') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

// ─── GET /api/system/info ─────────────────────────────────────────────
// Real-time server information for the cockpit view
router.get('/info', authenticate, adminOnly, (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const interfaces = [];
  for (const [name, iface] of Object.entries(networkInterfaces)) {
    for (const alias of iface) {
      if (!alias.internal) {
        interfaces.push({ name, family: alias.family, address: alias.address, mac: alias.mac });
      }
    }
  }

  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const memUsed = memTotal - memFree;
  const uptimeSec = Math.floor((Date.now() - START_TIME) / 1000);

  res.json({
    server: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      osType: os.type(),
      osRelease: os.release(),
      nodeVersion: process.version,
      appVersion: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    network: {
      interfaces,
      primaryIp: interfaces.find(i => i.family === 'IPv4')?.address || '127.0.0.1',
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown',
      loadAvg: os.loadavg(),
      loadPercent: Math.min(100, (os.loadavg()[0] / os.cpus().length) * 100).toFixed(1),
    },
    memory: {
      totalMB: Math.round(memTotal / 1024 / 1024),
      usedMB: Math.round(memUsed / 1024 / 1024),
      freeMB: Math.round(memFree / 1024 / 1024),
      percentUsed: ((memUsed / memTotal) * 100).toFixed(1),
    },
    process: {
      pid: process.pid,
      uptimeSeconds: uptimeSec,
      uptimeFormatted: formatUptime(uptimeSec),
      memoryUsage: {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      requestCount,
      errorCount,
      errorRate: requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) : '0.00',
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /api/system/metrics ──────────────────────────────────────────
// Snapshot metrics for dashboard charts
router.get('/metrics', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const uptimeSec = Math.floor((Date.now() - START_TIME) / 1000);

  // Record this snapshot
  const siteRow = db.prepare('SELECT id FROM sites WHERE is_primary = 1 LIMIT 1').get();
  const snapshotId = uuidv4();
  const now = new Date().toISOString();

  const memTotal = os.totalmem();
  const memUsed = memTotal - os.freemem();
  const cpuLoad = (os.loadavg()[0] / os.cpus().length) * 100;
  const activeSessionCount = db.prepare('SELECT COUNT(*) as c FROM sessions WHERE expires_at > ?').get(now)?.c || 0;

  if (siteRow) {
    db.prepare('INSERT INTO system_metrics (id,site_id,cpu_percent,memory_percent,disk_percent,active_sessions,requests_per_minute,error_rate,uptime_seconds,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(snapshotId, siteRow.id, +cpuLoad.toFixed(1), +((memUsed/memTotal)*100).toFixed(1), 0, activeSessionCount, +(requestCount/(uptimeSec/60)).toFixed(2), +(errorCount/Math.max(1,requestCount)*100).toFixed(2), uptimeSec, now);
  }

  // Return last 60 snapshots for charts
  const history = db.prepare('SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 60').all().reverse();

  res.json({
    current: {
      cpuPercent: +cpuLoad.toFixed(1),
      memoryPercent: +((memUsed / memTotal) * 100).toFixed(1),
      activeSessions: activeSessionCount,
      uptimeSeconds: uptimeSec,
      requestCount,
      errorCount,
    },
    history,
  });
});

// ─── GET /api/system/db-stats ─────────────────────────────────────────
router.get('/db-stats', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const tables = ['users','sessions','audit_trail','capas','ncrs','risk_assessments','suppliers','training_records','change_controls','complaints','adverse_events','documents','validation_reports','lifecycle_records','reports','metric_values','system_logs','sites'];

  const stats = {};
  for (const table of tables) {
    try {
      stats[table] = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
    } catch { stats[table] = 0; }
  }

  const dbSize = (() => {
    try {
      const fs = require('fs');
      const dbPath = process.env.DB_PATH || require('path').join(__dirname, '..', 'data', 'compliance.db');
      return fs.statSync(dbPath).size;
    } catch { return 0; }
  })();

  res.json({ tables: stats, dbSizeBytes: dbSize, dbSizeMB: (dbSize / 1024 / 1024).toFixed(2) });
});

// ─── GET /api/system/sites ────────────────────────────────────────────
router.get('/sites', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const sites = db.prepare('SELECT * FROM sites ORDER BY is_primary DESC, site_name ASC').all();
  res.json({ sites });
});

// ─── POST /api/system/sites ───────────────────────────────────────────
router.post('/sites', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const { site_name, site_code, description, address, city, state, country, ip_address, server_hostname, server_port, contact_name, contact_email, contact_phone, notes } = req.body;

  if (!site_name || !site_code) return res.status(400).json({ error: 'site_name and site_code are required' });

  const id = uuidv4();
  const now = new Date().toISOString();

  try {
    db.prepare('INSERT INTO sites (id,site_name,site_code,description,address,city,state,country,ip_address,server_hostname,server_port,status,is_primary,last_heartbeat,created_at,updated_at,contact_name,contact_email,contact_phone,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,?,?,?,?,?)')
      .run(id, site_name, site_code, description||'', address||'', city||'', state||'', country||'USA', ip_address||'', server_hostname||'', server_port||3001, 'Active', now, now, now, contact_name||'', contact_email||'', contact_phone||'', notes||'');
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  logAuditEntry({ action: `Added site: ${site_name}`, entityType: 'site', entityId: id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip });

  const created = db.prepare('SELECT * FROM sites WHERE id = ?').get(id);
  res.status(201).json(created);
});

// ─── PUT /api/system/sites/:id ────────────────────────────────────────
router.put('/sites/:id', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Site not found' });

  const now = new Date().toISOString();
  const allowed = ['site_name','site_code','description','address','city','state','country','ip_address','server_hostname','server_port','status','contact_name','contact_email','contact_phone','notes','server_version'];
  const updates = { updated_at: now };
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE sites SET ${setClause} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  logAuditEntry({ action: `Updated site: ${existing.site_name}`, entityType: 'site', entityId: req.params.id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip });

  const updated = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ─── DELETE /api/system/sites/:id ────────────────────────────────────
router.delete('/sites/:id', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Site not found' });
  if (existing.is_primary) return res.status(400).json({ error: 'Cannot delete primary site' });

  db.prepare('DELETE FROM sites WHERE id = ?').run(req.params.id);
  logAuditEntry({ action: `Deleted site: ${existing.site_name}`, entityType: 'site', entityId: req.params.id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip });
  res.json({ message: 'Site deleted', id: req.params.id });
});

// ─── POST /api/system/sites/:id/heartbeat ─────────────────────────────
router.post('/sites/:id/heartbeat', authenticate, (req, res) => {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare('UPDATE sites SET last_heartbeat = ?, status = ? WHERE id = ?').run(now, 'Active', req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Site not found' });
  res.json({ ok: true, timestamp: now });
});

// ─── GET /api/system/logs ─────────────────────────────────────────────
router.get('/logs', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const limit = Math.min(500, parseInt(req.query.limit) || 100);
  const level = req.query.level;
  const category = req.query.category;

  let where = '';
  const params = [];
  if (level) { where = 'WHERE level = ?'; params.push(level); }
  if (category) { where += (where ? ' AND' : 'WHERE') + ' category = ?'; params.push(category); }

  const logs = db.prepare(`SELECT * FROM system_logs ${where} ORDER BY timestamp DESC LIMIT ?`).all(...params, limit);
  res.json({ logs });
});

// ─── POST /api/system/logs ────────────────────────────────────────────
router.post('/logs', authenticate, (req, res) => {
  const db = getDb();
  const { level = 'info', category = 'app', message, details, source } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO system_logs (id,level,category,message,details,source,user_id,ip_address,timestamp) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, level, category, message, details ? JSON.stringify(details) : null, source || 'frontend', req.user.id, req.ip, now);

  res.status(201).json({ id, level, category, message, timestamp: now });
});

// ─── GET /api/system/users ────────────────────────────────────────────
router.get('/users', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, username, email, full_name, role, permissions, department, title, phone, status, last_login, created_at, updated_at, mfa_enabled, failed_login_attempts FROM users ORDER BY full_name').all();
  res.json({ users: users.map(u => ({ ...u, permissions: JSON.parse(u.permissions || '[]') })) });
});

// ─── POST /api/system/users ───────────────────────────────────────────
router.post('/users', authenticate, adminOnly, (req, res) => {
  const bcrypt = require('bcryptjs');
  const db = getDb();
  const { username, email, full_name, password, role, permissions, department, title, phone } = req.body;

  if (!username || !email || !password) return res.status(400).json({ error: 'username, email, and password are required' });

  const id = uuidv4();
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare('INSERT INTO users (id,username,email,full_name,password_hash,role,permissions,department,title,phone,status,created_at,updated_at,password_last_changed,must_change_password,mfa_enabled,failed_login_attempts) VALUES (?,?,?,?,?,?,?,?,?,?,\'Active\',?,?,?,0,0,0)')
      .run(id, username, email, full_name||username, hash, role||'Viewer', JSON.stringify(permissions||[]), department||'', title||'', phone||'', now, now, now);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  logAuditEntry({ action: `Created user: ${username}`, entityType: 'user', entityId: id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip, isoClause: '21 CFR Part 11.10' });
  res.status(201).json({ id, username, email, full_name, role: role||'Viewer', status: 'Active' });
});

// ─── PUT /api/system/users/:id ────────────────────────────────────────
router.put('/users/:id', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'User not found' });

  const now = new Date().toISOString();
  const allowed = ['email','full_name','role','permissions','department','title','phone','status'];
  const updates = { updated_at: now };
  for (const key of allowed) {
    if (key in req.body) {
      updates[key] = typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : req.body[key];
    }
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  logAuditEntry({ action: `Updated user: ${existing.username}`, entityType: 'user', entityId: req.params.id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip, isoClause: '21 CFR Part 11.10' });

  const updated = db.prepare('SELECT id, username, email, full_name, role, permissions, department, title, status FROM users WHERE id = ?').get(req.params.id);
  res.json({ ...updated, permissions: JSON.parse(updated.permissions || '[]') });
});

// ─── DELETE /api/system/users/:id ────────────────────────────────────
router.delete('/users/:id', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  if (existing.username === req.user.username) return res.status(400).json({ error: 'Cannot delete your own account' });

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  logAuditEntry({ action: `Deleted user: ${existing.username}`, entityType: 'user', entityId: req.params.id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip });
  res.json({ message: 'User deleted', id: req.params.id });
});

// ─── GET /api/system/sessions ─────────────────────────────────────────
router.get('/sessions', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const now = new Date().toISOString();
  const sessions = db.prepare(`
    SELECT s.id, s.user_id, u.username, u.full_name, s.ip_address, s.user_agent, s.created_at, s.expires_at, s.last_activity
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.expires_at > ? ORDER BY s.last_activity DESC
  `).all(now);
  res.json({ sessions, count: sessions.length });
});

// ─── POST /api/system/sessions/:id/revoke ─────────────────────────────
router.post('/sessions/:id/revoke', authenticate, adminOnly, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Session not found' });
  logAuditEntry({ action: `Revoked session: ${req.params.id}`, entityType: 'session', entityId: req.params.id, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip });
  res.json({ message: 'Session revoked' });
});

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

module.exports = router;
