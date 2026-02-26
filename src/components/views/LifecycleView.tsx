import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import {
  Plus, GitBranch, CheckCircle, ArrowRight, X,
  FileText, Shield, AlertTriangle, BookOpen,
  ClipboardList, Download, ExternalLink, ChevronRight,
  Activity, Layers, Code, Flag,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { LifecyclePhase } from '../../types';
import { getLifecycleMetrics } from '../../lib/compliance-engine';
import { METRICS_CONFIG } from '../../data/metrics-config';

const LIFECYCLE_PHASES: { phase: LifecyclePhase; isoFocus: string; description: string }[] = [
  { phase: 'Design', isoFocus: 'ISO 13485:7.3', description: 'Design and development planning, inputs, outputs, review, verification' },
  { phase: 'Verification', isoFocus: 'ISO 13485:7.3.6', description: 'Design and development verification to ensure outputs meet inputs' },
  { phase: 'Validation', isoFocus: 'ISO 13485:7.3.7', description: 'Design and development validation under defined operating conditions' },
  { phase: 'Production', isoFocus: 'ISO 13485:7.5', description: 'Production and service provision, process validation, identification' },
  { phase: 'Post-Market', isoFocus: 'ISO 13485:8.2.1', description: 'Feedback, complaint handling, vigilance, post-market surveillance' },
];

type FrameworkId = 'fda-820' | 'eu-mdr' | 'iec-62304';

interface FrameworkSection {
  ref: string;
  title: string;
  description: string;
  complianceStatus: 'Compliant' | 'Review Required' | 'N/A';
}

interface RegulatoryFramework {
  id: FrameworkId;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  overview: string;
  effectiveDate: string;
  applicability: string;
  sections: FrameworkSection[];
  actions: { label: string; description: string; icon: React.ComponentType<{ className?: string }> }[];
  keyRequirements: string[];
}

const FRAMEWORKS: RegulatoryFramework[] = [
  {
    id: 'fda-820',
    title: 'FDA 21 CFR Part 820',
    subtitle: 'US Quality System Regulation',
    badge: 'FDA / USA',
    icon: Flag,
    overview:
      'Title 21 Code of Federal Regulations Part 820 establishes the Current Good Manufacturing Practice (CGMP) requirements for medical devices. It applies to manufacturers of devices intended for commercial distribution in the United States.',
    effectiveDate: 'Effective: June 1, 1997 (updated via QMSR alignment with ISO 13485)',
    applicability: 'All Class I, II, and III medical device manufacturers distributing in the US',
    sections: [
      { ref: '820.20', title: 'Management Responsibility', description: 'Quality policy, organization, management review, and quality planning requirements.', complianceStatus: 'Compliant' },
      { ref: '820.22', title: 'Quality Audit', description: 'Establish and implement quality audit procedures per written procedures.', complianceStatus: 'Compliant' },
      { ref: '820.30', title: 'Design Controls', description: 'Design and development planning, inputs, outputs, review, verification, validation, changes, and transfer.', complianceStatus: 'Compliant' },
      { ref: '820.50', title: 'Purchasing Controls', description: 'Evaluate and select suppliers, contractors, and consultants on the ability to meet specified requirements.', complianceStatus: 'Review Required' },
      { ref: '820.70', title: 'Production & Process Controls', description: 'Develop, conduct, control, and monitor production processes to ensure conformance to specifications.', complianceStatus: 'Compliant' },
      { ref: '820.80', title: 'Acceptance Activities', description: 'Incoming, in-process, and finished device acceptance procedures with records.', complianceStatus: 'Compliant' },
      { ref: '820.100', title: 'Corrective & Preventive Action', description: 'Establish and maintain procedures for implementing CAPA activities.', complianceStatus: 'Compliant' },
      { ref: '820.120', title: 'Device Labeling', description: 'Label integrity, inspection, storage, operations, and control procedures.', complianceStatus: 'Compliant' },
      { ref: '820.180', title: 'General Requirements — Records', description: 'Records must be legible, stored to minimize deterioration, accessible for review by FDA.', complianceStatus: 'Compliant' },
      { ref: '820.184', title: 'Device History Record', description: 'Maintain DHR for each device or batch demonstrating device manufactured per DMR.', complianceStatus: 'Compliant' },
      { ref: '820.198', title: 'Complaint Files', description: 'Establish and maintain procedures for receiving, reviewing, and evaluating complaints.', complianceStatus: 'Compliant' },
    ],
    keyRequirements: [
      'Documented Quality System with Management Review',
      'Design Controls with formal V&V activities',
      'CAPA system with root cause analysis',
      'Device History Record for every lot/batch',
      'Complaint Handling and MDR reporting procedures',
      'Supplier qualification and monitoring program',
      '21 CFR Part 11 for electronic records and signatures',
    ],
    actions: [
      { label: 'View Design Controls Checklist', description: 'Open 820.30 compliance checklist', icon: ClipboardList },
      { label: 'Review CAPA Compliance', description: 'Check 820.100 CAPA records', icon: Activity },
      { label: 'Export FDA Readiness Report', description: 'Generate FDA inspection summary', icon: Download },
      { label: 'View Complaint File Status', description: 'Review 820.198 complaint records', icon: FileText },
    ],
  },
  {
    id: 'eu-mdr',
    title: 'EU MDR 2017/745',
    subtitle: 'European Medical Device Regulation',
    badge: 'CE / EU',
    icon: Shield,
    overview:
      'Regulation (EU) 2017/745 on medical devices replaces Council Directives 90/385/EEC and 93/42/EEC. It introduces stricter requirements for clinical evidence, post-market surveillance, and UDI, with full application from May 26, 2021.',
    effectiveDate: 'Date of application: May 26, 2021 (transitional periods per device class)',
    applicability: 'Manufacturers placing medical devices on the EU market, including Class I–III and IVDs',
    sections: [
      { ref: 'Article 10', title: 'General Obligations of Manufacturers', description: 'QMS, technical documentation, EU authorized representative, post-market surveillance, and UDI assignment.', complianceStatus: 'Compliant' },
      { ref: 'Annex I', title: 'General Safety & Performance Requirements (GSPR)', description: 'Chemical, physical, biological, and electrical safety; usability; labeling; information supplied.', complianceStatus: 'Review Required' },
      { ref: 'Annex II', title: 'Technical Documentation', description: 'Device description, design information, manufacturing information, GSPR references, benefit-risk analysis.', complianceStatus: 'Compliant' },
      { ref: 'Annex III', title: 'Post-Market Surveillance Documentation', description: 'PMS plan, PSUR (periodic safety update report), and post-market clinical follow-up plan.', complianceStatus: 'Review Required' },
      { ref: 'Annex IX', title: 'Conformity Assessment — QMS & TD', description: 'Quality management system assessment and technical documentation assessment by Notified Body.', complianceStatus: 'Compliant' },
      { ref: 'Annex XIV', title: 'Clinical Evaluation & PMCF', description: 'Clinical evaluation report (CER) requirements and post-market clinical follow-up procedures.', complianceStatus: 'Compliant' },
      { ref: 'Article 83', title: 'Post-Market Surveillance System', description: 'Manufacturers must establish, document, implement, and maintain a PMS system.', complianceStatus: 'Compliant' },
      { ref: 'Article 87', title: 'Reporting of Serious Incidents', description: 'Report serious incidents and field safety corrective actions to competent authorities.', complianceStatus: 'Compliant' },
      { ref: 'Article 123', title: 'UDI System', description: 'Unique Device Identification assignment, EUDAMED registration, and UDI-DI/PI requirements.', complianceStatus: 'Compliant' },
    ],
    keyRequirements: [
      'Technical Documentation per Annex II & III',
      'Clinical Evaluation Report (CER) with sufficient clinical data',
      'Post-Market Surveillance Plan and PSUR',
      'GSPR compliance demonstration (Annex I)',
      'UDI assignment and EUDAMED registration',
      'Notified Body certification for Class IIa, IIb, III',
      'EU Authorized Representative (for non-EU manufacturers)',
      'Serious Incident Reporting within 15 days (serious) / 2 days (death)',
    ],
    actions: [
      { label: 'View GSPR Checklist', description: 'Review Annex I compliance status', icon: ClipboardList },
      { label: 'Review Technical Documentation', description: 'Check Annex II completeness', icon: Layers },
      { label: 'PMS & PSUR Status', description: 'Review post-market surveillance records', icon: Activity },
      { label: 'Export MDR Compliance Report', description: 'Generate CE marking summary', icon: Download },
    ],
  },
  {
    id: 'iec-62304',
    title: 'IEC 62304:2006+A1:2015',
    subtitle: 'Medical Device Software Lifecycle',
    badge: 'Software',
    icon: Code,
    overview:
      'IEC 62304 defines lifecycle requirements for medical device software and software within medical devices. It specifies processes, activities, and tasks for the development and maintenance of medical device software, scaled by software safety class.',
    effectiveDate: 'Published: 2006, Amendment 1: 2015. Widely adopted globally including FDA, EU MDR, and Health Canada.',
    applicability: 'All software that is itself a medical device (SaMD) or embedded software in medical devices',
    sections: [
      { ref: 'Clause 4', title: 'General Requirements', description: 'Quality management system, risk management, and software safety classification (Class A, B, C).', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.1', title: 'Software Development Planning', description: 'Develop and document a software development plan covering activities, standards, tools, and resources.', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.2', title: 'Software Requirements Analysis', description: 'Define and document functional/non-functional requirements including safety and security requirements.', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.3', title: 'Software Architectural Design', description: 'Transform requirements into an architecture identifying software items and their interfaces.', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.4', title: 'Software Detailed Design', description: 'Refine the software architecture until software units can be implemented (Class B & C only).', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.5', title: 'Software Unit Implementation & Verification', description: 'Implement each software unit and verify that it meets its detailed design.', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.6', title: 'Software Integration & Integration Testing', description: 'Integrate software items per the integration plan and verify integrated items.', complianceStatus: 'Compliant' },
      { ref: 'Clause 5.7', title: 'Software System Testing', description: 'Verify that the integrated software meets its requirements using a defined test plan.', complianceStatus: 'Review Required' },
      { ref: 'Clause 6', title: 'Software Maintenance Process', description: 'Establish and document a software maintenance plan; manage changes via change control.', complianceStatus: 'Compliant' },
      { ref: 'Clause 7', title: 'Software Risk Management', description: 'Implement risk management activities from ISO 14971 throughout the software lifecycle.', complianceStatus: 'Compliant' },
      { ref: 'Clause 8', title: 'Software Configuration Management', description: 'Identify, control, track, and report software configuration items throughout the lifecycle.', complianceStatus: 'Compliant' },
      { ref: 'Clause 9', title: 'Software Problem Resolution', description: 'Establish a process to identify, analyze, and resolve software problems.', complianceStatus: 'Compliant' },
    ],
    keyRequirements: [
      'Software Safety Classification: A (no injury), B (non-serious injury), C (death/serious injury)',
      'Software Development Plan with defined lifecycle model',
      'Traceable Software Requirements (functional, non-functional, safety)',
      'Architectural Design with SOUP (Software of Unknown Provenance) list',
      'Unit verification, integration testing, system testing evidence',
      'Configuration Management with version control',
      'Problem Resolution Process and anomaly list',
      'Software Risk Management integrated with ISO 14971',
      'Regression testing strategy for all changes',
    ],
    actions: [
      { label: 'Classify Software Safety', description: 'Determine Class A / B / C per risk analysis', icon: Layers },
      { label: 'Review SOUP List', description: 'Manage third-party software components', icon: BookOpen },
      { label: 'View Anomaly List', description: 'Check open software problem reports', icon: AlertTriangle },
      { label: 'Export Software Documentation Plan', description: 'Generate IEC 62304 document set summary', icon: Download },
    ],
  },
];

export default function LifecycleView() {
  const { lifecycleRecords } = useAppStore();

  const [selectedPhase, setSelectedPhase] = useState<LifecyclePhase>('Production');
  const [openFramework, setOpenFramework] = useState<FrameworkId | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'sections' | 'actions'>('overview');

  const phaseMetricIds = getLifecycleMetrics(selectedPhase);
  const phaseMetrics = METRICS_CONFIG.filter((m) => phaseMetricIds.includes(m.id));
  const activeRecords = lifecycleRecords.filter((r) => r.status === 'Active');
  const framework = FRAMEWORKS.find((f) => f.id === openFramework) ?? null;

  const statusColor = (s: FrameworkSection['complianceStatus']) => {
    if (s === 'Compliant') return 'bg-green-100 text-green-700';
    if (s === 'Review Required') return 'bg-yellow-100 text-yellow-700';
    return 'bg-surface-100 text-gray-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lifecycle Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Product lifecycle tracking per ISO 13485:2016 and ISO 14971
          </p>
        </div>
        <button type="button" className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Lifecycle Flow */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Device Lifecycle Phases</h3>
        <div className="flex items-center justify-between">
          {LIFECYCLE_PHASES.map((item, index) => (
            <div key={item.phase} className="flex items-center">
              <button
                type="button"
                onClick={() => setSelectedPhase(item.phase)}
                className={cn(
                  'flex flex-col items-center p-4 rounded-lg transition-all duration-200',
                  selectedPhase === item.phase ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-surface-100'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  selectedPhase === item.phase ? 'bg-primary-600 text-white' : 'bg-surface-200 text-gray-600'
                )}>
                  <GitBranch className="w-6 h-6" />
                </div>
                <p className={cn('font-medium text-sm', selectedPhase === item.phase ? 'text-primary-700' : 'text-gray-700')}>
                  {item.phase}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.isoFocus}</p>
              </button>
              {index < LIFECYCLE_PHASES.length - 1 && <ArrowRight className="w-6 h-6 text-gray-300 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Phase Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedPhase} Phase</h3>

          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-primary-800">
              {LIFECYCLE_PHASES.find((p) => p.phase === selectedPhase)?.isoFocus}
            </p>
            <p className="text-sm text-primary-600 mt-1">
              {LIFECYCLE_PHASES.find((p) => p.phase === selectedPhase)?.description}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Metrics</h4>
            <div className="space-y-2">
              {phaseMetrics.length > 0 ? (
                phaseMetrics.map((metric) => (
                  <div key={metric.id} className="p-3 bg-surface-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{metric.shortName}</p>
                        <p className="text-xs text-gray-500">{metric.name}</p>
                      </div>
                      <span className="text-xs text-primary-600 font-medium">
                        {metric.isoMappings[0]?.clause}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No specific metrics for this phase</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">ISO 14971 Risk Management Tasks</h4>
            <div className="space-y-2">
              {selectedPhase === 'Design' && (
                <>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Hazard identification (5.4)</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Risk estimation (5.5)</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Risk evaluation (6)</span></div>
                </>
              )}
              {selectedPhase === 'Verification' && (
                <>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Risk control implementation (7.2)</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Residual risk evaluation (7.3)</span></div>
                </>
              )}
              {selectedPhase === 'Validation' && (
                <>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Benefit-risk analysis (7.4)</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Overall residual risk (8)</span></div>
                </>
              )}
              {selectedPhase === 'Production' && (
                <>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Production information collection (10)</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Risk management review (9)</span></div>
                </>
              )}
              {selectedPhase === 'Post-Market' && (
                <>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Post-production information review (10)</span></div>
                  <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /><span>Risk management file update (4.5)</span></div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Products</h3>
          {activeRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No active products in lifecycle tracking</p>
              <button type="button" className="btn-primary btn-sm mt-4">Add Product</button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecords.map((record) => (
                <div key={record.id} className="p-4 bg-surface-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{record.productCode}</p>
                      <p className="text-sm text-gray-500">Phase: {record.phase}</p>
                    </div>
                    <span className={cn(
                      'badge',
                      record.status === 'Active' && 'badge-green',
                      record.status === 'Completed' && 'badge-blue',
                      record.status === 'On Hold' && 'badge-yellow'
                    )}>
                      {record.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>Started: {formatDate(record.startDate)}</span>
                    {record.targetEndDate && <span>Target: {formatDate(record.targetEndDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Framework Reference — clickable cards */}
      <div className="card bg-surface-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Applicable Regulatory Frameworks</h3>
        <p className="text-sm text-gray-500 mb-4">Click any framework to view detailed requirements, sections, and available actions.</p>
        <div className="grid grid-cols-3 gap-4">
          {FRAMEWORKS.map((fw) => {
            const Icon = fw.icon;
            return (
              <button
                key={fw.id}
                type="button"
                onClick={() => { setOpenFramework(fw.id); setActiveSection('overview'); }}
                className="p-4 bg-white rounded-lg border border-surface-200 text-left hover:border-primary-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-[10px] font-semibold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                    {fw.badge}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mt-2">{fw.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{fw.subtitle}</p>
                <p className="text-xs text-primary-600 mt-2 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  {fw.id === 'fda-820' && 'Subpart C — Design Controls (820.30)'}
                  {fw.id === 'eu-mdr' && 'Annex II — Technical Documentation'}
                  {fw.id === 'iec-62304' && 'Software safety classification'}
                  <ChevronRight className="w-3 h-3" />
                </p>
                <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-gray-400">
                  <span>{fw.sections.filter(s => s.complianceStatus === 'Compliant').length}/{fw.sections.length} sections compliant</span>
                  <span className="text-primary-500 font-medium group-hover:underline">View details →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Framework Detail Modal */}
      {framework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <framework.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{framework.title}</h2>
                    <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      {framework.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{framework.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenFramework(null)}
                aria-label="Close"
                className="btn-ghost p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b flex-shrink-0 px-6">
              {(['overview', 'sections', 'actions'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSection(tab)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-colors',
                    activeSection === tab
                      ? 'border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab === 'sections' ? `Clauses & Sections (${framework.sections.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Overview Tab */}
              {activeSection === 'overview' && (
                <div className="space-y-5">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-sm text-primary-800 leading-relaxed">{framework.overview}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Applicability</p>
                      <p className="text-sm text-gray-700">{framework.effectiveDate}</p>
                    </div>
                    <div className="bg-surface-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Scope</p>
                      <p className="text-sm text-gray-700">{framework.applicability}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                      Key Requirements
                    </h4>
                    <div className="space-y-2">
                      {framework.keyRequirements.map((req, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <ChevronRight className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Summary */}
                  <div className="border border-surface-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Compliance Summary</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-700">
                          {framework.sections.filter(s => s.complianceStatus === 'Compliant').length}
                        </p>
                        <p className="text-xs text-green-600 mt-1">Compliant</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-700">
                          {framework.sections.filter(s => s.complianceStatus === 'Review Required').length}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">Review Required</p>
                      </div>
                      <div className="text-center p-3 bg-surface-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-700">
                          {framework.sections.filter(s => s.complianceStatus === 'N/A').length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Not Applicable</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections/Clauses Tab */}
              {activeSection === 'sections' && (
                <div className="space-y-3">
                  {framework.sections.map((sec) => (
                    <div
                      key={sec.ref}
                      className="flex items-start gap-4 p-4 bg-surface-50 rounded-lg border border-surface-200"
                    >
                      <div className="flex-shrink-0">
                        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-mono font-bold px-2.5 py-1 rounded">
                          {sec.ref}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{sec.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sec.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusColor(sec.complianceStatus))}>
                          {sec.complianceStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions Tab */}
              {activeSection === 'actions' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Available actions and workflows related to {framework.title} compliance.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {framework.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => alert(`${action.label}\n\n${action.description}\n\n(Feature coming soon — integrate with your ${framework.title} compliance records)`)}
                          className="flex items-start gap-4 p-4 bg-surface-50 border border-surface-200 rounded-lg text-left hover:border-primary-400 hover:bg-primary-50 transition-all group"
                        >
                          <div className="w-10 h-10 bg-white border border-surface-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 group-hover:border-primary-300 transition-all">
                            <ActionIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{action.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 ml-auto flex-shrink-0 mt-1" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-xs text-blue-700">
                      <strong>{framework.title}</strong> compliance records are maintained throughout the quality management system.
                      Use the CAPA, Change Control, and Document modules to link specific compliance activities to this framework.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-surface-50 flex-shrink-0">
              <div className="text-xs text-gray-400">
                {framework.sections.filter(s => s.complianceStatus === 'Compliant').length} of {framework.sections.length} sections compliant
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => alert(`Exporting ${framework.title} compliance report...`)}
                  className="btn-secondary btn-sm gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <button
                  type="button"
                  onClick={() => setOpenFramework(null)}
                  className="btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
