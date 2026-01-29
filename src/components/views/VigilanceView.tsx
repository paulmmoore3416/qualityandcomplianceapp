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
} from 'lucide-react';
import { cn, formatDate, isOverdue } from '../../lib/utils';
import {
  Complaint,
  RegulatorySubmission,
  ComplaintSeverity,
  ComplaintStatus,
} from '../../types';
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

export default function VigilanceView() {
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'complaints' | 'adverse' | 'fsca' | 'pms'>('complaints');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<ComplaintSeverity | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Use sample data for now
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

  // Calculate stats
  const stats = {
    totalComplaints: complaints.length,
    openComplaints: complaints.filter((c) => c.status !== 'Closed').length,
    criticalOpen: complaints.filter((c) => c.severity === 'Critical' && c.status !== 'Closed').length,
    pendingReports: pendingSubmissions.filter((s) => s.status !== 'Submitted').length,
    urgentReports: pendingSubmissions.filter((s) => s.daysRemaining <= 7).length,
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
        <button onClick={() => setShowComplaintModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* Urgent Alerts - Regulatory Deadlines */}
      {stats.urgentReports > 0 && (
        <div className="card bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Urgent: Regulatory Reporting Deadlines</h3>
              <p className="text-sm text-red-700">
                {stats.urgentReports} report(s) due within 7 days - Failure to report may result in regulatory action
              </p>
            </div>
            <button className="btn-danger btn-sm">View Reports</button>
          </div>

          <div className="mt-4 space-y-2">
            {pendingSubmissions
              .filter((s) => s.daysRemaining <= 7)
              .map((sub) => (
                <div key={sub.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {sub.authority} {sub.reportType} Report
                      </p>
                      <p className="text-sm text-gray-500">Due: {formatDate(sub.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-lg font-bold',
                      sub.daysRemaining <= 3 ? 'text-red-600' : 'text-orange-600'
                    )}>
                      {sub.daysRemaining} days
                    </span>
                    <button className="btn-primary btn-sm">Submit</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
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

        <div className={cn(
          'card',
          stats.criticalOpen > 0 && 'border-red-300 bg-red-50'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.criticalOpen > 0 ? 'text-red-600' : 'text-gray-900'
              )}>
                {stats.criticalOpen}
              </p>
            </div>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              stats.criticalOpen > 0 ? 'bg-red-100' : 'bg-gray-100'
            )}>
              <AlertTriangle className={cn(
                'w-5 h-5',
                stats.criticalOpen > 0 ? 'text-red-600' : 'text-gray-400'
              )} />
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

      {/* Complaints Tab Content */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filters */}
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

          {/* Complaints List */}
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="card">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                >
                  <div className="flex items-start gap-3">
                    {expandedId === complaint.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-gray-500">{complaint.referenceNumber}</span>
                        <span className={cn('badge', getSeverityColor(complaint.severity))}>
                          {complaint.severity}
                        </span>
                        <span className={cn('badge', getStatusColor(complaint.status))}>
                          {complaint.status}
                        </span>
                        {complaint.patientInvolved && (
                          <span className="badge bg-purple-100 text-purple-700">Patient Involved</span>
                        )}
                        {complaint.injuryReported && (
                          <span className="badge bg-red-100 text-red-700">Injury Reported</span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mt-2">{complaint.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{complaint.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Received: {formatDate(complaint.receivedDate)}</p>
                    {complaint.investigationDueDate && complaint.status !== 'Closed' && (
                      <p className={cn(
                        'font-medium',
                        isOverdue(complaint.investigationDueDate) ? 'text-red-600' : 'text-gray-600'
                      )}>
                        Due: {formatDate(complaint.investigationDueDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
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
                          {complaint.linkedHazardIds.length > 0
                            ? complaint.linkedHazardIds.join(', ')
                            : 'None identified'}
                        </p>
                      </div>
                    </div>

                    {/* Risk Linkage Alert */}
                    {complaint.linkedHazardIds.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Risk File Impact: Linked to Hazard {complaint.linkedHazardIds.join(', ')}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Per ISO 14971:10 - This complaint data should be evaluated against the design risk estimate
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="btn-secondary btn-sm">Investigate</button>
                      <button className="btn-secondary btn-sm">Link to CAPA</button>
                      <button className="btn-secondary btn-sm">Create Adverse Event</button>
                      {complaint.severity === 'Critical' && (
                        <button className="btn-danger btn-sm">Initiate Regulatory Report</button>
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
          <button className="btn-primary mt-4">Create Adverse Event Report</button>
        </div>
      )}

      {/* Field Safety Actions Tab */}
      {activeTab === 'fsca' && (
        <div className="card text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Field Safety Corrective Actions</h3>
          <p className="text-sm text-gray-500 mt-2">
            Manage recalls, safety notices, and corrective actions
          </p>
          <button className="btn-primary mt-4">Initiate FSCA</button>
        </div>
      )}

      {/* PMS/PMCF Tab */}
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
            <p className="font-medium text-primary-800">ISO 13485:2016 - 8.2.1/8.2.2</p>
            <p className="text-primary-600">Feedback & Complaint Handling</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">EU MDR 2017/745 - Art. 83-86</p>
            <p className="text-primary-600">Vigilance & Post-Market Surveillance</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">FDA 21 CFR 803</p>
            <p className="text-primary-600">Medical Device Reporting</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showComplaintModal && <ComplaintModal onClose={() => setShowComplaintModal(false)} />}
    </div>
  );
}
