import { useAppStore } from '../stores/app-store';
import { AlertTriangle, CheckCircle, Info, ExternalLink, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { ISO_STANDARDS } from '../data/iso-standards';

export default function ComplianceGuardrail() {
  const { getDashboardMetrics, getUnacknowledgedAlerts, acknowledgeAlert, selectedMetricId } = useAppStore();

  const dashboardMetrics = getDashboardMetrics();
  const alerts = getUnacknowledgedAlerts();
  const selectedMetric = dashboardMetrics.find(dm => dm.metric.id === selectedMetricId);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-surface-200">
        <BookOpen className="w-5 h-5 text-primary-600" />
        <h2 className="font-semibold text-gray-900">Compliance Guardrail</h2>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Active Alerts ({alerts.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg text-sm',
                  alert.type === 'Critical' && 'bg-red-50 border border-red-200',
                  alert.type === 'Warning' && 'bg-yellow-50 border border-yellow-200',
                  alert.type === 'Info' && 'bg-blue-50 border border-blue-200'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                    {alert.isoReference && (
                      <p className="text-xs text-primary-600 mt-1 font-medium">
                        {alert.isoReference.standard}:{alert.isoReference.clause}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Metric ISO Reference */}
      {selectedMetric && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-500" />
            ISO Reference: {selectedMetric.metric.shortName}
          </h3>
          <div className="bg-surface-50 rounded-lg p-3 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Metric Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  selectedMetric.status === 'green' && 'bg-compliance-green',
                  selectedMetric.status === 'yellow' && 'bg-compliance-yellow',
                  selectedMetric.status === 'red' && 'bg-compliance-red'
                )} />
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {selectedMetric.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">ISO Mappings</p>
              <div className="mt-1 space-y-1">
                {selectedMetric.metric.isoMappings.map((mapping, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-primary-700">
                      {mapping.standard}:{mapping.clause}
                    </span>
                    <p className="text-xs text-gray-600">{mapping.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Risk Impact</p>
              <p className="text-sm text-gray-700 mt-1">{selectedMetric.metric.riskImpact}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Workaround Suggestion</p>
              <p className="text-sm text-gray-700 mt-1">{selectedMetric.metric.workaroundSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Compliance Status</h3>
        <div className="space-y-2">
          {Object.entries(
            dashboardMetrics.reduce((acc, dm) => {
              acc[dm.status] = (acc[dm.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  status === 'green' && 'bg-compliance-green',
                  status === 'yellow' && 'bg-compliance-yellow',
                  status === 'red' && 'bg-compliance-red'
                )} />
                <span className="capitalize">{status}</span>
              </div>
              <span className="font-medium">{count} metrics</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Quick Reference</h3>
        <div className="space-y-2">
          {Object.entries(ISO_STANDARDS).slice(0, 4).map(([key, standard]) => (
            <div
              key={key}
              className="p-2 bg-surface-50 rounded-lg hover:bg-surface-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{standard.name}</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 truncate">{standard.description.slice(0, 60)}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* ALCOA+ Reminder */}
      <div className="p-3 bg-primary-50 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-800 mb-2">ALCOA+ Data Integrity</h4>
        <ul className="text-xs text-primary-700 space-y-1">
          <li><CheckCircle className="w-3 h-3 inline mr-1" />Attributable - All entries tracked by user</li>
          <li><CheckCircle className="w-3 h-3 inline mr-1" />Legible - Digital records maintained</li>
          <li><CheckCircle className="w-3 h-3 inline mr-1" />Contemporaneous - Timestamped entries</li>
          <li><CheckCircle className="w-3 h-3 inline mr-1" />Original - Source data preserved</li>
          <li><CheckCircle className="w-3 h-3 inline mr-1" />Accurate - Validated calculations</li>
        </ul>
      </div>
    </div>
  );
}
