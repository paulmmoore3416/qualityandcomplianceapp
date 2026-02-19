const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');
const { generateToken, authenticate } = require('../middleware/auth');
const { logAuditEntry } = require('../middleware/audit');
const { loginValidation } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      logAuditEntry({
        action: 'Login failed - user not found',
        entityType: 'auth',
        userId: null,
        userName: username,
        ipAddress: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.account_locked_until) {
      const lockTime = new Date(user.account_locked_until);
      if (lockTime > new Date()) {
        return res.status(423).json({ error: 'Account is locked', lockedUntil: user.account_locked_until });
      }
      // Lock expired, reset
      db.prepare('UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE id = ?').run(user.id);
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      const attempts = user.failed_login_attempts + 1;
      const updates = { failed_login_attempts: attempts };

      // Lock after 5 failed attempts for 15 minutes
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        db.prepare('UPDATE users SET failed_login_attempts = ?, account_locked_until = ? WHERE id = ?')
          .run(attempts, lockUntil, user.id);
      } else {
        db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?')
          .run(attempts, user.id);
      }

      logAuditEntry({
        action: `Login failed - invalid password (attempt ${attempts})`,
        entityType: 'auth',
        userId: user.id,
        userName: username,
        ipAddress: req.ip,
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login - reset failed attempts and update last login
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET failed_login_attempts = 0, last_login = ?, account_locked_until = NULL WHERE id = ?')
      .run(now, user.id);

    const token = generateToken(user);

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO sessions (id, user_id, token, ip_address, user_agent, created_at, expires_at, last_activity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, user.id, token, req.ip, req.headers['user-agent'] || '', now, expiresAt, now);

    logAuditEntry({
      action: 'User logged in',
      entityType: 'auth',
      userId: user.id,
      userName: user.full_name,
      ipAddress: req.ip,
      sessionId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        permissions: JSON.parse(user.permissions),
        department: user.department,
        title: user.title,
        status: user.status,
        lastLogin: now,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        passwordLastChanged: user.password_last_changed,
        mustChangePassword: !!user.must_change_password,
        mfaEnabled: !!user.mfa_enabled,
        failedLoginAttempts: 0,
      },
      session: {
        id: sessionId,
        userId: user.id,
        token,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        createdAt: now,
        expiresAt,
        lastActivity: now,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  const db = getDb();
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);

  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  logAuditEntry({
    action: 'User logged out',
    entityType: 'auth',
    userId: req.user.id,
    userName: req.user.fullName || req.user.username,
    ipAddress: req.ip,
  });

  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDb();

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET password_hash = ?, password_last_changed = ?, must_change_password = 0, updated_at = ? WHERE id = ?')
    .run(newHash, now, now, user.id);

  logAuditEntry({
    action: 'Password changed',
    entityType: 'auth',
    userId: user.id,
    userName: user.full_name,
    ipAddress: req.ip,
    isoClause: '21 CFR Part 11.10(d)',
  });

  res.json({ message: 'Password changed successfully' });
});

// GET /api/auth/users (admin only)
router.get('/users', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = getDb();
  const users = db.prepare('SELECT id, username, email, full_name, role, permissions, department, title, status, last_login, created_at, updated_at, mfa_enabled, failed_login_attempts FROM users').all();

  res.json({
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      permissions: JSON.parse(u.permissions),
      department: u.department,
      title: u.title,
      status: u.status,
      lastLogin: u.last_login,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      mfaEnabled: !!u.mfa_enabled,
      failedLoginAttempts: u.failed_login_attempts,
    })),
  });
});

module.exports = router;
