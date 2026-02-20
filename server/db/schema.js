const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'compliance.db');

// Generate a deterministic but non-guessable default from JWT_SECRET + username.
// This means if you run without SEED_* vars, each install gets unique passwords
// tied to its JWT_SECRET. Never hard-codes passwords in source code.
function generateSecureDefault(username) {
  const secret = process.env.JWT_SECRET || 'change-me-in-production';
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(username).digest('hex').slice(0, 16);
}

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Viewer',
      permissions TEXT NOT NULL DEFAULT '[]',
      department TEXT,
      title TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      last_login TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      password_last_changed TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      mfa_enabled INTEGER NOT NULL DEFAULT 0,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      account_locked_until TEXT
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_activity TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Audit trail table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_trail (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      previous_value TEXT,
      new_value TEXT,
      iso_clause TEXT,
      user_id TEXT,
      user_name TEXT,
      ip_address TEXT,
      timestamp TEXT NOT NULL,
      session_id TEXT
    )
  `);

  // Generic data store for compliance modules
  db.exec(`
    CREATE TABLE IF NOT EXISTS compliance_data (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by TEXT,
      updated_by TEXT
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
    CREATE INDEX IF NOT EXISTS idx_compliance_data_module ON compliance_data(module);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  // Seed default users if none exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    seedDefaultUsers(db);
  }

  console.log('Database initialized successfully');
  return db;
}

function seedDefaultUsers(db) {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO users (id, username, email, full_name, password_hash, role, permissions, department, title, status, created_at, updated_at, password_last_changed, must_change_password, mfa_enabled, failed_login_attempts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, 0, 0, 0)
  `);

  const users = [
    {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@medtech.com',
      fullName: 'System Administrator',
      password: process.env.SEED_ADMIN_PASSWORD || generateSecureDefault('admin'),
      role: 'Admin',
      permissions: JSON.stringify([
        'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
        'view_capa', 'edit_capa', 'approve_capa', 'view_ncr', 'edit_ncr',
        'view_documents', 'edit_documents', 'delete_documents', 'share_documents',
        'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
        'approve_suppliers', 'view_training', 'edit_training', 'verify_training',
        'view_change_control', 'edit_change_control', 'approve_change_control',
        'view_validation', 'edit_validation', 'approve_validation',
        'sign_electronically', 'view_audit_trail', 'manage_users', 'manage_roles',
        'system_settings', 'export_data', 'import_data'
      ]),
      department: 'IT & Quality Systems',
      title: 'Quality Systems Administrator',
    },
    {
      id: uuidv4(),
      username: 'qa_manager',
      email: 'qa.manager@medtech.com',
      fullName: 'Sarah Johnson',
      password: process.env.SEED_QA_PASSWORD || generateSecureDefault('qa_manager'),
      role: 'QA Manager',
      permissions: JSON.stringify([
        'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
        'view_capa', 'edit_capa', 'approve_capa', 'view_ncr', 'edit_ncr',
        'view_documents', 'edit_documents', 'share_documents',
        'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
        'view_training', 'edit_training', 'verify_training',
        'view_change_control', 'edit_change_control', 'approve_change_control',
        'view_validation', 'edit_validation', 'approve_validation',
        'sign_electronically', 'view_audit_trail', 'export_data'
      ]),
      department: 'Quality Assurance',
      title: 'QA Manager',
    },
    {
      id: uuidv4(),
      username: 'engineer',
      email: 'engineer@medtech.com',
      fullName: 'Michael Chen',
      password: process.env.SEED_ENGINEER_PASSWORD || generateSecureDefault('engineer'),
      role: 'Engineer',
      permissions: JSON.stringify([
        'view_dashboard', 'view_metrics', 'view_risk', 'view_capa', 'edit_capa',
        'view_ncr', 'edit_ncr', 'view_documents', 'edit_documents', 'share_documents',
        'view_vigilance', 'view_suppliers', 'view_training',
        'view_change_control', 'edit_change_control',
        'view_validation', 'edit_validation'
      ]),
      department: 'Engineering',
      title: 'Senior Design Engineer',
    },
    {
      id: uuidv4(),
      username: 'demo',
      email: 'demo@medtech.com',
      fullName: 'Demo User',
      password: process.env.SEED_DEMO_PASSWORD || generateSecureDefault('demo'),
      role: 'Demo',
      permissions: JSON.stringify([
        'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
        'view_capa', 'edit_capa', 'view_ncr', 'edit_ncr',
        'view_documents', 'edit_documents', 'share_documents',
        'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
        'view_training', 'edit_training',
        'view_change_control', 'edit_change_control',
        'view_validation', 'edit_validation',
        'sign_electronically', 'view_audit_trail', 'export_data'
      ]),
      department: 'Demonstration',
      title: 'Demo Account',
    },
  ];

  const insertTransaction = db.transaction(() => {
    for (const user of users) {
      const hash = bcrypt.hashSync(user.password, 10);
      insert.run(
        user.id, user.username, user.email, user.fullName, hash,
        user.role, user.permissions, user.department, user.title,
        now, now, now
      );
    }
  });

  insertTransaction();
  console.log('Default users seeded. Check your .env file for SEED_* passwords, or see the startup banner.');
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, initializeDatabase, closeDatabase };
