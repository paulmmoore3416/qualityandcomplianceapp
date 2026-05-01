# MedTech Compliance Suite - Architecture Diagrams

**Version:** 2.0.1 (Security Hardened)  
**Generated:** May 1, 2026

---

## 📊 Available Diagram Formats

This directory contains professional architecture diagrams for the MedTech Compliance Suite in multiple formats:

### 1. **PROJECT_ARCHITECTURE.png** (284 KB)
- **Format:** PNG Image
- **Best For:** Quick viewing, presentations, documentation
- **Resolution:** High-resolution raster image
- **Usage:** Open with any image viewer

### 2. **PROJECT_ARCHITECTURE.svg** (41 KB)
- **Format:** Scalable Vector Graphics
- **Best For:** Web display, infinite zoom without quality loss
- **Resolution:** Vector-based (scales infinitely)
- **Usage:** Open in web browser or vector graphics editor

### 3. **PROJECT_ARCHITECTURE.pdf** (27 KB)
- **Format:** Portable Document Format
- **Best For:** Printing, professional documentation, archival
- **Resolution:** Vector-based (print-ready)
- **Usage:** Open with PDF reader (Adobe, Chrome, etc.)

### 4. **project_architecture.dot** (5.9 KB)
- **Format:** Graphviz DOT Language
- **Best For:** Editing, customization, regeneration
- **Usage:** Edit with text editor, regenerate with `dot` command

---

## 🎨 Diagram Overview

The architecture diagram visualizes the complete MedTech Compliance Suite system with:

### Key Components Shown:

1. **Entry Points**
   - Web Browser (React App)
   - Electron Desktop (Optional)
   - Configuration (.env)

2. **Security Middleware Layer**
   - Nginx Reverse Proxy
   - Helmet Security Headers
   - CORS Whitelist
   - Rate Limiter (Tiered)
   - Input Sanitization
   - JWT Authentication
   - RBAC Authorization

3. **Backend Services**
   - Express.js Server (Port 3002)
   - API Routes:
     - `/api/auth` - Authentication
     - `/api/compliance` - Compliance Data
     - `/api/audit` - Audit Trails
     - `/api/system` - System Management
     - `/api/modules` - Module Operations

4. **Database Layer**
   - SQLite Database (WAL Mode)
   - Audit Trail with SHA-256 Hash Chain
   - Automated Backups

5. **Security Features**
   - Refresh Token System
   - Password Policy
   - Session Management
   - IP Tracking

6. **Additional Components**
   - AI Service (Command Injection Fixed)
   - Decision Points (Authentication/Authorization)
   - Status Indicators (Success/Error)

---

## 🔍 How to View the Diagrams

### View PNG Image:
```bash
# Linux
xdg-open PROJECT_ARCHITECTURE.png

# macOS
open PROJECT_ARCHITECTURE.png

# Windows
start PROJECT_ARCHITECTURE.png
```

### View SVG in Browser:
```bash
# Linux
firefox PROJECT_ARCHITECTURE.svg

# macOS
open -a "Google Chrome" PROJECT_ARCHITECTURE.svg

# Windows
start chrome PROJECT_ARCHITECTURE.svg
```

### View PDF:
```bash
# Linux
evince PROJECT_ARCHITECTURE.pdf

# macOS
open PROJECT_ARCHITECTURE.pdf

# Windows
start PROJECT_ARCHITECTURE.pdf
```

---

## 🔧 Regenerating the Diagrams

If you need to modify or regenerate the diagrams:

### Method 1: Using the Python Script
```bash
python3 generate_project_diagram.py
```

### Method 2: Using Graphviz Directly
```bash
# Generate PNG
dot -Tpng project_architecture.dot -o PROJECT_ARCHITECTURE.png

# Generate SVG
dot -Tsvg project_architecture.dot -o PROJECT_ARCHITECTURE.svg

# Generate PDF
dot -Tpdf project_architecture.dot -o PROJECT_ARCHITECTURE.pdf
```

### Method 3: Edit DOT File
1. Open `project_architecture.dot` in a text editor
2. Modify the diagram structure using DOT language
3. Regenerate using one of the methods above

---

## 📐 Diagram Color Scheme

The diagram uses a professional dark theme with color-coded components:

| Color | Component Type | Hex Code |
|-------|---------------|----------|
| **Blue** | Entry Points | #5a9fd4 |
| **Green** | Security Layer | #6a8a6a |
| **Purple** | Backend Services | #7a6a9a, #5a7a9a |
| **Brown** | Database | #8a6a5a |
| **Orange** | Security Features | #9a7a6a |
| **Yellow** | Decision Points | #8a8a5a |
| **Dark Green** | Success | #5a8a5a |
| **Dark Red** | Error | #8a5a5a |

---

## 🎯 Diagram Features

### Visual Elements:

1. **Boxes (Rectangles)** - Components and services
2. **Diamonds** - Decision points (authentication, authorization)
3. **Arrows** - Data flow and connections
4. **Clusters** - Grouped related components
5. **Labels** - Descriptive text and details
6. **Legend** - Color-coded component types

### Information Displayed:

- Component names and purposes
- Security features and protections
- Data flow directions
- API endpoints and routes
- Database schema elements
- Rate limiting configurations
- Authentication/authorization flow
- Audit logging integration

---

## 📚 Related Documentation

For more detailed information, see:

- **PROJECT_STRUCTURE.md** - Complete file structure
- **PROJECT_ARCHITECTURE_DIAGRAM.md** - ASCII art version with detailed explanations
- **SECURITY_FIXES.md** - Critical security implementations
- **MEDIUM_SECURITY_FIXES.md** - Medium priority security fixes
- **COMPLETE_SECURITY_SUMMARY.md** - Comprehensive security overview
- **DEPLOYMENT_SECURITY_GUIDE.md** - Production deployment guide

---

## 🔐 Security Architecture Highlights

The diagram emphasizes the **Defense in Depth** strategy:

```
Layer 1: Network Security (Nginx, SSL/TLS)
    ↓
Layer 2: Application Security (Headers, CORS, Rate Limiting)
    ↓
Layer 3: Authentication & Authorization (JWT, RBAC)
    ↓
Layer 4: Data Security (SQL Protection, Audit Trail)
    ↓
Layer 5: Monitoring & Response (Logging, Alerts)
```

---

## 💡 Tips for Using the Diagrams

### For Presentations:
- Use **PNG** for PowerPoint/Google Slides
- Use **PDF** for printed handouts
- Use **SVG** for web-based presentations

### For Documentation:
- Embed **PNG** in Markdown/Word documents
- Link to **SVG** for interactive web docs
- Include **PDF** in formal documentation packages

### For Development:
- Keep **DOT** file in version control
- Regenerate diagrams when architecture changes
- Update colors/labels to match your branding

---

## 🛠️ Customization Guide

### Editing the DOT File:

```dot
// Change node colors
node_name [fillcolor="#custom_color"];

// Change labels
node_name [label="New Label\nMultiple Lines"];

// Add new nodes
new_node [label="New Component", fillcolor="#color"];

// Add connections
node1 -> node2 [label="connection label"];

// Change layout direction
rankdir=TB;  // Top to Bottom
rankdir=LR;  // Left to Right
```

### Common Customizations:

1. **Add New Component:**
   ```dot
   new_service [label="New Service", fillcolor="#5a7a9a"];
   server -> new_service;
   ```

2. **Change Colors:**
   ```dot
   // Update fillcolor attribute
   auth [label="Authentication", fillcolor="#ff6b6b"];
   ```

3. **Modify Layout:**
   ```dot
   // Change graph direction
   rankdir=LR;  // Horizontal layout
   ```

---

## 📊 Diagram Statistics

- **Total Nodes:** 40+
- **Total Connections:** 50+
- **Clusters:** 6
- **Decision Points:** 2
- **Security Layers:** 7
- **API Routes:** 6
- **File Formats:** 4

---

## 🚀 Quick Start

To view the main diagram immediately:

```bash
# Navigate to project directory
cd /home/paul/Documents/qualityandcompliance/qualityandcomplianceapp

# View the PNG diagram
xdg-open PROJECT_ARCHITECTURE.png
```

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 1, 2026 | Initial architecture diagram with all security features |

---

## 🤝 Contributing

To update the architecture diagram:

1. Edit `project_architecture.dot`
2. Run `python3 generate_project_diagram.py`
3. Verify all output files (PNG, SVG, PDF)
4. Update this README if needed
5. Commit changes to version control

---

## 📞 Support

For questions about the architecture diagrams:

- **Technical Documentation:** See PROJECT_STRUCTURE.md
- **Security Details:** See COMPLETE_SECURITY_SUMMARY.md
- **Deployment Guide:** See DEPLOYMENT_SECURITY_GUIDE.md

---

## 📄 License

These diagrams are part of the MedTech Compliance Suite and are subject to the same license terms.

---

**Generated By:** generate_project_diagram.py  
**Graphviz Version:** dot - graphviz version 2.43.0+  
**Last Updated:** May 1, 2026

---

*Professional architecture diagrams for the MedTech Compliance Suite v2.0.1 (Security Hardened)*

**© 2026 MedTech Compliance Solutions LLC - All Rights Reserved**