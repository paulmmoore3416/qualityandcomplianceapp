const express = require('express');
const { getDb } = require('../db/schema');
const os = require('os');

const router = express.Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  let dbStatus = 'ok';
  try { getDb().prepare('SELECT 1').get(); } catch { dbStatus = 'error'; }

  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: { database: dbStatus, api: 'ok' },
  });
});

router.get('/detailed', (req, res) => {
  const db = getDb();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const tables = ['users','sessions','audit_trail','capas','ncrs','risk_assessments','suppliers','training_records','change_controls','complaints','documents','validation_reports','lifecycle_records','reports','metric_values','sites','system_logs'];
  const tableCounts = {};
  let dbStatus = 'ok';

  try {
    tables.forEach(t => {
      try { tableCounts[t] = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get().c; }
      catch { tableCounts[t] = 0; }
    });
  } catch (err) {
    dbStatus = 'error';
  }

  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: os.platform(), arch: os.arch(), nodeVersion: process.version,
      memoryUsage: { rssMB: Math.round(process.memoryUsage().rss/1024/1024), heapUsedMB: Math.round(process.memoryUsage().heapUsed/1024/1024) },
      cpuLoad: os.loadavg(), freeMB: Math.round(os.freemem()/1024/1024), totalMB: Math.round(os.totalmem()/1024/1024),
    },
    database: { status: dbStatus, tables: tableCounts },
  });
});

module.exports = router;
