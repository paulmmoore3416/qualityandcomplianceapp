require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initializeDatabase, closeDatabase } = require('./db/schema');

const app = express();
const PORT = process.env.API_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Security Middleware ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Managed by frontend
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Initialize Database ────────────────────────────────────────────
initializeDatabase();

// ─── Routes ─────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const complianceRoutes = require('./routes/compliance');
const auditRoutes = require('./routes/audit');
const exportRoutes = require('./routes/export');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/health', healthRoutes);

// ─── Serve Frontend in Production ────────────────────────────────────
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// ─── Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Start Server ───────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  const crypto = require('crypto');
  const jwtSecret = process.env.JWT_SECRET || 'change-me-in-production';
  const mkPass = (u) => process.env[`SEED_${u.toUpperCase()}_PASSWORD`]
    || crypto.createHmac('sha256', jwtSecret).update(u === 'qa_manager' ? 'qa_manager' : u).digest('hex').slice(0, 16);

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MedTech Compliance Suite - Backend API Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Environment : ${NODE_ENV}`);
  console.log(`  API Server  : http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  if (NODE_ENV !== 'production') {
    console.log('');
    console.log('  Seeded Accounts (set SEED_* env vars to override):');
    console.log(`    admin      / ${mkPass('admin')}`);
    console.log(`    qa_manager / ${mkPass('qa_manager')}`);
    console.log(`    engineer   / ${mkPass('engineer')}`);
    console.log(`    demo       / ${mkPass('demo')}`);
    console.log('');
    console.log('  ⚠  These are derived from JWT_SECRET. Set SEED_*');
    console.log('     env vars for predictable demo passwords.');
  }
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// ─── Graceful Shutdown ──────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('Server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
