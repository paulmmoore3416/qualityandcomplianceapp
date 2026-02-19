const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');
const { authenticate, authorize } = require('../middleware/auth');
const { logAuditEntry } = require('../middleware/audit');
const { complianceDataValidation, idParamValidation, paginationValidation } = require('../middleware/validation');

const router = express.Router();

// Module-to-permission mapping
const modulePermissions = {
  metrics: { view: 'view_metrics', edit: 'edit_metrics' },
  risks: { view: 'view_risk', edit: 'edit_risk' },
  capas: { view: 'view_capa', edit: 'edit_capa' },
  ncrs: { view: 'view_ncr', edit: 'edit_ncr' },
  validationReports: { view: 'view_validation', edit: 'edit_validation' },
  suppliers: { view: 'view_suppliers', edit: 'edit_suppliers' },
  training: { view: 'view_training', edit: 'edit_training' },
  changeControls: { view: 'view_change_control', edit: 'edit_change_control' },
  complaints: { view: 'view_vigilance', edit: 'edit_vigilance' },
  documents: { view: 'view_documents', edit: 'edit_documents' },
  alerts: { view: 'view_dashboard', edit: 'view_dashboard' },
  lifecycle: { view: 'view_dashboard', edit: 'edit_metrics' },
  lots: { view: 'view_metrics', edit: 'edit_metrics' },
  moduleLinks: { view: 'view_dashboard', edit: 'view_dashboard' },
};

// GET /api/compliance/:module - Get all records for a module
router.get('/:module', authenticate, paginationValidation, (req, res) => {
  const { module } = req.params;
  const perms = modulePermissions[module];

  if (!perms) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  if (req.user.role !== 'Admin' && !req.user.permissions.includes(perms.view)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const db = getDb();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const countResult = db.prepare('SELECT COUNT(*) as total FROM compliance_data WHERE module = ?').get(module);
  const rows = db.prepare('SELECT * FROM compliance_data WHERE module = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?')
    .all(module, limit, offset);

  const items = rows.map(row => ({
    ...JSON.parse(row.data),
    _id: row.id,
    _createdAt: row.created_at,
    _updatedAt: row.updated_at,
    _createdBy: row.created_by,
    _updatedBy: row.updated_by,
  }));

  res.json({
    module,
    items,
    pagination: {
      page,
      limit,
      total: countResult.total,
      totalPages: Math.ceil(countResult.total / limit),
    },
  });
});

// GET /api/compliance/:module/:id - Get single record
router.get('/:module/:id', authenticate, idParamValidation, (req, res) => {
  const { module, id } = req.params;
  const perms = modulePermissions[module];

  if (!perms) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM compliance_data WHERE id = ? AND module = ?').get(id, module);

  if (!row) {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.json({
    ...JSON.parse(row.data),
    _id: row.id,
    _createdAt: row.created_at,
    _updatedAt: row.updated_at,
  });
});

// POST /api/compliance/:module - Create new record
router.post('/:module', authenticate, (req, res) => {
  const { module } = req.params;
  const perms = modulePermissions[module];

  if (!perms) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  if (req.user.role !== 'Admin' && !req.user.permissions.includes(perms.edit)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const db = getDb();
  const id = req.body.id || uuidv4();
  const now = new Date().toISOString();
  const data = { ...req.body, id };

  db.prepare(`
    INSERT INTO compliance_data (id, module, data, created_at, updated_at, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, module, JSON.stringify(data), now, now, req.user.id, req.user.id);

  logAuditEntry({
    action: `Created ${module} record`,
    entityType: module,
    entityId: id,
    newValue: data,
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: 'ISO 13485:4.2.5',
  });

  res.status(201).json({ id, ...data, _createdAt: now, _updatedAt: now });
});

// PUT /api/compliance/:module/:id - Update record
router.put('/:module/:id', authenticate, idParamValidation, (req, res) => {
  const { module, id } = req.params;
  const perms = modulePermissions[module];

  if (!perms) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  if (req.user.role !== 'Admin' && !req.user.permissions.includes(perms.edit)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM compliance_data WHERE id = ? AND module = ?').get(id, module);

  if (!existing) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const now = new Date().toISOString();
  const previousData = JSON.parse(existing.data);
  const newData = { ...previousData, ...req.body, id };

  db.prepare('UPDATE compliance_data SET data = ?, updated_at = ?, updated_by = ? WHERE id = ? AND module = ?')
    .run(JSON.stringify(newData), now, req.user.id, id, module);

  logAuditEntry({
    action: `Updated ${module} record`,
    entityType: module,
    entityId: id,
    previousValue: previousData,
    newValue: newData,
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: 'ISO 13485:4.2.5',
  });

  res.json({ id, ...newData, _updatedAt: now });
});

// DELETE /api/compliance/:module/:id - Delete record
router.delete('/:module/:id', authenticate, idParamValidation, (req, res) => {
  const { module, id } = req.params;
  const perms = modulePermissions[module];

  if (!perms) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  // Only admins can delete
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required for deletion' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM compliance_data WHERE id = ? AND module = ?').get(id, module);

  if (!existing) {
    return res.status(404).json({ error: 'Record not found' });
  }

  db.prepare('DELETE FROM compliance_data WHERE id = ? AND module = ?').run(id, module);

  logAuditEntry({
    action: `Deleted ${module} record`,
    entityType: module,
    entityId: id,
    previousValue: JSON.parse(existing.data),
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: 'ISO 13485:4.2.5',
  });

  res.json({ message: 'Record deleted', id });
});

// POST /api/compliance/bulk/:module - Bulk import/sync
router.post('/bulk/:module', authenticate, (req, res) => {
  const { module } = req.params;
  const perms = modulePermissions[module];

  if (!perms) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  if (req.user.role !== 'Admin' && !req.user.permissions.includes(perms.edit)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array' });
  }

  const db = getDb();
  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO compliance_data (id, module, data, created_at, updated_at, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at, updated_by = excluded.updated_by
  `);

  const transaction = db.transaction(() => {
    let created = 0;
    let updated = 0;
    for (const item of items) {
      const id = item.id || uuidv4();
      const existing = db.prepare('SELECT id FROM compliance_data WHERE id = ? AND module = ?').get(id, module);
      upsert.run(id, module, JSON.stringify({ ...item, id }), now, now, req.user.id, req.user.id);
      if (existing) updated++;
      else created++;
    }
    return { created, updated };
  });

  const result = transaction();

  logAuditEntry({
    action: `Bulk sync ${module}: ${result.created} created, ${result.updated} updated`,
    entityType: module,
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
    isoClause: 'ISO 13485:4.2.5',
  });

  res.json({ message: 'Bulk sync completed', ...result, total: items.length });
});

module.exports = router;
