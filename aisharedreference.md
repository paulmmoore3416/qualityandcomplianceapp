# AI Shared Reference — MedTech Compliance Suite

**Purpose:** Central reference for AI agent infrastructure, setup steps, integration points, current status, and next actions. Keep this file updated whenever backend/agent changes are made.

**Last Updated**: February 1, 2026
**Version**: 2.1

---

## 1) Current Status ✅

### CRM Deployment (NEW - Feb 1, 2026)
- **Docker Deployment**: SuiteCRM containerized with MySQL 8.0
- **Credentials**: Stored securely in local vault (see private setup guide)
- **Status**: Installation infrastructure ready, waiting for full database schema completion

### Authentication & Security (NEW)
- **Enhanced Login System**: Implemented modern, transparent login UI with glass-morphism effects and animations
- **SSO Integration**: Google, GitHub, and Microsoft OAuth 2.0 support (demo mode, production-ready framework)
- **Demo User Account**: Added dedicated demo user with full feature access (excluding admin/system settings)
- **Role-Based Access Control**: Implemented granular permissions and role-based navigation filtering
- **Admin Panel Protection**: Admin panel now only visible and accessible to users with Admin role
- **Password Security**: Integrated bcryptjs for secure password hashing
- **Session Management**: Implemented secure session handling with automatic expiration

### Application Features
- Local LLM host integration implemented (Ollama CLI wrappers in `electron/ai-service.ts`)
- Main process exposes IPC handlers to list models and run prompts. Preload exposes a safe bridge for renderer use (`electron/preload.ts`)
- Frontend management UI created: `src/components/views/AIAgentsView.tsx` and supporting modals (`AIAgentSettingsModal.tsx`, `AIAgentRunModal.tsx`)
- Documents section: all action handlers added and modals implemented for viewing, editing, sharing, and uploading documents (`src/components/views/DocumentsView.tsx`, `src/components/modals/DocumentViewerModal.tsx`, `DocumentEditorModal.tsx`, `DocumentShareModal.tsx`, `DocumentUploadModal.tsx`)

### Documentation & Repository (NEW)
- **Comprehensive README**: Professional GitHub README with badges, metrics, feature tables, and architecture diagrams
- **Security Policy**: Complete SECURITY.md with vulnerability reporting procedures and security best practices
- **Installation Guide**: Detailed INSTALLATION.md for Windows, macOS, and Linux
- **Contributing Guidelines**: Full CONTRIBUTING.md with code standards, PR process, and testing requirements
- **License**: MIT License with medical device disclaimer
- **Enhanced .gitignore**: Comprehensive exclusions for secrets, credentials, and sensitive data

### Business & Marketing (NEW)
- **Business Marketing Folder**: Created `/businessmarketing` directory with all business documents:
  - BUSINESS_MODEL.md
  - BUSINESS_PLAN.md
  - MARKETING_STYLE.md
  - RECOMMENDED_DOCUMENTS.md
  - SOPS.md

### Resources & Compliance (NEW)
- **Resources Directory**: Created `/resources` with compliance documentation structure:
  - `/standards` - ISO standard references and summaries
  - `/fda` - FDA regulation guidance
  - `/eu` - EU MDR/IVDR guidance
  - `/templates` - Quality system templates
- **Resource README**: Comprehensive guide to obtaining official standards and regulations
- **Templates**: Risk Assessment template (ISO 14971) and other QMS templates

---

## 2) Setup & Run (developer) 🔧

### Prerequisites
1. **Node.js 18+** - Project uses Vite/TypeScript/Electron
2. **Ollama (optional)** - For local LLM features
   - Download: https://ollama.ai/
   - Verify: `ollama --version`
   - Test: `ollama run llama2`
3. **bcryptjs** - For password hashing (auto-installed with npm install)

### Quick Start
```bash
# Clone repository
git clone https://github.com/paulmmoore3416/qualityandcomplianceapp.git
cd qualityandcomplianceapp

# Install dependencies
npm install

# Start development server
npm run dev

# Or run as Electron app
npm run electron:dev
```

### Demo Accounts
The application includes 5 pre-configured accounts for testing:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Demo** | demo | demo2026 | Full access (no admin) |
| **Admin** | admin | admin123 | Full system access |
| **QA Manager** | qa_manager | qa123 | Quality operations |
| **Engineer** | engineer | eng123 | Engineering & NCR |
| **Auditor** | auditor | audit123 | Read-only + exports |

### SSO Authentication (Demo Mode)
Currently supports mock SSO authentication for:
- Google OAuth 2.0
- GitHub OAuth 2.0
- Microsoft Azure AD / OAuth 2.0

**Production Setup**: Configure OAuth apps in respective platforms and add client IDs to `.env` file.

---

## 3) Architecture & Key Files 🔎

### Authentication & Security
- **src/stores/auth-store.ts** - Zustand store with authentication state, login/logout, SSO integration
- **src/components/views/EnhancedLoginView.tsx** - Modern login UI with SSO buttons
- **src/components/views/LoginView.tsx** - Legacy login view (deprecated)
- **src/components/Sidebar.tsx** - Role-based navigation filtering
- **src/types/index.ts** - User roles, permissions, session types

### AI Infrastructure
- **electron/ai-service.ts** - Ollama CLI wrappers and utility functions
- **electron/main.ts** - IPC handlers for renderer calls (ai:list-models, ai:run-prompt)
- **electron/preload.ts** - Minimal, typed API surface to renderer
- **src/components/views/AIAgentsView.tsx** - UI for managing agents

### Document Management
- **src/components/views/DocumentsView.tsx** - Document control UI
- **src/components/modals/Document*.tsx** - Viewer, Editor, Share, Upload modals
- **src/types/index.ts** - DocumentType, FileFormat, DocumentMetadata types

### State Management
- **src/stores/auth-store.ts** - Authentication state
- **src/stores/app-store.ts** - Application state

---

## 4) Recent Changes (February 1, 2026) ✍️

### Moore Family CRM Setup & Documentation
- ✅ Deployed SuiteCRM in Docker containers
- ✅ Configured MySQL 8.0 database
- ✅ Set up web server stack
- ✅ Created setup documentation (stored locally, not in repo)
- ✅ Created backup and restore procedures

### Previous Updates (January 28, 2026)
- ✅ Added Demo user account with comprehensive permissions (no admin access)
- ✅ Implemented EnhancedLoginView with modern UI and SSO buttons
- ✅ Integrated bcryptjs for password hashing
- ✅ Added OAuth framework for Google, GitHub, Microsoft SSO
- ✅ Implemented role-based admin panel access control
- ✅ Updated App.tsx to use EnhancedLoginView
- ✅ Added 'Demo' to UserRole type definition

### Documentation
- ✅ Created comprehensive README.md with badges, metrics, and professional styling
- ✅ Created SECURITY.md with vulnerability reporting and best practices
- ✅ Created INSTALLATION.md with platform-specific installation guides
- ✅ Created CONTRIBUTING.md with code standards and PR guidelines
- ✅ Created LICENSE file (MIT with medical device disclaimer)
- ✅ Enhanced .gitignore for security (excludes secrets, credentials, keys)

### Resources & Templates
- ✅ Created `/resources` directory structure
- ✅ Created `/businessmarketing` folder with all business documents
- ✅ Added resources/README.md with links to official standards
- ✅ Created Risk Assessment Template (ISO 14971)
- ✅ Copied business and marketing documents to businessmarketing folder

---

## 5) Outstanding Work & Next Steps 🧭

### High Priority
- [ ] Create ARCHITECTURE.md with detailed technical architecture documentation
- [ ] Create USER_GUIDE.md with complete user documentation
- [ ] Add additional compliance templates (CAPA, NCR, Change Control, etc.)
- [ ] Generate application screenshots for README
- [ ] Create architecture diagrams (component, data flow, deployment)
- [ ] Initialize Git repository if not already done
- [ ] Create initial Git commit with all new files

### Security Enhancements (Deferred to v1.1)
- [ ] Implement password complexity requirements
- [ ] Add rate limiting for login attempts
- [ ] Implement account lockout after failed attempts
- [ ] Add password expiration policies
- [ ] Implement session timeout warnings
- [ ] Add MFA/2FA functionality beyond mock
- [ ] Production OAuth integration with real client IDs

### Backend Integration
- [ ] Persist documents to real backend/file store (currently UI-only/mock)
- [ ] Implement actual download/upload flows with checksum verification
- [ ] Add audit-trail logging for document actions
- [ ] Connect SSO to real OAuth providers (production)
- [ ] Implement database for user management
- [ ] Add backup and restore functionality

### Testing & Quality
- [ ] Add unit tests for authentication flows
- [ ] Add integration tests for IPC handlers
- [ ] Add e2e tests for login and SSO flows
- [ ] Test role-based access control
- [ ] Security audit and penetration testing
- [ ] Performance testing with large datasets

### Features
- [ ] Admin Dashboard enhancements (user management UI)
- [ ] Professional Settings page
- [ ] Password reset functionality
- [ ] User profile editing
- [ ] Email verification for new accounts
- [ ] Audit log viewer for admins

---

## 6) How to Add Model/Agent Support

### Local LLM Setup
1. Install Ollama: https://ollama.ai/
2. Pull models:
   ```bash
   ollama pull llama2:13b      # General purpose
   ollama pull codellama:13b   # Code analysis
   ollama pull mistral:7b      # Fast inference
   ```
3. Verify installation: `ollama list`

### Adding New Agents
1. Use `electron/ai-service.ts` functions:
   - `isOllamaInstalled()` - Check Ollama availability
   - `listOllamaModels()` - List available models
   - `runOllamaPrompt()` - Execute prompts
2. Add IPC routes in `electron/main.ts`
3. Keep preload exposure minimal and typed in `electron/preload.ts`
4. Update `src/components/views/AIAgentsView.tsx` for UI

---

## 7) Security Best Practices ⚠️

### For Developers
- **Never commit secrets**: .env files are gitignored
- **Use bcrypt for passwords**: Already integrated in auth-store
- **Validate all inputs**: Especially in modal forms
- **Follow RBAC**: Check permissions before sensitive operations
- **Audit critical actions**: Log to audit trail

### For Administrators
- **Change default passwords**: Immediately after deployment
- **Enable MFA**: For all admin accounts
- **Review audit logs**: Regularly check for anomalies
- **Update promptly**: Apply security patches within 48 hours
- **Backup regularly**: Implement automated backup procedures

### For End Users
- **Strong passwords**: Minimum 12 characters, use password manager
- **Don't share credentials**: Each user gets unique login
- **Lock workstation**: When leaving computer unattended
- **Report suspicious activity**: Notify IT immediately

---

## 8) Troubleshooting & Notes ⚠️

### Common Issues

**Vite postcss.config.js warning**
- Solution: Add `"type": "module"` to package.json

**Modal components not closing properly**
- Check for mismatched braces in modal JSX
- Previously caused build failure in DocumentUploadModal.tsx

**Ollama not found**
```bash
# Linux/macOS
export PATH=$PATH:/usr/local/bin

# Windows - Reinstall with PATH option checked
```

**Port 5173 already in use**
```bash
# Vite auto-selects another port
# Or specify custom port:
npm run dev -- --port 3000
```

**TypeScript errors after updates**
```bash
rm -f *.tsbuildinfo
rm -rf node_modules
npm install
npm run typecheck
```

---

## 9) Contact & Ownership

### Company Information
**MedTech Compliance Solutions LLC**
- **CEO & Co-Founder**: Katie Emma (50% ownership)
- **COO/CTO & Co-Founder**: Paul Moore (50% ownership)
- **Location**: 5739 Potomac St, St. Louis, MO 63139
- **Website**: www.medtechcomplianceLLc.org
- **Email**: paulmmoore3416@gmail.com

### Development
- **Primary Developer**: Paul Moore (@paulmmoore3416)
- **GitHub**: https://github.com/paulmmoore3416/qualityandcomplianceapp
- **Issues**: https://github.com/paulmmoore3416/qualityandcomplianceapp/issues

---

## 10) Documentation Index

| Document | Purpose | Status |
|----------|---------|--------|
| **README.md** | Project overview, features, installation | ✅ Complete |
| **SECURITY.md** | Security policies, vulnerability reporting | ✅ Complete |
| **INSTALLATION.md** | Platform-specific installation guides | ✅ Complete |
| **CONTRIBUTING.md** | Development guidelines, PR process | ✅ Complete |
| **LICENSE** | MIT License with medical device disclaimer | ✅ Complete |
| **ARCHITECTURE.md** | Technical architecture details | ⏳ Pending |
| **USER_GUIDE.md** | End-user documentation | ⏳ Pending |
| **API_REFERENCE.md** | API documentation | ⏳ Future |
| **aisharedreference.md** | This file - AI/dev reference | ✅ Updated |

---

## 11) Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation reviewed
- [ ] Secrets removed from codebase
- [ ] .env.example created
- [ ] OAuth apps configured (production)
- [ ] Database initialized
- [ ] Backup procedures tested

### Production Configuration
- [ ] Change all default passwords
- [ ] Configure real OAuth client IDs
- [ ] Set secure session secrets
- [ ] Configure email service (for notifications)
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging and monitoring
- [ ] Set up automated backups

### Validation (21 CFR Part 11)
- [ ] Installation qualification (IQ)
- [ ] Operational qualification (OQ)
- [ ] Performance qualification (PQ)
- [ ] User acceptance testing (UAT)
- [ ] Traceability matrix verified
- [ ] Validation report signed

---

**Next Actions**:
1. Create ARCHITECTURE.md with technical details
2. Create USER_GUIDE.md with screenshots
3. Add more compliance templates to /resources/templates
4. Generate application screenshots
5. Create architecture diagrams
6. Initialize Git repository (if needed)
7. Create comprehensive first commit

> For questions or updates, contact Paul Moore at paulmmoore3416@gmail.com