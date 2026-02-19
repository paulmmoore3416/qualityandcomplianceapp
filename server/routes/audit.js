const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAuditTrail } = require('../middleware/audit');
const { auditQueryValidation } = require('../middleware/validation');

const router = express.Router();

// GET /api/audit - Get audit trail entries
router.get('/', authenticate, authorize('view_audit_trail'), auditQueryValidation, (req, res) => {
  const filters = {
    entityType: req.query.entityType,
    entityId: req.query.entityId,
    userId: req.query.userId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    limit: parseInt(req.query.limit) || 200,
    offset: parseInt(req.query.offset) || 0,
  };

  const entries = getAuditTrail(filters);

  res.json({
    entries,
    filters,
    count: entries.length,
  });
});

// GET /api/audit/stats - Get audit statistics
router.get('/stats', authenticate, authorize('view_audit_trail'), (req, res) => {
  const { getDb } = require('../db/schema');
  const db = getDb();

  const totalEntries = db.prepare('SELECT COUNT(*) as count FROM audit_trail').get();
  const todayEntries = db.prepare(
    "SELECT COUNT(*) as count FROM audit_trail WHERE timestamp >= date('now')"
  ).get();
  const uniqueUsers = db.prepare(
    'SELECT COUNT(DISTINCT user_id) as count FROM audit_trail WHERE user_id IS NOT NULL'
  ).get();
  const actionBreakdown = db.prepare(
    'SELECT action, COUNT(*) as count FROM audit_trail GROUP BY action ORDER BY count DESC LIMIT 20'
  ).all();
  const entityBreakdown = db.prepare(
    'SELECT entity_type, COUNT(*) as count FROM audit_trail WHERE entity_type IS NOT NULL GROUP BY entity_type ORDER BY count DESC'
  ).all();
  const recentActivity = db.prepare(
    'SELECT * FROM audit_trail ORDER BY timestamp DESC LIMIT 10'
  ).all();

  res.json({
    totalEntries: totalEntries.count,
    todayEntries: todayEntries.count,
    uniqueUsers: uniqueUsers.count,
    actionBreakdown,
    entityBreakdown,
    recentActivity,
  });
});

// GET /api/audit/entity/:type/:id - Get audit trail for specific entity
router.get('/entity/:type/:id', authenticate, authorize('view_audit_trail'), (req, res) => {
  const entries = getAuditTrail({
    entityType: req.params.type,
    entityId: req.params.id,
    limit: 100,
  });

  res.json({ entries, count: entries.length });
});

module.exports = router;
