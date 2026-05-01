#!/usr/bin/env python3
"""
Generate MedTech Compliance Suite Project Architecture Diagram
Similar to the reference flowchart style
"""

import subprocess
import sys

# DOT language diagram definition
dot_content = '''
digraph MedTechCompliance {
    // Graph settings
    rankdir=TB;
    bgcolor="#2d2d2d";
    fontname="Arial";
    fontcolor="white";
    node [fontname="Arial", fontsize=11, style=filled];
    edge [fontname="Arial", fontsize=9, color="white"];
    
    // Define node styles
    node [shape=box, style="filled,rounded", fillcolor="#4a4a4a", fontcolor="white"];
    
    // Top level - Entry Points
    subgraph cluster_entry {
        label="Entry Points";
        fontcolor="white";
        style=filled;
        fillcolor="#3a3a3a";
        
        browser [label="Web Browser\n(React App)", fillcolor="#5a9fd4"];
        electron [label="Electron Desktop\n(Optional)", fillcolor="#5a9fd4"];
        config [label="Configuration\n(.env)", fillcolor="#8b7355"];
    }
    
    // Security Layer
    subgraph cluster_security {
        label="Security Middleware Layer";
        fontcolor="white";
        style=filled;
        fillcolor="#3a3a3a";
        
        nginx [label="Nginx Reverse Proxy\n• Rate Limiting\n• SSL/TLS\n• Security Headers", fillcolor="#6a8a6a"];
        helmet [label="Helmet\nSecurity Headers", fillcolor="#6a8a6a"];
        cors [label="CORS\nWhitelist", fillcolor="#6a8a6a"];
        ratelimit [label="Rate Limiter\n500/20/100 req/15min", fillcolor="#6a8a6a"];
        sanitize [label="Input Sanitization\nXSS Protection", fillcolor="#6a8a6a"];
        auth [label="JWT Authentication\n128-char secret", fillcolor="#6a8a6a"];
        rbac [label="RBAC Authorization\nRole-based Access", fillcolor="#6a8a6a"];
    }
    
    // Backend Core
    subgraph cluster_backend {
        label="Express.js Backend (Port 3002)";
        fontcolor="white";
        style=filled;
        fillcolor="#3a3a3a";
        
        server [label="server/index.js\n• CSP Configuration\n• HTTPS Support", fillcolor="#7a6a9a"];
        
        // Routes
        auth_route [label="/api/auth\nAuthentication", fillcolor="#5a7a9a"];
        compliance_route [label="/api/compliance\nCompliance Data", fillcolor="#5a7a9a"];
        audit_route [label="/api/audit\nAudit Trails", fillcolor="#5a7a9a"];
        system_route [label="/api/system\nSystem Management", fillcolor="#5a7a9a"];
        modules_route [label="/api/modules\nModule Operations", fillcolor="#5a7a9a"];
    }
    
    // Database Layer
    subgraph cluster_database {
        label="Data Persistence";
        fontcolor="white";
        style=filled;
        fillcolor="#3a3a3a";
        
        sqlite [label="SQLite Database\n• WAL Mode\n• Foreign Keys\n• Prepared Statements", fillcolor="#8a6a5a"];
        audit_integrity [label="Audit Trail\nSHA-256 Hash Chain", fillcolor="#8a6a5a"];
        backups [label="Automated Backups\nDaily/Weekly/Monthly", fillcolor="#8a6a5a"];
    }
    
    // Security Features
    subgraph cluster_features {
        label="Security Features";
        fontcolor="white";
        style=filled;
        fillcolor="#3a3a3a";
        
        refresh_token [label="Refresh Tokens\n7-day expiry", fillcolor="#9a7a6a"];
        password_policy [label="Password Policy\n12+ chars, complexity", fillcolor="#9a7a6a"];
        session_mgmt [label="Session Management\nTimeout warnings", fillcolor="#9a7a6a"];
        ip_tracking [label="IP Tracking\nProxy-aware", fillcolor="#9a7a6a"];
    }
    
    // AI Service (Electron)
    ai_service [label="AI Service\n(Command Injection Fixed)", fillcolor="#7a5a8a"];
    
    // Decision Points
    auth_check [label="Authenticated?", shape=diamond, fillcolor="#8a8a5a"];
    authorized_check [label="Authorized?", shape=diamond, fillcolor="#8a8a5a"];
    
    // Status Indicators
    success [label="✓ Request Successful\nAudit Logged", fillcolor="#5a8a5a", fontcolor="white"];
    error [label="✗ Access Denied\n401/403 Response", fillcolor="#8a5a5a", fontcolor="white"];
    
    // Connections - Entry to Security
    browser -> nginx [label="HTTPS"];
    electron -> nginx [label="HTTPS"];
    config -> server [label="env vars"];
    
    // Security Layer Flow
    nginx -> helmet;
    helmet -> cors;
    cors -> ratelimit;
    ratelimit -> sanitize;
    sanitize -> auth_check;
    
    auth_check -> auth [label="Yes"];
    auth_check -> error [label="No"];
    
    auth -> authorized_check;
    authorized_check -> rbac [label="Check"];
    authorized_check -> error [label="No"];
    
    rbac -> server [label="Authorized"];
    
    // Backend Routes
    server -> auth_route;
    server -> compliance_route;
    server -> audit_route;
    server -> system_route;
    server -> modules_route;
    
    // Routes to Database
    auth_route -> sqlite;
    compliance_route -> sqlite;
    audit_route -> sqlite;
    system_route -> sqlite;
    modules_route -> sqlite;
    
    // Database to Audit
    sqlite -> audit_integrity [label="Every write"];
    audit_integrity -> backups;
    
    // Security Features Integration
    auth -> refresh_token;
    auth -> password_policy;
    auth -> session_mgmt;
    audit_route -> ip_tracking;
    
    // AI Service
    electron -> ai_service [label="Local AI"];
    ai_service -> server [label="API calls"];
    
    // Success Path
    sqlite -> success;
    success -> audit_route [label="Log action"];
    
    // Legend
    subgraph cluster_legend {
        label="Legend";
        fontcolor="white";
        style=filled;
        fillcolor="#2a2a2a";
        
        legend_entry [label="Entry Point", fillcolor="#5a9fd4"];
        legend_security [label="Security Layer", fillcolor="#6a8a6a"];
        legend_backend [label="Backend Service", fillcolor="#7a6a9a"];
        legend_database [label="Database", fillcolor="#8a6a5a"];
        legend_feature [label="Security Feature", fillcolor="#9a7a6a"];
        
        legend_entry -> legend_security [style=invis];
        legend_security -> legend_backend [style=invis];
        legend_backend -> legend_database [style=invis];
        legend_database -> legend_feature [style=invis];
    }
}
'''

def generate_diagram():
    """Generate the project diagram using graphviz"""
    try:
        # Check if dot command is available
        result = subprocess.run(['which', 'dot'], capture_output=True, text=True)
        if result.returncode != 0:
            print("Error: graphviz 'dot' command not found.")
            print("Install with: sudo apt-get install graphviz")
            return False
        
        # Write DOT content to file
        dot_file = 'project_architecture.dot'
        with open(dot_file, 'w') as f:
            f.write(dot_content)
        
        print(f"✓ Created {dot_file}")
        
        # Generate PNG image
        png_file = 'PROJECT_ARCHITECTURE.png'
        result = subprocess.run(
            ['dot', '-Tpng', dot_file, '-o', png_file],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"✓ Generated {png_file}")
            
            # Also generate SVG for scalability
            svg_file = 'PROJECT_ARCHITECTURE.svg'
            subprocess.run(['dot', '-Tsvg', dot_file, '-o', svg_file])
            print(f"✓ Generated {svg_file}")
            
            # Generate PDF
            pdf_file = 'PROJECT_ARCHITECTURE.pdf'
            subprocess.run(['dot', '-Tpdf', dot_file, '-o', pdf_file])
            print(f"✓ Generated {pdf_file}")
            
            print("\n✅ Project architecture diagrams generated successfully!")
            print(f"   - {png_file} (for viewing)")
            print(f"   - {svg_file} (scalable)")
            print(f"   - {pdf_file} (printable)")
            return True
        else:
            print(f"Error generating diagram: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    success = generate_diagram()
    sys.exit(0 if success else 1)

# Made with Bob
