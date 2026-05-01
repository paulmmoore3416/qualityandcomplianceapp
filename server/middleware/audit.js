const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { getDb } = require('../db/schema');

/**
 * Calculate integrity hash for audit entry
 * Medium Security Enhancement: Audit trail integrity protection
 */
function calculateIntegrityHash(entry, previousHash = '') {
  const data = [
    entry.id,
    entry.action,
    entry.entityType || '',
    entry.entityId || '',
    entry.previousValue || '',
    entry.newValue || '',
    entry.userId || '',
    entry.timestamp,
    previousHash,
  ].join('|');
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get the last audit entry hash for chain integrity
 */
function getLastAuditHash() {
  const db = getDb();
  try {
    const lastEntry = db.prepare('SELECT integrity_hash FROM audit_trail ORDER BY timestamp DESC LIMIT 1').get();
    return lastEntry?.integrity_hash || '';
  } catch {
    return '';
  }
}

/**
 * Extract real IP address from request
 * Medium Security Enhancement: Better IP capture
 */
function extractIpAddress(req) {
  // Check for proxy headers (in order of preference)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection remote address
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function logAuditEntry({ action, entityType, entityId, previousValue, newValue, isoClause, userId, userName, ipAddress, sessionId, req }) {
  const db = getDb();
  
  // Use enhanced IP extraction if request object is provided
  const finalIpAddress = req ? extractIpAddress(req) : (ipAddress || null);
  
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
    ipAddress: finalIpAddress,
    timestamp: new Date().toISOString(),
    sessionId: sessionId || null,
  };

  // Calculate integrity hash
  const previousHash = getLastAuditHash();
  entry.integrityHash = calculateIntegrityHash(entry, previousHash);

  db.prepare(`
    INSERT INTO audit_trail (id, action, entity_type, entity_id, previous_value, new_value, iso_clause, user_id, user_name, ip_address, timestamp, session_id, integrity_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.id, entry.action, entry.entityType, entry.entityId,
    entry.previousValue, entry.newValue, entry.isoClause,
    entry.userId, entry.userName, entry.ipAddress, entry.timestamp, entry.sessionId,
    entry.integrityHash
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
            req, // Pass request object for enhanced IP extraction
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

/**
 * Verify audit trail integrity
 * Medium Security Enhancement: Detect tampering
 */
function verifyAuditIntegrity(startDate, endDate) {
  const db = getDb();
  let query = 'SELECT * FROM audit_trail WHERE 1=1';
  const params = [];

  if (startDate) {
    query += ' AND timestamp >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND timestamp <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY timestamp ASC';

  const entries = db.prepare(query).all(...params);
  
  let previousHash = '';
  const results = {
    total: entries.length,
    verified: 0,
    tampered: 0,
    tamperedEntries: [],
  };

  for (const entry of entries) {
    const expectedHash = calculateIntegrityHash(entry, previousHash);
    
    if (entry.integrity_hash === expectedHash) {
      results.verified++;
    } else {
      results.tampered++;
      results.tamperedEntries.push({
        id: entry.id,
        timestamp: entry.timestamp,
        action: entry.action,
        expectedHash,
        actualHash: entry.integrity_hash,
      });
    }
    
    previousHash = entry.integrity_hash;
  }

  return results;
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

module.exports = { logAuditEntry, auditMiddleware, getAuditTrail, verifyAuditIntegrity, extractIpAddress };
