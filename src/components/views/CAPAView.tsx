import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Plus, Search, Filter, Clock, CheckCircle, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn, formatDate, daysUntil, isOverdue } from '../../lib/utils';
import { CAPAStatus, CAPAPriority } from '../../types';
import CAPAModal from '../modals/CAPAModal';

export default function CAPAView() {
  const { capas, updateCAPA, getCAPAStats } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CAPAStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = getCAPAStats();

  const filteredCAPAs = capas.filter((capa) => {
    const matchesSearch =
      capa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capa.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || capa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: CAPAPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status: CAPAStatus) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Verification': return 'bg-purple-100 text-purple-700';
      case 'Closed': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">CAPA Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Corrective and Preventive Actions per ISO 13485:8.5.2/8.5.3
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          New CAPA
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total CAPAs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={cn(
          'card',
          stats.overdue > 0 && 'border-red-200 bg-red-50'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.overdue > 0 ? 'text-red-600' : 'text-gray-900'
              )}>
                {stats.overdue}
              </p>
            </div>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              stats.overdue > 0 ? 'bg-red-100' : 'bg-gray-100'
            )}>
              <AlertTriangle className={cn(
                'w-5 h-5',
                stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'
              )} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Closed This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closedThisMonth}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search CAPAs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {(['all', 'Open', 'In Progress', 'Verification', 'Closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* CAPA List */}
      <div className="space-y-3">
        {filteredCAPAs.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            No CAPAs found. Create a new CAPA to get started.
          </div>
        ) : (
          filteredCAPAs.map((capa) => (
            <div key={capa.id} className="card">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === capa.id ? null : capa.id)}
              >
                <div className="flex items-start gap-3">
                  {expandedId === capa.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('badge', capa.type === 'Corrective' ? 'badge-red' : 'badge-blue')}>
                        {capa.type}
                      </span>
                      <span className={cn('badge', getPriorityColor(capa.priority))}>
                        {capa.priority}
                      </span>
                      <span className={cn('badge', getStatusColor(capa.status))}>
                        {capa.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mt-2">{capa.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{capa.description}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-500">Due: {formatDate(capa.dueDate)}</p>
                  {isOverdue(capa.dueDate) && capa.status !== 'Closed' ? (
                    <p className="text-red-600 font-medium">{Math.abs(daysUntil(capa.dueDate))} days overdue</p>
                  ) : capa.status !== 'Closed' ? (
                    <p className="text-gray-600">{daysUntil(capa.dueDate)} days remaining</p>
                  ) : null}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === capa.id && (
                <div className="mt-4 pt-4 border-t border-surface-200 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Assignee</p>
                      <p className="font-medium">{capa.assignee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{formatDate(capa.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ISO Reference</p>
                      <p className="font-medium text-primary-600">
                        ISO 13485:{capa.type === 'Corrective' ? '8.5.2' : '8.5.3'}
                      </p>
                    </div>
                  </div>

                  {capa.rootCause && (
                    <div>
                      <p className="text-sm text-gray-500">Root Cause</p>
                      <p className="text-sm mt-1">{capa.rootCause}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {capa.actions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Actions</p>
                      <div className="space-y-2">
                        {capa.actions.map((action) => (
                          <div key={action.id} className="flex items-center gap-3 p-2 bg-surface-50 rounded">
                            <input
                              type="checkbox"
                              checked={action.status === 'Completed'}
                              onChange={() => {}}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <span className={cn(
                              'flex-1 text-sm',
                              action.status === 'Completed' && 'line-through text-gray-400'
                            )}>
                              {action.description}
                            </span>
                            <span className="text-xs text-gray-500">{action.assignee}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  {capa.status !== 'Closed' && (
                    <div className="flex gap-2">
                      {capa.status === 'Open' && (
                        <button
                          onClick={() => updateCAPA(capa.id, { status: 'In Progress' })}
                          className="btn-primary btn-sm"
                        >
                          Start Work
                        </button>
                      )}
                      {capa.status === 'In Progress' && (
                        <button
                          onClick={() => updateCAPA(capa.id, { status: 'Verification' })}
                          className="btn-primary btn-sm"
                        >
                          Submit for Verification
                        </button>
                      )}
                      {capa.status === 'Verification' && (
                        <button
                          onClick={() => updateCAPA(capa.id, { status: 'Closed', closedAt: new Date() })}
                          className="btn-primary btn-sm"
                        >
                          Close CAPA
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && <CAPAModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
