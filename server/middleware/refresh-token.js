const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');

/**
 * Refresh Token Management - Medium Security Enhancement
 * Implements refresh token mechanism for better session management
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate a refresh token
 */
function generateRefreshToken(userId) {
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return refreshToken;
}

/**
 * Store refresh token in database
 */
function storeRefreshToken(userId, refreshToken, ipAddress, userAgent) {
  const db = getDb();
  const sessionId = uuidv4();
  const now = new Date().toISOString();
  
  // Calculate expiry date
  const expiryMs = parseExpiry(REFRESH_TOKEN_EXPIRY);
  const expiresAt = new Date(Date.now() + expiryMs).toISOString();
  
  db.prepare(`
    INSERT INTO sessions (id, user_id, token, ip_address, user_agent, created_at, expires_at, last_activity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, userId, refreshToken, ipAddress, userAgent, now, expiresAt, now);
  
  return sessionId;
}

/**
 * Verify and decode refresh token
 */
function verifyRefreshToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    // Check if token exists in database and is not revoked
    const db = getDb();
    const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?')
      .get(refreshToken, new Date().toISOString());
    
    if (!session) {
      return null;
    }
    
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Revoke a refresh token
 */
function revokeRefreshToken(refreshToken) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(refreshToken);
}

/**
 * Revoke all refresh tokens for a user
 */
function revokeAllUserTokens(userId) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  return result.changes;
}

/**
 * Parse expiry string to milliseconds
 */
function parseExpiry(expiry) {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 8 * 60 * 60 * 1000; // Default 8 hours
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  return value * multipliers[unit];
}

/**
 * Middleware to handle token refresh
 */
function refreshTokenMiddleware(req, res, next) {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  const decoded = verifyRefreshToken(refreshToken);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
  
  // Get user from database
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND status = ?')
    .get(decoded.userId, 'Active');
  
  if (!user) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }
  
  // Generate new access token
  const { generateToken } = require('./auth');
  const newAccessToken = generateToken(user);
  
  // Update session last activity
  db.prepare('UPDATE sessions SET last_activity = ? WHERE token = ?')
    .run(new Date().toISOString(), refreshToken);
  
  res.json({
    token: newAccessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      permissions: JSON.parse(user.permissions),
      department: user.department,
      title: user.title,
    },
  });
}

module.exports = {
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  refreshTokenMiddleware,
};

// Made with Bob
