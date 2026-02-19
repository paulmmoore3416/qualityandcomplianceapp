const jwt = require('jsonwebtoken');
const { getDb } = require('../db/schema');

const JWT_SECRET = process.env.JWT_SECRET || 'medtech-compliance-jwt-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token);
    const db = getDb();

    // Verify user still exists and is active
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND status = ?').get(decoded.userId, 'Active');
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Check if account is locked
    if (user.account_locked_until) {
      const lockTime = new Date(user.account_locked_until);
      if (lockTime > new Date()) {
        return res.status(423).json({ error: 'Account is locked', lockedUntil: user.account_locked_until });
      }
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      permissions: JSON.parse(user.permissions),
      department: user.department,
      title: user.title,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'Admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

module.exports = { generateToken, verifyToken, authenticate, authorize, JWT_SECRET };
