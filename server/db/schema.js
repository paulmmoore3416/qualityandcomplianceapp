const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'compliance.db');

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

  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'Viewer',
    permissions TEXT NOT NULL DEFAULT '[]', department TEXT, title TEXT, phone TEXT,
    status TEXT NOT NULL DEFAULT 'Active', last_login TEXT, created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, password_last_changed TEXT NOT NULL,
    must_change_password INTEGER NOT NULL DEFAULT 0, mfa_enabled INTEGER NOT NULL DEFAULT 0,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0, account_locked_until TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token TEXT UNIQUE NOT NULL,
    ip_address TEXT, user_agent TEXT, created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL, last_activity TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS audit_trail (
    id TEXT PRIMARY KEY, action TEXT NOT NULL, entity_type TEXT, entity_id TEXT,
    previous_value TEXT, new_value TEXT, iso_clause TEXT, user_id TEXT,
    user_name TEXT, ip_address TEXT, timestamp TEXT NOT NULL, session_id TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS compliance_data (
    id TEXT PRIMARY KEY, module TEXT NOT NULL, data TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT, updated_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS capas (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
    root_cause TEXT, status TEXT NOT NULL DEFAULT 'Open', priority TEXT NOT NULL DEFAULT 'Medium',
    assignee TEXT, due_date TEXT, closed_at TEXT, linked_ncrs TEXT DEFAULT '[]',
    linked_risks TEXT DEFAULT '[]', iso_references TEXT DEFAULT '[]', actions TEXT DEFAULT '[]',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT, updated_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS ncrs (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
    detected_at TEXT, lot_number TEXT, product_code TEXT, quantity INTEGER,
    disposition TEXT DEFAULT 'Pending', status TEXT NOT NULL DEFAULT 'Open',
    linked_capas TEXT DEFAULT '[]', iso_references TEXT DEFAULT '[]',
    closed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY, hazard_id TEXT, description TEXT NOT NULL, hazardous_situation TEXT,
    harm TEXT, initial_severity INTEGER, initial_probability INTEGER, initial_risk_level TEXT,
    risk_controls TEXT DEFAULT '[]', residual_severity INTEGER, residual_probability INTEGER,
    residual_risk_level TEXT, benefit_risk_acceptable INTEGER DEFAULT 1,
    real_world_rate REAL, design_estimate_rate REAL, linked_complaints TEXT DEFAULT '[]',
    linked_adverse_events TEXT DEFAULT '[]', status TEXT DEFAULT 'Active',
    last_review_date TEXT, next_review_date TEXT, created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY, supplier_code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    category TEXT, risk_level TEXT DEFAULT 'Minor', status TEXT DEFAULT 'Pending Audit',
    qualification_date TEXT, last_audit_date TEXT, next_audit_due TEXT,
    certifications TEXT DEFAULT '[]', contact_info TEXT DEFAULT '{}', products TEXT DEFAULT '[]',
    performance_score REAL, open_ncrs INTEGER DEFAULT 0, open_scapas INTEGER DEFAULT 0,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS training_records (
    id TEXT PRIMARY KEY, employee_id TEXT, employee_name TEXT NOT NULL, department TEXT,
    role TEXT, training_id TEXT, training_title TEXT NOT NULL, training_type TEXT,
    required_by TEXT, completed_date TEXT, expiry_date TEXT, status TEXT DEFAULT 'Not Started',
    score REAL, passing_score REAL, trainer_id TEXT, verified_by TEXT,
    verification_date TEXT, certificate_url TEXT, created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS change_controls (
    id TEXT PRIMARY KEY, reference_number TEXT UNIQUE NOT NULL, type TEXT,
    classification TEXT DEFAULT 'Minor', title TEXT NOT NULL, description TEXT,
    justification TEXT, requested_by TEXT, requested_date TEXT,
    impact_assessment TEXT DEFAULT '{}', linked_risks TEXT DEFAULT '[]',
    linked_capas TEXT DEFAULT '[]', linked_documents TEXT DEFAULT '[]',
    triggered_by_risk TEXT, approvals TEXT DEFAULT '[]', status TEXT DEFAULT 'Draft',
    implementation_plan TEXT, implemented_date TEXT, verification_evidence TEXT,
    closed_at TEXT, audit_trail TEXT DEFAULT '[]', created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY, reference_number TEXT UNIQUE NOT NULL, source TEXT, severity TEXT,
    title TEXT NOT NULL, description TEXT, product_code TEXT, lot_number TEXT, udi_number TEXT,
    patient_involved INTEGER DEFAULT 0, injury_reported INTEGER DEFAULT 0,
    death_reported INTEGER DEFAULT 0, status TEXT DEFAULT 'New', received_date TEXT,
    investigation_due_date TEXT, root_cause TEXT, linked_capas TEXT DEFAULT '[]',
    linked_adverse_events TEXT DEFAULT '[]', linked_hazard_ids TEXT DEFAULT '[]',
    closed_at TEXT, audit_trail TEXT DEFAULT '[]', created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS adverse_events (
    id TEXT PRIMARY KEY, reference_number TEXT UNIQUE NOT NULL, type TEXT, description TEXT,
    event_date TEXT, reported_date TEXT, product_code TEXT, lot_number TEXT, udi_number TEXT,
    linked_complaint_id TEXT, linked_hazard_ids TEXT DEFAULT '[]',
    regulatory_submissions TEXT DEFAULT '[]', status TEXT DEFAULT 'Open',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY, document_number TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
    description TEXT, type TEXT, format TEXT, revision TEXT DEFAULT 'A',
    status TEXT DEFAULT 'Draft', effective_date TEXT, review_date TEXT, expiry_date TEXT,
    author TEXT, reviewers TEXT DEFAULT '[]', approvers TEXT DEFAULT '[]',
    owner TEXT, department TEXT, tags TEXT DEFAULT '[]', related_products TEXT DEFAULT '[]',
    iso_references TEXT DEFAULT '[]', linked_documents TEXT DEFAULT '[]',
    linked_change_controls TEXT DEFAULT '[]', file_path TEXT, file_size INTEGER DEFAULT 0,
    checksum TEXT, version INTEGER DEFAULT 1, access_control TEXT DEFAULT '{}',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS validation_reports (
    id TEXT PRIMARY KEY, report_number TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
    type TEXT, category TEXT, status TEXT DEFAULT 'Draft', version TEXT DEFAULT '1.0',
    author TEXT, reviewers TEXT DEFAULT '[]', approvers TEXT DEFAULT '[]', objective TEXT,
    device_under_test TEXT DEFAULT '{}', test_methods TEXT DEFAULT '[]',
    requirements TEXT DEFAULT '[]', test_results TEXT DEFAULT '[]',
    overall_conclusion TEXT, conclusion_summary TEXT, non_conformances TEXT DEFAULT '[]',
    failures TEXT DEFAULT '[]', design_change_recommendations TEXT DEFAULT '[]',
    discussion_notes TEXT, linked_ncrs TEXT DEFAULT '[]', linked_capas TEXT DEFAULT '[]',
    linked_change_controls TEXT DEFAULT '[]', linked_risk_assessments TEXT DEFAULT '[]',
    linked_documents TEXT DEFAULT '[]', iso_references TEXT DEFAULT '[]',
    audit_trail TEXT DEFAULT '[]', submitted_at TEXT, approved_at TEXT, approved_by TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS lifecycle_records (
    id TEXT PRIMARY KEY, phase TEXT NOT NULL, product_code TEXT,
    iso_focus TEXT DEFAULT '[]', key_metrics TEXT DEFAULT '[]',
    risk_management_tasks TEXT DEFAULT '[]', status TEXT DEFAULT 'Active',
    start_date TEXT, target_end_date TEXT, actual_end_date TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, report_number TEXT, category TEXT,
    section TEXT, status TEXT DEFAULT 'Draft', file_path TEXT, file_name TEXT,
    file_size INTEGER DEFAULT 0, file_url TEXT, storage_type TEXT DEFAULT 'local',
    reference_id TEXT, authority TEXT, report_type TEXT, due_date TEXT, summary TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY, level TEXT NOT NULL, category TEXT, message TEXT NOT NULL,
    details TEXT, source TEXT, user_id TEXT, ip_address TEXT, timestamp TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY, site_name TEXT NOT NULL, site_code TEXT UNIQUE NOT NULL,
    description TEXT, address TEXT, city TEXT, state TEXT, country TEXT DEFAULT 'USA',
    ip_address TEXT, server_hostname TEXT, server_port INTEGER DEFAULT 3001,
    server_version TEXT, os_info TEXT, cpu_cores INTEGER, total_memory_gb REAL,
    status TEXT DEFAULT 'Active', is_primary INTEGER DEFAULT 0,
    last_heartbeat TEXT, last_sync TEXT, contact_name TEXT, contact_email TEXT,
    contact_phone TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS system_metrics (
    id TEXT PRIMARY KEY, site_id TEXT, cpu_percent REAL, memory_percent REAL,
    disk_percent REAL, active_sessions INTEGER, requests_per_minute REAL,
    error_rate REAL, uptime_seconds INTEGER, timestamp TEXT NOT NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS metric_values (
    id TEXT PRIMARY KEY, metric_id TEXT NOT NULL, value REAL NOT NULL,
    calculated_value REAL, inputs TEXT DEFAULT '{}', notes TEXT,
    linked_risk_assessments TEXT DEFAULT '[]', audit_trail TEXT DEFAULT '[]',
    recorded_by TEXT, timestamp TEXT NOT NULL
  )`);

  // Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
    CREATE INDEX IF NOT EXISTS idx_compliance_data_module ON compliance_data(module);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_capas_status ON capas(status);
    CREATE INDEX IF NOT EXISTS idx_ncrs_status ON ncrs(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
    CREATE INDEX IF NOT EXISTS idx_training_status ON training_records(status);
    CREATE INDEX IF NOT EXISTS idx_change_controls_status ON change_controls(status);
    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_metric_values_metric_id ON metric_values(metric_id);
    CREATE INDEX IF NOT EXISTS idx_metric_values_timestamp ON metric_values(timestamp);
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) seedDefaultUsers(db);

  const capaCount = db.prepare('SELECT COUNT(*) as count FROM capas').get();
  if (capaCount.count === 0) seedDemoData(db);

  const siteCount = db.prepare('SELECT COUNT(*) as count FROM sites').get();
  if (siteCount.count === 0) seedSiteData(db);

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
    { id: uuidv4(), username: 'admin', email: 'admin@medtech.com', fullName: 'System Administrator', password: process.env.SEED_ADMIN_PASSWORD || 'admin123', role: 'Admin', permissions: JSON.stringify(['view_dashboard','view_metrics','edit_metrics','view_risk','edit_risk','view_capa','edit_capa','approve_capa','view_ncr','edit_ncr','view_documents','edit_documents','delete_documents','share_documents','view_vigilance','edit_vigilance','view_suppliers','edit_suppliers','approve_suppliers','view_training','edit_training','verify_training','view_change_control','edit_change_control','approve_change_control','view_validation','edit_validation','approve_validation','sign_electronically','view_audit_trail','manage_users','manage_roles','system_settings','export_data','import_data']), department: 'IT & Quality Systems', title: 'Quality Systems Administrator' },
    { id: uuidv4(), username: 'qa_manager', email: 'qa.manager@medtech.com', fullName: 'Sarah Johnson', password: process.env.SEED_QA_PASSWORD || 'qa123', role: 'QA Manager', permissions: JSON.stringify(['view_dashboard','view_metrics','edit_metrics','view_risk','edit_risk','view_capa','edit_capa','approve_capa','view_ncr','edit_ncr','view_documents','edit_documents','share_documents','view_vigilance','edit_vigilance','view_suppliers','edit_suppliers','view_training','edit_training','verify_training','view_change_control','edit_change_control','approve_change_control','view_validation','edit_validation','approve_validation','sign_electronically','view_audit_trail','export_data']), department: 'Quality Assurance', title: 'QA Manager' },
    { id: uuidv4(), username: 'engineer', email: 'engineer@medtech.com', fullName: 'Michael Chen', password: process.env.SEED_ENGINEER_PASSWORD || 'eng123', role: 'Engineer', permissions: JSON.stringify(['view_dashboard','view_metrics','view_risk','view_capa','edit_capa','view_ncr','edit_ncr','view_documents','edit_documents','share_documents','view_vigilance','view_suppliers','view_training','view_change_control','edit_change_control','view_validation','edit_validation']), department: 'Engineering', title: 'Senior Design Engineer' },
    { id: uuidv4(), username: 'demo', email: 'demo@medtech.com', fullName: 'Demo User', password: process.env.SEED_DEMO_PASSWORD || 'demo123', role: 'Demo', permissions: JSON.stringify(['view_dashboard','view_metrics','edit_metrics','view_risk','edit_risk','view_capa','edit_capa','view_ncr','edit_ncr','view_documents','edit_documents','share_documents','view_vigilance','edit_vigilance','view_suppliers','edit_suppliers','view_training','edit_training','view_change_control','edit_change_control','view_validation','edit_validation','sign_electronically','view_audit_trail','export_data']), department: 'Demonstration', title: 'Demo Account' },
    { id: uuidv4(), username: 'tjbest', email: 'tracy.best@medtech.com', fullName: 'Tracy Best', password: process.env.SEED_TJBEST_PASSWORD || 'tjbest2026', role: 'Admin', permissions: JSON.stringify(['view_dashboard','view_metrics','edit_metrics','view_risk','edit_risk','view_capa','edit_capa','approve_capa','view_ncr','edit_ncr','view_documents','edit_documents','delete_documents','share_documents','view_vigilance','edit_vigilance','view_suppliers','edit_suppliers','approve_suppliers','view_training','edit_training','verify_training','view_change_control','edit_change_control','approve_change_control','view_validation','edit_validation','approve_validation','sign_electronically','view_audit_trail','manage_users','manage_roles','system_settings','export_data','import_data']), department: 'Quality & Administration', title: 'Administrator' },
  ];

  const tx = db.transaction(() => {
    for (const user of users) {
      const hash = bcrypt.hashSync(user.password, 10);
      insert.run(user.id, user.username, user.email, user.fullName, hash, user.role, user.permissions, user.department, user.title, now, now, now);
    }
  });
  tx();
  console.log('Default users seeded: admin/admin123, qa_manager/qa123, engineer/eng123, demo/demo123, tjbest/tjbest2026');
}

function seedDemoData(db) {
  const now = new Date().toISOString();
  const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
  const future = (days) => new Date(Date.now() + days * 86400000).toISOString();

  // CAPAs
  const capas = [
    [uuidv4(),'Corrective','Sterility Failure Investigation - Lot 2024-089','Sterility testing failure detected in final product lot 2024-089. Immediate containment and CAPA initiated.','Cleanroom gowning procedure deviation by temporary staff','In Progress','Critical','Sarah Johnson',ago(7)],
    [uuidv4(),'Preventive','FMEA Update for New Catheter Design','Proactive FMEA review triggered by design change CR-2024-012 to catheter hub assembly.',null,'Open','High','Michael Chen',future(14)],
    [uuidv4(),'Corrective','Calibration System Overdue Instruments','12 instruments found overdue for calibration during internal audit.','Calibration management software upgrade caused scheduling data loss','Closed','High','Sarah Johnson',future(30)],
    [uuidv4(),'Corrective','Supplier Nonconformance - Polymer Supplier','Incoming inspection failure for polymer raw material from Supplier SP-0042.','Supplier process change without notification per agreement','In Progress','Medium','Michael Chen',ago(5)],
    [uuidv4(),'Preventive','Electronic Records Backup Verification','Annual verification of electronic record backup and recovery procedures per 21 CFR Part 11.',null,'Open','Low','System Administrator',future(20)],
  ];
  const capaTx = db.transaction(() => {
    capas.forEach(c => db.prepare(`INSERT INTO capas (id,type,title,description,root_cause,status,priority,assignee,due_date,linked_ncrs,linked_risks,iso_references,actions,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,'[]','[]','[]','[]',?,?,'system')`).run(...c, now, now));
  });
  capaTx();

  // NCRs
  const ncrs = [
    [uuidv4(),'Product','Dimensional OOS - Catheter OD','Outer diameter measurement outside specification range on catheter lot 2024-091.',ago(5),'2024-091','CAT-300-FR','Rework','Under Investigation'],
    [uuidv4(),'Process','Welding Parameter Deviation','RF welding parameters logged outside validated range during production run 2024-0338.',ago(3),'2024-0338','BAG-500-IV','Use As Is','Pending CAPA'],
    [uuidv4(),'Supplier','Incorrect CoA Format from Polymer Supplier','Certificate of Analysis from SP-0042 missing required test methods per spec PRD-MAT-022.',ago(8),'SP42-20241015','RAW-POLY-001','Return to Supplier','Closed'],
    [uuidv4(),'Documentation','SOP Revision Level Mismatch','Production floor copy of SOP-MFG-015 found at Rev C; approved revision is Rev D.',ago(2),null,null,'Pending','Open'],
  ];
  const ncrTx = db.transaction(() => {
    ncrs.forEach(n => db.prepare(`INSERT INTO ncrs (id,type,title,description,detected_at,lot_number,product_code,disposition,status,linked_capas,iso_references,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,'[]','[]',?,?,'system')`).run(...n, now, now));
  });
  ncrTx();

  // Risk Assessments
  const risks = [
    [uuidv4(),'HAZ-001','Catheter fracture during deployment','Catheter tip separation under torsional force','Device embolization, surgical intervention required',5,2,'High','[]',5,1,'Medium','Active',ago(90),future(275)],
    [uuidv4(),'HAZ-002','Biocompatibility failure of new polymer','Cytotoxic leachables in contact with blood','Systemic toxicity, hemolysis',4,2,'High','[]',4,1,'Medium','Under Review',ago(30),future(335)],
    [uuidv4(),'HAZ-003','Sterility compromise due to packaging defect','Pinhole in sterile barrier','Patient infection',5,2,'High','[]',5,1,'Medium','Active',ago(60),future(305)],
    [uuidv4(),'HAZ-004','Misuse due to unclear IFU labeling','Incorrect catheter size selected','Vessel trauma, inadequate therapy',3,3,'Medium','[]',3,2,'Low','Active',ago(120),future(245)],
  ];
  const riskTx = db.transaction(() => {
    risks.forEach(r => db.prepare(`INSERT INTO risk_assessments (id,hazard_id,description,hazardous_situation,harm,initial_severity,initial_probability,initial_risk_level,risk_controls,residual_severity,residual_probability,residual_risk_level,benefit_risk_acceptable,status,last_review_date,next_review_date,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,'system')`).run(...r, now, now));
  });
  riskTx();

  // Suppliers
  const suppliers = [
    [uuidv4(),'SP-0042','PolyMed Materials Inc.','Raw Material','Critical','Conditional',ago(365),ago(60),future(90),JSON.stringify([{id:uuidv4(),type:'ISO 9001',certificationNumber:'ISO9001-2024-7823',issuedDate:ago(400),expiryDate:future(100),certifyingBody:'SGS Certification',status:'Expiring Soon'}]),JSON.stringify({address:'1200 Industrial Blvd, Cincinnati, OH 45201',contactName:'James Reeves',email:'j.reeves@polymedmaterials.com',phone:'513-555-0192'}),JSON.stringify(['Polymer Resin Type A','Polymer Resin Type B']),72,2,1],
    [uuidv4(),'SP-0018','SterilTech Solutions','Sterilization','Critical','Approved',ago(730),ago(180),future(185),JSON.stringify([{id:uuidv4(),type:'ISO 13485',certificationNumber:'ISO13485-2023-1122',issuedDate:ago(800),expiryDate:future(365),certifyingBody:'BSI Group',status:'Valid'}]),JSON.stringify({address:'5600 Medical Dr, Chicago, IL 60601',contactName:'Linda Zhao',email:'l.zhao@steriltech.com',phone:'312-555-0281'}),JSON.stringify(['EO Sterilization Services','Radiation Sterilization']),94,0,0],
    [uuidv4(),'SP-0031','PrecisionMicro Components','Component','Major','Approved',ago(500),ago(120),future(245),JSON.stringify([{id:uuidv4(),type:'ISO 13485',certificationNumber:'ISO13485-2024-0892',issuedDate:ago(400),expiryDate:future(400),certifyingBody:'TÜV Rheinland',status:'Valid'}]),JSON.stringify({address:'900 Tech Park Way, Minneapolis, MN 55401',contactName:'Robert Kim',email:'r.kim@precisionmicro.com',phone:'612-555-0344'}),JSON.stringify(['Needle Tubing','Connector Bodies','Guidewire Components']),88,1,0],
  ];
  const suppTx = db.transaction(() => {
    suppliers.forEach(s => db.prepare(`INSERT INTO suppliers (id,supplier_code,name,category,risk_level,status,qualification_date,last_audit_date,next_audit_due,certifications,contact_info,products,performance_score,open_ncrs,open_scapas,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'system')`).run(...s, now, now));
  });
  suppTx();

  // Training Records
  const trainings = [
    [uuidv4(),'EMP-001','Sarah Johnson','Quality Assurance','QA Manager','TRN-QMS-001','ISO 13485:2016 Overview','Regulatory',ago(30),ago(20),future(335),'Completed',95,80,'System Administrator'],
    [uuidv4(),'EMP-002','Michael Chen','Engineering','Senior Design Engineer','TRN-ISO14971','ISO 14971 Risk Management','Regulatory',ago(15),ago(10),future(350),'Completed',88,80,'Sarah Johnson'],
    [uuidv4(),'EMP-003','David Park','Manufacturing','Production Technician','TRN-CLEAN-001','Cleanroom Gowning Procedure','Role-specific',ago(5),null,null,'Overdue',null,85,null],
    [uuidv4(),'EMP-004','Jennifer Walsh','Regulatory Affairs','Regulatory Specialist','TRN-EUMDR-001','EU MDR 2017/745 Requirements','Regulatory',ago(60),ago(45),future(305),'Completed',92,80,'Sarah Johnson'],
    [uuidv4(),'EMP-005','Carlos Rivera','Manufacturing','Production Lead','TRN-21CFR-001','21 CFR Part 820 QSR Training','Regulatory',ago(10),null,null,'In Progress',null,80,null],
    [uuidv4(),'EMP-006','Tracy Best','Quality & Administration','Administrator','TRN-QMS-001','ISO 13485:2016 Overview','Regulatory',ago(30),ago(15),future(350),'Completed',97,80,'System Administrator'],
  ];
  const trainTx = db.transaction(() => {
    trainings.forEach(t => db.prepare(`INSERT INTO training_records (id,employee_id,employee_name,department,role,training_id,training_title,training_type,required_by,completed_date,expiry_date,status,score,passing_score,verified_by,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'system')`).run(...t, now, now));
  });
  trainTx();

  // Complaints
  const complaints = [
    [uuidv4(),'COMP-2024-0087','Healthcare Provider','Critical','Reported fracture during catheterization','Physician reported catheter tip separation during cardiac procedure. Patient required surgical retrieval.','CAT-300-FR','2024-067',1,1,'Under Investigation',ago(12),ago(18)],
    [uuidv4(),'COMP-2024-0091','Customer','Major','Packaging integrity concern','Customer received product with apparent seal peelback on sterile pouch.','BAG-500-IV','2024-082',0,0,'Under Investigation',ago(5),ago(25)],
    [uuidv4(),'COMP-2024-0079','Distributor','Minor','Label printing smear on guidewire','Lot of guidewires received with smeared UDI barcode, unreadable by scanner.','GW-035-PTFE','2024-071',0,0,'Closed',ago(25),ago(5)],
  ];
  const compTx = db.transaction(() => {
    complaints.forEach(c => db.prepare(`INSERT INTO complaints (id,reference_number,source,severity,title,description,product_code,lot_number,patient_involved,injury_reported,status,received_date,investigation_due_date,linked_capas,linked_adverse_events,linked_hazard_ids,audit_trail,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'[]','[]','[]','[]',?,?,'system')`).run(...c, now, now));
  });
  compTx();

  // Change Controls
  const changes = [
    [uuidv4(),'CR-2024-012','Design','Major','Catheter Hub Assembly Redesign','Redesign of distal hub to improve torque response and reduce fracture risk.','CAPA-024 identified hub geometry as root cause of fracture risk.','Michael Chen',ago(20),JSON.stringify({safetyImpact:'High',qualityImpact:'High',regulatoryImpact:'High',affectedDocuments:['SPC-CAT-001','DWG-HUB-003'],affectedProducts:['CAT-300-FR'],affectedProcesses:['Assembly','Testing'],riskAssessmentRequired:true,validationRequired:true,regulatorySubmissionRequired:true}),JSON.stringify([{id:uuidv4(),role:'Quality',approverName:'Sarah Johnson',decision:'Approved',timestamp:ago(15)},{id:uuidv4(),role:'Regulatory',approverName:'Jennifer Walsh',decision:'Pending'}]),'Pending Review'],
    [uuidv4(),'CR-2024-009','Document','Minor','SOP-MFG-015 Rev D Update','Update cleanroom gowning SOP to address CAPA-021 findings.','CAPA-021 identified procedure gaps.','Sarah Johnson',ago(8),JSON.stringify({safetyImpact:'Low',qualityImpact:'Medium',regulatoryImpact:'Low',affectedDocuments:['SOP-MFG-015'],affectedProducts:[],affectedProcesses:['Cleanroom Operations'],riskAssessmentRequired:false,validationRequired:false,regulatorySubmissionRequired:false}),JSON.stringify([{id:uuidv4(),role:'Quality',approverName:'Sarah Johnson',decision:'Approved',timestamp:ago(5)}]),'Approved'],
  ];
  const changeTx = db.transaction(() => {
    changes.forEach(c => db.prepare(`INSERT INTO change_controls (id,reference_number,type,classification,title,description,justification,requested_by,requested_date,impact_assessment,approvals,status,linked_risks,linked_capas,linked_documents,audit_trail,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'[]','[]','[]','[]',?,?,'system')`).run(...c, now, now));
  });
  changeTx();

  // Documents
  const docs = [
    [uuidv4(),'QM-001','Quality Manual','Quality Manual','PDF','D','Effective',ago(180),'Sarah Johnson','Quality Assurance',JSON.stringify([{standard:'ISO 13485:2016',clause:'4.1',description:'General Requirements'}]),524288,4],
    [uuidv4(),'SOP-MFG-015','Cleanroom Gowning Procedure','SOP','PDF','D','Approved',ago(5),'Sarah Johnson','Manufacturing',JSON.stringify([{standard:'ISO 14644',clause:'5.3',description:'Cleanroom Personnel'}]),245760,4],
    [uuidv4(),'SPC-CAT-001','Catheter FR-300 Product Specification','Specification','PDF','C','Effective',ago(365),'Michael Chen','Engineering',JSON.stringify([{standard:'ISO 13485:2016',clause:'7.3',description:'Design and Development'}]),819200,3],
    [uuidv4(),'RMF-CAT-001','Catheter Risk Management File','Risk Analysis','XLSX','B','Effective',ago(200),'Michael Chen','Engineering',JSON.stringify([{standard:'ISO 14971',clause:'4.1',description:'Risk Analysis Process'}]),655360,2],
  ];
  const docTx = db.transaction(() => {
    docs.forEach(d2 => db.prepare(`INSERT INTO documents (id,document_number,title,type,format,revision,status,effective_date,author,department,iso_references,file_size,version,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'system')`).run(...d2, now, now));
  });
  docTx();

  // Reports
  const reportData = [
    [uuidv4(),'Q3 2024 Internal Quality Audit Report','AUD-2024-Q3','Audit Report','Audit','Approved','Internal quality audit covering manufacturing and QMS. 3 major findings, 7 minor findings.'],
    [uuidv4(),'ISO 13485 Annual Management Review','MR-2024-001','Audit Report','Audit','Approved','Annual management review of QMS performance, audit results, and process metrics.'],
    [uuidv4(),'MedWatch Adverse Event Report - COMP-2024-0087','MDR-2024-0087','Regulatory Report','Vigilance','Submitted','FDA MedWatch report for catheter fracture adverse event. Submitted within 30-day MDR requirement.'],
    [uuidv4(),'EVT-001 Engineering Validation Test Report','EVT-2024-CAT300-001','Validation Report','Validation','Approved','Engineering validation test results for catheter redesign. All primary endpoints met.'],
  ];
  const reportTx = db.transaction(() => {
    reportData.forEach(r => db.prepare(`INSERT INTO reports (id,title,report_number,category,section,status,summary,created_at,updated_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,'system')`).run(...r, now, now));
  });
  reportTx();

  // Metric Values
  const metricTx = db.transaction(() => {
    const metrics = [
      ['yield',97.3,'{"total":1500,"passed":1460}','Monthly FPY - October 2024',ago(1)],
      ['yield',96.8,'{"total":1420,"passed":1374}','Monthly FPY - September 2024',ago(31)],
      ['yield',98.1,'{"total":1380,"passed":1354}','Monthly FPY - August 2024',ago(62)],
      ['customer_complaints',3,'{"complaints":3}','Monthly complaints - October 2024',ago(1)],
      ['customer_complaints',5,'{"complaints":5}','Monthly complaints - September 2024',ago(31)],
      ['capa_closure',78,'{"closed":18,"total":23}','CAPA closure rate October 2024',ago(1)],
      ['supplier_quality',94.2,'{"approved":94.2}','Supplier quality index Q3 2024',ago(5)],
      ['training_compliance',88,'{"compliant":88}','Training compliance October 2024',ago(1)],
      ['ncr_rate',2.1,'{"ncrs":3,"units":1500}','NCR rate October 2024',ago(1)],
    ];
    metrics.forEach(([mid, val, inp, note, ts]) => {
      db.prepare(`INSERT INTO metric_values (id,metric_id,value,inputs,notes,recorded_by,timestamp) VALUES (?,?,?,?,?,'system',?)`).run(uuidv4(), mid, val, inp, note, ts);
    });
  });
  metricTx();

  console.log('Demo data seeded successfully');
}

function seedSiteData(db) {
  const now = new Date().toISOString();
  const os = require('os');

  const networkInterfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  for (const iface of Object.values(networkInterfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        localIp = alias.address;
        break;
      }
    }
    if (localIp !== '127.0.0.1') break;
  }

  db.prepare(`INSERT INTO sites (id,site_name,site_code,description,city,state,country,ip_address,server_hostname,server_port,server_version,os_info,cpu_cores,total_memory_gb,status,is_primary,last_heartbeat,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(uuidv4(),'Primary Compliance Server','SITE-HQ-001','Headquarters onsite MedTech Compliance Suite server - Administrator & Developer platform','St. Louis','MO','USA',localIp,os.hostname(),parseInt(process.env.API_PORT)||3001,'2.0.0',`${os.type()} ${os.release()}`,os.cpus().length,+(os.totalmem()/(1024**3)).toFixed(2),'Active',1,now,now,now);

  console.log(`Primary site seeded (hostname: ${os.hostname()}, IP: ${localIp})`);
}

function closeDatabase() {
  if (db) { db.close(); db = null; }
}

module.exports = { getDb, initializeDatabase, closeDatabase };
