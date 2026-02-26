import { useMemo, useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { useAuthStore } from '../../stores/auth-store';
import { ReportEntry, ReportSection, ReportStatus } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { FileText, Search, Filter, ExternalLink, AlertTriangle } from 'lucide-react';
import ReportViewerModal from '../modals/ReportViewerModal';
import RegulatoryReportViewerModal from '../modals/RegulatoryReportViewerModal';

const STATUS_OPTIONS: (ReportStatus | 'all')[] = [
  'all',
  'Draft',
  'In Progress',
  'Under Review',
  'Approved',
  'Pending Submission',
  'Submitted',
  'Acknowledged',
  'Closed',
];

const SECTION_OPTIONS: (ReportSection | 'all')[] = [
  'all',
  'Validation',
  'Vigilance',
  'Audit',
  'Metrics',
  'Risk',
  'CAPA',
  'NCR',
  'Documents',
  'Training',
  'Change Control',
  'Suppliers',
  'Lifecycle',
  'Other',
];

function getStatusPill(status: string) {
  switch (status) {
    case 'Draft':
      return 'bg-surface-100 text-gray-600';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-700';
    case 'Approved':
      return 'bg-green-100 text-green-700';
    case 'Pending Submission':
      return 'bg-orange-100 text-orange-700';
    case 'Submitted':
      return 'bg-indigo-100 text-indigo-700';
    case 'Acknowledged':
      return 'bg-emerald-100 text-emerald-700';
    case 'Closed':
      return 'bg-surface-100 text-gray-600';
    default:
      return 'bg-surface-100 text-gray-600';
  }
}

export default function ReportsView() {
  const { getReportEntries, validationReports, setActiveView } = useAppStore();
  const { currentUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<ReportSection | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  const [selectedValidationId, setSelectedValidationId] = useState<string | null>(null);
  const [selectedRegulatoryEntry, setSelectedRegulatoryEntry] = useState<ReportEntry | null>(null);

  const entries = getReportEntries();

  const validationReportMap = useMemo(() => {
    return new Map(validationReports.map((report) => [report.id, report]));
  }, [validationReports]);

  const filtered = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase())
      || (entry.reportNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      || (entry.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = sectionFilter === 'all' || entry.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesSection && matchesStatus;
  });

  const stats = useMemo(() => {
    const total = entries.length;
    const pending = entries.filter((e) => e.status === 'Pending Submission').length;
    const approved = entries.filter((e) => e.status === 'Approved').length;
    const dueSoon = entries.filter((e) => e.dueDate && new Date(e.dueDate).getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000).length;
    return { total, pending, approved, dueSoon };
  }, [entries]);

  const handleOpen = (entry: ReportEntry) => {
    if (entry.category === 'Validation Report' && entry.referenceId) {
      const report = validationReportMap.get(entry.referenceId);
      if (report) {
        setSelectedValidationId(report.id);
      }
      return;
    }
    if (entry.category === 'Regulatory Report') {
      setSelectedRegulatoryEntry(entry);
    }
  };

  const selectedValidationReport = selectedValidationId
    ? validationReportMap.get(selectedValidationId) || null
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary-600" />
            Reports Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">A secure, consolidated record of user-generated reports across all modules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setActiveView('validation')} className="btn-secondary btn-sm">Create Validation Report</button>
          <button type="button" onClick={() => setActiveView('vigilance')} className="btn-danger btn-sm">Initiate Regulatory Report</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-2">User-generated records only</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pending Submission</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-2">Regulatory workflow</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Approved Reports</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
          <p className="text-xs text-gray-400 mt-2">Signed-off outcomes</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Due Within 7 Days</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.dueSoon}</p>
          <p className="text-xs text-gray-400 mt-2">Time-sensitive reporting</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, report number, or summary"
              className="input pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value as ReportSection | 'all')} className="input" title="Filter by section">
            {SECTION_OPTIONS.map((section) => (
              <option key={section} value={section}>{section === 'all' ? 'All Sections' : section}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')} className="input" title="Filter by status">
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status === 'all' ? 'All Statuses' : status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Report Register</h3>
            <p className="text-sm text-gray-500">{currentUser?.department ? `${currentUser.department} • ` : ''}{filtered.length} report(s)</p>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No user-generated reports found</p>
            <p className="text-sm text-gray-400 mt-1">Create a report in Validation or initiate a regulatory report in Vigilance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Report</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Section</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Created</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{entry.title}</p>
                      <p className="text-xs text-gray-500">{entry.reportNumber || entry.category}</p>
                      {entry.dueDate && (
                        <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Due {formatDate(entry.dueDate)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.section}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusPill(entry.status))}>{entry.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.createdBy}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpen(entry)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedValidationReport && (
        <ReportViewerModal
          report={selectedValidationReport}
          isOpen={Boolean(selectedValidationReport)}
          onClose={() => setSelectedValidationId(null)}
        />
      )}

      {selectedRegulatoryEntry && (
        <RegulatoryReportViewerModal
          report={selectedRegulatoryEntry}
          isOpen={Boolean(selectedRegulatoryEntry)}
          onClose={() => setSelectedRegulatoryEntry(null)}
        />
      )}
    </div>
  );
}
