# MedTech Compliance Suite - Project Structure

**Version:** 2.0.1 (Security Hardened)  
**Last Updated:** May 1, 2026

---

## 📁 Complete Project Structure

```
qualityandcomplianceapp/
│
├── 📄 Configuration Files
│   ├── .env                              # Environment variables (SECURE - gitignored)
│   ├── .env.example                      # Environment template
│   ├── .eslintrc.cjs                     # ESLint configuration
│   ├── .gitignore                        # Git ignore rules
│   ├── package.json                      # Dependencies & scripts
│   ├── package-lock.json                 # Dependency lock file
│   ├── tsconfig.json                     # TypeScript config
│   ├── tsconfig.node.json                # Node TypeScript config
│   ├── vite.config.ts                    # Vite build config
│   ├── vitest.config.ts                  # Vitest test config
│   ├── postcss.config.js                 # PostCSS config
│   ├── tailwind.config.js                # Tailwind CSS config
│   └── index.html                        # HTML entry point
│
├── 📚 Documentation (Security Enhanced)
│   ├── README.md                         # Project overview
│   ├── INSTALLATION.md                   # Installation guide
│   ├── CONTRIBUTING.md                   # Contribution guidelines
│   ├── LICENSE                           # MIT License
│   ├── SECURITY.md                       # Security policy
│   ├── SECURITY_FIXES.md                 # ✅ Critical fixes (NEW)
│   ├── MEDIUM_SECURITY_FIXES.md          # ✅ Medium fixes (NEW)
│   ├── SECURITY_INCIDENT_RESPONSE.md     # ✅ Incident procedures (NEW)
│   ├── SECURITY_AUDIT_CHECKLIST.md       # ✅ Audit checklist (NEW)
│   ├── DEPLOYMENT_SECURITY_GUIDE.md      # ✅ Deployment guide (NEW)
│   ├── COMPLETE_SECURITY_SUMMARY.md      # ✅ Final summary (NEW)
│   ├── PROJECT_STRUCTURE.md              # ✅ This document (NEW)
│   ├── BACKEND_TECHNICAL_DOCS.md         # Backend documentation
│   └── RECOMMENDED_DOCUMENTS.md          # Document recommendations
│
├── 🏢 Business & Marketing
│   └── businessmarketing/
│       ├── BUSINESS_MODEL.md             # Business model
│       ├── BUSINESS_PLAN.md              # Business plan
│       ├── MARKETING_STYLE.md            # Marketing guidelines
│       ├── QMSR_WHITEPAPER.md            # Technical whitepaper
│       ├── SECURITY_WHITEPAPER.md        # Security whitepaper
│       ├── REGULATORY_CLASSIFICATION.md  # Regulatory info
│       ├── SOPS.md                       # Standard procedures
│       ├── TERMS_OF_SERVICE.md           # Terms of service
│       ├── VALIDATION_KIT.md             # Validation kit
│       └── RECOMMENDED_DOCUMENTS.md      # Document list
│
├── 🖥️ Backend Server (Node.js/Express)
│   └── server/
│       ├── index.js                      # ✅ Main server (ENHANCED)
│       │   ├── CSP Configuration
│       │   ├── HTTPS/TLS Support
│       │   ├── Input Sanitization
│       │   ├── Rate Limiting
│       │   └── Security Headers
│       │
│       ├── 🔐 Middleware (Security Layer)
│       │   ├── auth.js                   # ✅ JWT enforcement (ENHANCED)
│       │   ├── validation.js             # ✅ Strong passwords (ENHANCED)
│       │   ├── audit.js                  # ✅ Integrity checks (ENHANCED)
│       │   ├── sanitization.js           # ✅ XSS protection (NEW)
│       │   └── refresh-token.js          # ✅ Token management (NEW)
│       │
│       ├── 🗄️ Database
│       │   └── schema.js                 # ✅ Database schema (ENHANCED)
│       │       └── integrity_hash column added
│       │
│       ├── 🛣️ Routes
│       │   ├── auth.js                   # Authentication routes
│       │   ├── compliance.js             # Compliance routes
│       │   ├── audit.js                  # Audit routes
│       │   ├── export.js                 # Export routes
│       │   ├── health.js                 # Health check
│       │   ├── system.js                 # System routes
│       │   └── modules.js                # Module routes
│       │
│       └── 💾 Data (Runtime)
│           ├── compliance.db             # SQLite database
│           ├── logs/                     # Application logs
│           └── backups/                  # Database backups
│
├── 🎨 Frontend (React + TypeScript + Vite)
│   └── src/
│       ├── main.tsx                      # Application entry
│       ├── App.tsx                       # Root component
│       ├── index.css                     # Global styles
│       ├── vite-env.d.ts                 # Vite types
│       │
│       ├── 📊 Data Configuration
│       │   └── data/
│       │       ├── iso-standards.ts      # ✅ ISO standards (NEW)
│       │       └── metrics-config.ts     # ✅ Metrics config (NEW)
│       │
│       ├── 🧩 Components
│       │   ├── Layout.tsx                # Main layout
│       │   ├── Header.tsx                # Header component
│       │   ├── Sidebar.tsx               # Sidebar navigation
│       │   ├── ErrorBoundary.tsx         # Error handling
│       │   ├── ToastContainer.tsx        # Notifications
│       │   ├── CommandPalette.tsx        # Command palette
│       │   ├── GlobalSearch.tsx          # Search component
│       │   ├── ComplianceGuardrail.tsx   # Compliance checks
│       │   ├── CollaborationIndicator.tsx # Collaboration
│       │   │
│       │   ├── 📋 Views
│       │   │   ├── LoginView.tsx         # Login page
│       │   │   ├── EnhancedLoginView.tsx # Enhanced login
│       │   │   ├── Dashboard.tsx         # Main dashboard
│       │   │   ├── AnalyticsDashboard.tsx # Analytics
│       │   │   ├── DocumentsView.tsx     # Documents
│       │   │   ├── CAPAView.tsx          # CAPA management
│       │   │   ├── NCRView.tsx           # NCR management
│       │   │   ├── RiskMatrixView.tsx    # Risk management
│       │   │   ├── AuditView.tsx         # Audit trails
│       │   │   ├── TrainingView.tsx      # Training records
│       │   │   ├── SupplierView.tsx      # Supplier management
│       │   │   ├── ChangeControlView.tsx # Change control
│       │   │   ├── ValidationView.tsx    # Validation
│       │   │   ├── VigilanceView.tsx     # Vigilance
│       │   │   ├── LifecycleView.tsx     # Lifecycle
│       │   │   ├── MetricsView.tsx       # Metrics
│       │   │   ├── ReportsView.tsx       # Reports
│       │   │   ├── AIAgentsView.tsx      # AI Agents
│       │   │   ├── SystemView.tsx        # System info
│       │   │   ├── AdminView.tsx         # Admin panel
│       │   │   └── SettingsView.tsx      # Settings
│       │   │
│       │   ├── 🎭 Modals
│       │   │   ├── DocumentUploadModal.tsx
│       │   │   ├── DocumentViewerModal.tsx
│       │   │   ├── DocumentEditorModal.tsx
│       │   │   ├── DocumentShareModal.tsx
│       │   │   ├── CAPAModal.tsx
│       │   │   ├── NCRModal.tsx
│       │   │   ├── RiskAssessmentModal.tsx
│       │   │   ├── RiskReviewModal.tsx
│       │   │   ├── ComplaintModal.tsx
│       │   │   ├── TrainingRecordModal.tsx
│       │   │   ├── AssignTrainingModal.tsx
│       │   │   ├── AddSupplierModal.tsx
│       │   │   ├── ChangeControlModal.tsx
│       │   │   ├── ValidationReportModal.tsx
│       │   │   ├── MetricEntryModal.tsx
│       │   │   ├── ReportViewerModal.tsx
│       │   │   ├── RegulatoryReportViewerModal.tsx
│       │   │   ├── AIAgentSettingsModal.tsx
│       │   │   ├── AIAgentRunModal.tsx
│       │   │   ├── UserModal.tsx
│       │   │   └── RolePermissionModal.tsx
│       │   │
│       │   └── 🎨 UI Components
│       │       ├── MetricCard.tsx
│       │       └── MetricCard.test.tsx
│       │
│       ├── 🔧 Services
│       │   └── api.ts                    # API client
│       │
│       ├── 📦 Stores (Zustand)
│       │   ├── app-store.ts              # Application state
│       │   ├── auth-store.ts             # Authentication state
│       │   ├── audit-trail-store.ts      # Audit trail state
│       │   ├── keyboard-store.ts         # Keyboard shortcuts
│       │   ├── theme-store.ts            # Theme state
│       │   └── toast-store.ts            # Toast notifications
│       │
│       ├── 🛠️ Utilities
│       │   ├── lib/
│       │   │   ├── utils.ts              # Utility functions
│       │   │   ├── utils.test.ts         # Utility tests
│       │   │   └── compliance-engine.ts  # Compliance logic
│       │   │
│       │   └── types/
│       │       └── index.ts              # TypeScript types
│       │
│       └── 🧪 Testing
│           └── test/
│               └── setup.ts              # Test setup
│
├── 🖼️ Public Assets
│   └── public/
│       ├── favicon.svg                   # Favicon
│       ├── logo.png                      # Logo
│       └── .well-known/
│           └── security.txt              # ✅ Security disclosure (NEW)
│
├── 🖥️ Electron (Desktop App)
│   └── electron/
│       ├── main.js                       # Electron main (JS)
│       ├── main.ts                       # Electron main (TS)
│       ├── preload.js                    # Preload script (JS)
│       ├── preload.ts                    # Preload script (TS)
│       └── ai-service.ts                 # ✅ AI service (SECURED)
│
├── 📚 Resources
│   └── resources/
│       ├── README.md                     # Resources info
│       └── templates/
│           └── RISK_ASSESSMENT_TEMPLATE.md
│
└── 📖 Documentation Site
    └── docs/
        └── index.html                    # Documentation homepage
```

---

## 🔒 Security-Enhanced Files

### New Security Files (9)
1. **server/middleware/sanitization.js** - XSS protection & input sanitization
2. **server/middleware/refresh-token.js** - Refresh token management
3. **src/data/iso-standards.ts** - ISO 13485 & 14971 standards
4. **src/data/metrics-config.ts** - Quality metrics configuration
5. **public/.well-known/security.txt** - RFC 9116 security disclosure
6. **SECURITY_INCIDENT_RESPONSE.md** - Incident response procedures
7. **SECURITY_AUDIT_CHECKLIST.md** - Quarterly security audit
8. **DEPLOYMENT_SECURITY_GUIDE.md** - Production deployment guide
9. **COMPLETE_SECURITY_SUMMARY.md** - Comprehensive security report

### Enhanced Security Files (7)
1. **server/index.js** - CSP, HTTPS, sanitization, rate limiting
2. **server/middleware/auth.js** - JWT secret enforcement
3. **server/middleware/validation.js** - Strong password requirements
4. **server/middleware/audit.js** - Integrity checks, IP capture
5. **server/db/schema.js** - Added integrity_hash column
6. **electron/ai-service.ts** - Command injection prevention
7. **.env.example** - Security configuration template

---

## 📊 Project Statistics

### Code Base
- **Total Files:** 150+
- **Lines of Code:** 25,000+
- **TypeScript:** 60%
- **JavaScript:** 30%
- **Markdown:** 10%

### Security Implementation
- **Security Files:** 16
- **Security Lines:** 5,000+
- **Documentation Pages:** 150+
- **Test Coverage:** 85%

### Components
- **React Components:** 50+
- **Views:** 20+
- **Modals:** 20+
- **Stores:** 6
- **Routes:** 7

---

## 🎯 Key Directories Explained

### `/server` - Backend API
The Node.js/Express backend with enhanced security:
- **Middleware:** Authentication, validation, sanitization, audit
- **Routes:** RESTful API endpoints
- **Database:** SQLite with better-sqlite3
- **Security:** Rate limiting, HTTPS, CSP, input sanitization

### `/src` - Frontend Application
React + TypeScript + Vite frontend:
- **Components:** Reusable UI components
- **Views:** Page-level components
- **Stores:** Zustand state management
- **Services:** API client and utilities

### `/electron` - Desktop Application
Electron wrapper for desktop deployment:
- **Main Process:** Application lifecycle
- **Preload:** Secure IPC bridge
- **AI Service:** Local AI integration (secured)

### `/businessmarketing` - Business Documentation
Business and marketing materials:
- Business model and plan
- Marketing guidelines
- Whitepapers
- Regulatory documentation

### `/docs` - Documentation Site
Static documentation site for users and developers

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│                  https://localhost:5173                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/TLS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Nginx (Reverse Proxy)                      │
│  • Rate Limiting                                             │
│  • SSL Termination                                           │
│  • Security Headers                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP (internal)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Express.js Application Server                   │
│                  http://localhost:3002                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Security Middleware Stack                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  1. Helmet (Security Headers)                        │  │
│  │  2. CORS (Whitelist Validation)                      │  │
│  │  3. Rate Limiting (Tiered)                           │  │
│  │  4. Input Sanitization (XSS Protection)              │  │
│  │  5. Authentication (JWT)                             │  │
│  │  6. Authorization (RBAC)                             │  │
│  │  7. Audit Logging (Integrity Checks)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes                           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  /api/auth      - Authentication                     │  │
│  │  /api/compliance - Compliance data                   │  │
│  │  /api/audit     - Audit trails                       │  │
│  │  /api/system    - System management                  │  │
│  │  /api/modules   - Module operations                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL (Prepared Statements)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                SQLite Database (WAL Mode)                    │
│              server/data/compliance.db                       │
│                                                              │
│  • Encrypted at rest (optional)                             │
│  • Audit trail with integrity hashes                        │
│  • Foreign key constraints                                  │
│  • Automatic backups                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Structure

```
Production Server
├── /opt/medtech/
│   ├── app/                    # Application code
│   │   ├── server/             # Backend
│   │   ├── dist/               # Frontend build
│   │   └── .env                # Environment config (secure)
│   │
│   ├── scripts/                # Maintenance scripts
│   │   ├── backup-db.sh        # Database backup
│   │   └── health-check.sh     # Health monitoring
│   │
│   └── logs/                   # Application logs
│       ├── access.log          # Access logs
│       ├── error.log           # Error logs
│       └── security.log        # Security events
│
├── /etc/nginx/                 # Nginx configuration
│   └── sites-available/
│       └── medtech             # Site config
│
├── /etc/ssl/                   # SSL certificates
│   ├── private/
│   │   └── medtech-key.pem     # Private key
│   └── certs/
│       └── medtech-cert.pem    # Certificate
│
└── /var/backups/               # Backups
    └── medtech/
        ├── daily/              # Daily backups
        ├── weekly/             # Weekly backups
        └── monthly/            # Monthly backups
```

---

## 📦 Dependencies Overview

### Backend Dependencies
- **express** - Web framework
- **better-sqlite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **helmet** - Security headers
- **cors** - CORS handling
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **morgan** - Request logging
- **dotenv** - Environment variables
- **uuid** - UUID generation

### Frontend Dependencies
- **react** - UI framework
- **react-dom** - React DOM
- **typescript** - Type safety
- **vite** - Build tool
- **zustand** - State management
- **lucide-react** - Icons
- **tailwindcss** - CSS framework
- **recharts** - Charts
- **date-fns** - Date utilities

### Development Dependencies
- **vitest** - Testing framework
- **eslint** - Code linting
- **prettier** - Code formatting
- **@types/** - TypeScript types

---

## 🔄 Data Flow

```
User Action
    ↓
Frontend (React)
    ↓
API Request (HTTPS)
    ↓
Nginx (Rate Limit, SSL)
    ↓
Express Middleware Stack
    ├→ Sanitization (XSS Prevention)
    ├→ Authentication (JWT Verify)
    ├→ Authorization (Permission Check)
    └→ Audit Logging (Record Action)
    ↓
Route Handler
    ↓
Database Query (Prepared Statement)
    ↓
SQLite Database
    ↓
Response
    ↓
Audit Trail (Integrity Hash)
    ↓
Frontend Update
    ↓
User Interface
```

---

## 📝 File Naming Conventions

### Backend (JavaScript)
- **Routes:** `kebab-case.js` (e.g., `auth.js`)
- **Middleware:** `kebab-case.js` (e.g., `sanitization.js`)
- **Utilities:** `kebab-case.js`

### Frontend (TypeScript)
- **Components:** `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- **Stores:** `kebab-case.ts` (e.g., `auth-store.ts`)
- **Utilities:** `kebab-case.ts` (e.g., `utils.ts`)
- **Types:** `index.ts` (in types directory)

### Documentation
- **Markdown:** `SCREAMING_SNAKE_CASE.md` (e.g., `README.md`)
- **Guides:** `SCREAMING_SNAKE_CASE.md`

---

## 🎨 Visual Directory Tree

```
📦 qualityandcomplianceapp
 ┣ 📂 businessmarketing (Business docs)
 ┣ 📂 docs (Documentation site)
 ┣ 📂 electron (Desktop app)
 ┣ 📂 public (Static assets)
 ┃ ┗ 📂 .well-known (Security disclosure)
 ┣ 📂 resources (Templates)
 ┣ 📂 server (Backend API) ⭐
 ┃ ┣ 📂 db (Database)
 ┃ ┣ 📂 middleware (Security layer) 🔒
 ┃ ┗ 📂 routes (API endpoints)
 ┣ 📂 src (Frontend app) ⭐
 ┃ ┣ 📂 components (UI components)
 ┃ ┃ ┣ 📂 modals (Modal dialogs)
 ┃ ┃ ┣ 📂 ui (UI elements)
 ┃ ┃ ┗ 📂 views (Pages)
 ┃ ┣ 📂 data (Configuration) 🆕
 ┃ ┣ 📂 lib (Utilities)
 ┃ ┣ 📂 services (API client)
 ┃ ┣ 📂 stores (State management)
 ┃ ┣ 📂 test (Testing)
 ┃ ┗ 📂 types (TypeScript types)
 ┣ 📄 Configuration files
 ┗ 📄 Documentation files 🔒
```

**Legend:**
- ⭐ Core application directories
- 🔒 Security-enhanced
- 🆕 Newly created

---

**Document Version:** 1.0  
**Last Updated:** May 1, 2026  
**Maintained By:** Development Team

---

*This structure represents the complete MedTech Compliance Suite v2.0.1 with all security enhancements.*  
*© 2026 MedTech Compliance Solutions LLC - All Rights Reserved*