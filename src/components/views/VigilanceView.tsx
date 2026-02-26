import { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  Clock,
  FileWarning,
  Users,
  Activity,
  Bell,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  X,
  Link2,
  Shield,
  FileText,
  Siren,
} from 'lucide-react';
import { cn, formatDate, isOverdue } from '../../lib/utils';
import {
  Complaint,
  RegulatorySubmission,
  ComplaintSeverity,
  ComplaintStatus,
} from '../../types';
import { useAppStore } from '../../stores/app-store';
import { useAuthStore } from '../../stores/auth-store';
import ComplaintModal from '../modals/ComplaintModal';

// Sample data for demonstration
const sampleComplaints: Complaint[] = [
  {
    id: '1',
    referenceNumber: 'CMP-2026-0042',
    source: 'Healthcare Provider',
    severity: 'Critical',
    title: 'Device overheating during use',
    description: 'Physician reported device became unusually hot during a procedure',
    productCode: 'MDV-1000',
    lotNumber: 'LOT-2026-0128',
    patientInvolved: true,
    injuryReported: false,
    deathReported: false,
    status: 'Under Investigation',
    receivedDate: new Date('2026-01-25'),
    investigationDueDate: new Date('2026-02-08'),
    linkedCAPAs: [],
    linkedAdverseEvents: [],
    linkedHazardIds: ['H-04'],
    createdAt: new Date('2026-01-25'),
    auditTrail: [],
  },
  {
    id: '2',
    referenceNumber: 'CMP-2026-0041',
    source: 'Customer',
    severity: 'Minor',
    title: 'Packaging damaged on arrival',
    description: 'Customer received product with dented outer packaging, inner sterile barrier intact',
    productCode: 'MDV-2000',
    lotNumber: 'LOT-2026-0115',
    patientInvolved: false,
    injuryReported: false,
    deathReported: false,
    status: 'Closed',
    receivedDate: new Date('2026-01-20'),
    linkedCAPAs: [],
    linkedAdverseEvents: [],
    linkedHazardIds: [],
    createdAt: new Date('2026-01-20'),
    closedAt: new Date('2026-01-22'),
    auditTrail: [],
  },
];

const sampleSubmissions: RegulatorySubmission[] = [
  {
    id: '1',
    authority: 'FDA',
    reportType: 'Initial',
    dueDate: new Date('2026-02-05'),
    status: 'Pending Submission',
    daysRemaining: 8,
  },
  {
    id: '2',
    authority: 'EMA',
    reportType: 'Initial',
    dueDate: new Date('2026-02-10'),
    status: 'Draft',
    daysRemaining: 13,
  },
];

const EXISTING_CAPAS = [
  { id: 'CAPA-2026-001', title: 'Battery thermal hazard root cause investigation', status: 'In Progress' },
  { id: 'CAPA-2026-002', title: 'Packaging supplier qualification review', status: 'Open' },
  { id: 'CAPA-2025-089', title: 'Sterilization cycle deviation corrective action', status: 'Verification' },
];

type ActiveModal =
  | { type: 'investigate'; complaint: Complaint }
  | { type: 'link-capa'; complaint: Complaint }
  | { type: 'adverse-event'; complaint: Complaint | null }
  | { type: 'regulatory-report'; complaint: Complaint | null }
  | { type: 'fsca' }
  | null;

export default function VigilanceView() {
  const { addReportEntry } = useAppStore();
  const { currentUser } = useAuthStore();
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'complaints' | 'adverse' | 'fsca' | 'pms'>('complaints');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<ComplaintSeverity | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Investigation form state
  const [investigator, setInvestigator] = useState('');
  const [investigationDueDate, setInvestigationDueDate] = useState('');
  const [investigationNotes, setInvestigationNotes] = useState('');

  // Link to CAPA state
  const [selectedCAPAId, setSelectedCAPAId] = useState('');
  const [createNewCAPA, setCreateNewCAPA] = useState(false);
  const [newCAPATitle, setNewCAPATitle] = useState('');

  // Adverse Event form state
  const [adverseEventType, setAdverseEventType] = useState('Serious Adverse Event');
  const [adverseEventAuthority, setAdverseEventAuthority] = useState('FDA');
  const [adverseEventDescription, setAdverseEventDescription] = useState('');
  const [patientOutcome, setPatientOutcome] = useState('Recovered');

  // Regulatory Report form state
  const [reportAuthority, setReportAuthority] = useState('FDA');
  const [reportType, setReportType] = useState('Initial');
  const [reportDeadline, setReportDeadline] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  // FSCA form state
  const [fscaType, setFscaType] = useState('Safety Notice');
  const [fscaScope, setFscaScope] = useState('');
  const [fscaAffectedLots, setFscaAffectedLots] = useState('');
  const [fscaDescription, setFscaDescription] = useState('');

  const complaints = sampleComplaints;
  const pendingSubmissions = sampleSubmissions;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: ComplaintSeverity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Major': return 'bg-orange-100 text-orange-700';
      case 'Minor': return 'bg-yellow-100 text-yellow-700';
      case 'Inquiry': return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'New': return 'bg-purple-100 text-purple-700';
      case 'Under Investigation': return 'bg-blue-100 text-blue-700';
      case 'Pending CAPA': return 'bg-yellow-100 text-yellow-700';
      case 'Pending Regulatory': return 'bg-orange-100 text-orange-700';
      case 'Closed': return 'bg-green-100 text-green-700';
    }
  };

  const stats = {
    totalComplaints: complaints.length,
    openComplaints: complaints.filter((c) => c.status !== 'Closed').length,
    criticalOpen: complaints.filter((c) => c.severity === 'Critical' && c.status !== 'Closed').length,
    pendingReports: pendingSubmissions.filter((s) => s.status !== 'Submitted').length,
    urgentReports: pendingSubmissions.filter((s) => s.daysRemaining <= 7).length,
  };

  const closeModal = () => {
    setActiveModal(null);
    setInvestigator('');
    setInvestigationDueDate('');
    setInvestigationNotes('');
    setSelectedCAPAId('');
    setCreateNewCAPA(false);
    setNewCAPATitle('');
    setAdverseEventDescription('');
    setReportDescription('');
    setFscaScope('');
    setFscaAffectedLots('');
    setFscaDescription('');
  };

  const handleInvestigateSubmit = () => {
    const ref = activeModal && 'complaint' in activeModal ? (activeModal.complaint?.referenceNumber ?? '') : '';
    alert(`Investigation initiated for ${ref}\nInvestigator: ${investigator}\nDue: ${investigationDueDate}`);
    closeModal();
  };

  const handleLinkCAPASubmit = () => {
    const complaint = activeModal && 'complaint' in activeModal ? activeModal.complaint : null;
    if (createNewCAPA && newCAPATitle) {
      alert(`New CAPA created: "${newCAPATitle}"\nLinked to complaint: ${complaint?.referenceNumber}`);
    } else if (selectedCAPAId) {
      const capa = EXISTING_CAPAS.find((c) => c.id === selectedCAPAId);
      alert(`Complaint ${complaint?.referenceNumber} linked to ${capa?.id}: ${capa?.title}`);
    }
    closeModal();
  };

  const handleAdverseEventSubmit = () => {
    const refNum = activeModal && 'complaint' in activeModal && activeModal.complaint
      ? activeModal.complaint.referenceNumber : 'N/A';
    alert(`Adverse Event Report created\nType: ${adverseEventType}\nAuthority: ${adverseEventAuthority}\nLinked complaint: ${refNum}`);
    closeModal();
  };

  const handleRegulatoryReportSubmit = () => {
    const complaint = activeModal && 'complaint' in activeModal ? activeModal.complaint : null;
    addReportEntry({
      title: reportDescription || `Regulatory ${reportType} Report`,
      category: 'Regulatory Report',
      section: 'Vigilance',
      status: 'Pending Submission',
      createdBy: currentUser?.fullName || currentUser?.username || 'Unknown User',
      authority: reportAuthority,
      reportType,
      dueDate: reportDeadline ? new Date(reportDeadline) : undefined,
      summary: complaint
        ? `${complaint.referenceNumber} • ${complaint.title}`
        : reportDescription || 'Regulatory reporting initiated',
    });
    alert(`Regulatory Report initiated\nAuthority: ${reportAuthority}\nType: ${reportType} Report\nDeadline: ${reportDeadline}`);
    closeModal();
  };

  const handleFSCASubmit = () => {
    alert(`FSCA Initiated\nType: ${fscaType}\nAffected lots: ${fscaAffectedLots}`);
    closeModal();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Vigilance & Post-Market Surveillance</h2>
          <p className="text-sm text-gray-500 mt-1">
            Per ISO 13485:8.2.1, EU MDR Article 83-86, FDA 21 CFR 803
          </p>
        </div>
        <button type="button" onClick={() => setShowComplaintModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* Urgent Alerts */}
      {stats.urgentReports > 0 && (
        <div className="card bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Urgent: Regulatory Reporting Deadlines</h3>
              <p className="text-sm text-red-700">
                {stats.urgentReports} report(s) due within 7 days — Failure to report may result in regulatory action
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal({ type: 'regulatory-report', complaint: null })}
              className="btn-danger btn-sm"
            >
              View Reports
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {pendingSubmissions.filter((s) => s.daysRemaining <= 7).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{sub.authority} {sub.reportType} Report</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(sub.dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-lg font-bold', sub.daysRemaining <= 3 ? 'text-red-600' : 'text-orange-600')}>
                    {sub.daysRemaining} days
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveModal({ type: 'regulatory-report', complaint: null })}
                    className="btn-primary btn-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">This year</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openComplaints}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Under investigation</p>
        </div>

        <div className={cn('card', stats.criticalOpen > 0 && 'border-red-300 bg-red-50')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className={cn('text-2xl font-bold', stats.criticalOpen > 0 ? 'text-red-600' : 'text-gray-900')}>
                {stats.criticalOpen}
              </p>
            </div>
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', stats.criticalOpen > 0 ? 'bg-red-100' : 'bg-gray-100')}>
              <AlertTriangle className={cn('w-5 h-5', stats.criticalOpen > 0 ? 'text-red-600' : 'text-gray-400')} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Requires immediate action</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Regulatory submissions</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Complaint Rate</p>
              <p className="text-2xl font-bold text-gray-900">0.8‰</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Per 1,000 units sold</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-200 pb-2">
        {[
          { id: 'complaints', label: 'Complaints', icon: FileWarning },
          { id: 'adverse', label: 'Adverse Events', icon: AlertTriangle },
          { id: 'fsca', label: 'Field Safety Actions', icon: Bell },
          { id: 'pms', label: 'PMS/PMCF', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-white border border-b-0 border-surface-200 text-primary-700 font-medium -mb-[1px]'
                  : 'text-gray-600 hover:bg-surface-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="card flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {(['all', 'Critical', 'Major', 'Minor', 'Inquiry'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    severityFilter === sev
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                  )}
                >
                  {sev === 'all' ? 'All' : sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="card">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                >
                  <div className="flex items-start gap-3">
                    {expandedId === complaint.id
                      ? <ChevronDown className="w-5 h-5 text-gray-400 mt-0.5" />
                      : <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-gray-500">{complaint.referenceNumber}</span>
                        <span className={cn('badge', getSeverityColor(complaint.severity))}>{complaint.severity}</span>
                        <span className={cn('badge', getStatusColor(complaint.status))}>{complaint.status}</span>
                        {complaint.patientInvolved && <span className="badge bg-purple-100 text-purple-700">Patient Involved</span>}
                        {complaint.injuryReported && <span className="badge bg-red-100 text-red-700">Injury Reported</span>}
                      </div>
                      <h4 className="font-medium text-gray-900 mt-2">{complaint.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{complaint.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Received: {formatDate(complaint.receivedDate)}</p>
                    {complaint.investigationDueDate && complaint.status !== 'Closed' && (
                      <p className={cn('font-medium', isOverdue(complaint.investigationDueDate) ? 'text-red-600' : 'text-gray-600')}>
                        Due: {formatDate(complaint.investigationDueDate)}
                      </p>
                    )}
                  </div>
                </div>

                {expandedId === complaint.id && (
                  <div className="mt-4 pt-4 border-t border-surface-200 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Product</p>
                        <p className="font-medium">{complaint.productCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lot Number</p>
                        <p className="font-medium">{complaint.lotNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Source</p>
                        <p className="font-medium">{complaint.source}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Linked Hazards</p>
                        <p className="font-medium text-primary-600">
                          {complaint.linkedHazardIds.length > 0 ? complaint.linkedHazardIds.join(', ') : 'None identified'}
                        </p>
                      </div>
                    </div>

                    {complaint.linkedHazardIds.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Risk File Impact: Linked to Hazard {complaint.linkedHazardIds.join(', ')}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Per ISO 14971:10 — This complaint data should be evaluated against the design risk estimate
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'investigate', complaint }); }}
                        className="btn-secondary btn-sm flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        Investigate
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'link-capa', complaint }); }}
                        className="btn-secondary btn-sm flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" />
                        Link to CAPA
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'adverse-event', complaint }); }}
                        className="btn-secondary btn-sm flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Create Adverse Event
                      </button>
                      {complaint.severity === 'Critical' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'regulatory-report', complaint }); }}
                          className="btn-danger btn-sm flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Initiate Regulatory Report
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adverse Events Tab */}
      {activeTab === 'adverse' && (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Adverse Event Reporting</h3>
          <p className="text-sm text-gray-500 mt-2">
            Track and report serious incidents per EU MDR Article 87 and FDA 21 CFR 803
          </p>
          <button
            type="button"
            onClick={() => setActiveModal({ type: 'adverse-event', complaint: null })}
            className="btn-primary mt-4"
          >
            Create Adverse Event Report
          </button>
        </div>
      )}

      {/* FSCA Tab */}
      {activeTab === 'fsca' && (
        <div className="card text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Field Safety Corrective Actions</h3>
          <p className="text-sm text-gray-500 mt-2">
            Manage recalls, safety notices, and corrective actions per EU MDR Art. 89 / FDA 21 CFR 806
          </p>
          <button
            type="button"
            onClick={() => setActiveModal({ type: 'fsca' })}
            className="btn-primary mt-4"
          >
            Initiate FSCA
          </button>
        </div>
      )}

      {/* PMS Tab */}
      {activeTab === 'pms' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Market Clinical Follow-up (PMCF)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Active PMCF Studies</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Data Points Collected</p>
                <p className="text-2xl font-bold text-gray-900">1,245</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Next Report Due</p>
                <p className="text-2xl font-bold text-primary-600">Mar 2026</p>
              </div>
            </div>
          </div>
          <div className="card bg-primary-50 border-primary-200">
            <h4 className="font-semibold text-primary-900 mb-2">EU MDR PMCF Requirements</h4>
            <p className="text-sm text-primary-700">
              Per EU MDR Annex XIV Part B, manufacturers must proactively collect and evaluate clinical data
              throughout the device lifecycle. The PMCF plan and report must demonstrate ongoing safety and
              benefit-risk acceptability.
            </p>
          </div>
        </div>
      )}

      {/* ISO Reference */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">Regulatory Framework</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-primary-800">ISO 13485:2016 — 8.2.1/8.2.2</p>
            <p className="text-primary-600">Feedback & Complaint Handling</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">EU MDR 2017/745 — Art. 83-86</p>
            <p className="text-primary-600">Vigilance & Post-Market Surveillance</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">FDA 21 CFR 803</p>
            <p className="text-primary-600">Medical Device Reporting</p>
          </div>
        </div>
      </div>

      {/* New Complaint Modal */}
      {showComplaintModal && <ComplaintModal onClose={() => setShowComplaintModal(false)} />}

      {/* ─── Investigate Modal ─── */}
      {activeModal?.type === 'investigate' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Initiate Investigation</h3>
                  <p className="text-xs text-gray-500">{activeModal.complaint.referenceNumber} — {activeModal.complaint.title}</p>
                </div>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Investigator</label>
                <select value={investigator} onChange={(e) => setInvestigator(e.target.value)} className="input" title="Select investigator">
                  <option value="">-- Select Investigator --</option>
                  <option>Sarah Johnson (QA Manager)</option>
                  <option>Michael Chen (Engineer)</option>
                  <option>Lisa Anderson (Regulatory)</option>
                  <option>Tom Richardson (QC Lead)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Due Date</label>
                <input type="date" value={investigationDueDate} onChange={(e) => setInvestigationDueDate(e.target.value)} className="input" title="Investigation Due Date" />
                <p className="text-xs text-gray-500 mt-1">FDA MDR: 30-day initial report. EU MDR: 15 days for serious incidents.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Plan / Initial Notes</label>
                <textarea
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  className="input resize-none"
                  rows={4}
                  placeholder="Describe the investigation approach, methods, and initial assessment..."
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>ISO 13485:8.2.2</strong> — Investigation must determine whether the complaint is related to
                  product characteristics, packaging, or distribution. Results must be documented.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button type="button" onClick={handleInvestigateSubmit} className="btn-primary flex-1" disabled={!investigator}>
                Start Investigation
              </button>
              <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Link to CAPA Modal ─── */}
      {activeModal?.type === 'link-capa' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Link to CAPA</h3>
                  <p className="text-xs text-gray-500">{activeModal.complaint.referenceNumber}</p>
                </div>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCreateNewCAPA(false); setSelectedCAPAId(''); }}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                    !createNewCAPA ? 'bg-primary-100 text-primary-700 border-primary-300' : 'bg-white text-gray-600 border-surface-200 hover:bg-surface-50'
                  )}
                >
                  Link Existing CAPA
                </button>
                <button
                  type="button"
                  onClick={() => { setCreateNewCAPA(true); setSelectedCAPAId(''); }}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                    createNewCAPA ? 'bg-primary-100 text-primary-700 border-primary-300' : 'bg-white text-gray-600 border-surface-200 hover:bg-surface-50'
                  )}
                >
                  Create New CAPA
                </button>
              </div>

              {!createNewCAPA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing CAPA</label>
                  <div className="space-y-2">
                    {EXISTING_CAPAS.map((capa) => (
                      <label key={capa.id} className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedCAPAId === capa.id ? 'bg-primary-50 border-primary-300' : 'hover:bg-surface-50 border-surface-200'
                      )}>
                        <input
                          type="radio"
                          name="capa"
                          value={capa.id}
                          checked={selectedCAPAId === capa.id}
                          onChange={(e) => setSelectedCAPAId(e.target.value)}
                          className="text-primary-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{capa.id}</p>
                          <p className="text-xs text-gray-500">{capa.title}</p>
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">{capa.status}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {createNewCAPA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New CAPA Title</label>
                  <input
                    type="text"
                    value={newCAPATitle}
                    onChange={(e) => setNewCAPATitle(e.target.value)}
                    className="input"
                    placeholder="Describe the corrective action required..."
                  />
                  <p className="text-xs text-gray-500 mt-1">A new CAPA record will be created and linked automatically.</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button
                type="button"
                onClick={handleLinkCAPASubmit}
                className="btn-primary flex-1"
                disabled={!createNewCAPA ? !selectedCAPAId : !newCAPATitle}
              >
                {createNewCAPA ? 'Create & Link CAPA' : 'Link to CAPA'}
              </button>
              <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Adverse Event Modal ─── */}
      {activeModal?.type === 'adverse-event' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Adverse Event Report</h3>
                  <p className="text-xs text-gray-500">EU MDR Art. 87 / FDA 21 CFR 803</p>
                </div>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {activeModal.complaint && (
                <div className="bg-surface-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-700">Linked Complaint: {activeModal.complaint.referenceNumber}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{activeModal.complaint.title}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select value={adverseEventType} onChange={(e) => setAdverseEventType(e.target.value)} className="input" title="Select event type">
                    <option>Serious Adverse Event</option>
                    <option>Device Deficiency</option>
                    <option>Incident</option>
                    <option>Near-Miss</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Authority</label>
                  <select value={adverseEventAuthority} onChange={(e) => setAdverseEventAuthority(e.target.value)} className="input" title="Select authority">
                    <option>FDA</option>
                    <option>EMA / EUDAMED</option>
                    <option>Health Canada</option>
                    <option>TGA (Australia)</option>
                    <option>PMDA (Japan)</option>
                    <option>Multiple Authorities</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Outcome</label>
                <select value={patientOutcome} onChange={(e) => setPatientOutcome(e.target.value)} className="input" title="Select patient outcome">
                  <option>Recovered</option>
                  <option>Recovering</option>
                  <option>Not Recovered</option>
                  <option>Recovered with Sequelae</option>
                  <option>Fatal</option>
                  <option>Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                <textarea
                  value={adverseEventDescription}
                  onChange={(e) => setAdverseEventDescription(e.target.value)}
                  className="input resize-none"
                  rows={4}
                  placeholder="Describe the adverse event, device involvement, and patient impact..."
                />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">
                  <strong>Reporting Timelines:</strong> FDA MDR — 30 days (5 days for malfunction causing death/serious injury).
                  EU MDR — 15 days for serious incidents, 2 days for imminent risk.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button type="button" onClick={handleAdverseEventSubmit} className="btn-primary flex-1">Create Report</button>
              <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Regulatory Report Modal ─── */}
      {activeModal?.type === 'regulatory-report' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Initiate Regulatory Report</h3>
                  <p className="text-xs text-gray-500">
                    {activeModal.complaint ? activeModal.complaint.referenceNumber : 'Regulatory Submission'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Authority</label>
                  <select value={reportAuthority} onChange={(e) => setReportAuthority(e.target.value)} className="input" title="Select authority">
                    <option>FDA</option>
                    <option>EMA / EUDAMED</option>
                    <option>Health Canada</option>
                    <option>TGA</option>
                    <option>PMDA</option>
                    <option>ANVISA</option>
                    <option>Multiple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input" title="Select report type">
                    <option>Initial</option>
                    <option>Supplemental</option>
                    <option>Follow-up</option>
                    <option>Final</option>
                    <option>Annual Summary</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline</label>
                <input type="date" value={reportDeadline} onChange={(e) => setReportDeadline(e.target.value)} className="input" title="Submission Deadline" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Summary</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="input resize-none"
                  rows={4}
                  placeholder="Provide a summary of the reportable event, device details, and corrective actions..."
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700">
                  <strong>Note:</strong> This will create a pending regulatory submission record. Ensure all required
                  MedWatch (FDA) or EUDAMED fields are completed before final submission.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button type="button" onClick={handleRegulatoryReportSubmit} className="btn-danger flex-1">
                Initiate Report
              </button>
              <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FSCA Modal ─── */}
      {activeModal?.type === 'fsca' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Siren className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Initiate Field Safety Corrective Action</h3>
                  <p className="text-xs text-gray-500">EU MDR Art. 89 / FDA 21 CFR 806</p>
                </div>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FSCA Type</label>
                <select value={fscaType} onChange={(e) => setFscaType(e.target.value)} className="input" title="Select FSCA type">
                  <option>Safety Notice</option>
                  <option>Product Recall (Class I)</option>
                  <option>Product Recall (Class II)</option>
                  <option>Product Recall (Class III)</option>
                  <option>Device Correction</option>
                  <option>Device Removal</option>
                  <option>Urgent Safety Restriction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope of Action</label>
                <input
                  type="text"
                  value={fscaScope}
                  onChange={(e) => setFscaScope(e.target.value)}
                  className="input"
                  placeholder="e.g. All MDV-1000 units manufactured Jan–Mar 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affected Lot Numbers</label>
                <textarea
                  value={fscaAffectedLots}
                  onChange={(e) => setFscaAffectedLots(e.target.value)}
                  className="input resize-none"
                  rows={2}
                  placeholder="LOT-2025-0101, LOT-2025-0102, ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Description</label>
                <textarea
                  value={fscaDescription}
                  onChange={(e) => setFscaDescription(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Describe the safety issue, action to be taken, and instructions to customers/distributors..."
                />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">
                  <strong>Critical:</strong> All FSCAs must be notified to competent authorities within 2 days of decision
                  (EU MDR Art. 89). A Field Safety Notice (FSN) must be distributed to all affected customers.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button type="button" onClick={handleFSCASubmit} className="btn-danger flex-1">Initiate FSCA</button>
              <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
