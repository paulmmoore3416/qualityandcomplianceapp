const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');

function logAuditEntry({ action, entityType, entityId, previousValue, newValue, isoClause, userId, userName, ipAddress, sessionId }) {
  const db = getDb();
  const entry = {
    id: uuidv4(),
    action,
    entityType: entityType || null,
    entityId: entityId || null,
    previousValue: previousValue ? JSON.stringify(previousValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
    isoClause: isoClause || null,
    userId: userId || null,
    userName: userName || null,
    ipAddress: ipAddress || null,
    timestamp: new Date().toISOString(),
    sessionId: sessionId || null,
  };

  db.prepare(`
    INSERT INTO audit_trail (id, action, entity_type, entity_id, previous_value, new_value, iso_clause, user_id, user_name, ip_address, timestamp, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.id, entry.action, entry.entityType, entry.entityId,
    entry.previousValue, entry.newValue, entry.isoClause,
    entry.userId, entry.userName, entry.ipAddress, entry.timestamp, entry.sessionId
  );

  return entry;
}

function auditMiddleware(action, entityType, isoClause) {
  return (req, res, next) => {
    const originalSend = res.json.bind(res);

    res.json = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          logAuditEntry({
            action: typeof action === 'function' ? action(req, body) : action,
            entityType,
            entityId: req.params.id || body?.id || null,
            previousValue: req._previousValue || null,
            newValue: body,
            isoClause,
            userId: req.user?.id,
            userName: req.user?.fullName || req.user?.username,
            ipAddress: req.ip,
          });
        } catch (err) {
          console.error('Audit logging error:', err);
        }
      }
      return originalSend(body);
    };

    next();
  };
}

function getAuditTrail(filters = {}) {
  const db = getDb();
  let query = 'SELECT * FROM audit_trail WHERE 1=1';
  const params = [];

  if (filters.entityType) {
    query += ' AND entity_type = ?';
    params.push(filters.entityType);
  }
  if (filters.entityId) {
    query += ' AND entity_id = ?';
    params.push(filters.entityId);
  }
  if (filters.userId) {
    query += ' AND user_id = ?';
    params.push(filters.userId);
  }
  if (filters.startDate) {
    query += ' AND timestamp >= ?';
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ' AND timestamp <= ?';
    params.push(filters.endDate);
  }

  query += ' ORDER BY timestamp DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  } else {
    query += ' LIMIT 1000';
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  return db.prepare(query).all(...params);
}

module.exports = { logAuditEntry, auditMiddleware, getAuditTrail };
