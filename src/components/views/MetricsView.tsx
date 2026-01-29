import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn, formatNumber, formatDateTime } from '../../lib/utils';
import MetricEntryModal from '../modals/MetricEntryModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type CategoryFilter = 'all' | 'Quality' | 'Compliance' | 'Operational' | 'Financial';

export default function MetricsView() {
  const {
    getDashboardMetrics,
    getMetricHistory,
    selectedMetricId,
    setSelectedMetricId,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showEntryModal, setShowEntryModal] = useState(false);

  const dashboardMetrics = getDashboardMetrics();

  const filteredMetrics = dashboardMetrics.filter((dm) => {
    const matchesSearch = dm.metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dm.metric.shortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || dm.metric.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedMetricData = selectedMetricId
    ? dashboardMetrics.find((dm) => dm.metric.id === selectedMetricId)
    : null;

  const selectedHistory = selectedMetricId
    ? getMetricHistory(selectedMetricId, 30)
    : [];

  const chartData = selectedHistory
    .map((v) => ({
      date: formatDateTime(v.timestamp).split(',')[0],
      value: v.value,
    }))
    .reverse();

  const categories: CategoryFilter[] = ['all', 'Quality', 'Compliance', 'Operational', 'Financial'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Metrics Management</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage quality, compliance, and operational metrics</p>
        </div>
        <button
          onClick={() => setShowEntryModal(true)}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Value
        </button>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                categoryFilter === cat
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Metrics List */}
        <div className="col-span-1 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredMetrics.map((dm) => (
            <div
              key={dm.metric.id}
              onClick={() => setSelectedMetricId(dm.metric.id)}
              className={cn(
                'card cursor-pointer transition-all duration-200 hover:shadow-card-hover border-l-4',
                dm.status === 'green' && 'border-l-compliance-green',
                dm.status === 'yellow' && 'border-l-compliance-yellow',
                dm.status === 'red' && 'border-l-compliance-red',
                selectedMetricId === dm.metric.id && 'ring-2 ring-primary-500'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{dm.metric.shortName}</p>
                  <p className="text-xs text-gray-500">{dm.metric.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {dm.currentValue ? `${formatNumber(dm.currentValue.value, 1)}${dm.metric.unit}` : '--'}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {dm.trend === 'improving' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {dm.trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    {dm.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                    <span className={cn(
                      'text-xs',
                      dm.trend === 'improving' && 'text-green-600',
                      dm.trend === 'declining' && 'text-red-600',
                      dm.trend === 'stable' && 'text-gray-500'
                    )}>
                      {dm.changePercent !== undefined
                        ? `${dm.changePercent > 0 ? '+' : ''}${formatNumber(dm.changePercent, 1)}%`
                        : 'No change'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metric Detail Panel */}
        <div className="col-span-2">
          {selectedMetricData ? (
            <div className="card space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedMetricData.metric.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedMetricData.metric.description}</p>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  selectedMetricData.status === 'green' && 'bg-green-100 text-green-700',
                  selectedMetricData.status === 'yellow' && 'bg-yellow-100 text-yellow-700',
                  selectedMetricData.status === 'red' && 'bg-red-100 text-red-700'
                )}>
                  {selectedMetricData.status.toUpperCase()}
                </span>
              </div>

              {/* Current Value */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {selectedMetricData.currentValue
                      ? `${formatNumber(selectedMetricData.currentValue.value, 2)}${selectedMetricData.metric.unit}`
                      : '--'}
                  </p>
                </div>
                <div className="bg-surface-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Target (Green)</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {selectedMetricData.metric.threshold.direction === 'higher-better' ? '≥' : '≤'}
                    {selectedMetricData.metric.threshold.green}{selectedMetricData.metric.unit}
                  </p>
                </div>
                <div className="bg-surface-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Formula</p>
                  <p className="text-sm font-mono text-gray-700 mt-1">{selectedMetricData.metric.formula}</p>
                </div>
              </div>

              {/* Trend Chart */}
              {chartData.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Historical Trend</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        />
                        <ReferenceLine
                          y={selectedMetricData.metric.threshold.green}
                          stroke="#10b981"
                          strokeDasharray="5 5"
                          label={{ value: 'Target', position: 'right', fontSize: 10 }}
                        />
                        <ReferenceLine
                          y={selectedMetricData.metric.threshold.yellow}
                          stroke="#f59e0b"
                          strokeDasharray="5 5"
                        />
                        <ReferenceLine
                          y={selectedMetricData.metric.threshold.red}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ISO References */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  ISO Standard References
                </h4>
                <div className="space-y-2">
                  {selectedMetricData.metric.isoMappings.map((mapping, idx) => (
                    <div key={idx} className="bg-primary-50 rounded-lg p-3">
                      <p className="font-medium text-primary-800">
                        {mapping.standard}:{mapping.clause}
                      </p>
                      <p className="text-sm text-primary-600">{mapping.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Impact & Workaround */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Impact</h4>
                  <p className="text-sm text-gray-600 bg-surface-50 rounded-lg p-3">
                    {selectedMetricData.metric.riskImpact}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Workaround Suggestion</h4>
                  <p className="text-sm text-gray-600 bg-surface-50 rounded-lg p-3">
                    {selectedMetricData.metric.workaroundSuggestion}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center h-96 text-gray-500">
              <Info className="w-12 h-12 mb-4 text-gray-300" />
              <p>Select a metric to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Metric Entry Modal */}
      {showEntryModal && (
        <MetricEntryModal onClose={() => setShowEntryModal(false)} />
      )}
    </div>
  );
}
