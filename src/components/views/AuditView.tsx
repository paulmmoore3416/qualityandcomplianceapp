import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { ISO_STANDARDS, REGULATORY_FRAMEWORKS } from '../../data/iso-standards';
import {
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  BookOpen,
} from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';

type AuditSection = 'overview' | 'metrics' | 'capa' | 'ncr' | 'risk' | 'standards';

export default function AuditView() {
  const {
    getDashboardMetrics,
    getCAPAStats,
    riskAssessments,
    exportAuditReport,
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<AuditSection>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const dashboardMetrics = getDashboardMetrics();
  const capaStats = getCAPAStats();

  // Calculate compliance score
  const greenMetrics = dashboardMetrics.filter((dm) => dm.status === 'green').length;
  const complianceScore = Math.round((greenMetrics / dashboardMetrics.length) * 100);

  const handleExport = (format: 'json' | 'csv') => {
    const report = exportAuditReport();

    if (format === 'json') {
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const sections: { id: AuditSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'metrics', label: 'Metrics', icon: CheckCircle },
    { id: 'capa', label: 'CAPA', icon: Clock },
    { id: 'ncr', label: 'NCR', icon: AlertTriangle },
    { id: 'risk', label: 'Risk', icon: AlertTriangle },
    { id: 'standards', label: 'Standards', icon: BookOpen },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Audit Mode</h2>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive compliance report generation and audit preparation
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="input w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button onClick={() => handleExport('json')} className="btn-primary gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Compliance Score Banner */}
      <div className={cn(
        'card',
        complianceScore >= 90 && 'bg-gradient-to-r from-green-500 to-green-600',
        complianceScore >= 70 && complianceScore < 90 && 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        complianceScore < 70 && 'bg-gradient-to-r from-red-500 to-red-600'
      )}>
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-white/80">Overall Compliance Score</p>
            <p className="text-5xl font-bold mt-1">{complianceScore}%</p>
            <p className="text-white/80 mt-2">
              {greenMetrics} of {dashboardMetrics.length} metrics within target
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/80">Report Generated</p>
            <p className="font-medium">{formatDateTime(new Date())}</p>
            <p className="text-white/80 mt-4">Audit Period</p>
            <p className="font-medium">
              {dateRange === 'all' ? 'All Time' : `Last ${dateRange.replace('d', ' days')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
                activeSection === section.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Metrics Tracked</span>
                <span className="font-semibold">{dashboardMetrics.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-compliance-green" />
                  Green (Compliant)
                </span>
                <span className="font-semibold">{dashboardMetrics.filter((dm) => dm.status === 'green').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-compliance-yellow" />
                  Yellow (Caution)
                </span>
                <span className="font-semibold">{dashboardMetrics.filter((dm) => dm.status === 'yellow').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-compliance-red" />
                  Red (Non-compliant)
                </span>
                <span className="font-semibold">{dashboardMetrics.filter((dm) => dm.status === 'red').length}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">CAPA Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total CAPAs</span>
                <span className="font-semibold">{capaStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open</span>
                <span className="font-semibold">{capaStats.open}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-gray-600', capaStats.overdue > 0 && 'text-red-600')}>
                  Overdue
                </span>
                <span className={cn('font-semibold', capaStats.overdue > 0 && 'text-red-600')}>
                  {capaStats.overdue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Closed This Month</span>
                <span className="font-semibold">{capaStats.closedThisMonth}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Assessments</span>
                <span className="font-semibold">{riskAssessments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open Mitigations</span>
                <span className="font-semibold">
                  {riskAssessments.filter((ra) => ra.mitigationRequired && ra.status !== 'Closed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">High/Critical</span>
                <span className="font-semibold text-red-600">
                  {riskAssessments.filter((ra) => (ra.riskLevel === 'High' || ra.riskLevel === 'Critical') && ra.status !== 'Closed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'metrics' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics Compliance Report</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Category</th>
                  <th>Current Value</th>
                  <th>Status</th>
                  <th>ISO Reference</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {dashboardMetrics.map((dm) => (
                  <tr key={dm.metric.id}>
                    <td>
                      <p className="font-medium">{dm.metric.shortName}</p>
                      <p className="text-xs text-gray-500">{dm.metric.name}</p>
                    </td>
                    <td>{dm.metric.category}</td>
                    <td className="font-mono">
                      {dm.currentValue ? `${dm.currentValue.value.toFixed(1)}${dm.metric.unit}` : '--'}
                    </td>
                    <td>
                      <span className={cn(
                        'badge',
                        dm.status === 'green' && 'badge-green',
                        dm.status === 'yellow' && 'badge-yellow',
                        dm.status === 'red' && 'badge-red'
                      )}>
                        {dm.status}
                      </span>
                    </td>
                    <td className="text-primary-600 text-sm">
                      {dm.metric.isoMappings[0]?.standard}:{dm.metric.isoMappings[0]?.clause}
                    </td>
                    <td className={cn(
                      dm.trend === 'improving' && 'text-green-600',
                      dm.trend === 'declining' && 'text-red-600',
                      dm.trend === 'stable' && 'text-gray-500'
                    )}>
                      {dm.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'standards' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ISO Standards Reference</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(ISO_STANDARDS).slice(0, 6).map(([key, standard]) => (
                <div key={key} className="p-4 bg-surface-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{standard.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{standard.fullName}</p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{standard.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Frameworks</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(REGULATORY_FRAMEWORKS).map(([key, framework]) => (
                <div key={key} className="p-4 bg-primary-50 rounded-lg">
                  <p className="font-semibold text-primary-900">{framework.name}</p>
                  <p className="text-sm text-primary-700 mt-1">{framework.fullName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALCOA+ Compliance Note */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900">ALCOA+ Data Integrity Compliance</h4>
            <p className="text-sm text-green-700 mt-1">
              All records in this system maintain ALCOA+ principles: Attributable (user tracked),
              Legible (digital format), Contemporaneous (timestamped), Original (source preserved),
              Accurate (validated calculations), plus Complete, Consistent, Enduring, and Available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
