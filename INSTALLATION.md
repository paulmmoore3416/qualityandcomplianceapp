# Installation Guide

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Configuration](#configuration)
- [AI Agent Setup](#ai-agent-setup)
- [Troubleshooting](#troubleshooting)
- [Validation](#validation)

---

## 💻 System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+) |
| **CPU** | 64-bit processor, 2+ cores |
| **RAM** | 4 GB |
| **Storage** | 2 GB free space |
| **Node.js** | 18.x or higher |
| **Display** | 1280x720 or higher |

### Recommended Requirements

| Component | Recommendation |
|-----------|----------------|
| **OS** | Windows 11, macOS 13+, Linux (Ubuntu 22.04+) |
| **CPU** | 64-bit processor, 4+ cores |
| **RAM** | 8 GB+ |
| **Storage** | 10 GB+ SSD |
| **Node.js** | 20.x LTS |
| **Display** | 1920x1080 or higher |
| **Network** | For SSO and updates only |

---

## 📦 Prerequisites

### 1. Install Node.js

#### Windows
```powershell
# Download from official website
https://nodejs.org/

# Or use Chocolatey
choco install nodejs-lts
```

#### macOS
```bash
# Using Homebrew
brew install node@20

# Or download from
https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install Git

#### Windows
```powershell
# Download from
https://git-scm.com/download/win

# Or use Chocolatey
choco install git
```

#### macOS
```bash
# Using Homebrew
brew install git

# Or use Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install git
```

### 3. Install Ollama (Optional - for AI features)

#### Windows
```powershell
# Download installer from
https://ollama.ai/download/windows
```

#### macOS
```bash
# Download installer from
https://ollama.ai/download/mac
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

---

## 🚀 Installation Methods

### Method 1: From Source (Recommended for Development)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/paulmmoore3416/qualityandcomplianceapp.git
cd qualityandcomplianceapp
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Electron
- Tailwind CSS
- Recharts
- Zustand
- And all development dependencies

#### Step 3: Run Development Server

```bash
# Start Vite development server
npm run dev
```

The application will open at `http://localhost:5173`

#### Step 4: Run as Electron App (Optional)

```bash
# Build Electron components
npm run build:electron

# Run Electron app with development features
npm run electron:dev
```

---

### Method 2: Pre-built Binaries (Recommended for Production)

#### Windows

```powershell
# Download the latest release
https://github.com/paulmmoore3416/qualityandcomplianceapp/releases

# Run the installer
MedTech-Compliance-Suite-Setup-1.0.0.exe
```

#### macOS

```bash
# Download the latest release
https://github.com/paulmmoore3416/qualityandcomplianceapp/releases

# Open the DMG file
open MedTech-Compliance-Suite-1.0.0.dmg

# Drag to Applications folder
```

#### Linux

```bash
# Download AppImage
wget https://github.com/paulmmoore3416/qualityandcomplianceapp/releases/download/v1.0.0/MedTech-Compliance-Suite-1.0.0.AppImage

# Make executable
chmod +x MedTech-Compliance-Suite-1.0.0.AppImage

# Run
./MedTech-Compliance-Suite-1.0.0.AppImage
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application Settings
VITE_APP_NAME=MedTech Compliance Suite
VITE_APP_VERSION=1.0.0

# SSO Configuration (Production Only)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id

# Optional: Custom Configuration
VITE_MAX_UPLOAD_SIZE=104857600  # 100MB in bytes
VITE_SESSION_TIMEOUT=28800000   # 8 hours in milliseconds
```

### OAuth Setup (Production)

For production SSO integration, configure OAuth applications:

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID to `.env`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL
4. Copy Client ID to `.env`

#### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register new application
3. Configure authentication
4. Copy Application (client) ID to `.env`

---

## 🤖 AI Agent Setup

### Install Ollama

Follow the platform-specific instructions above to install Ollama.

### Download AI Models

```bash
# List available models
ollama list

# Pull recommended models for MedTech Compliance Suite
ollama pull llama2:13b           # General purpose
ollama pull codellama:13b        # Code analysis
ollama pull mistral:7b           # Fast inference

# Verify installation
ollama list
```

### Configure AI Agents

1. Launch the application
2. Navigate to **AI Agents** section
3. Click **Settings** for each agent
4. Configure:
   - Model selection
   - Temperature (0.1-1.0)
   - Max tokens
   - Auto-run schedule

### Test AI Functionality

```bash
# Test Ollama installation
ollama run llama2:13b "Explain ISO 13485 compliance"

# Should return detailed explanation
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: `npm install` fails with permission errors

**Solution**:
```bash
# Linux/macOS - Don't use sudo
npm config set unsafe-perm true

# Windows - Run as Administrator
# Or reinstall Node.js with proper permissions
```

#### Issue: Port 5173 already in use

**Solution**:
```bash
# Vite will automatically try another port
# Or specify custom port
npm run dev -- --port 3000
```

#### Issue: Electron window won't open

**Solution**:
```bash
# Clear Electron cache
rm -rf node_modules/.cache/electron

# Rebuild
npm run build:electron
npm run electron:dev
```

#### Issue: Ollama not found

**Solution**:
```bash
# Verify Ollama is installed
ollama --version

# Add to PATH (Linux/macOS)
export PATH=$PATH:/usr/local/bin

# Windows - Reinstall Ollama with PATH option checked
```

#### Issue: TypeScript errors

**Solution**:
```bash
# Clean TypeScript build info
rm -f *.tsbuildinfo

# Reinstall dependencies
rm -rf node_modules
npm install

# Type check
npm run typecheck
```

---

## ✅ Validation

### Verify Installation

```bash
# Run test suite
npm test

# Run with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Performance Check

```bash
# Build production version
npm run build

# Analyze bundle size
npm run build -- --analyze

# Preview production build
npm run preview
```

### Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Review dependency licenses
npm run licenses
```

---

## 🏗️ Build for Production

### Web Version

```bash
# Build optimized production bundle
npm run build

# Output in /dist folder
```

### Electron Desktop App

```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build -- --win
npm run electron:build -- --mac
npm run electron:build -- --linux

# Output in /release folder
```

---

## 📝 Post-Installation Steps

### 1. Initial Setup

- [ ] Create admin user account
- [ ] Configure organization settings
- [ ] Set up user roles and permissions
- [ ] Configure compliance standards
- [ ] Import existing quality data (if migrating)

### 2. Security Configuration

- [ ] Change default admin password
- [ ] Enable MFA for admin accounts
- [ ] Configure session timeout
- [ ] Review audit trail settings
- [ ] Set up backup procedures

### 3. Integration

- [ ] Configure document storage
- [ ] Set up AI agent automation
- [ ] Test SSO login (if configured)
- [ ] Connect to existing systems (optional)

### 4. Training

- [ ] Review user guide
- [ ] Complete administrator training
- [ ] Train end users
- [ ] Document custom procedures

---

## 🆘 Getting Help

### Resources

- **Documentation**: Check [README.md](./README.md) and [USER_GUIDE.md](./USER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/paulmmoore3416/qualityandcomplianceapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/paulmmoore3416/qualityandcomplianceapp/discussions)

### Support Contact

- **Email**: [paulmmoore3416@gmail.com](mailto:paulmmoore3416@gmail.com)
- **GitHub**: [@paulmmoore3416](https://github.com/paulmmoore3416)

### Enterprise Support

For professional installation, validation, and training services:
- Contact MedTech Compliance Solutions LLC
- Email: [paulmmoore3416@gmail.com](mailto:paulmmoore3416@gmail.com)

---

**Last Updated**: January 28, 2026
**Version**: 1.0
**Maintainer**: MedTech Compliance Solutions LLC
