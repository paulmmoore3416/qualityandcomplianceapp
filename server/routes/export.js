const express = require('express');
const { getDb } = require('../db/schema');
const { authenticate, authorize } = require('../middleware/auth');
const { logAuditEntry } = require('../middleware/audit');
const { exportValidation } = require('../middleware/validation');

const router = express.Router();

// GET /api/export/data - Export compliance data
router.get('/data', authenticate, authorize('export_data'), exportValidation, (req, res) => {
  const format = req.query.format || 'json';
  const module = req.query.module;
  const db = getDb();

  let rows;
  if (module) {
    rows = db.prepare('SELECT * FROM compliance_data WHERE module = ? ORDER BY updated_at DESC').all(module);
  } else {
    rows = db.prepare('SELECT * FROM compliance_data ORDER BY module, updated_at DESC').all();
  }

  const data = rows.map(row => ({
    module: row.module,
    ...JSON.parse(row.data),
    _createdAt: row.created_at,
    _updatedAt: row.updated_at,
  }));

  logAuditEntry({
    action: `Exported ${module || 'all'} data as ${format}`,
    entityType: 'export',
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: '21 CFR Part 11.10(b)',
  });

  if (format === 'csv') {
    const csvData = convertToCSV(data, module);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="compliance-export-${module || 'all'}-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="compliance-export-${module || 'all'}-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    exportedBy: req.user.fullName || req.user.username,
    module: module || 'all',
    recordCount: data.length,
    data,
  });
});

// GET /api/export/audit - Export audit trail
router.get('/audit', authenticate, authorize('view_audit_trail', 'export_data'), (req, res) => {
  const format = req.query.format || 'json';
  const db = getDb();

  const entries = db.prepare('SELECT * FROM audit_trail ORDER BY timestamp DESC').all();

  logAuditEntry({
    action: `Exported audit trail (${entries.length} entries)`,
    entityType: 'export',
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: '21 CFR Part 11.10(e)',
  });

  if (format === 'csv') {
    const csvData = convertToCSV(entries);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-trail-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  }

  res.setHeader('Content-Disposition', `attachment; filename="audit-trail-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    exportedBy: req.user.fullName || req.user.username,
    entryCount: entries.length,
    entries,
  });
});

// GET /api/export/report - Generate compliance summary report
router.get('/report', authenticate, authorize('export_data'), (req, res) => {
  const db = getDb();

  const moduleCounts = db.prepare(
    'SELECT module, COUNT(*) as count FROM compliance_data GROUP BY module'
  ).all();

  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_trail').get();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE status = ?').get('Active');

  // Gather per-module data summaries
  const modules = {};
  for (const mc of moduleCounts) {
    const items = db.prepare('SELECT data FROM compliance_data WHERE module = ?').all(mc.module);
    modules[mc.module] = {
      count: mc.count,
      summary: generateModuleSummary(mc.module, items.map(i => JSON.parse(i.data))),
    };
  }

  const report = {
    generatedAt: new Date().toISOString(),
    generatedBy: req.user.fullName || req.user.username,
    systemOverview: {
      activeUsers: userCount.count,
      auditEntries: auditCount.count,
      totalRecords: moduleCounts.reduce((sum, mc) => sum + mc.count, 0),
    },
    modules,
  };

  logAuditEntry({
    action: 'Generated compliance summary report',
    entityType: 'export',
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: 'ISO 13485:8.4',
  });

  res.json(report);
});

function generateModuleSummary(module, items) {
  if (items.length === 0) return { status: 'empty' };

  switch (module) {
    case 'capas':
      return {
        total: items.length,
        open: items.filter(i => i.status !== 'Closed').length,
        overdue: items.filter(i => i.status !== 'Closed' && new Date(i.dueDate) < new Date()).length,
        byPriority: countBy(items, 'priority'),
      };
    case 'ncrs':
      return {
        total: items.length,
        open: items.filter(i => i.status !== 'Closed').length,
        byType: countBy(items, 'type'),
        byDisposition: countBy(items, 'disposition'),
      };
    case 'risks':
      return {
        total: items.length,
        open: items.filter(i => i.status !== 'Closed').length,
        byLevel: countBy(items, 'riskLevel'),
      };
    case 'suppliers':
      return {
        total: items.length,
        byStatus: countBy(items, 'status'),
        byRiskLevel: countBy(items, 'riskLevel'),
      };
    default:
      return { total: items.length };
  }
}

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function convertToCSV(data, module) {
  if (data.length === 0) return '';

  // Get all unique keys
  const keys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (typeof item[key] !== 'object' || item[key] === null) {
        keys.add(key);
      }
    });
  });

  const headers = Array.from(keys);
  const headerRow = headers.map(h => `"${h}"`).join(',');

  const rows = data.map(item => {
    return headers.map(key => {
      const val = item[key];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

module.exports = router;
