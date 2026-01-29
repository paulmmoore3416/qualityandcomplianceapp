import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { METRICS_CONFIG } from '../../data/metrics-config';
import { X, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import {
  calculateFPY,
  calculateNCRRate,
  calculateCAPAClosureRate,
  calculateOEE,
  calculateLAR,
  calculateScrapRate,
} from '../../lib/compliance-engine';
import { getMetricStatus } from '../../data/metrics-config';

interface MetricEntryModalProps {
  onClose: () => void;
  preselectedMetricId?: string;
}

export default function MetricEntryModal({ onClose, preselectedMetricId }: MetricEntryModalProps) {
  const { addMetricValue } = useAppStore();

  const [selectedMetricId, setSelectedMetricId] = useState(preselectedMetricId || '');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [user, setUser] = useState('Quality Engineer');

  const selectedMetric = METRICS_CONFIG.find((m) => m.id === selectedMetricId);

  const getInputFields = (metricId: string): { key: string; label: string; placeholder: string }[] => {
    const inputConfigs: Record<string, { key: string; label: string; placeholder: string }[]> = {
      M001: [
        { key: 'totalStarted', label: 'Total Units Started', placeholder: '1000' },
        { key: 'passedFirstTime', label: 'Passed First Time', placeholder: '950' },
      ],
      M002: [
        { key: 'totalNCRs', label: 'Total NCRs', placeholder: '15' },
        { key: 'totalUnits', label: 'Total Units Produced', placeholder: '1000' },
      ],
      M003: [
        { key: 'closedCAPAs', label: 'Closed CAPAs', placeholder: '18' },
        { key: 'totalOpenCAPAs', label: 'Total Open CAPAs', placeholder: '5' },
      ],
      M004: [
        { key: 'overdueCAPAs', label: 'Overdue CAPAs', placeholder: '2' },
        { key: 'totalOpenCAPAs', label: 'Total Open CAPAs', placeholder: '10' },
      ],
      M005: [
        { key: 'releasedLots', label: 'Released Lots', placeholder: '48' },
        { key: 'totalLots', label: 'Total Lots Manufactured', placeholder: '50' },
      ],
      M010: [
        { key: 'availability', label: 'Availability (%)', placeholder: '90' },
        { key: 'performance', label: 'Performance (%)', placeholder: '95' },
        { key: 'quality', label: 'Quality (%)', placeholder: '98' },
      ],
      M019: [
        { key: 'scrapValue', label: 'Scrap Value ($)', placeholder: '5000' },
        { key: 'totalMaterialValue', label: 'Total Material Value ($)', placeholder: '250000' },
      ],
    };

    return inputConfigs[metricId] || [{ key: 'value', label: 'Value', placeholder: '0' }];
  };

  const calculateMetricValue = () => {
    if (!selectedMetric) return;

    const numInputs: Record<string, number> = {};
    Object.entries(inputs).forEach(([key, val]) => {
      numInputs[key] = parseFloat(val) || 0;
    });

    let value: number;

    switch (selectedMetricId) {
      case 'M001':
        value = calculateFPY(numInputs.totalStarted, numInputs.passedFirstTime);
        break;
      case 'M002':
        value = calculateNCRRate(numInputs.totalNCRs, numInputs.totalUnits);
        break;
      case 'M003':
        value = calculateCAPAClosureRate(numInputs.closedCAPAs, numInputs.totalOpenCAPAs);
        break;
      case 'M004':
        value = numInputs.totalOpenCAPAs > 0
          ? (numInputs.overdueCAPAs / numInputs.totalOpenCAPAs) * 100
          : 0;
        break;
      case 'M005':
        value = calculateLAR(numInputs.releasedLots, numInputs.totalLots);
        break;
      case 'M010':
        const oeeResult = calculateOEE(numInputs.availability, numInputs.performance, numInputs.quality);
        value = oeeResult.oee;
        break;
      case 'M019':
        value = calculateScrapRate(numInputs.scrapValue, numInputs.totalMaterialValue);
        break;
      default:
        value = numInputs.value || 0;
    }

    setCalculatedValue(value);
  };

  const handleSubmit = () => {
    if (!selectedMetric || calculatedValue === null) return;

    const numInputs: Record<string, number> = {};
    Object.entries(inputs).forEach(([key, val]) => {
      numInputs[key] = parseFloat(val) || 0;
    });

    addMetricValue(selectedMetricId, calculatedValue, numInputs, user, notes);
    onClose();
  };

  const inputFields = selectedMetricId ? getInputFields(selectedMetricId) : [];
  const status = selectedMetric && calculatedValue !== null
    ? getMetricStatus(selectedMetric, calculatedValue)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Record Metric Value</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Metric
          </label>
          <select
            value={selectedMetricId}
            onChange={(e) => {
              setSelectedMetricId(e.target.value);
              setInputs({});
              setCalculatedValue(null);
            }}
            className="input"
          >
            <option value="">Choose a metric...</option>
            {METRICS_CONFIG.map((m) => (
              <option key={m.id} value={m.id}>
                {m.shortName} - {m.name}
              </option>
            ))}
          </select>
        </div>

        {selectedMetric && (
          <>
            {/* Metric Info */}
            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>Formula:</strong> {selectedMetric.formula}
              </p>
              <p className="text-xs text-primary-600 mt-1">
                ISO Reference: {selectedMetric.isoMappings[0]?.standard}:{selectedMetric.isoMappings[0]?.clause}
              </p>
            </div>

            {/* Input Fields */}
            <div className="space-y-3 mb-4">
              {inputFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={inputs[field.key] || ''}
                    onChange={(e) => setInputs({ ...inputs, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input"
                  />
                </div>
              ))}
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateMetricValue}
              className="btn-secondary w-full mb-4 gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calculate Value
            </button>

            {/* Calculated Result */}
            {calculatedValue !== null && (
              <div className={cn(
                'p-4 rounded-lg mb-4 border',
                status === 'green' && 'bg-green-50 border-green-200',
                status === 'yellow' && 'bg-yellow-50 border-yellow-200',
                status === 'red' && 'bg-red-50 border-red-200'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Calculated Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(calculatedValue, 2)}{selectedMetric.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'green' && <CheckCircle className="w-6 h-6 text-green-600" />}
                    {status === 'yellow' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                    {status === 'red' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                    <span className={cn(
                      'font-medium capitalize',
                      status === 'green' && 'text-green-700',
                      status === 'yellow' && 'text-yellow-700',
                      status === 'red' && 'text-red-700'
                    )}>
                      {status}
                    </span>
                  </div>
                </div>
                {status === 'red' && (
                  <p className="mt-2 text-sm text-red-600">
                    This value requires immediate attention. Consider initiating a CAPA per ISO 13485:8.5.2.
                  </p>
                )}
              </div>
            )}

            {/* User and Notes */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recorded By
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="Add any relevant observations or context..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={calculatedValue === null}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Record
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
