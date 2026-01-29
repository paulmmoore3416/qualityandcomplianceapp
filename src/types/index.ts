// ISO Standard References
export type ISOStandard =
  | 'ISO 13485:2016'
  | 'ISO 14971'
  | 'ISO 10993'
  | 'ISO 9001'
  | 'ISO 11135'
  | 'ISO 11137'
  | 'ISO 11607'
  | 'ISO 14644'
  | 'IEC 62304'
  | 'IEC 60601'
  | 'IEC 62366'
  | 'ISO 14155'
  | 'ISO 15223'
  | 'ISO 20417'
  | 'FDA 21 CFR 820'
  | 'EU MDR 2017/745';

export interface ISOMapping {
  standard: ISOStandard | string;
  clause: string;
  description: string;
}

// Risk Management Types (ISO 14971)
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type ProbabilityLevel = 1 | 2 | 3 | 4 | 5;
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskAssessment {
  id: string;
  metricId: string;
  hazardDescription: string;
  severity: SeverityLevel;
  probability: ProbabilityLevel;
  riskIndex: number;
  riskLevel: RiskLevel;
  mitigationRequired: boolean;
  mitigationPlan?: string;
  status: 'Open' | 'In Review' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

// Metric Categories
export type MetricCategory = 'Quality' | 'Compliance' | 'Operational' | 'Financial';

export interface Metric {
  id: string;
  name: string;
  shortName: string;
  category: MetricCategory;
  description: string;
  formula: string;
  unit: string;
  isoMappings: ISOMapping[];
  riskImpact: string;
  threshold: {
    green: number;
    yellow: number;
    red: number;
    direction: 'higher-better' | 'lower-better';
  };
  workaroundSuggestion: string;
}

export interface MetricValue {
  id: string;
  metricId: string;
  value: number;
  calculatedValue?: number;
  inputs: Record<string, number>;
  timestamp: Date;
  notes?: string;
  linkedRiskAssessments: string[];
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  isoClause: string;
  timestamp: Date;
  user: string;
}

// CAPA Types
export type CAPAType = 'Corrective' | 'Preventive';
export type CAPAStatus = 'Open' | 'In Progress' | 'Verification' | 'Closed' | 'Overdue';
export type CAPAPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CAPA {
  id: string;
  type: CAPAType;
  title: string;
  description: string;
  rootCause?: string;
  status: CAPAStatus;
  priority: CAPAPriority;
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  closedAt?: Date;
  linkedNCRs: string[];
  linkedRiskAssessments: string[];
  isoReferences: ISOMapping[];
  actions: CAPAAction[];
}

export interface CAPAAction {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  completedAt?: Date;
  status: 'Pending' | 'In Progress' | 'Completed';
  verificationRequired: boolean;
  verificationEvidence?: string;
}

// NCR Types
export type NCRType = 'Product' | 'Process' | 'Documentation' | 'Supplier';
export type NCRStatus = 'Open' | 'Under Investigation' | 'Pending CAPA' | 'Closed';

export interface NCR {
  id: string;
  type: NCRType;
  title: string;
  description: string;
  detectedAt: Date;
  lotNumber?: string;
  productCode?: string;
  quantity?: number;
  disposition: 'Rework' | 'Scrap' | 'Use As Is' | 'Return to Supplier' | 'Pending';
  status: NCRStatus;
  linkedCAPAs: string[];
  isoReferences: ISOMapping[];
  createdAt: Date;
  closedAt?: Date;
}

// Lifecycle Phases
export type LifecyclePhase = 'Design' | 'Verification' | 'Validation' | 'Production' | 'Post-Market';

export interface LifecycleRecord {
  id: string;
  phase: LifecyclePhase;
  productCode: string;
  isoFocus: ISOMapping[];
  keyMetrics: string[];
  riskManagementTasks: string[];
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
}

// Lot/Batch Information
export interface Lot {
  id: string;
  lotNumber: string;
  productCode: string;
  quantity: number;
  manufacturedDate: Date;
  status: 'In Process' | 'Quarantine' | 'Released' | 'Rejected' | 'Scrapped';
  fpy?: number;
  ncrs: string[];
  qualityRecords: QualityRecord[];
}

export interface QualityRecord {
  id: string;
  type: 'Inspection' | 'Test' | 'Verification' | 'Validation';
  result: 'Pass' | 'Fail' | 'Conditional';
  value?: number;
  specification?: string;
  notes?: string;
  performedAt: Date;
  performedBy: string;
}

// Dashboard Types
export interface DashboardMetric {
  metric: Metric;
  currentValue: MetricValue | null;
  trend: 'improving' | 'stable' | 'declining';
  status: 'green' | 'yellow' | 'red';
  changePercent?: number;
}

export interface ComplianceAlert {
  id: string;
  type: 'Warning' | 'Critical' | 'Info';
  title: string;
  message: string;
  isoReference?: ISOMapping;
  linkedEntityType?: 'Metric' | 'CAPA' | 'NCR' | 'Risk';
  linkedEntityId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Audit Mode Types
export interface AuditReport {
  id: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    metricId: string;
    values: MetricValue[];
    isoCompliance: {
      clause: string;
      status: 'Compliant' | 'Non-Compliant' | 'Needs Review';
      evidence: string;
    }[];
  }[];
  capaSummary: {
    total: number;
    closed: number;
    overdue: number;
    avgClosureTime: number;
  };
  ncrSummary: {
    total: number;
    byType: Record<NCRType, number>;
    dispositionBreakdown: Record<string, number>;
  };
  riskSummary: {
    totalAssessments: number;
    byLevel: Record<RiskLevel, number>;
    openMitigations: number;
  };
}

// Electron API Types
export interface ElectronAPI {
  saveData: (key: string, data: unknown) => Promise<{ success: boolean; error?: string }>;
  loadData: (key: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  exportReport: (content: string, filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;

  // AI API
  aiIsInstalled: () => Promise<boolean>;
  aiListModels: () => Promise<{ name: string; size?: string }[]>;
  aiPullModel: (modelName: string) => Promise<{ success: boolean; message?: string }>;
  aiRunPrompt: (opts: { model: string; prompt: string; temperature?: number; maxTokens?: number; timeoutMs?: number }) => Promise<{ success: boolean; output?: string; error?: string; mocked?: boolean }>;
  aiStartAgent: (agentId: string, scheduleMs: number) => Promise<{ success: boolean }>; 
  aiStopAgent: (agentId: string) => Promise<{ success: boolean }>;
  aiAgentStatus: (agentId: string) => Promise<{ status: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// ===============================
// VIGILANCE & POST-MARKET SURVEILLANCE
// ===============================

export type ComplaintSource = 'Customer' | 'Healthcare Provider' | 'Distributor' | 'Internal' | 'Regulatory';
export type ComplaintSeverity = 'Critical' | 'Major' | 'Minor' | 'Inquiry';
export type ComplaintStatus = 'New' | 'Under Investigation' | 'Pending CAPA' | 'Pending Regulatory' | 'Closed';

export interface Complaint {
  id: string;
  referenceNumber: string;
  source: ComplaintSource;
  severity: ComplaintSeverity;
  title: string;
  description: string;
  productCode: string;
  lotNumber?: string;
  udiNumber?: string;
  patientInvolved: boolean;
  injuryReported: boolean;
  deathReported: boolean;
  status: ComplaintStatus;
  receivedDate: Date;
  investigationDueDate?: Date;
  rootCause?: string;
  linkedCAPAs: string[];
  linkedAdverseEvents: string[];
  linkedHazardIds: string[];
  createdAt: Date;
  closedAt?: Date;
  auditTrail: AuditEntry[];
}

export type AdverseEventType = 'Serious Injury' | 'Death' | 'Malfunction' | 'Near Miss' | 'Use Error';
export type ReportingAuthority = 'FDA' | 'EMA' | 'Health Canada' | 'TGA' | 'PMDA' | 'Other';
export type ReportingStatus = 'Draft' | 'Pending Submission' | 'Submitted' | 'Acknowledged' | 'Closed';

export interface AdverseEvent {
  id: string;
  referenceNumber: string;
  type: AdverseEventType;
  description: string;
  eventDate: Date;
  reportedDate: Date;
  productCode: string;
  lotNumber?: string;
  udiNumber?: string;
  linkedComplaintId?: string;
  linkedHazardIds: string[];
  regulatorySubmissions: RegulatorySubmission[];
  status: 'Open' | 'Under Investigation' | 'Reported' | 'Closed';
  createdAt: Date;
}

export interface RegulatorySubmission {
  id: string;
  authority: ReportingAuthority;
  reportType: 'Initial' | 'Follow-up' | 'Final';
  dueDate: Date;
  submittedDate?: Date;
  submissionReference?: string;
  status: ReportingStatus;
  daysRemaining: number;
}

export interface FieldSafetyAction {
  id: string;
  type: 'Recall' | 'Safety Notice' | 'Advisory' | 'Correction';
  title: string;
  description: string;
  affectedProducts: string[];
  affectedLots: string[];
  initiatedDate: Date;
  completionTargetDate: Date;
  completedDate?: Date;
  status: 'Initiated' | 'In Progress' | 'Completed' | 'Closed';
  regulatoryNotifications: RegulatorySubmission[];
}

// ===============================
// SUPPLIER QUALITY MANAGEMENT
// ===============================

export type SupplierRiskLevel = 'Critical' | 'Major' | 'Minor';
export type SupplierStatus = 'Approved' | 'Conditional' | 'Pending Audit' | 'Disqualified' | 'On Hold';

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  category: 'Raw Material' | 'Component' | 'Service' | 'Contract Manufacturer' | 'Sterilization' | 'Calibration';
  riskLevel: SupplierRiskLevel;
  status: SupplierStatus;
  qualificationDate?: Date;
  lastAuditDate?: Date;
  nextAuditDue?: Date;
  certifications: SupplierCertification[];
  contactInfo: {
    address: string;
    contactName: string;
    email: string;
    phone: string;
  };
  products: string[];
  performanceScore?: number;
  openNCRs: number;
  openSCAPAs: number;
  createdAt: Date;
}

export interface SupplierCertification {
  id: string;
  type: 'ISO 13485' | 'ISO 9001' | 'ISO 14001' | 'AS9100' | 'IATF 16949' | 'Other';
  certificationNumber: string;
  issuedDate: Date;
  expiryDate: Date;
  certifyingBody: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface SupplierAudit {
  id: string;
  supplierId: string;
  type: 'Initial Qualification' | 'Surveillance' | 'For Cause' | 'Re-qualification';
  scheduledDate: Date;
  completedDate?: Date;
  auditor: string;
  findings: AuditFinding[];
  overallResult: 'Pass' | 'Conditional Pass' | 'Fail' | 'Pending';
  nextAuditRecommendation?: Date;
}

export interface AuditFinding {
  id: string;
  category: 'Major' | 'Minor' | 'Observation' | 'Opportunity';
  description: string;
  isoClause?: string;
  capaRequired: boolean;
  linkedCAPAId?: string;
  status: 'Open' | 'Closed';
}

// ===============================
// TRAINING & COMPETENCY
// ===============================

export type TrainingStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Expired';
export type TrainingType = 'Initial' | 'Refresher' | 'Role-specific' | 'Regulatory' | 'Equipment';

export interface TrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  trainingId: string;
  trainingTitle: string;
  trainingType: TrainingType;
  requiredBy: Date;
  completedDate?: Date;
  expiryDate?: Date;
  status: TrainingStatus;
  score?: number;
  passingScore?: number;
  trainerId?: string;
  verifiedBy?: string;
  verificationDate?: Date;
  certificateUrl?: string;
}

export interface TrainingCurriculum {
  id: string;
  title: string;
  description: string;
  type: TrainingType;
  isoReferences: ISOMapping[];
  applicableRoles: string[];
  applicableDepartments: string[];
  validityPeriod: number; // months
  passingScore: number;
  isActive: boolean;
}

export interface TrainingMatrix {
  department: string;
  role: string;
  requiredTrainings: string[];
  completionRate: number;
  overdueCount: number;
}

// ===============================
// CHANGE CONTROL (21 CFR Part 11)
// ===============================

export type ChangeType = 'Design' | 'Process' | 'Material' | 'Supplier' | 'Document' | 'Software' | 'Equipment';
export type ChangeClassification = 'Major' | 'Minor' | 'Administrative';
export type ChangeStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Implemented' | 'Closed';

export interface ChangeControl {
  id: string;
  referenceNumber: string;
  type: ChangeType;
  classification: ChangeClassification;
  title: string;
  description: string;
  justification: string;
  requestedBy: string;
  requestedDate: Date;

  // Impact Assessment
  impactAssessment: {
    safetyImpact: 'High' | 'Medium' | 'Low' | 'None';
    qualityImpact: 'High' | 'Medium' | 'Low' | 'None';
    regulatoryImpact: 'High' | 'Medium' | 'Low' | 'None';
    affectedDocuments: string[];
    affectedProducts: string[];
    affectedProcesses: string[];
    riskAssessmentRequired: boolean;
    validationRequired: boolean;
    regulatorySubmissionRequired: boolean;
  };

  // Linked entities
  linkedRiskAssessments: string[];
  linkedCAPAs: string[];
  linkedDocuments: string[];

  // Risk threshold breach (for automatic triggers)
  triggeredByRiskBreach?: {
    hazardId: string;
    designEstimate: number;
    actualRate: number;
    variance: number;
  };

  // Approval workflow
  approvals: ChangeApproval[];
  status: ChangeStatus;

  // Implementation
  implementationPlan?: string;
  implementedDate?: Date;
  verificationEvidence?: string;

  createdAt: Date;
  closedAt?: Date;
  auditTrail: AuditEntry[];
}

export interface ChangeApproval {
  id: string;
  role: 'Quality' | 'Engineering' | 'Regulatory' | 'Production' | 'Management';
  approverName: string;
  approverId: string;
  decision: 'Pending' | 'Approved' | 'Rejected' | 'Conditional';
  comments?: string;
  digitalSignature?: DigitalSignature;
  timestamp?: Date;
}

export interface DigitalSignature {
  userId: string;
  userName: string;
  meaning: string;
  timestamp: Date;
  signatureHash: string;
  ipAddress?: string;
}

// ===============================
// DOCUMENT CONTROL (eDMS)
// ===============================

export type DocumentType =
  | 'CAD Model'
  | 'Design History File'
  | 'Process Instruction'
  | 'Quality Manual'
  | 'SOP'
  | 'Work Instruction'
  | 'Specification'
  | 'Test Method'
  | 'Validation Protocol'
  | 'Risk Management File'
  | 'Technical File'
  | 'Regulatory Submission'
  | 'Training Material'
  | 'Audit Report'
  | 'Change Control'
  | 'CAPA'
  | 'NCR'
  | 'Supplier Qualification'
  | 'Equipment Qualification'
  | 'Software Validation'
  | 'Label'
  | 'Packaging'
  | 'Other';

export type FileFormat =
  | 'PDF'
  | 'DOC'
  | 'DOCX'
  | 'XLS'
  | 'XLSX'
  | 'PPT'
  | 'PPTX'
  | 'VSD'
  | 'VSDX'
  | 'DWG'
  | 'DXF'
  | 'STEP'
  | 'IGES'
  | 'STL'
  | 'PNG'
  | 'JPG'
  | 'SVG'
  | 'TXT'
  | 'XML'
  | 'JSON'
  | 'ZIP'
  | 'Other';

export type DocumentStatus = 'Draft' | 'In Review' | 'Approved' | 'Effective' | 'Obsolete' | 'Superseded';

export interface DocumentMetadata {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  type: DocumentType;
  format: FileFormat;
  revision: string;
  status: DocumentStatus;
  effectiveDate?: Date;
  reviewDate?: Date;
  expiryDate?: Date;
  author: string;
  reviewers: string[];
  approvers: string[];
  owner: string;
  department: string;
  tags?: string[];
  relatedProducts?: string[];
  isoReferences: ISOMapping[];
  linkedDocuments?: string[];
  linkedChangeControls?: string[];
  linkedTrainings?: string[];
  filePath: string;
  fileSize: number;
  checksum: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  accessControl: {
    isRestricted: boolean;
    allowedRoles: UserRole[];
    allowedUsers: string[];
    requiresAuthentication: boolean;
    viewPermissions: Permission[];
    editPermissions: Permission[];
    deletePermissions: Permission[];
    sharePermissions: Permission[];
  };
}

export interface ControlledDocument {
  id: string;
  documentNumber: string;
  title: string;
  type: DocumentType;
  version: string;
  revisionHistory: DocumentRevision[];
  status: DocumentStatus;
  effectiveDate?: Date;
  reviewDate?: Date;
  expiryDate?: Date;
  owner: string;
  department: string;
  isoReferences: ISOMapping[];
  linkedChangeControls: string[];
  linkedTrainings: string[];
  filePath?: string;
  createdAt: Date;
}

export interface DocumentRevision {
  version: string;
  date: Date;
  author: string;
  approver: string;
  changeDescription: string;
  digitalSignature?: DigitalSignature;
}

// ===============================
// UDI & LABELING COMPLIANCE
// ===============================

export interface UDIRecord {
  id: string;
  udiDI: string; // Device Identifier
  udiPI?: string; // Production Identifier
  productCode: string;
  productName: string;
  lotNumber?: string;
  serialNumber?: string;
  manufacturingDate?: Date;
  expirationDate?: Date;
  gudidSubmissionDate?: Date;
  gudidStatus: 'Pending' | 'Submitted' | 'Published' | 'Needs Update';
  labelingCompliance: LabelingCompliance;
}

export interface LabelingCompliance {
  id: string;
  productCode: string;
  iso15223Symbols: string[];
  iso20417Compliance: boolean;
  isoCountryCompliance: Record<string, boolean>;
  lastReviewDate: Date;
  nextReviewDate: Date;
  issues: LabelingIssue[];
}

export interface LabelingIssue {
  id: string;
  type: 'Missing Symbol' | 'Incorrect Translation' | 'Regulatory Update' | 'Format Issue';
  description: string;
  affectedMarkets: string[];
  status: 'Open' | 'In Progress' | 'Closed';
  dueDate: Date;
}

// ===============================
// SOFTWARE COMPLIANCE (IEC 62304)
// ===============================

export type SoftwareSafetyClass = 'A' | 'B' | 'C';

export interface SOUPComponent {
  id: string;
  name: string;
  version: string;
  vendor: string;
  license: string;
  purpose: string;
  safetyClass: SoftwareSafetyClass;
  lastSecurityReview: Date;
  knownVulnerabilities: Vulnerability[];
  riskAssessmentId?: string;
  anomalyListId?: string;
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  discoveredDate: Date;
  mitigationStatus: 'Open' | 'Mitigated' | 'Accepted' | 'Not Applicable';
  mitigationPlan?: string;
}

export interface CybersecurityLog {
  id: string;
  eventType: 'Access Attempt' | 'Configuration Change' | 'Vulnerability Scan' | 'Penetration Test' | 'Incident';
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  outcome: 'Success' | 'Failure' | 'Blocked';
  actionTaken?: string;
}

// ===============================
// ENHANCED RISK MANAGEMENT
// ===============================

export interface HazardRecord {
  id: string;
  hazardId: string;
  description: string;
  hazardousSituation: string;
  harm: string;
  initialSeverity: SeverityLevel;
  initialProbability: ProbabilityLevel;
  initialRiskLevel: RiskLevel;
  riskControls: RiskControl[];
  residualSeverity: SeverityLevel;
  residualProbability: ProbabilityLevel;
  residualRiskLevel: RiskLevel;
  benefitRiskAcceptable: boolean;
  realWorldOccurrenceRate?: number;
  designEstimateRate?: number;
  linkedComplaints: string[];
  linkedAdverseEvents: string[];
  status: 'Active' | 'Under Review' | 'Archived';
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export interface RiskControl {
  id: string;
  type: 'Inherent Safety' | 'Protective Measure' | 'Information for Safety';
  description: string;
  verificationMethod: string;
  verificationStatus: 'Pending' | 'Verified' | 'Failed';
  verificationDate?: Date;
  effectiveness: 'Effective' | 'Partially Effective' | 'Not Effective' | 'Not Verified';
}

// ===============================
// DASHBOARD EXTENSIONS
// ===============================

export interface VigilanceDashboard {
  openComplaints: number;
  criticalComplaints: number;
  pendingReports: RegulatorySubmission[];
  adverseEventsThisMonth: number;
  averageInvestigationTime: number;
  complaintTrend: { date: string; count: number }[];
}

export interface SupplierDashboard {
  totalSuppliers: number;
  criticalSuppliers: number;
  pendingAudits: number;
  expiredCertifications: number;
  openSCAPAs: number;
  supplierPerformanceAvg: number;
}

export interface TrainingDashboard {
  totalEmployees: number;
  overallComplianceRate: number;
  overdueTrainings: number;
  expiringThisMonth: number;
  departmentCompliance: { department: string; rate: number }[];
}

export interface ChangeControlDashboard {
  openChanges: number;
  pendingApprovals: number;
  implementedThisMonth: number;
  riskTriggeredChanges: number;
  averageApprovalTime: number;
}

// ===============================
// Authentication & User Management
// ===============================

export type UserRole = 'Admin' | 'QA Manager' | 'Engineer' | 'Auditor' | 'Viewer' | 'Guest' | 'Demo';

export type Permission =
  | 'view_dashboard'
  | 'view_metrics'
  | 'edit_metrics'
  | 'view_risk'
  | 'edit_risk'
  | 'view_capa'
  | 'edit_capa'
  | 'approve_capa'
  | 'view_ncr'
  | 'edit_ncr'
  | 'view_documents'
  | 'edit_documents'
  | 'delete_documents'
  | 'share_documents'
  | 'view_vigilance'
  | 'edit_vigilance'
  | 'view_suppliers'
  | 'edit_suppliers'
  | 'approve_suppliers'
  | 'view_training'
  | 'edit_training'
  | 'verify_training'
  | 'view_change_control'
  | 'edit_change_control'
  | 'approve_change_control'
  | 'sign_electronically'
  | 'view_audit_trail'
  | 'manage_users'
  | 'manage_roles'
  | 'system_settings'
  | 'export_data'
  | 'import_data';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: Permission[];
  department?: string;
  title?: string;
  phone?: string;
  status: 'Active' | 'Inactive' | 'Locked' | 'Pending';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  passwordLastChanged: Date;
  mustChangePassword: boolean;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}

export interface LoginAttempt {
  id: string;
  username: string;
  ipAddress: string;
  success: boolean;
  timestamp: Date;
  failureReason?: string;
}

export interface RoleDefinition {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isCustom: boolean;
}

// ===============================
// Enhanced Document Control (eDMS)
// ===============================

export type DocumentType =
  | 'Engineering Drawing'
  | 'CAD Model'
  | 'Visio Diagram'
  | 'Specification'
  | 'Test Report'
  | 'Risk Analysis'
  | 'Design History File'
  | 'SOP'
  | 'Work Instruction'
  | 'Validation Protocol'
  | 'Validation Report'
  | 'Technical File'
  | 'User Manual'
  | 'IFU'
  | 'Label Artwork'
  | 'Certificate'
  | 'Other';

export type FileFormat =
  | 'DWG'
  | 'DXF'
  | 'STEP'
  | 'IGES'
  | 'STL'
  | 'VSDX'
  | 'VSD'
  | 'PDF'
  | 'DOCX'
  | 'XLSX'
  | 'PPTX'
  | 'PNG'
  | 'JPG'
  | 'SVG'
  | 'Other';

export interface DocumentMetadata {
  id: string;
  documentNumber: string;
  title: string;
  description: string;
  type: DocumentType;
  format: FileFormat;
  revision: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Obsolete' | 'Superseded';
  effectiveDate?: Date;
  expirationDate?: Date;
  author: string;
  reviewers: string[];
  approvers: string[];
  owner: string;
  department: string;
  tags: string[];
  relatedProducts: string[];
  isoReferences: ISOMapping[];
  linkedDocuments: string[];
  linkedChangeControls: string[];
  filePath: string;
  fileSize: number;
  checksum: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  accessControl: DocumentAccessControl;
}

export interface DocumentAccessControl {
  isRestricted: boolean;
  allowedRoles: UserRole[];
  allowedUsers: string[];
  requiresAuthentication: boolean;
  viewPermissions: string[];
  editPermissions: string[];
  deletePermissions: string[];
  sharePermissions: string[];
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  revision: string;
  revisionDate: Date;
  revisedBy: string;
  changeDescription: string;
  changeControlRef?: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  approvals: DocumentApproval[];
}

export interface DocumentApproval {
  id: string;
  documentId: string;
  approverUserId: string;
  approverName: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  timestamp: Date;
  digitalSignature?: DigitalSignature;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  sharedBy: string;
  sharedWith: string[];
  shareType: 'View' | 'Edit' | 'Download';
  expiresAt?: Date;
  message?: string;
  createdAt: Date;
}

export interface DocumentConversion {
  id: string;
  sourceDocumentId: string;
  sourceFormat: FileFormat;
  targetFormat: FileFormat;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  outputFilePath?: string;
  errorMessage?: string;
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
}

export interface CADDrawingMetadata {
  drawingNumber: string;
  drawingTitle: string;
  scale: string;
  units: 'mm' | 'in' | 'cm';
  materialSpec?: string;
  surfaceFinish?: string;
  tolerances: { type: string; value: string }[];
  layers: string[];
  blocks: string[];
  dimensions: { width: number; height: number; depth?: number };
}

export interface VisioMetadata {
  templateName: string;
  pageCount: number;
  diagramType: string;
  connectors: number;
  shapes: number;
}

// ===============================
// AI Agent Infrastructure
// ===============================

export type AgentType = 'Vigilance Watchman' | 'Audit-Ready RAG' | 'Risk Predictor';
export type AgentStatus = 'Idle' | 'Running' | 'Paused' | 'Error' | 'Stopped';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  version: string;
  description: string;
  lastRun?: Date;
  nextScheduledRun?: Date;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  configuration: AgentConfiguration;
  metrics: AgentMetrics;
}

export interface AgentConfiguration {
  enabled: boolean;
  autoRun: boolean;
  schedule?: string;
  maxConcurrentTasks: number;
  timeout: number;
  retryAttempts: number;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  isLocalDeployment: boolean;
  endpoint?: string;
  // Vigilance Watchman specific
  autoGenerateChangeControl?: boolean;
  riskThreshold?: 'critical' | 'high' | 'medium';
  // Risk Predictor specific
  predictionSensitivity?: 'low' | 'medium' | 'high';
  lookbackHours?: number;
  // RAG specific
  knowledgeBasePath?: string;
  maxContextLength?: number;
  includeAuditTrail?: boolean;
}

export interface AgentMetrics {
  tasksProcessed: number;
  tasksQueued: number;
  tasksFailed: number;
  averageResponseTime: number;
  hallucinationDetections: number;
  confidenceScores: number[];
}

export interface VigilanceWatchmanTask {
  id: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  sourceType: 'Email' | 'PDF' | 'Manual Entry' | 'Web Form';
  sourceData: string;
  extractedComplaint?: Complaint;
  extractedHazards: string[];
  linkedRiskIds: string[];
  generatedChangeControlId?: string;
  confidence: number;
  processingTime: number;
  warnings: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface AuditRAGQuery {
  id: string;
  query: string;
  userId: string;
  response: string;
  sources: string[];
  confidence: number;
  isoReferences: ISOMapping[];
  relatedDocuments: string[];
  processingTime: number;
  timestamp: Date;
}

export interface RiskPrediction {
  id: string;
  predictionType: 'Quality Escape' | 'Compliance Drift' | 'Performance Decline' | 'Threshold Breach';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  affectedMetrics: string[];
  triggerData: { metricId: string; currentValue: number; threshold: number; trend: string }[];
  recommendedActions: string[];
  autoGeneratedChangeControl: boolean;
  changeControlId?: string;
  createdAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AISecurityAudit {
  id: string;
  agentType: AgentType;
  taskId: string;
  hallucinationDetected: boolean;
  hallucinationDetails?: string;
  isoComplianceCheck: boolean;
  isoComplianceIssues: string[];
  dataIntegrityCheck: boolean;
  dataIntegrityIssues: string[];
  confidenceScore: number;
  auditResult: 'Pass' | 'Warning' | 'Fail';
  timestamp: Date;
}

// ===============================
// Admin Dashboard
// ===============================

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  lockedAccounts: number;
  pendingApprovals: number;
  systemHealth: 'Healthy' | 'Warning' | 'Critical';
  aiAgentsRunning: number;
  storageUsed: number;
  storageLimit: number;
  recentActivity: AuditEntry[];
  securityAlerts: SecurityAlert[];
}

export interface SecurityAlert {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Failed Login' | 'Unauthorized Access' | 'Data Export' | 'AI Hallucination' | 'System Error';
  description: string;
  userId?: string;
  ipAddress?: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}
