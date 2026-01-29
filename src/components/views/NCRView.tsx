import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Plus, Search, Filter, FileWarning, Package, Cog, FileText, Truck } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { NCR, NCRType, NCRStatus } from '../../types';
import NCRModal from '../modals/NCRModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function NCRView() {
  const { ncrs, updateNCR, getNCRStats } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<NCRType | 'all'>('all');

  const stats = getNCRStats();

  const filteredNCRs = ncrs.filter((ncr) => {
    const matchesSearch =
      ncr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ncr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ncr.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = typeFilter === 'all' || ncr.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: NCRType) => {
    switch (type) {
      case 'Product': return <Package className="w-4 h-4" />;
      case 'Process': return <Cog className="w-4 h-4" />;
      case 'Documentation': return <FileText className="w-4 h-4" />;
      case 'Supplier': return <Truck className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: NCRStatus) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'Under Investigation': return 'bg-yellow-100 text-yellow-700';
      case 'Pending CAPA': return 'bg-blue-100 text-blue-700';
      case 'Closed': return 'bg-green-100 text-green-700';
    }
  };

  const getDispositionColor = (disposition: NCR['disposition']) => {
    switch (disposition) {
      case 'Rework': return 'bg-blue-100 text-blue-700';
      case 'Scrap': return 'bg-red-100 text-red-700';
      case 'Use As Is': return 'bg-green-100 text-green-700';
      case 'Return to Supplier': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
    }
  };

  // Chart data
  const typeChartData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Non-Conformance Reports</h2>
          <p className="text-sm text-gray-500 mt-1">
            Control of nonconforming product per ISO 13485:8.3
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New NCR
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total NCRs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open NCRs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              stats.open > 0 ? 'bg-red-100' : 'bg-green-100'
            )}>
              <FileWarning className={cn(
                'w-5 h-5',
                stats.open > 0 ? 'text-red-600' : 'text-green-600'
              )} />
            </div>
          </div>
        </div>

        {/* Type Distribution Chart */}
        <div className="card col-span-2">
          <p className="text-sm text-gray-500 mb-2">Distribution by Type</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {typeChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search NCRs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {(['all', 'Product', 'Process', 'Documentation', 'Supplier'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1',
                typeFilter === type
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {type !== 'all' && getTypeIcon(type as NCRType)}
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* NCR List */}
      <div className="table-container card p-0">
        <table className="table">
          <thead>
            <tr>
              <th>NCR ID</th>
              <th>Type</th>
              <th>Title</th>
              <th>Lot/Product</th>
              <th>Disposition</th>
              <th>Status</th>
              <th>Detected</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNCRs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No NCRs found
                </td>
              </tr>
            ) : (
              filteredNCRs.map((ncr) => (
                <tr key={ncr.id}>
                  <td className="font-mono text-sm">{ncr.id.slice(0, 8)}</td>
                  <td>
                    <span className="flex items-center gap-1 text-gray-600">
                      {getTypeIcon(ncr.type)}
                      {ncr.type}
                    </span>
                  </td>
                  <td>
                    <p className="font-medium text-gray-900">{ncr.title}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{ncr.description}</p>
                  </td>
                  <td>
                    {ncr.lotNumber && <p className="text-sm">Lot: {ncr.lotNumber}</p>}
                    {ncr.productCode && <p className="text-xs text-gray-500">{ncr.productCode}</p>}
                    {ncr.quantity && <p className="text-xs text-gray-500">Qty: {ncr.quantity}</p>}
                  </td>
                  <td>
                    <span className={cn('badge', getDispositionColor(ncr.disposition))}>
                      {ncr.disposition}
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge', getStatusColor(ncr.status))}>
                      {ncr.status}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">{formatDate(ncr.detectedAt)}</td>
                  <td>
                    {ncr.status !== 'Closed' && (
                      <div className="flex gap-1">
                        {ncr.status === 'Open' && (
                          <button
                            onClick={() => updateNCR(ncr.id, { status: 'Under Investigation' })}
                            className="btn-ghost btn-sm text-xs"
                          >
                            Investigate
                          </button>
                        )}
                        {ncr.status === 'Under Investigation' && (
                          <button
                            onClick={() => updateNCR(ncr.id, { status: 'Pending CAPA' })}
                            className="btn-ghost btn-sm text-xs"
                          >
                            Link CAPA
                          </button>
                        )}
                        {ncr.disposition !== 'Pending' && (
                          <button
                            onClick={() => updateNCR(ncr.id, { status: 'Closed', closedAt: new Date() })}
                            className="btn-ghost btn-sm text-xs"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ISO Reference */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">ISO 13485:2016 - 8.3 Control of Nonconforming Product</h4>
        <p className="text-sm text-primary-700">
          The organization shall ensure that product which does not conform to product requirements is identified and
          controlled to prevent its unintended use or delivery. A documented procedure shall define the controls and
          related responsibilities and authorities for dealing with nonconforming product.
        </p>
      </div>

      {/* Modal */}
      {showModal && <NCRModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
