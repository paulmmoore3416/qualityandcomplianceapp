require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { initializeDatabase, closeDatabase } = require('./db/schema');
const { sanitizeAll } = require('./middleware/sanitization');

const app = express();
const PORT = process.env.API_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Security Middleware ─────────────────────────────────────────────
// Content Security Policy - Medium Security Enhancement
const cspConfig = NODE_ENV === 'production' ? {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for React dev
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
} : false;

app.use(helmet({
  contentSecurityPolicy: cspConfig,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
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

const systemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit system/admin endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many system requests, please try again later' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/system', systemLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Input Sanitization ──────────────────────────────────────────────
// Medium Security Enhancement: XSS Protection
app.use(sanitizeAll);

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
const systemRoutes = require('./routes/system');
const modulesRoutes = require('./routes/modules');

app.use('/api/auth', authRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/modules', modulesRoutes);

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

// ─── HTTPS/TLS Support ──────────────────────────────────────────────
// Medium Security Enhancement: HTTPS Configuration
let server;
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;

if (ENABLE_HTTPS && SSL_KEY_PATH && SSL_CERT_PATH) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };
    
    // Start HTTPS server
    server = https.createServer(httpsOptions, app);
    server.listen(HTTPS_PORT, () => {
      logServerStart(HTTPS_PORT, 'https');
    });
    
    // Redirect HTTP to HTTPS in production
    if (NODE_ENV === 'production') {
      const httpApp = express();
      httpApp.use((req, res) => {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
      });
      httpApp.listen(PORT, () => {
        console.log(`  HTTP→HTTPS  : Redirecting port ${PORT} to ${HTTPS_PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to start HTTPS server:', err.message);
    console.log('Falling back to HTTP...');
    server = http.createServer(app);
    server.listen(PORT, () => {
      logServerStart(PORT, 'http');
    });
  }
} else {
  // Start HTTP server
  server = http.createServer(app);
  server.listen(PORT, () => {
    logServerStart(PORT, 'http');
  });
}

function logServerStart(port, protocol) {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  for (const iface of Object.values(networkInterfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) { localIp = alias.address; break; }
    }
    if (localIp !== '127.0.0.1') break;
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MedTech Compliance Solutions — A Moore Family Businesses LLC');
  console.log('  Subsidiary — Backend API Server v2.0.1');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Environment : ${NODE_ENV}`);
  console.log(`  Protocol    : ${protocol.toUpperCase()}${ENABLE_HTTPS ? ' ✓ Secure' : ''}`);
  console.log(`  Hostname    : ${os.hostname()}`);
  console.log(`  IP Address  : ${localIp}`);
  console.log(`  API Server  : ${protocol}://localhost:${port}`);
  console.log(`  Health Check: ${protocol}://localhost:${port}/api/health`);
  console.log(`  System Info : ${protocol}://localhost:${port}/api/system/info  [Admin]`);
  console.log('');
  console.log('  Security Features:');
  console.log(`    ✓ Content Security Policy (CSP)`);
  console.log(`    ✓ XSS Protection & Input Sanitization`);
  console.log(`    ✓ Rate Limiting`);
  console.log(`    ✓ Helmet Security Headers`);
  console.log(`    ✓ Strong Password Requirements`);
  console.log(`    ✓ JWT Secret Enforcement`);
  if (NODE_ENV !== 'production') {
    console.log('');
    console.log('  Demo Accounts:');
    console.log(`    admin      / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123!@#$'}`);
    console.log(`    tjbest     / ${process.env.SEED_TJBEST_PASSWORD || 'TjBest2026!@'}  (Tracy Best)`);
    console.log(`    qa_manager / ${process.env.SEED_QA_PASSWORD || 'QaManager123!'}`);
    console.log(`    engineer   / ${process.env.SEED_ENGINEER_PASSWORD || 'Engineer123!'}`);
    console.log(`    demo       / ${process.env.SEED_DEMO_PASSWORD || 'DemoUser123!'}`);
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
}

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
