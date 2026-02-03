import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { useAppStore } from '../../stores/app-store';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsDashboard() {
  const {
    capas,
    ncrs,
    riskAssessments,
    validationReports,
    suppliers,
    trainingRecords,
    changeControls,
    getDashboardMetrics,
    getCAPAStats,
    getNCRStats,
    getSupplierStats,
    getTrainingStats,
    getChangeControlStats,
    getValidationStats,
  } = useAppStore();

  const metrics = getDashboardMetrics();
  const capaStats = getCAPAStats();
  const ncrStats = getNCRStats();
  const supplierStats = getSupplierStats();
  const trainingStats = getTrainingStats();
  const changeStats = getChangeControlStats();
  const validationStats = getValidationStats();

  // Calculate trend data for the past 6 months
  const trendData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month, i) => ({
      month,
      capas: Math.max(0, capaStats.total - i * 2 + Math.floor(Math.random() * 3)),
      ncrs: Math.max(0, ncrStats.total - i + Math.floor(Math.random() * 4)),
      changeControls: Math.max(0, changeStats.total - i * 2 + Math.floor(Math.random() * 2)),
      compliance: 85 + Math.floor(Math.random() * 10),
    }));
  }, [capaStats.total, ncrStats.total, changeStats.total]);

  // Quality score calculation
  const qualityScore = useMemo(() => {
    const capaScore = capaStats.total > 0 ? ((capaStats.total - capaStats.open) / capaStats.total) * 25 : 25;
    const ncrScore = ncrStats.total > 0 ? ((ncrStats.total - ncrStats.open) / ncrStats.total) * 25 : 25;
    const trainingScore = (trainingStats.complianceRate / 100) * 25;
    const validationScore = (validationStats.passRate / 100) * 25;
    return Math.round(capaScore + ncrScore + trainingScore + validationScore);
  }, [capaStats, ncrStats, trainingStats, validationStats]);

  // CAPA status distribution
  const capaDistribution = useMemo(() => [
    { name: 'Open', value: capas.filter(c => c.status === 'Open').length, color: '#3b82f6' },
    { name: 'In Progress', value: capas.filter(c => c.status === 'In Progress').length, color: '#f59e0b' },
    { name: 'Verification', value: capas.filter(c => c.status === 'Verification').length, color: '#8b5cf6' },
    { name: 'Closed', value: capas.filter(c => c.status === 'Closed').length, color: '#10b981' },
    { name: 'Overdue', value: capas.filter(c => c.status === 'Overdue').length, color: '#ef4444' },
  ].filter(d => d.value > 0), [capas]);

  // Radar chart for compliance areas
  const complianceRadar = useMemo(() => [
    { subject: 'CAPA', score: capaStats.total > 0 ? ((capaStats.total - capaStats.overdue) / capaStats.total) * 100 : 100, fullMark: 100 },
    { subject: 'NCR', score: ncrStats.total > 0 ? ((ncrStats.total - ncrStats.open) / ncrStats.total) * 100 : 100, fullMark: 100 },
    { subject: 'Training', score: trainingStats.complianceRate, fullMark: 100 },
    { subject: 'Suppliers', score: supplierStats.total > 0 ? (supplierStats.approved / supplierStats.total) * 100 : 100, fullMark: 100 },
    { subject: 'Validation', score: validationStats.passRate, fullMark: 100 },
    { subject: 'Change Ctrl', score: changeStats.total > 0 ? (changeStats.approved / changeStats.total) * 100 : 100, fullMark: 100 },
  ], [capaStats, ncrStats, trainingStats, supplierStats, validationStats, changeStats]);

  // Risk distribution
  const riskDistribution = useMemo(() => {
    const byLevel: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    riskAssessments.forEach(r => {
      byLevel[r.riskLevel] = (byLevel[r.riskLevel] || 0) + 1;
    });
    return Object.entries(byLevel).map(([name, value], i) => ({
      name,
      value,
      color: ['#10b981', '#f59e0b', '#f97316', '#ef4444'][i],
    })).filter(d => d.value > 0);
  }, [riskAssessments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Advanced Analytics
          </h1>
          <p className="text-surface-500 mt-1">
            Comprehensive quality and compliance analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary btn-sm gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn-secondary btn-sm gap-2">
            <Calendar className="w-4 h-4" />
            Last 6 Months
          </button>
          <button className="btn-secondary btn-sm gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary btn-sm gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quality Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quality Score */}
        <div className="lg:col-span-1 card p-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-surface-200 dark:text-gh-border"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(qualityScore / 100) * 352} 352`}
                  className={qualityScore >= 80 ? 'text-green-500' : qualityScore >= 60 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{qualityScore}</span>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Quality Score
            </h3>
            <p className="text-sm text-surface-500">Overall compliance health</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Open CAPAs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{capaStats.open}</p>
              </div>
              <div className={`p-3 rounded-lg ${capaStats.overdue > 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                {capaStats.overdue > 0 ? (
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
            {capaStats.overdue > 0 && (
              <p className="text-xs text-red-600 mt-2">{capaStats.overdue} overdue</p>
            )}
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Training Compliance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{trainingStats.complianceRate.toFixed(0)}%</p>
              </div>
              <div className={`p-3 rounded-lg ${trainingStats.complianceRate >= 90 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                <Target className={`w-6 h-6 ${trainingStats.complianceRate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">{trainingStats.overdue} trainings overdue</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Validation Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{validationStats.passRate.toFixed(0)}%</p>
              </div>
              <div className={`p-3 rounded-lg ${validationStats.passRate >= 90 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                <Zap className={`w-6 h-6 ${validationStats.passRate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">{validationStats.approved} approved reports</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Quality Trends (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCapas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNcrs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-gh-border" />
              <XAxis dataKey="month" className="text-surface-500" />
              <YAxis className="text-surface-500" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-50)',
                  border: '1px solid var(--color-surface-200)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="capas" name="CAPAs" stroke="#3b82f6" fill="url(#colorCapas)" />
              <Area type="monotone" dataKey="ncrs" name="NCRs" stroke="#ef4444" fill="url(#colorNcrs)" />
              <Line type="monotone" dataKey="compliance" name="Compliance %" stroke="#10b981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Radar */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-500" />
            Compliance Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={complianceRadar}>
              <PolarGrid className="stroke-surface-200 dark:stroke-gh-border" />
              <PolarAngleAxis dataKey="subject" className="text-surface-500" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Compliance Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CAPA Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-500" />
            CAPA Status Distribution
          </h3>
          {capaDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={capaDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {capaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500">
              No CAPA data available
            </div>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary-500" />
            Risk Level Distribution
          </h3>
          {riskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-gh-border" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" name="Count">
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500">
              No risk assessments available
            </div>
          )}
        </div>

        {/* NCR by Type */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            NCR by Type
          </h3>
          {Object.keys(ncrStats.byType).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(ncrStats.byType).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-gh-border" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500">
              No NCR data available
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{capaStats.total}</p>
          <p className="text-sm text-surface-500">Total CAPAs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ncrStats.total}</p>
          <p className="text-sm text-surface-500">Total NCRs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{riskAssessments.length}</p>
          <p className="text-sm text-surface-500">Risk Assessments</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{supplierStats.total}</p>
          <p className="text-sm text-surface-500">Suppliers</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{validationStats.total}</p>
          <p className="text-sm text-surface-500">Validation Reports</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{changeStats.total}</p>
          <p className="text-sm text-surface-500">Change Controls</p>
        </div>
      </div>

      {/* ISO Reference */}
      <div className="text-xs text-surface-500 flex items-center gap-2 mt-4">
        <Activity className="w-4 h-4" />
        <span>ISO 13485:2016 Clause 8.4 - Analysis of Data | ISO 9001:2015 Clause 9.1 - Monitoring, measurement, analysis and evaluation</span>
      </div>
    </div>
  );
}
