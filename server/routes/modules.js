/**
 * Dedicated Module Routes - MedTech Compliance Suite
 * Provides typed CRUD against dedicated SQLite tables for each compliance module.
 * Falls back to generic compliance_data table for unknown modules.
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');
const { authenticate } = require('../middleware/auth');
const { logAuditEntry } = require('../middleware/audit');

const router = express.Router();

// ─── Module Config ─────────────────────────────────────────────────────
// Maps module name -> { table, viewPerm, editPerm, deletePerm }
const MODULE_CONFIG = {
  capas:              { table: 'capas',              view: 'view_capa',           edit: 'edit_capa',           del: 'approve_capa' },
  ncrs:               { table: 'ncrs',               view: 'view_ncr',            edit: 'edit_ncr',            del: 'manage_users' },
  risks:              { table: 'risk_assessments',   view: 'view_risk',           edit: 'edit_risk',           del: 'manage_users' },
  suppliers:          { table: 'suppliers',          view: 'view_suppliers',      edit: 'edit_suppliers',      del: 'approve_suppliers' },
  training:           { table: 'training_records',   view: 'view_training',       edit: 'edit_training',       del: 'manage_users' },
  changeControls:     { table: 'change_controls',    view: 'view_change_control', edit: 'edit_change_control', del: 'manage_users' },
  complaints:         { table: 'complaints',         view: 'view_vigilance',      edit: 'edit_vigilance',      del: 'manage_users' },
  adverseEvents:      { table: 'adverse_events',     view: 'view_vigilance',      edit: 'edit_vigilance',      del: 'manage_users' },
  documents:          { table: 'documents',          view: 'view_documents',      edit: 'edit_documents',      del: 'delete_documents' },
  validationReports:  { table: 'validation_reports', view: 'view_validation',     edit: 'edit_validation',     del: 'manage_users' },
  lifecycle:          { table: 'lifecycle_records',  view: 'view_dashboard',      edit: 'edit_metrics',        del: 'manage_users' },
  reports:            { table: 'reports',            view: 'view_dashboard',      edit: 'edit_metrics',        del: 'manage_users' },
  metricValues:       { table: 'metric_values',      view: 'view_metrics',        edit: 'edit_metrics',        del: 'manage_users' },
};

function checkPerm(user, perm) {
  if (user.role === 'Admin' || user.role === 'Developer') return true;
  return Array.isArray(user.permissions) && user.permissions.includes(perm);
}

// ─── Helper: serialize row (all JSON TEXT fields auto-parsed) ──────────
function serializeRow(row) {
  if (!row) return null;
  const out = { ...row };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) {
      try { out[key] = JSON.parse(v); } catch { /* leave as string */ }
    }
  }
  return out;
}

// ─── GET /api/modules/:module ──────────────────────────────────────────
router.get('/:module', authenticate, (req, res) => {
  const cfg = MODULE_CONFIG[req.params.module];
  if (!cfg) return res.status(400).json({ error: `Unknown module: ${req.params.module}` });
  if (!checkPerm(req.user, cfg.view)) return res.status(403).json({ error: 'Insufficient permissions' });

  const db = getDb();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, parseInt(req.query.limit) || 100);
  const offset = (page - 1) * limit;

  // Optional status filter
  let where = '';
  const params = [];
  if (req.query.status) { where = 'WHERE status = ?'; params.push(req.query.status); }

  const total = db.prepare(`SELECT COUNT(*) as c FROM ${cfg.table} ${where}`).get(...params).c;
  const rows = db.prepare(`SELECT * FROM ${cfg.table} ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.json({ module: req.params.module, items: rows.map(serializeRow), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// ─── GET /api/modules/:module/:id ─────────────────────────────────────
router.get('/:module/:id', authenticate, (req, res) => {
  const cfg = MODULE_CONFIG[req.params.module];
  if (!cfg) return res.status(400).json({ error: `Unknown module: ${req.params.module}` });
  if (!checkPerm(req.user, cfg.view)) return res.status(403).json({ error: 'Insufficient permissions' });

  const db = getDb();
  const row = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Record not found' });
  res.json(serializeRow(row));
});

// ─── POST /api/modules/:module ─────────────────────────────────────────
router.post('/:module', authenticate, (req, res) => {
  const cfg = MODULE_CONFIG[req.params.module];
  if (!cfg) return res.status(400).json({ error: `Unknown module: ${req.params.module}` });
  if (!checkPerm(req.user, cfg.edit)) return res.status(403).json({ error: 'Insufficient permissions' });

  const db = getDb();
  const id = req.body.id || uuidv4();
  const now = new Date().toISOString();

  // Get column names from table
  const cols = db.prepare(`PRAGMA table_info(${cfg.table})`).all().map(c => c.name);

  // Build insert object from request body, filtering to valid columns
  const insertData = { id, created_at: now, updated_at: now, created_by: req.user.id };
  for (const col of cols) {
    if (col in req.body && col !== 'id') {
      insertData[col] = typeof req.body[col] === 'object' ? JSON.stringify(req.body[col]) : req.body[col];
    }
  }

  const colNames = Object.keys(insertData).join(', ');
  const placeholders = Object.keys(insertData).map(() => '?').join(', ');
  const values = Object.values(insertData);

  try {
    db.prepare(`INSERT INTO ${cfg.table} (${colNames}) VALUES (${placeholders})`).run(...values);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  logAuditEntry({ action: `Created ${req.params.module} record`, entityType: req.params.module, entityId: id, newValue: req.body, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip, isoClause: 'ISO 13485:4.2.5' });

  const created = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(id);
  res.status(201).json(serializeRow(created));
});

// ─── PUT /api/modules/:module/:id ─────────────────────────────────────
router.put('/:module/:id', authenticate, (req, res) => {
  const cfg = MODULE_CONFIG[req.params.module];
  if (!cfg) return res.status(400).json({ error: `Unknown module: ${req.params.module}` });
  if (!checkPerm(req.user, cfg.edit)) return res.status(403).json({ error: 'Insufficient permissions' });

  const db = getDb();
  const existing = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Record not found' });

  const now = new Date().toISOString();
  const cols = db.prepare(`PRAGMA table_info(${cfg.table})`).all().map(c => c.name);

  const updates = { updated_at: now, updated_by: req.user.id };
  for (const col of cols) {
    if (col in req.body && col !== 'id' && col !== 'created_at' && col !== 'created_by') {
      updates[col] = typeof req.body[col] === 'object' ? JSON.stringify(req.body[col]) : req.body[col];
    }
  }

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  db.prepare(`UPDATE ${cfg.table} SET ${setClause} WHERE id = ?`).run(...values);

  logAuditEntry({ action: `Updated ${req.params.module} record`, entityType: req.params.module, entityId: req.params.id, previousValue: serializeRow(existing), newValue: req.body, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip, isoClause: 'ISO 13485:4.2.5' });

  const updated = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(req.params.id);
  res.json(serializeRow(updated));
});

// ─── DELETE /api/modules/:module/:id ──────────────────────────────────
router.delete('/:module/:id', authenticate, (req, res) => {
  const cfg = MODULE_CONFIG[req.params.module];
  if (!cfg) return res.status(400).json({ error: `Unknown module: ${req.params.module}` });

  // Delete requires Admin or specific delete permission
  if (req.user.role !== 'Admin' && req.user.role !== 'Developer' && !checkPerm(req.user, cfg.del)) {
    return res.status(403).json({ error: 'Insufficient permissions for deletion' });
  }

  const db = getDb();
  const existing = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Record not found' });

  db.prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).run(req.params.id);

  logAuditEntry({ action: `Deleted ${req.params.module} record`, entityType: req.params.module, entityId: req.params.id, previousValue: serializeRow(existing), userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip, isoClause: 'ISO 13485:4.2.5' });

  res.json({ message: 'Record deleted', id: req.params.id });
});

// ─── POST /api/modules/bulk/:module - Bulk upsert ─────────────────────
router.post('/bulk/:module', authenticate, (req, res) => {
  const cfg = MODULE_CONFIG[req.params.module];
  if (!cfg) return res.status(400).json({ error: `Unknown module: ${req.params.module}` });
  if (!checkPerm(req.user, cfg.edit)) return res.status(403).json({ error: 'Insufficient permissions' });

  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

  const db = getDb();
  const now = new Date().toISOString();
  const cols = db.prepare(`PRAGMA table_info(${cfg.table})`).all().map(c => c.name);

  let created = 0, updated = 0;
  const tx = db.transaction(() => {
    for (const item of items) {
      const id = item.id || uuidv4();
      const existing = db.prepare(`SELECT id FROM ${cfg.table} WHERE id = ?`).get(id);
      const row = { id, created_at: now, updated_at: now, created_by: req.user.id };
      for (const col of cols) {
        if (col in item && col !== 'id') {
          row[col] = typeof item[col] === 'object' ? JSON.stringify(item[col]) : item[col];
        }
      }
      const colNames = Object.keys(row).join(', ');
      const placeholders = Object.keys(row).map(() => '?').join(', ');
      const updateSet = Object.keys(row).filter(k => k !== 'id' && k !== 'created_at').map(k => `${k} = excluded.${k}`).join(', ');
      db.prepare(`INSERT INTO ${cfg.table} (${colNames}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updateSet}`).run(...Object.values(row));
      if (existing) updated++; else created++;
    }
  });
  tx();

  logAuditEntry({ action: `Bulk sync ${req.params.module}: ${created} created, ${updated} updated`, entityType: req.params.module, userId: req.user.id, userName: req.user.fullName || req.user.username, ipAddress: req.ip });
  res.json({ message: 'Bulk sync completed', created, updated, total: items.length });
});

module.exports = router;
