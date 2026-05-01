# Deployment Security Guide

**Version:** 1.0  
**Last Updated:** May 1, 2026  
**Target Audience:** DevOps, System Administrators, Deployment Engineers

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Environment Configuration](#2-environment-configuration)
3. [Server Hardening](#3-server-hardening)
4. [Network Security](#4-network-security)
5. [Application Security](#5-application-security)
6. [Database Security](#6-database-security)
7. [Monitoring & Logging](#7-monitoring--logging)
8. [Backup & Recovery](#8-backup--recovery)
9. [Post-Deployment Verification](#9-post-deployment-verification)
10. [Maintenance & Updates](#10-maintenance--updates)

---

## 1. Pre-Deployment Checklist

### 1.1 Code Review
- [ ] Security audit completed
- [ ] Code review approved
- [ ] No hardcoded secrets
- [ ] Dependencies updated
- [ ] Vulnerability scan passed

```bash
# Run security checks
npm audit
npm audit fix

# Check for secrets
git secrets --scan

# Verify no debug code
grep -r "console.log\|debugger" src/ server/
```

### 1.2 Testing
- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Security tests passed
- [ ] Performance tests passed
- [ ] Load testing completed

```bash
# Run all tests
npm test

# Run security-specific tests
npm run test:security
```

### 1.3 Documentation
- [ ] Deployment procedures updated
- [ ] Configuration documented
- [ ] Rollback procedures tested
- [ ] Incident response plan current

---

## 2. Environment Configuration

### 2.1 Generate Secure Secrets

```bash
# Generate JWT secret (128 characters recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate database encryption key
openssl rand -base64 32

# Generate session secret
openssl rand -hex 32
```

### 2.2 Environment Variables

Create `.env` file with secure values:

```bash
# CRITICAL: Never commit .env to version control!

# ─── Server Configuration ───────────────────────────────────
NODE_ENV=production
API_PORT=3002
HTTPS_PORT=3443

# ─── Security ───────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<128-character-hex-string>
JWT_EXPIRY=8h
REFRESH_TOKEN_EXPIRY=7d

# ─── HTTPS/TLS ──────────────────────────────────────────────
ENABLE_HTTPS=true
SSL_KEY_PATH=/etc/ssl/private/medtech-key.pem
SSL_CERT_PATH=/etc/ssl/certs/medtech-cert.pem

# ─── Database ───────────────────────────────────────────────
DB_PATH=/var/lib/medtech/compliance.db

# ─── CORS ───────────────────────────────────────────────────
CORS_ORIGIN=https://app.medtechcompliance.com,https://www.medtechcompliance.com

# ─── Monitoring ─────────────────────────────────────────────
LOG_LEVEL=info
SENTRY_DSN=<your-sentry-dsn>

# ─── Email (for notifications) ──────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
```

### 2.3 File Permissions

```bash
# Set restrictive permissions on .env
chmod 600 .env
chown medtech:medtech .env

# Verify
ls -la .env
# Should show: -rw------- 1 medtech medtech
```

---

## 3. Server Hardening

### 3.1 Operating System

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install security updates automatically
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3.2 User Management

```bash
# Create dedicated user for application
sudo useradd -r -s /bin/bash -d /opt/medtech -m medtech

# Set up SSH key authentication
sudo -u medtech mkdir -p /opt/medtech/.ssh
sudo -u medtech chmod 700 /opt/medtech/.ssh

# Add your public key
echo "your-public-key" | sudo tee -a /opt/medtech/.ssh/authorized_keys
sudo chmod 600 /opt/medtech/.ssh/authorized_keys
sudo chown medtech:medtech /opt/medtech/.ssh/authorized_keys
```

### 3.3 Node.js Security

```bash
# Install Node.js LTS version
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd -u medtech --hp /opt/medtech
```

---

## 4. Network Security

### 4.1 SSL/TLS Certificates

#### Option A: Let's Encrypt (Recommended for Production)

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d app.medtechcompliance.com

# Certificates will be at:
# /etc/letsencrypt/live/app.medtechcompliance.com/fullchain.pem
# /etc/letsencrypt/live/app.medtechcompliance.com/privkey.pem

# Set up auto-renewal
sudo certbot renew --dry-run
```

#### Option B: Self-Signed (Development/Testing Only)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout /etc/ssl/private/medtech-key.pem \
  -out /etc/ssl/certs/medtech-cert.pem \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=MedTech/CN=localhost"

# Set permissions
sudo chmod 600 /etc/ssl/private/medtech-key.pem
sudo chmod 644 /etc/ssl/certs/medtech-cert.pem
```

### 4.2 Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/medtech << 'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

# Upstream backend
upstream medtech_backend {
    server 127.0.0.1:3002;
    keepalive 64;
}

server {
    listen 80;
    server_name app.medtechcompliance.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.medtechcompliance.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.medtechcompliance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.medtechcompliance.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/medtech-access.log;
    error_log /var/log/nginx/medtech-error.log;

    # API endpoints
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://medtech_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        
        proxy_pass http://medtech_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location / {
        root /opt/medtech/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Security.txt
    location /.well-known/security.txt {
        alias /opt/medtech/public/.well-known/security.txt;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/medtech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4.3 Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Block all other incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status verbose
```

---

## 5. Application Security

### 5.1 Application Deployment

```bash
# Switch to medtech user
sudo su - medtech

# Clone repository (or copy files)
cd /opt/medtech
git clone https://github.com/your-org/qualityandcomplianceapp.git app
cd app

# Install dependencies (production only)
npm ci --production

# Build application
npm run build

# Create necessary directories
mkdir -p server/data/logs
mkdir -p server/data/backups

# Set permissions
chmod 700 server/data
chmod 600 server/data/compliance.db
```

### 5.2 PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'medtech-api',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: 'server/data/logs/pm2-error.log',
    out_file: 'server/data/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
  }]
};
```

Start application:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup

# Monitor
pm2 monit
```

### 5.3 Security Hardening

```bash
# Remove development dependencies
npm prune --production

# Remove unnecessary files
rm -rf .git tests docs

# Set immutable flag on critical files (Linux)
sudo chattr +i /opt/medtech/app/.env
sudo chattr +i /opt/medtech/app/server/index.js
```

---

## 6. Database Security

### 6.1 Database Configuration

```bash
# Set restrictive permissions
chmod 600 server/data/compliance.db
chown medtech:medtech server/data/compliance.db

# Enable WAL mode for better concurrency
sqlite3 server/data/compliance.db "PRAGMA journal_mode=WAL;"

# Enable foreign keys
sqlite3 server/data/compliance.db "PRAGMA foreign_keys=ON;"
```

### 6.2 Database Backup

Create backup script `/opt/medtech/scripts/backup-db.sh`:

```bash
#!/bin/bash
# Database backup script

BACKUP_DIR="/opt/medtech/app/server/data/backups"
DB_PATH="/opt/medtech/app/server/data/compliance.db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/compliance-$TIMESTAMP.db"

# Create backup
sqlite3 $DB_PATH ".backup '$BACKUP_FILE'"

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "compliance-*.db.gz" -mtime +30 -delete

# Verify backup
if [ -f "$BACKUP_FILE.gz" ]; then
    echo "Backup successful: $BACKUP_FILE.gz"
else
    echo "Backup failed!" >&2
    exit 1
fi
```

Set up cron job:

```bash
# Make script executable
chmod +x /opt/medtech/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /opt/medtech/scripts/backup-db.sh >> /opt/medtech/app/server/data/logs/backup.log 2>&1
```

---

## 7. Monitoring & Logging

### 7.1 Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 7.2 System Monitoring

Create monitoring script `/opt/medtech/scripts/health-check.sh`:

```bash
#!/bin/bash
# Health check script

API_URL="https://app.medtechcompliance.com/api/health"
ALERT_EMAIL="admin@medtechcompliance.com"

# Check API health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $HTTP_CODE -ne 200 ]; then
    echo "API health check failed! HTTP $HTTP_CODE" | \
        mail -s "MedTech API Alert" $ALERT_EMAIL
    exit 1
fi

# Check disk space
DISK_USAGE=$(df -h /opt/medtech | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is at ${DISK_USAGE}%" | \
        mail -s "MedTech Disk Alert" $ALERT_EMAIL
fi

# Check memory
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}' | cut -d. -f1)
if [ $MEM_USAGE -gt 90 ]; then
    echo "Memory usage is at ${MEM_USAGE}%" | \
        mail -s "MedTech Memory Alert" $ALERT_EMAIL
fi
```

Set up cron job:

```bash
# Run every 5 minutes
*/5 * * * * /opt/medtech/scripts/health-check.sh
```

### 7.3 Security Monitoring

```bash
# Monitor failed login attempts
grep "Authentication failed" server/data/logs/*.log | tail -20

# Check audit trail integrity
node -e "const {verifyAuditIntegrity} = require('./server/middleware/audit'); console.log(verifyAuditIntegrity());"

# Monitor rate limit violations
grep "Too many requests" /var/log/nginx/medtech-access.log | wc -l
```

---

## 8. Backup & Recovery

### 8.1 Backup Strategy

**What to Backup:**
- Database (`server/data/compliance.db`)
- Environment configuration (`.env`)
- SSL certificates
- Application logs
- User uploads (if any)

**Backup Schedule:**
- Database: Daily
- Logs: Weekly
- Full system: Monthly

### 8.2 Recovery Procedures

```bash
# Stop application
pm2 stop medtech-api

# Restore database
gunzip -c /opt/medtech/app/server/data/backups/compliance-YYYYMMDD-HHMMSS.db.gz > \
    /opt/medtech/app/server/data/compliance.db

# Verify database integrity
sqlite3 server/data/compliance.db "PRAGMA integrity_check;"

# Restart application
pm2 start medtech-api

# Verify application
curl https://app.medtechcompliance.com/api/health
```

---

## 9. Post-Deployment Verification

### 9.1 Security Checks

```bash
# 1. Verify HTTPS is working
curl -I https://app.medtechcompliance.com

# 2. Check security headers
curl -I https://app.medtechcompliance.com | grep -E "Strict-Transport|X-Frame|X-Content"

# 3. Verify HTTP redirects to HTTPS
curl -I http://app.medtechcompliance.com

# 4. Test API authentication
curl https://app.medtechcompliance.com/api/health

# 5. Verify rate limiting
for i in {1..25}; do curl https://app.medtechcompliance.com/api/health; done

# 6. Check audit trail
sqlite3 server/data/compliance.db "SELECT COUNT(*) FROM audit_trail;"

# 7. Verify no secrets exposed
curl https://app.medtechcompliance.com/.env
# Should return 404

# 8. SSL/TLS test
openssl s_client -connect app.medtechcompliance.com:443 -tls1_2
```

### 9.2 Functional Tests

```bash
# Run smoke tests
npm run test:smoke

# Test login
curl -X POST https://app.medtechcompliance.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!@#$"}'

# Test protected endpoint
curl -H "Authorization: Bearer <token>" \
  https://app.medtechcompliance.com/api/system/info
```

---

## 10. Maintenance & Updates

### 10.1 Regular Maintenance Tasks

**Daily:**
- [ ] Check application logs
- [ ] Verify backups completed
- [ ] Monitor system resources

**Weekly:**
- [ ] Review security logs
- [ ] Check for dependency updates
- [ ] Verify SSL certificate validity

**Monthly:**
- [ ] Run security audit
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Test backup restoration

### 10.2 Update Procedure

```bash
# 1. Backup current version
pm2 save
tar -czf medtech-backup-$(date +%Y%m%d).tar.gz /opt/medtech/app

# 2. Pull updates
cd /opt/medtech/app
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Run database migrations (if any)
npm run migrate

# 5. Build application
npm run build

# 6. Restart with zero downtime
pm2 reload medtech-api

# 7. Verify deployment
curl https://app.medtechcompliance.com/api/health

# 8. Monitor for errors
pm2 logs medtech-api --lines 100
```

### 10.3 Rollback Procedure

```bash
# 1. Stop current version
pm2 stop medtech-api

# 2. Restore previous version
tar -xzf medtech-backup-YYYYMMDD.tar.gz -C /

# 3. Restore database (if needed)
# See section 8.2

# 4. Restart application
pm2 start medtech-api

# 5. Verify
curl https://app.medtechcompliance.com/api/health
```

---

## Emergency Procedures

### System Compromise

```bash
# 1. Isolate system
sudo ufw deny in
pm2 stop all

# 2. Preserve evidence
tar -czf incident-$(date +%Y%m%d-%H%M%S).tar.gz \
    /var/log \
    /opt/medtech/app/server/data/logs

# 3. Notify team
# Follow SECURITY_INCIDENT_RESPONSE.md

# 4. Investigate
# Review logs, audit trail, system state
```

### Data Breach

```bash
# 1. Follow incident response plan
# See SECURITY_INCIDENT_RESPONSE.md

# 2. Revoke all sessions
sqlite3 server/data/compliance.db "DELETE FROM sessions;"

# 3. Force password reset
sqlite3 server/data/compliance.db "UPDATE users SET must_change_password = 1;"

# 4. Enable enhanced logging
export LOG_LEVEL=debug

# 5. Notify affected users
# Use communication templates from incident response plan
```

---

## Compliance Checklist

- [ ] FDA 21 CFR Part 11 requirements met
- [ ] HIPAA compliance verified (if applicable)
- [ ] GDPR compliance verified (if applicable)
- [ ] Audit trail functional and tamper-proof
- [ ] Electronic signatures implemented
- [ ] Data encryption at rest and in transit
- [ ] Access controls enforced
- [ ] Backup and recovery tested

---

## Support Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call Engineer | [PHONE] | 24/7 |
| Security Team | security@medtechcompliance.com | Business hours |
| DevOps Lead | devops@medtechcompliance.com | Business hours |
| CTO | paulmmoore3416@gmail.com | Emergency only |

---

**Document Version:** 1.0  
**Last Review:** May 1, 2026  
**Next Review:** August 1, 2026

---

*This guide should be reviewed and updated with each major deployment.*  
*© 2026 MedTech Compliance Solutions LLC - All Rights Reserved*