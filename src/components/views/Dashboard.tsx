import { useAppStore } from '../../stores/app-store';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileWarning,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import MetricCard from '../ui/MetricCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const {
    getDashboardMetrics,
    getCAPAStats,
    getNCRStats,
    getUnacknowledgedAlerts,
    setActiveView,
    setSelectedMetricId,
  } = useAppStore();

  const dashboardMetrics = getDashboardMetrics();
  const capaStats = getCAPAStats();
  const ncrStats = getNCRStats();
  const alerts = getUnacknowledgedAlerts();

  // Group metrics by category
  const qualityMetrics = dashboardMetrics.filter(dm => dm.metric.category === 'Quality');
  const complianceMetrics = dashboardMetrics.filter(dm => dm.metric.category === 'Compliance');
  const operationalMetrics = dashboardMetrics.filter(dm => dm.metric.category === 'Operational');
  const financialMetrics = dashboardMetrics.filter(dm => dm.metric.category === 'Financial');

  // Calculate summary stats
  const redMetrics = dashboardMetrics.filter(dm => dm.status === 'red').length;
  const yellowMetrics = dashboardMetrics.filter(dm => dm.status === 'yellow').length;
  const greenMetrics = dashboardMetrics.filter(dm => dm.status === 'green').length;

  // Sample trend data for charts
  const trendData = [
    { name: 'Week 1', fpy: 94.5, ncr: 2.1, oee: 82 },
    { name: 'Week 2', fpy: 95.2, ncr: 1.8, oee: 84 },
    { name: 'Week 3', fpy: 94.8, ncr: 2.0, oee: 83 },
    { name: 'Week 4', fpy: 96.1, ncr: 1.5, oee: 86 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Overall Compliance Status */}
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Overall Status</p>
              <p className="text-3xl font-bold mt-1">
                {redMetrics === 0 && yellowMetrics === 0 ? 'Compliant' : redMetrics > 0 ? 'Action Needed' : 'Monitor'}
              </p>
            </div>
            {redMetrics === 0 && yellowMetrics === 0 ? (
              <CheckCircle className="w-12 h-12 text-primary-200" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-primary-200" />
            )}
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-300" />
              {greenMetrics} Green
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-300" />
              {yellowMetrics} Yellow
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-300" />
              {redMetrics} Red
            </span>
          </div>
        </div>

        {/* CAPA Status */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">CAPA Status</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{capaStats.open} Open</p>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              capaStats.overdue > 0 ? 'bg-red-100' : 'bg-green-100'
            )}>
              <Clock className={cn(
                'w-6 h-6',
                capaStats.overdue > 0 ? 'text-red-600' : 'text-green-600'
              )} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {capaStats.overdue > 0 ? (
              <span className="text-sm text-red-600 font-medium">
                {capaStats.overdue} overdue - Action required
              </span>
            ) : (
              <span className="text-sm text-green-600">All on track</span>
            )}
          </div>
        </div>

        {/* NCR Status */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">NCR Status</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{ncrStats.open} Open</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FileWarning className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex gap-2 text-xs">
              {Object.entries(ncrStats.byType).slice(0, 3).map(([type, count]) => (
                <span key={type} className="badge-gray">{type}: {count}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{alerts.length}</p>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              alerts.some(a => a.type === 'Critical') ? 'bg-red-100' : alerts.length > 0 ? 'bg-yellow-100' : 'bg-green-100'
            )}>
              <AlertTriangle className={cn(
                'w-6 h-6',
                alerts.some(a => a.type === 'Critical') ? 'text-red-600' : alerts.length > 0 ? 'text-yellow-600' : 'text-green-600'
              )} />
            </div>
          </div>
          <div className="mt-4">
            {alerts.length > 0 ? (
              <button
                onClick={() => setActiveView('risk')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all alerts →
              </button>
            ) : (
              <span className="text-sm text-green-600">No active alerts</span>
            )}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="fpy"
                name="FPY %"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="oee"
                name="OEE %"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality & Compliance Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quality & Compliance Metrics (KCIs)</h3>
          <button
            onClick={() => setActiveView('metrics')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...qualityMetrics, ...complianceMetrics].slice(0, 8).map((dm) => (
            <MetricCard
              key={dm.metric.id}
              metric={dm.metric}
              value={dm.currentValue}
              status={dm.status}
              trend={dm.trend}
              changePercent={dm.changePercent}
              onClick={() => {
                setSelectedMetricId(dm.metric.id);
                setActiveView('metrics');
              }}
            />
          ))}
        </div>
      </div>

      {/* Operational & Financial Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Operational Performance (KPIs)</h3>
        <div className="grid grid-cols-4 gap-4">
          {[...operationalMetrics, ...financialMetrics].slice(0, 8).map((dm) => (
            <MetricCard
              key={dm.metric.id}
              metric={dm.metric}
              value={dm.currentValue}
              status={dm.status}
              trend={dm.trend}
              changePercent={dm.changePercent}
              onClick={() => {
                setSelectedMetricId(dm.metric.id);
                setActiveView('metrics');
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-4 rounded-lg border',
                  alert.type === 'Critical' && 'bg-red-50 border-red-200',
                  alert.type === 'Warning' && 'bg-yellow-50 border-yellow-200',
                  alert.type === 'Info' && 'bg-blue-50 border-blue-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={cn(
                      'w-5 h-5 mt-0.5',
                      alert.type === 'Critical' && 'text-red-600',
                      alert.type === 'Warning' && 'text-yellow-600',
                      alert.type === 'Info' && 'text-blue-600'
                    )} />
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      {alert.isoReference && (
                        <p className="text-xs text-primary-600 mt-1 font-medium">
                          {alert.isoReference.standard}:{alert.isoReference.clause}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
