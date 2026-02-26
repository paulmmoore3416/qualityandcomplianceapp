# MedTech Compliance Suite — Backend Technical Architecture
## Professional Technical Reference Document
**Version:** 2.0.0  
**Date:** February 2026  
**Classification:** Internal Technical Documentation  
**Copyright:** © 2026 MedTech Compliance Solutions — A Moore Family Businesses LLC Subsidiary

---

## 1. Executive Summary

MedTech Compliance Suite employs a **polyglot persistence strategy** designed for onsite server deployments at medical device manufacturing and distribution facilities. Each location runs a self-contained compliance server that serves as both the Administrator platform and the Developer platform.

The architecture separates concerns across three data access tiers:

| Tier | Role | Current Implementation | Upgrade Path |
|------|------|----------------------|--------------|
| **Relational / OLTP** | User data, compliance records, audit trail | SQLite (WAL mode) | PostgreSQL via `pgx` |
| **Log Analytics / Time-Series** | System logs, error streams, events | SQLite `system_logs` table | Elasticsearch, ClickHouse |
| **Object / File Storage** | Generated reports, document files | Local filesystem + DB metadata | MinIO, AWS S3, Cloudflare R2 |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   ONSITE SERVER (per facility)           │
│                                                         │
│  ┌──────────────┐    ┌────────────────────────────────┐ │
│  │  React 18    │    │   Express.js Backend (Node.js)  │ │
│  │  Frontend    │◄──►│   Port 3001                     │ │
│  │  Port 5173   │    │                                 │ │
│  └──────────────┘    │  ┌─────────────────────────┐   │ │
│                       │  │   SQLite WAL Database    │   │ │
│  ┌──────────────┐    │  │   compliance.db          │   │ │
│  │  Zustand     │    │  │   - 18 dedicated tables  │   │ │
│  │  State Mgmt  │    │  │   - Full indexes          │   │ │
│  └──────────────┘    │  │   - ACID compliant        │   │ │
│                       │  └─────────────────────────┘   │ │
│                       │                                 │ │
│                       │  ┌─────────────────────────┐   │ │
│                       │  │   Local File Storage     │   │ │
│                       │  │   server/data/reports/   │   │ │
│                       │  └─────────────────────────┘   │ │
│                       └────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              System Cockpit (Admin/Dev)          │   │
│  │  - Server monitoring   - Multi-site management  │   │
│  │  - Session management  - User administration    │   │
│  │  - Database statistics - System logs viewer     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Backend API Services

### Base URL
```
http://localhost:3001/api
```

### 3.1 Authentication Service
**Route prefix:** `/api/auth`  
**File:** `server/routes/auth.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Authenticate user, issue JWT token | No |
| POST | `/auth/logout` | Invalidate session token | Yes |
| GET | `/auth/me` | Get current user profile | Yes |
| POST | `/auth/change-password` | Change authenticated user password | Yes |
| GET | `/auth/users` | List all users (Admin only) | Yes/Admin |

**Security Features:**
- JWT tokens with 8-hour expiry
- bcrypt password hashing (cost factor 10)
- Account lockout after 5 failed attempts (15-minute lockout)
- Session tracking with IP and User-Agent logging
- Rate limiting: 20 requests per 15 minutes on login endpoint

**Credentials (Default Seeded Users):**

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin123` | Admin | Full system + Developer features |
| `tjbest` | `tjbest2026` | Admin | Full system (no developer features) |
| `qa_manager` | `qa123` | QA Manager | Quality module management |
| `engineer` | `eng123` | Engineer | Engineering modules (view/edit) |
| `demo` | `demo123` | Demo | All modules (view/edit, no admin) |

---

### 3.2 Compliance Data Service (Generic/Legacy)
**Route prefix:** `/api/compliance`  
**File:** `server/routes/compliance.js`

Generic CRUD against the `compliance_data` table. Used for backward compatibility and frontend Zustand store sync.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compliance/:module` | List records for a module (paginated) |
| GET | `/compliance/:module/:id` | Get single record |
| POST | `/compliance/:module` | Create new record |
| PUT | `/compliance/:module/:id` | Update record |
| DELETE | `/compliance/:module/:id` | Delete record (Admin only) |
| POST | `/compliance/bulk/:module` | Bulk upsert (frontend sync) |

**Supported Modules:** `metrics`, `risks`, `capas`, `ncrs`, `validationReports`, `suppliers`, `training`, `changeControls`, `complaints`, `documents`, `alerts`, `lifecycle`, `lots`, `moduleLinks`

---

### 3.3 Dedicated Module Service (Typed Tables)
**Route prefix:** `/api/modules`  
**File:** `server/routes/modules.js`

Typed CRUD against dedicated SQLite tables. Provides better query performance, proper indexing, and type-safe data access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/modules/:module` | List typed records (paginated, filterable) |
| GET | `/modules/:module/:id` | Get single typed record |
| POST | `/modules/:module` | Create typed record |
| PUT | `/modules/:module/:id` | Update typed record |
| DELETE | `/modules/:module/:id` | Delete record (permission-gated) |
| POST | `/modules/bulk/:module` | Bulk upsert with ON CONFLICT |

**Module → Table Mapping:**

| Module Key | DB Table | View Permission | Edit Permission |
|------------|----------|-----------------|-----------------|
| `capas` | `capas` | `view_capa` | `edit_capa` |
| `ncrs` | `ncrs` | `view_ncr` | `edit_ncr` |
| `risks` | `risk_assessments` | `view_risk` | `edit_risk` |
| `suppliers` | `suppliers` | `view_suppliers` | `edit_suppliers` |
| `training` | `training_records` | `view_training` | `edit_training` |
| `changeControls` | `change_controls` | `view_change_control` | `edit_change_control` |
| `complaints` | `complaints` | `view_vigilance` | `edit_vigilance` |
| `adverseEvents` | `adverse_events` | `view_vigilance` | `edit_vigilance` |
| `documents` | `documents` | `view_documents` | `edit_documents` |
| `validationReports` | `validation_reports` | `view_validation` | `edit_validation` |
| `lifecycle` | `lifecycle_records` | `view_dashboard` | `edit_metrics` |
| `reports` | `reports` | `view_dashboard` | `edit_metrics` |
| `metricValues` | `metric_values` | `view_metrics` | `edit_metrics` |

---

### 3.4 System Administration Service
**Route prefix:** `/api/system`  
**File:** `server/routes/system.js`  
**Access:** Admin and Developer roles only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/system/info` | Real-time server hardware & network info |
| GET | `/system/metrics` | CPU, memory, request metrics with history |
| GET | `/system/db-stats` | Database table counts and file size |
| GET | `/system/sites` | List all registered sites |
| POST | `/system/sites` | Register new remote site |
| PUT | `/system/sites/:id` | Update site record |
| DELETE | `/system/sites/:id` | Remove site (non-primary only) |
| POST | `/system/sites/:id/heartbeat` | Update site last-seen timestamp |
| GET | `/system/logs` | Query system event logs |
| POST | `/system/logs` | Write log entry from frontend |
| GET | `/system/users` | Full user list with permissions |
| POST | `/system/users` | Create new user |
| PUT | `/system/users/:id` | Update user |
| DELETE | `/system/users/:id` | Delete user |
| GET | `/system/sessions` | Active session list |
| POST | `/system/sessions/:id/revoke` | Force-terminate a session |

**`GET /api/system/info` Response Shape:**
```json
{
  "server": { "hostname": "...", "platform": "linux", "appVersion": "2.0.0" },
  "network": { "primaryIp": "192.168.1.100", "interfaces": [...] },
  "cpu": { "cores": 8, "loadPercent": "14.2", "loadAvg": [1.14, 0.98, 0.87] },
  "memory": { "totalMB": 16384, "usedMB": 8192, "percentUsed": "50.0" },
  "process": { "pid": 1234, "uptimeFormatted": "2h 14m", "requestCount": 3821 }
}
```

---

### 3.5 Audit Trail Service
**Route prefix:** `/api/audit`  
**File:** `server/routes/audit.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit` | Paginated audit trail with filters |
| GET | `/audit/stats` | Aggregate statistics |
| GET | `/audit/entity/:type/:id` | Audit history for specific entity |

**21 CFR Part 11 Compliance:** All create, update, and delete operations are automatically logged with user ID, timestamp, IP address, previous and new values, and applicable ISO clause reference.

---

### 3.6 Export Service
**Route prefix:** `/api/export`  
**File:** `server/routes/export.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/data` | Export all module data (JSON or CSV) |
| GET | `/export/audit` | Export audit trail (JSON or CSV) |
| GET | `/export/report` | Generate compliance summary report |

---

### 3.7 Health Check Service
**Route prefix:** `/api/health`  
**File:** `server/routes/health.js`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Public health check (status, uptime, version) | No |
| GET | `/health/detailed` | Full system + database statistics | No |

---

## 4. Database Schema

### 4.1 Core Tables

#### `users`
Stores all system user accounts, credentials, roles, and permissions.
- Primary auth table for JWT issuance
- bcrypt-hashed passwords
- Role-based access control with granular permissions array

#### `sessions`
Active JWT session tracking. Foreign key to `users`.
- 8-hour expiry window
- IP address + User-Agent recorded per session
- Supports concurrent session detection

#### `audit_trail`
Immutable append-only log for all 21 CFR Part 11 and ISO 13485 compliance events.
- Indexed on `timestamp`, `entity_type/entity_id`, `user_id`
- Stores previous and new values as JSON text

### 4.2 Compliance Module Tables

| Table | Records | Description |
|-------|---------|-------------|
| `capas` | CAPA records | Corrective and Preventive Actions per ISO 13485 §8.5 |
| `ncrs` | NCR records | Nonconformance Reports per ISO 13485 §8.7 |
| `risk_assessments` | Risk records | Hazard analysis per ISO 14971 |
| `suppliers` | Supplier records | Supplier qualification and audit tracking |
| `training_records` | Training records | Employee competency per ISO 13485 §6.2 |
| `change_controls` | Change records | Design/process changes per 21 CFR Part 11 |
| `complaints` | Complaint records | Post-market complaint handling |
| `adverse_events` | Adverse events | MDR/EU MIR adverse event reporting |
| `documents` | Document metadata | Controlled document metadata per ISO 13485 §4.2 |
| `validation_reports` | Validation reports | EVT/DVT/PVT/DVP&R reports per IEC 62304 |
| `lifecycle_records` | Lifecycle phases | Product lifecycle management |
| `metric_values` | Quality metrics | KPI data points and trend data |

### 4.3 System Infrastructure Tables

| Table | Purpose |
|-------|---------|
| `reports` | Generated report metadata + file storage paths |
| `system_logs` | Event log stream (error/info/warning/debug) |
| `sites` | Multi-site installation registry with server info |
| `system_metrics` | Time-series performance snapshots per site |
| `compliance_data` | Legacy generic key-value store (backward compat) |

---

## 5. Multi-Site Architecture

MedTech Compliance Suite is designed for **onsite server deployment** at each facility. Each installation is independent and self-contained.

### Site Registry
Each site records:
- Site name, code, city/state/country
- IP address and server hostname
- Server version and OS info
- CPU/memory specifications
- Primary contact information
- Status and last heartbeat timestamp

### Primary Site
The first server is automatically designated as the **Primary Site** (`is_primary = 1`). The primary site:
- Serves as the Administrator and Developer platform
- Hosts the System Cockpit dashboard
- Cannot be deleted from the site registry

### Cockpit Dashboard
The System Cockpit (`/system` view) provides:
- Real-time server resource monitoring (CPU, RAM, network)
- Network interface and IP address display
- Database table statistics and file size
- Active user session management
- Multi-site registration and monitoring
- System event log viewer

**Access:** Admin and Developer roles only

---

## 6. Security Architecture

### Authentication Flow
```
Client → POST /api/auth/login → bcrypt verify → JWT sign → Session created → Token returned
Client → GET /api/* (with Bearer token) → JWT verify → Permission check → Response
```

### JWT Configuration
- Algorithm: HS256
- Expiry: 8 hours
- Secret: `JWT_SECRET` environment variable (required in production)

### Rate Limiting
| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| All API routes | 500 requests | 15 minutes |
| `/api/auth/login` | 20 requests | 15 minutes |

### Security Headers
Helmet.js configured with:
- XSS protection
- Clickjacking prevention
- MIME type sniffing prevention
- HSTS (in production)

### Account Security
- 5 failed login attempts → 15-minute account lock
- bcrypt cost factor 10 for all password hashes
- Session invalidation on logout
- Admin-only session revocation via cockpit

---

## 7. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server
API_PORT=3001
NODE_ENV=development
JWT_SECRET=your-secure-random-secret-minimum-32-chars

# Database
DB_PATH=./server/data/compliance.db

# CORS
CORS_ORIGIN=http://localhost:5173

# Seeded User Passwords (override defaults)
SEED_ADMIN_PASSWORD=admin123
SEED_QA_PASSWORD=qa123
SEED_ENGINEER_PASSWORD=eng123
SEED_DEMO_PASSWORD=demo123
SEED_TJBEST_PASSWORD=tjbest2026
```

---

## 8. Running the Application

### Development (Full Stack)
```bash
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

### Backend Only
```bash
npm run server
```

### Production Build
```bash
npm run build
NODE_ENV=production npm run server
# Serves frontend at http://localhost:3001
```

---

## 9. Polyglot Persistence Upgrade Path

The current SQLite implementation is production-ready for single-site deployments. For enterprise scale:

### Tier 1: User & Compliance Data → PostgreSQL
```bash
# Replace better-sqlite3 with pg/pgx
# Migrate schema via pg-migrate
# Benefits: Multi-server, read replicas, JSONB indexes
```

### Tier 2: System Logs → Elasticsearch or ClickHouse
```bash
# Stream from system_logs table to Elasticsearch index
# Benefits: Full-text search, log correlation, dashboards (Kibana)
# Alternative: ClickHouse for extreme compression and speed
```

### Tier 3: Report Files → Object Storage
```bash
# Replace local filesystem with MinIO (self-hosted S3-compatible)
# or AWS S3 / Cloudflare R2
# DB stores: bucket, key, URL, size, checksum
# Benefits: Unlimited scale, CDN delivery, lifecycle policies
```

---

## 10. File Structure

```
server/
├── index.js                  # Express app entry point
├── db/
│   └── schema.js             # SQLite schema, migrations, seed data
├── middleware/
│   ├── auth.js               # JWT verification, permission helpers
│   ├── audit.js              # Audit trail logging
│   └── validation.js         # Request validation middleware
└── routes/
    ├── auth.js               # Authentication (login, logout, users)
    ├── compliance.js         # Generic module CRUD (legacy)
    ├── modules.js            # Typed module CRUD (all dedicated tables)
    ├── system.js             # System cockpit, sites, monitoring
    ├── audit.js              # Audit trail queries
    ├── export.js             # Data export
    └── health.js             # Health check endpoints

src/
├── services/
│   └── api.ts                # Typed API client (all endpoints)
├── stores/
│   ├── auth-store.ts         # Authentication state + JWT
│   └── app-store.ts          # Application data + sync
└── components/views/
    └── SystemView.tsx         # System Cockpit UI
```

---

## 11. Compliance Standards Reference

| Standard | Scope | Backend Implementation |
|----------|-------|----------------------|
| ISO 13485:2016 | QMS record control | Audit trail on all CRUD, document versioning |
| ISO 14971 | Risk management | `risk_assessments` table, hazard-to-harm traceability |
| 21 CFR Part 11 | Electronic records | JWT auth, bcrypt, audit trail, session management |
| 21 CFR Part 820 | Quality system regulation | CAPA, NCR, document control modules |
| EU MDR 2017/745 | Medical device regulation | Vigilance, adverse events, EUDAMED reporting |
| IEC 62304 | Software lifecycle | Validation reports, change control |
| ISO 9001 | Quality management | CAPA, NCR, supplier qualification |

---

*Document maintained by MedTech Compliance Solutions — A Moore Family Businesses LLC Subsidiary*  
*© 2026 All Rights Reserved*
