import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { METRICS_CONFIG } from '../../data/metrics-config';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateRiskIndex, getRiskLevel, isMitigationRequired } from '../../lib/compliance-engine';
import { SeverityLevel, ProbabilityLevel } from '../../types';

interface RiskAssessmentModalProps {
  onClose: () => void;
}

export default function RiskAssessmentModal({ onClose }: RiskAssessmentModalProps) {
  const { addRiskAssessment } = useAppStore();

  const [metricId, setMetricId] = useState('');
  const [hazardDescription, setHazardDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>(1);
  const [probability, setProbability] = useState<ProbabilityLevel>(1);
  const [mitigationPlan, setMitigationPlan] = useState('');

  const riskIndex = calculateRiskIndex(severity, probability);
  const riskLevel = getRiskLevel(riskIndex);
  const needsMitigation = isMitigationRequired(riskLevel);

  const severityOptions: { value: SeverityLevel; label: string; description: string }[] = [
    { value: 1, label: 'Negligible (1)', description: 'No injury or impact' },
    { value: 2, label: 'Minor (2)', description: 'Temporary discomfort, no intervention needed' },
    { value: 3, label: 'Moderate (3)', description: 'Injury requiring medical intervention' },
    { value: 4, label: 'Major (4)', description: 'Permanent impairment or life-threatening' },
    { value: 5, label: 'Catastrophic (5)', description: 'Death or multiple serious injuries' },
  ];

  const probabilityOptions: { value: ProbabilityLevel; label: string; description: string }[] = [
    { value: 1, label: 'Rare (1)', description: '< 1 in 100,000' },
    { value: 2, label: 'Unlikely (2)', description: '1 in 10,000 to 1 in 100,000' },
    { value: 3, label: 'Possible (3)', description: '1 in 1,000 to 1 in 10,000' },
    { value: 4, label: 'Likely (4)', description: '1 in 100 to 1 in 1,000' },
    { value: 5, label: 'Frequent (5)', description: '> 1 in 100' },
  ];

  const handleSubmit = () => {
    if (!hazardDescription || (needsMitigation && !mitigationPlan)) return;

    addRiskAssessment({
      metricId,
      hazardDescription,
      severity,
      probability,
      riskIndex,
      riskLevel,
      mitigationRequired: needsMitigation,
      mitigationPlan: needsMitigation ? mitigationPlan : undefined,
      status: needsMitigation ? 'Open' : 'Closed',
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Risk Assessment</h2>
            <p className="text-sm text-gray-500">Per ISO 14971:2019 Clause 5 - Risk Analysis</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Related Metric */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Metric (Optional)
            </label>
            <select
              value={metricId}
              onChange={(e) => setMetricId(e.target.value)}
              className="input"
            >
              <option value="">Not linked to a specific metric</option>
              {METRICS_CONFIG.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.shortName} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hazard Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hazard Description *
            </label>
            <textarea
              value={hazardDescription}
              onChange={(e) => setHazardDescription(e.target.value)}
              rows={2}
              className="input"
              placeholder="Describe the identified hazard and hazardous situation..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Per ISO 14971:5.4 - Identification of hazards and hazardous situations
            </p>
          </div>

          {/* Severity & Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity (S)
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value) as SeverityLevel)}
                className="input"
              >
                {severityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {severityOptions.find((o) => o.value === severity)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probability (P)
              </label>
              <select
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value) as ProbabilityLevel)}
                className="input"
              >
                {probabilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {probabilityOptions.find((o) => o.value === probability)?.description}
              </p>
            </div>
          </div>

          {/* Risk Calculation Result */}
          <div className={cn(
            'p-4 rounded-lg border',
            riskLevel === 'Low' && 'bg-green-50 border-green-200',
            riskLevel === 'Medium' && 'bg-yellow-50 border-yellow-200',
            riskLevel === 'High' && 'bg-orange-50 border-orange-200',
            riskLevel === 'Critical' && 'bg-red-50 border-red-200'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Index (S × P)</p>
                <p className="text-3xl font-bold text-gray-900">{riskIndex}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Risk Level</p>
                <p className={cn(
                  'text-2xl font-bold',
                  riskLevel === 'Low' && 'text-green-700',
                  riskLevel === 'Medium' && 'text-yellow-700',
                  riskLevel === 'High' && 'text-orange-700',
                  riskLevel === 'Critical' && 'text-red-700'
                )}>
                  {riskLevel}
                </p>
              </div>
            </div>

            {needsMitigation && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <AlertTriangle className={cn(
                  'w-4 h-4',
                  riskLevel === 'High' ? 'text-orange-600' : 'text-red-600'
                )} />
                <span className={riskLevel === 'High' ? 'text-orange-700' : 'text-red-700'}>
                  Risk control measures required per ISO 14971:7
                </span>
              </div>
            )}
          </div>

          {/* Mitigation Plan (required for High/Critical) */}
          {needsMitigation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Control / Mitigation Plan *
              </label>
              <textarea
                value={mitigationPlan}
                onChange={(e) => setMitigationPlan(e.target.value)}
                rows={3}
                className="input"
                placeholder="Describe the risk control measures to be implemented..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Per ISO 14971:7.1 - Risk control option analysis. Consider: inherent safety, protective
                measures, and information for safety.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hazardDescription || (needsMitigation && !mitigationPlan)}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
