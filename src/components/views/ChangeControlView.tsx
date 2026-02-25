import { useState } from 'react';
import {
  Plus,
  Search,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Pen,
  X,
  User,
  Lock,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { ChangeControl, ChangeType, ChangeStatus, ChangeClassification } from '../../types';
import ChangeControlModal from '../modals/ChangeControlModal';
import RiskReviewModal from '../modals/RiskReviewModal';

// Sample data
const sampleChangeControls: ChangeControl[] = [
  {
    id: '1',
    referenceNumber: 'CC-2026-001',
    type: 'Process',
    classification: 'Major',
    title: 'Update sterilization cycle parameters',
    description: 'Modify EO sterilization cycle time based on validation data',
    justification: 'Validation study showed improved SAL with modified parameters',
    requestedBy: 'Process Engineer',
    requestedDate: new Date('2026-01-20'),
    impactAssessment: {
      safetyImpact: 'Medium',
      qualityImpact: 'High',
      regulatoryImpact: 'High',
      affectedDocuments: ['SOP-STER-001', 'VAL-STER-003'],
      affectedProducts: ['MDV-1000', 'MDV-2000'],
      affectedProcesses: ['Sterilization'],
      riskAssessmentRequired: true,
      validationRequired: true,
      regulatorySubmissionRequired: false,
    },
    linkedRiskAssessments: [],
    linkedCAPAs: [],
    linkedDocuments: ['SOP-STER-001'],
    approvals: [
      {
        id: '1',
        role: 'Quality',
        approverName: 'QA Manager',
        approverId: 'USR-001',
        decision: 'Approved',
        comments: 'Approved pending validation completion',
        timestamp: new Date('2026-01-22'),
      },
      {
        id: '2',
        role: 'Engineering',
        approverName: 'Engineering Lead',
        approverId: 'USR-002',
        decision: 'Approved',
        timestamp: new Date('2026-01-23'),
      },
      {
        id: '3',
        role: 'Regulatory',
        approverName: '',
        approverId: '',
        decision: 'Pending',
      },
    ],
    status: 'Pending Review',
    createdAt: new Date('2026-01-20'),
    auditTrail: [],
  },
  {
    id: '2',
    referenceNumber: 'CC-2026-002',
    type: 'Material',
    classification: 'Minor',
    title: 'Alternative packaging material supplier',
    description: 'Qualify secondary supplier for sterile pouches',
    justification: 'Supply chain risk mitigation - single source dependency',
    requestedBy: 'Supply Chain Manager',
    requestedDate: new Date('2026-01-15'),
    impactAssessment: {
      safetyImpact: 'Low',
      qualityImpact: 'Medium',
      regulatoryImpact: 'Low',
      affectedDocuments: ['ASL-001'],
      affectedProducts: ['All'],
      affectedProcesses: ['Packaging'],
      riskAssessmentRequired: true,
      validationRequired: false,
      regulatorySubmissionRequired: false,
    },
    linkedRiskAssessments: [],
    linkedCAPAs: [],
    linkedDocuments: [],
    approvals: [
      {
        id: '1',
        role: 'Quality',
        approverName: 'QA Manager',
        approverId: 'USR-001',
        decision: 'Approved',
        timestamp: new Date('2026-01-18'),
      },
    ],
    status: 'Approved',
    createdAt: new Date('2026-01-15'),
    auditTrail: [],
  },
  {
    id: '3',
    referenceNumber: 'CC-2026-003',
    type: 'Design',
    classification: 'Major',
    title: 'Risk threshold breach - Battery thermal hazard',
    description: 'Real-world occurrence rate exceeds design estimate for H-04',
    justification: 'Complaint data shows 0.08% occurrence vs 0.01% design estimate',
    requestedBy: 'System (Auto-triggered)',
    requestedDate: new Date('2026-01-25'),
    impactAssessment: {
      safetyImpact: 'High',
      qualityImpact: 'High',
      regulatoryImpact: 'High',
      affectedDocuments: ['RMF-001', 'DHF-MDV1000'],
      affectedProducts: ['MDV-1000'],
      affectedProcesses: ['Design', 'Manufacturing'],
      riskAssessmentRequired: true,
      validationRequired: true,
      regulatorySubmissionRequired: true,
    },
    triggeredByRiskBreach: {
      hazardId: 'H-04',
      designEstimate: 0.01,
      actualRate: 0.08,
      variance: 700,
    },
    linkedRiskAssessments: ['RA-001'],
    linkedCAPAs: [],
    linkedDocuments: [],
    approvals: [],
    status: 'Draft',
    createdAt: new Date('2026-01-25'),
    auditTrail: [],
  },
];

export default function ChangeControlView() {
  const [showModal, setShowModal] = useState(false);
  const [showRiskReviewModal, setShowRiskReviewModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingChange, setSigningChange] = useState<ChangeControl | null>(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signatureRole, setSignatureRole] = useState('Regulatory');
  const [signatureDecision, setSignatureDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [signatureComments, setSignatureComments] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChangeType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ChangeStatus | 'all'>('all');

  const handleSignApprove = (cc: ChangeControl) => {
    setSigningChange(cc);
    setSignaturePassword('');
    setSignatureRole('Regulatory');
    setSignatureDecision('Approved');
    setSignatureComments('');
    setSignatureError('');
    setShowSignModal(true);
  };

  const handleSignSubmit = () => {
    if (!signaturePassword) {
      setSignatureError('Password is required to apply electronic signature.');
      return;
    }
    // In a real app, verify password against authenticated user's credentials
    alert(
      `Electronic Signature Applied\n` +
      `Change: ${signingChange?.referenceNumber}\n` +
      `Decision: ${signatureDecision}\n` +
      `Role: ${signatureRole}\n` +
      `Per 21 CFR Part 11 — Signature recorded in audit trail`
    );
    setShowSignModal(false);
    setSigningChange(null);
  };

  const changeControls = sampleChangeControls;

  // Get risk-triggered changes for the review modal
  const riskTriggeredChanges = changeControls.filter((cc) => cc.triggeredByRiskBreach);

  const filteredChanges = changeControls.filter((cc) => {
    const matchesSearch =
      cc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || cc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || cc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    openChanges: changeControls.filter((cc) => cc.status !== 'Closed' && cc.status !== 'Rejected').length,
    pendingApprovals: changeControls.filter((cc) => cc.status === 'Pending Review').length,
    riskTriggered: changeControls.filter((cc) => cc.triggeredByRiskBreach).length,
    implementedThisMonth: changeControls.filter((cc) => cc.status === 'Implemented').length,
  };

  const getStatusColor = (status: ChangeStatus) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Implemented': return 'bg-blue-100 text-blue-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
    }
  };

  const getClassificationColor = (classification: ChangeClassification) => {
    switch (classification) {
      case 'Major': return 'bg-red-100 text-red-700';
      case 'Minor': return 'bg-yellow-100 text-yellow-700';
      case 'Administrative': return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Change Control</h2>
          <p className="text-sm text-gray-500 mt-1">
            Per ISO 13485:7.3.9 & 21 CFR Part 11 - Electronic Records & Signatures
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New Change Request
        </button>
      </div>

      {/* Risk-Triggered Alert */}
      {stats.riskTriggered > 0 && (
        <div className="card bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Risk Threshold Breach Detected</h3>
              <p className="text-sm text-red-700">
                {stats.riskTriggered} change(s) auto-triggered by ISO 14971 risk data exceeding design estimates.
                Per ISO 13485:4.1.4, immediate review and disposition required.
              </p>
            </div>
            <button 
              onClick={() => setShowRiskReviewModal(true)} 
              className="btn-danger btn-sm"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Changes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openChanges}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className={cn('card', stats.pendingApprovals > 0 && 'border-yellow-300 bg-yellow-50')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.pendingApprovals > 0 ? 'text-yellow-600' : 'text-gray-900'
              )}>
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={cn('card', stats.riskTriggered > 0 && 'border-red-300 bg-red-50')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Risk-Triggered</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.riskTriggered > 0 ? 'text-red-600' : 'text-gray-900'
              )}>
                {stats.riskTriggered}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Implemented (MTD)</p>
              <p className="text-2xl font-bold text-green-600">{stats.implementedThisMonth}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search changes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ChangeType | 'all')}
          className="input w-auto"
          title="Filter by change type"
          aria-label="Filter by change type"
        >
          <option value="all">All Types</option>
          <option value="Design">Design</option>
          <option value="Process">Process</option>
          <option value="Material">Material</option>
          <option value="Supplier">Supplier</option>
          <option value="Document">Document</option>
          <option value="Software">Software</option>
        </select>
        <div className="flex items-center gap-2">
          {(['all', 'Draft', 'Pending Review', 'Approved', 'Implemented'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Change Control List */}
      <div className="space-y-4">
        {filteredChanges.map((cc) => (
          <div key={cc.id} className={cn(
            'card',
            cc.triggeredByRiskBreach && 'border-red-300 bg-red-50'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-gray-500">{cc.referenceNumber}</span>
                  <span className={cn('badge', getClassificationColor(cc.classification))}>
                    {cc.classification}
                  </span>
                  <span className="badge badge-gray">{cc.type}</span>
                  <span className={cn('badge', getStatusColor(cc.status))}>
                    {cc.status}
                  </span>
                  {cc.triggeredByRiskBreach && (
                    <span className="badge bg-red-100 text-red-700">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Risk Triggered
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mt-2">{cc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{cc.description}</p>

                {/* Risk Breach Details */}
                {cc.triggeredByRiskBreach && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800">Risk Data Comparison</p>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Design Estimate:</span>
                        <span className="ml-2 font-medium">{cc.triggeredByRiskBreach.designEstimate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual Rate:</span>
                        <span className="ml-2 font-medium text-red-600">{cc.triggeredByRiskBreach.actualRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Variance:</span>
                        <span className="ml-2 font-medium text-red-600">+{cc.triggeredByRiskBreach.variance}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Impact Assessment Summary */}
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className={cn(
                    'flex items-center gap-1',
                    cc.impactAssessment.safetyImpact === 'High' ? 'text-red-600' :
                    cc.impactAssessment.safetyImpact === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  )}>
                    <Shield className="w-4 h-4" />
                    Safety: {cc.impactAssessment.safetyImpact}
                  </span>
                  {cc.impactAssessment.validationRequired && (
                    <span className="text-blue-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Validation Required
                    </span>
                  )}
                  {cc.impactAssessment.regulatorySubmissionRequired && (
                    <span className="text-purple-600 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Regulatory Submission
                    </span>
                  )}
                </div>
              </div>

              {/* Approval Status */}
              <div className="ml-6 min-w-[200px]">
                <p className="text-sm font-medium text-gray-700 mb-2">Approvals</p>
                <div className="space-y-1">
                  {cc.approvals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{approval.role}</span>
                      {approval.decision === 'Approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : approval.decision === 'Rejected' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
                {cc.status === 'Pending Review' && (
                  <button
                    type="button"
                    onClick={() => handleSignApprove(cc)}
                    className="btn-primary btn-sm w-full mt-3 gap-1"
                  >
                    <Pen className="w-3 h-3" />
                    Sign & Approve
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-200 flex items-center justify-between text-xs text-gray-500">
              <span>Requested by {cc.requestedBy} on {formatDate(cc.requestedDate)}</span>
              <span>
                Affected: {cc.impactAssessment.affectedProducts.length} product(s),{' '}
                {cc.impactAssessment.affectedDocuments.length} document(s)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 21 CFR Part 11 Reference */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">21 CFR Part 11 Compliance</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-primary-800">11.10 Controls</p>
            <p className="text-primary-600">System validation, audit trails, authority checks</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">11.50 Signature Manifestations</p>
            <p className="text-primary-600">Printed name, date/time, meaning of signature</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">11.70 Signature Linking</p>
            <p className="text-primary-600">Signatures linked to respective electronic records</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && <ChangeControlModal onClose={() => setShowModal(false)} />}

      {/* Risk Review Modal */}
      {showRiskReviewModal && (
        <RiskReviewModal
          onClose={() => setShowRiskReviewModal(false)}
          riskTriggeredChanges={riskTriggeredChanges}
        />
      )}

      {/* ─── Electronic Signature / Sign & Approve Modal ─── */}
      {showSignModal && signingChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Pen className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Electronic Signature</h3>
                  <p className="text-xs text-gray-500">{signingChange.referenceNumber} — 21 CFR Part 11 Compliant</p>
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowSignModal(false)} className="btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Change Summary */}
              <div className="bg-surface-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Change Being Approved</p>
                <p className="text-sm text-gray-900">{signingChange.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className={cn('badge', signingChange.classification === 'Major' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>
                    {signingChange.classification}
                  </span>
                  <span>{signingChange.type}</span>
                  <span>Requested by {signingChange.requestedBy}</span>
                </div>
              </div>

              {/* Pending Approvals */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pending Approvals</p>
                <div className="space-y-1">
                  {signingChange.approvals.filter((a) => a.decision === 'Pending').map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="font-medium text-gray-700">{approval.role}</span>
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Signer Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Role / Capacity</label>
                <select
                  value={signatureRole}
                  onChange={(e) => setSignatureRole(e.target.value)}
                  className="input"
                  title="Select your approval role"
                >
                  {signingChange.approvals
                    .filter((a) => a.decision === 'Pending')
                    .map((a) => <option key={a.id} value={a.role}>{a.role}</option>)
                  }
                  <option value="Quality">Quality</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Regulatory">Regulatory</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              {/* Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSignatureDecision('Approved')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border font-medium text-sm transition-colors',
                      signatureDecision === 'Approved'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-white text-gray-600 border-surface-200 hover:bg-surface-50'
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureDecision('Rejected')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border font-medium text-sm transition-colors',
                      signatureDecision === 'Rejected'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-white text-gray-600 border-surface-200 hover:bg-surface-50'
                    )}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments {signatureDecision === 'Rejected' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={signatureComments}
                  onChange={(e) => setSignatureComments(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder={signatureDecision === 'Rejected'
                    ? 'Provide reason for rejection...'
                    : 'Optional approval comments...'}
                />
              </div>

              {/* Password / PIN */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-3 h-3" />
                  Password Confirmation <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={signaturePassword}
                  onChange={(e) => { setSignaturePassword(e.target.value); setSignatureError(''); }}
                  className={cn('input', signatureError && 'border-red-300')}
                  placeholder="Enter your account password to sign"
                  autoComplete="current-password"
                />
                {signatureError && <p className="text-xs text-red-600 mt-1">{signatureError}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Per 21 CFR Part 11.50 — Electronic signatures require printed name, date/time, and meaning.
                </p>
              </div>

              {/* 21 CFR Part 11 Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800">21 CFR Part 11 Electronic Signature</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    By signing, you certify that you are the named individual and that you are applying
                    this signature with the intent to approve or reject the specified record. This action
                    will be recorded in the immutable audit trail.
                  </p>
                </div>
              </div>

              {/* Signer Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-surface-50 rounded-lg p-3">
                <User className="w-4 h-4 text-gray-400" />
                <span>Signing as: <strong>Current User</strong></span>
                <span className="text-gray-400">•</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button
                type="button"
                onClick={handleSignSubmit}
                className={cn(
                  'flex-1 btn-sm py-2 font-medium rounded-lg transition-colors',
                  signatureDecision === 'Approved'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                )}
              >
                {signatureDecision === 'Approved' ? 'Apply Approval Signature' : 'Apply Rejection Signature'}
              </button>
              <button type="button" onClick={() => setShowSignModal(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
