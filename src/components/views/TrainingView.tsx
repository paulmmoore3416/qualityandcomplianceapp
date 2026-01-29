import { useState } from 'react';
import {
  Plus,
  Search,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn, formatDate, daysUntil } from '../../lib/utils';
import { TrainingRecord, TrainingStatus, TrainingMatrix } from '../../types';
import TrainingRecordModal from '../modals/TrainingRecordModal';

// Sample data
const sampleTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    employeeName: 'Alice Johnson',
    department: 'Production',
    role: 'Line Operator',
    trainingId: 'TRN-001',
    trainingTitle: 'GMP Fundamentals',
    trainingType: 'Regulatory',
    requiredBy: new Date('2026-01-15'),
    completedDate: new Date('2026-01-10'),
    expiryDate: new Date('2027-01-10'),
    status: 'Completed',
    score: 92,
    passingScore: 80,
    verifiedBy: 'QA Manager',
    verificationDate: new Date('2026-01-11'),
  },
  {
    id: '2',
    employeeId: 'EMP-002',
    employeeName: 'Bob Smith',
    department: 'Quality',
    role: 'QC Inspector',
    trainingId: 'TRN-002',
    trainingTitle: 'ISO 13485 Internal Auditor',
    trainingType: 'Role-specific',
    requiredBy: new Date('2026-02-01'),
    status: 'In Progress',
    passingScore: 85,
  },
  {
    id: '3',
    employeeId: 'EMP-003',
    employeeName: 'Carol Davis',
    department: 'Engineering',
    role: 'Design Engineer',
    trainingId: 'TRN-003',
    trainingTitle: 'Risk Management (ISO 14971)',
    trainingType: 'Regulatory',
    requiredBy: new Date('2026-01-20'),
    status: 'Overdue',
    passingScore: 80,
  },
  {
    id: '4',
    employeeId: 'EMP-004',
    employeeName: 'David Lee',
    department: 'Production',
    role: 'Line Operator',
    trainingId: 'TRN-001',
    trainingTitle: 'GMP Fundamentals',
    trainingType: 'Regulatory',
    requiredBy: new Date('2025-12-15'),
    completedDate: new Date('2024-12-10'),
    expiryDate: new Date('2025-12-10'),
    status: 'Expired',
    score: 88,
    passingScore: 80,
  },
];

const sampleDepartmentCompliance: TrainingMatrix[] = [
  { department: 'Production', role: 'All', requiredTrainings: [], completionRate: 87, overdueCount: 3 },
  { department: 'Quality', role: 'All', requiredTrainings: [], completionRate: 95, overdueCount: 1 },
  { department: 'Engineering', role: 'All', requiredTrainings: [], completionRate: 78, overdueCount: 4 },
  { department: 'Regulatory', role: 'All', requiredTrainings: [], completionRate: 100, overdueCount: 0 },
];

export default function TrainingView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const trainingRecords = sampleTrainingRecords;
  const departmentCompliance = sampleDepartmentCompliance;

  const filteredRecords = trainingRecords.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || r.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Calculate stats
  const stats = {
    totalEmployees: 45,
    overallCompliance: 89,
    overdueTrainings: trainingRecords.filter((r) => r.status === 'Overdue').length,
    expiringThisMonth: trainingRecords.filter(
      (r) => r.expiryDate && daysUntil(r.expiryDate) <= 30 && daysUntil(r.expiryDate) > 0
    ).length,
  };

  const handleViewRecord = (record: TrainingRecord) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const handleCloseModal = () => {
    setShowRecordModal(false);
    setSelectedRecord(null);
  };

  const getStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Not Started': return 'bg-gray-100 text-gray-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Expired': return 'bg-orange-100 text-orange-700';
    }
  };

  const departments = [...new Set(trainingRecords.map((r) => r.department))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Training & Competency</h2>
          <p className="text-sm text-gray-500 mt-1">
            Per ISO 13485:6.2 - Human Resources & Competence
          </p>
        </div>
        <button className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Assign Training
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Compliance</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.overallCompliance >= 90 ? 'text-green-600' : stats.overallCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {stats.overallCompliance}%
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className={cn('card', stats.overdueTrainings > 0 && 'border-red-300 bg-red-50')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.overdueTrainings > 0 ? 'text-red-600' : 'text-gray-900'
              )}>
                {stats.overdueTrainings}
              </p>
            </div>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              stats.overdueTrainings > 0 ? 'bg-red-100' : 'bg-gray-100'
            )}>
              <AlertTriangle className={cn(
                'w-5 h-5',
                stats.overdueTrainings > 0 ? 'text-red-600' : 'text-gray-400'
              )} />
            </div>
          </div>
        </div>

        <div className={cn('card', stats.expiringThisMonth > 0 && 'border-yellow-300 bg-yellow-50')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expiring (30d)</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.expiringThisMonth > 0 ? 'text-yellow-600' : 'text-gray-900'
              )}>
                {stats.expiringThisMonth}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Compliance Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Department Compliance Matrix</h3>
        <div className="grid grid-cols-4 gap-4">
          {departmentCompliance.map((dept) => (
            <div key={dept.department} className="bg-surface-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{dept.department}</p>
                {dept.overdueCount > 0 && (
                  <span className="badge badge-red text-xs">{dept.overdueCount} overdue</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      dept.completionRate >= 90 ? 'bg-green-500' :
                      dept.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${dept.completionRate}%` }}
                  />
                </div>
                <span className={cn(
                  'text-lg font-bold',
                  dept.completionRate >= 90 ? 'text-green-600' :
                  dept.completionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {dept.completionRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees or trainings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          {(['all', 'Completed', 'In Progress', 'Overdue', 'Expired'] as const).map((status) => (
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

      {/* Training Records Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Training</th>
                <th>Type</th>
                <th>Status</th>
                <th>Required By</th>
                <th>Score</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{record.employeeName}</p>
                      <p className="text-xs text-gray-500">{record.role}</p>
                    </div>
                  </td>
                  <td>{record.department}</td>
                  <td>
                    <p className="font-medium text-gray-900">{record.trainingTitle}</p>
                    <p className="text-xs text-gray-500">{record.trainingId}</p>
                  </td>
                  <td>
                    <span className="badge badge-gray">{record.trainingType}</span>
                  </td>
                  <td>
                    <span className={cn('badge', getStatusColor(record.status))}>
                      {record.status}
                    </span>
                  </td>
                  <td className={cn(
                    'text-sm',
                    record.status === 'Overdue' ? 'text-red-600 font-medium' : 'text-gray-600'
                  )}>
                    {formatDate(record.requiredBy)}
                  </td>
                  <td>
                    {record.score !== undefined ? (
                      <span className={cn(
                        'font-medium',
                        record.score >= (record.passingScore || 80) ? 'text-green-600' : 'text-red-600'
                      )}>
                        {record.score}%
                      </span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td>
                    {record.verifiedBy ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-500">{record.verifiedBy}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewRecord(record)}
                      className="btn-ghost btn-sm text-xs"
                    >
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISO Reference */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2">ISO 13485:2016 - Clause 6.2 Human Resources</h4>
        <p className="text-sm text-primary-700">
          Personnel performing work affecting product quality shall be competent on the basis of
          appropriate education, training, skills and experience. The organization shall determine
          the necessary competence, provide training or take other actions to achieve the necessary
          competence, evaluate the effectiveness of the actions taken, and maintain appropriate
          records of education, training, skills and experience.
        </p>
      </div>

      {/* Training Record Modal */}
      {showRecordModal && selectedRecord && (
        <TrainingRecordModal
          record={selectedRecord}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
