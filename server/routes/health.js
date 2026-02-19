const express = require('express');
const { getDb } = require('../db/schema');
const os = require('os');

const router = express.Router();

const startTime = Date.now();

// GET /api/health - Public health check
router.get('/', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  let dbStatus = 'ok';
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
  } catch (err) {
    dbStatus = 'error';
  }

  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
      api: 'ok',
    },
  });
});

// GET /api/health/detailed - Authenticated detailed health check
router.get('/detailed', (req, res) => {
  const db = getDb();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  let dbStats = {};
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
    const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_trail').get();
    const dataCount = db.prepare('SELECT COUNT(*) as count FROM compliance_data').get();
    const moduleCounts = db.prepare('SELECT module, COUNT(*) as count FROM compliance_data GROUP BY module').all();

    dbStats = {
      status: 'ok',
      users: userCount.count,
      activeSessions: sessionCount.count,
      auditEntries: auditCount.count,
      complianceRecords: dataCount.count,
      moduleBreakdown: moduleCounts.reduce((acc, m) => { acc[m.module] = m.count; return acc; }, {}),
    };
  } catch (err) {
    dbStats = { status: 'error', error: err.message };
  }

  res.json({
    status: dbStats.status === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
      cpuLoad: os.loadavg(),
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
    },
    database: dbStats,
  });
});

module.exports = router;
