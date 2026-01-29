import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Plus, GitBranch, CheckCircle, ArrowRight } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { LifecyclePhase } from '../../types';
import { getLifecycleMetrics } from '../../lib/compliance-engine';
import { METRICS_CONFIG } from '../../data/metrics-config';

const LIFECYCLE_PHASES: { phase: LifecyclePhase; isoFocus: string; description: string }[] = [
  {
    phase: 'Design',
    isoFocus: 'ISO 13485:7.3',
    description: 'Design and development planning, inputs, outputs, review, verification',
  },
  {
    phase: 'Verification',
    isoFocus: 'ISO 13485:7.3.6',
    description: 'Design and development verification to ensure outputs meet inputs',
  },
  {
    phase: 'Validation',
    isoFocus: 'ISO 13485:7.3.7',
    description: 'Design and development validation under defined operating conditions',
  },
  {
    phase: 'Production',
    isoFocus: 'ISO 13485:7.5',
    description: 'Production and service provision, process validation, identification',
  },
  {
    phase: 'Post-Market',
    isoFocus: 'ISO 13485:8.2.1',
    description: 'Feedback, complaint handling, vigilance, post-market surveillance',
  },
];

export default function LifecycleView() {
  const { lifecycleRecords } = useAppStore();

  const [selectedPhase, setSelectedPhase] = useState<LifecyclePhase>('Production');

  const phaseMetricIds = getLifecycleMetrics(selectedPhase);
  const phaseMetrics = METRICS_CONFIG.filter((m) => phaseMetricIds.includes(m.id));

  const activeRecords = lifecycleRecords.filter((r) => r.status === 'Active');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lifecycle Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Product lifecycle tracking per ISO 13485:2016 and ISO 14971
          </p>
        </div>
        <button className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Lifecycle Flow */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Device Lifecycle Phases</h3>
        <div className="flex items-center justify-between">
          {LIFECYCLE_PHASES.map((item, index) => (
            <div key={item.phase} className="flex items-center">
              <button
                onClick={() => setSelectedPhase(item.phase)}
                className={cn(
                  'flex flex-col items-center p-4 rounded-lg transition-all duration-200',
                  selectedPhase === item.phase
                    ? 'bg-primary-100 ring-2 ring-primary-500'
                    : 'hover:bg-surface-100'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  selectedPhase === item.phase
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-200 text-gray-600'
                )}>
                  <GitBranch className="w-6 h-6" />
                </div>
                <p className={cn(
                  'font-medium text-sm',
                  selectedPhase === item.phase ? 'text-primary-700' : 'text-gray-700'
                )}>
                  {item.phase}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.isoFocus}</p>
              </button>
              {index < LIFECYCLE_PHASES.length - 1 && (
                <ArrowRight className="w-6 h-6 text-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Phase Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedPhase} Phase</h3>

          {/* Phase Info */}
          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-primary-800">
              {LIFECYCLE_PHASES.find((p) => p.phase === selectedPhase)?.isoFocus}
            </p>
            <p className="text-sm text-primary-600 mt-1">
              {LIFECYCLE_PHASES.find((p) => p.phase === selectedPhase)?.description}
            </p>
          </div>

          {/* Key Metrics for Phase */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Metrics</h4>
            <div className="space-y-2">
              {phaseMetrics.length > 0 ? (
                phaseMetrics.map((metric) => (
                  <div key={metric.id} className="p-3 bg-surface-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{metric.shortName}</p>
                        <p className="text-xs text-gray-500">{metric.name}</p>
                      </div>
                      <span className="text-xs text-primary-600 font-medium">
                        {metric.isoMappings[0]?.clause}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No specific metrics for this phase</p>
              )}
            </div>
          </div>

          {/* Risk Management Requirements */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              ISO 14971 Risk Management Tasks
            </h4>
            <div className="space-y-2">
              {selectedPhase === 'Design' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Hazard identification (5.4)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risk estimation (5.5)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risk evaluation (6)</span>
                  </div>
                </>
              )}
              {selectedPhase === 'Verification' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risk control implementation (7.2)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Residual risk evaluation (7.3)</span>
                  </div>
                </>
              )}
              {selectedPhase === 'Validation' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Benefit-risk analysis (7.4)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Overall residual risk (8)</span>
                  </div>
                </>
              )}
              {selectedPhase === 'Production' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Production information collection (10)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risk management review (9)</span>
                  </div>
                </>
              )}
              {selectedPhase === 'Post-Market' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Post-production information review (10)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risk management file update (4.5)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Products</h3>

          {activeRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No active products in lifecycle tracking</p>
              <button className="btn-primary btn-sm mt-4">Add Product</button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecords.map((record) => (
                <div key={record.id} className="p-4 bg-surface-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{record.productCode}</p>
                      <p className="text-sm text-gray-500">Phase: {record.phase}</p>
                    </div>
                    <span className={cn(
                      'badge',
                      record.status === 'Active' && 'badge-green',
                      record.status === 'Completed' && 'badge-blue',
                      record.status === 'On Hold' && 'badge-yellow'
                    )}>
                      {record.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>Started: {formatDate(record.startDate)}</span>
                    {record.targetEndDate && (
                      <span>Target: {formatDate(record.targetEndDate)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Framework Reference */}
      <div className="card bg-surface-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Regulatory Frameworks</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-surface-200">
            <p className="font-medium text-gray-900">FDA 21 CFR Part 820</p>
            <p className="text-sm text-gray-500 mt-1">US Quality System Regulation</p>
            <p className="text-xs text-primary-600 mt-2">Subpart C - Design Controls (820.30)</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-surface-200">
            <p className="font-medium text-gray-900">EU MDR 2017/745</p>
            <p className="text-sm text-gray-500 mt-1">European Medical Device Regulation</p>
            <p className="text-xs text-primary-600 mt-2">Annex II - Technical Documentation</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-surface-200">
            <p className="font-medium text-gray-900">IEC 62304</p>
            <p className="text-sm text-gray-500 mt-1">Medical Device Software Lifecycle</p>
            <p className="text-xs text-primary-600 mt-2">Software safety classification</p>
          </div>
        </div>
      </div>
    </div>
  );
}
