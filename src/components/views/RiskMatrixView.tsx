import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Plus, AlertTriangle } from 'lucide-react';
import { cn, getRiskColor, getRiskBgColor } from '../../lib/utils';
import { getRiskLevel, calculateRiskIndex } from '../../lib/compliance-engine';
import { SeverityLevel, ProbabilityLevel, RiskLevel } from '../../types';
import RiskAssessmentModal from '../modals/RiskAssessmentModal';

export default function RiskMatrixView() {
  const { riskAssessments, getUnacknowledgedAlerts, acknowledgeAlert } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'In Review' | 'Closed'>('all');

  const alerts = getUnacknowledgedAlerts();

  const filteredAssessments = riskAssessments.filter(
    (ra) => statusFilter === 'all' || ra.status === statusFilter
  );

  // Build risk matrix data
  const severityLevels: SeverityLevel[] = [5, 4, 3, 2, 1];
  const probabilityLevels: ProbabilityLevel[] = [1, 2, 3, 4, 5];

  const getCellColor = (severity: SeverityLevel, probability: ProbabilityLevel): string => {
    const riskIndex = calculateRiskIndex(severity, probability);
    const level = getRiskLevel(riskIndex);
    return level === 'Low' ? 'risk-low'
      : level === 'Medium' ? 'risk-medium'
      : level === 'High' ? 'risk-high'
      : 'risk-critical';
  };

  const getAssessmentsInCell = (severity: SeverityLevel, probability: ProbabilityLevel) => {
    return riskAssessments.filter(
      (ra) => ra.severity === severity && ra.probability === probability && ra.status !== 'Closed'
    );
  };

  const severityLabels: Record<SeverityLevel, string> = {
    1: 'Negligible',
    2: 'Minor',
    3: 'Moderate',
    4: 'Major',
    5: 'Catastrophic',
  };

  const probabilityLabels: Record<ProbabilityLevel, string> = {
    1: 'Rare',
    2: 'Unlikely',
    3: 'Possible',
    4: 'Likely',
    5: 'Frequent',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">ISO 14971 Risk Matrix</h2>
          <p className="text-sm text-gray-500 mt-1">
            Medical device risk management per ISO 14971:2019
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Active Risk Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between bg-white p-3 rounded-lg border border-red-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  {alert.isoReference && (
                    <p className="text-xs text-primary-600 mt-1">
                      {alert.isoReference.standard}:{alert.isoReference.clause}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Risk Matrix */}
        <div className="col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Matrix (ISO 14971)</h3>

          <div className="flex">
            {/* Y-axis label */}
            <div className="flex flex-col items-center justify-center w-8">
              <span className="transform -rotate-90 whitespace-nowrap text-sm font-medium text-gray-600">
                Severity →
              </span>
            </div>

            <div className="flex-1">
              {/* Matrix */}
              <div className="border border-surface-200 rounded-lg overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-6 bg-surface-50">
                  <div className="p-2 border-r border-b border-surface-200" />
                  {probabilityLevels.map((p) => (
                    <div
                      key={p}
                      className="p-2 text-center border-r border-b border-surface-200 last:border-r-0"
                    >
                      <p className="text-xs font-medium text-gray-700">{p}</p>
                      <p className="text-[10px] text-gray-500">{probabilityLabels[p]}</p>
                    </div>
                  ))}
                </div>

                {/* Matrix rows */}
                {severityLevels.map((s) => (
                  <div key={s} className="grid grid-cols-6">
                    {/* Row header */}
                    <div className="p-2 border-r border-b border-surface-200 bg-surface-50">
                      <p className="text-xs font-medium text-gray-700">{s}</p>
                      <p className="text-[10px] text-gray-500">{severityLabels[s]}</p>
                    </div>

                    {/* Cells */}
                    {probabilityLevels.map((p) => {
                      const cellAssessments = getAssessmentsInCell(s, p);
                      const riskIndex = calculateRiskIndex(s, p);
                      const level = getRiskLevel(riskIndex);

                      return (
                        <div
                          key={`${s}-${p}`}
                          className={cn(
                            'risk-cell border-r border-b border-surface-200 last:border-r-0 relative',
                            getCellColor(s, p)
                          )}
                          title={`Risk Index: ${riskIndex} (${level})`}
                        >
                          <span className="text-xs font-semibold">{riskIndex}</span>
                          {cellAssessments.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-gray-900 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                              {cellAssessments.length}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* X-axis label */}
              <p className="text-center text-sm font-medium text-gray-600 mt-2">
                Probability →
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded risk-low" />
              <span className="text-sm text-gray-600">Low (1-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded risk-medium" />
              <span className="text-sm text-gray-600">Medium (5-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded risk-high" />
              <span className="text-sm text-gray-600">High (10-15)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded risk-critical" />
              <span className="text-sm text-gray-600">Critical (16-25)</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assessments</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="text-sm border border-surface-200 rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map((level) => {
              const count = riskAssessments.filter(
                (ra) => ra.riskLevel === level && ra.status !== 'Closed'
              ).length;
              return (
                <div
                  key={level}
                  className={cn(
                    'p-3 rounded-lg',
                    level === 'Low' && 'bg-green-50',
                    level === 'Medium' && 'bg-yellow-50',
                    level === 'High' && 'bg-orange-50',
                    level === 'Critical' && 'bg-red-50'
                  )}
                >
                  <p className={cn('text-2xl font-bold', getRiskColor(level))}>{count}</p>
                  <p className="text-xs text-gray-600">{level} Risk</p>
                </div>
              );
            })}
          </div>

          {/* Assessment List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredAssessments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No assessments found</p>
            ) : (
              filteredAssessments.slice(0, 10).map((ra) => (
                <div key={ra.id} className="p-3 bg-surface-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ra.hazardDescription}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium text-white',
                          getRiskBgColor(ra.riskLevel)
                        )}>
                          {ra.riskLevel}
                        </span>
                        <span className="text-xs text-gray-500">
                          S:{ra.severity} × P:{ra.probability} = {ra.riskIndex}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      ra.status === 'Open' && 'bg-red-100 text-red-700',
                      ra.status === 'In Review' && 'bg-yellow-100 text-yellow-700',
                      ra.status === 'Closed' && 'bg-green-100 text-green-700'
                    )}>
                      {ra.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ISO 14971 Reference */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">ISO 14971:2019 Risk Management Process</h4>
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="font-medium text-primary-800">1. Analysis</p>
            <p className="text-primary-600 text-xs">Identify hazards and estimate risks (Clause 5)</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">2. Evaluation</p>
            <p className="text-primary-600 text-xs">Determine risk acceptability (Clause 6)</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">3. Control</p>
            <p className="text-primary-600 text-xs">Implement risk controls (Clause 7)</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">4. Review</p>
            <p className="text-primary-600 text-xs">Evaluate overall residual risk (Clause 8)</p>
          </div>
          <div>
            <p className="font-medium text-primary-800">5. Production</p>
            <p className="text-primary-600 text-xs">Monitor post-production (Clause 10)</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && <RiskAssessmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
