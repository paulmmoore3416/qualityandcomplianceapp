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
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { ChangeControl, ChangeType, ChangeStatus, ChangeClassification } from '../../types';
import ChangeControlModal from '../modals/ChangeControlModal';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChangeType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ChangeStatus | 'all'>('all');

  const changeControls = sampleChangeControls;

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
            <button className="btn-danger btn-sm">Review Now</button>
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
                  <button className="btn-primary btn-sm w-full mt-3 gap-1">
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
    </div>
  );
}
