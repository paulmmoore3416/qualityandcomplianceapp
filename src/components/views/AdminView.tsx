import React, { useState } from 'react';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  UserPlus,
  Settings,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { User, UserRole, AdminDashboard, SecurityAlert } from '../../types';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'roles' | 'security' | 'system'
  >('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');

  // Mock data - in production, this would come from a backend
  const adminDashboard: AdminDashboard = {
    totalUsers: 47,
    activeUsers: 42,
    lockedAccounts: 2,
    pendingApprovals: 5,
    systemHealth: 'Healthy',
    aiAgentsRunning: 3,
    storageUsed: 245.8,
    storageLimit: 1024,
    recentActivity: [],
    securityAlerts: [
      {
        id: 'alert-001',
        severity: 'Medium',
        type: 'Failed Login',
        description: '5 failed login attempts from user: jdoe',
        userId: 'user-023',
        ipAddress: '192.168.1.105',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
      },
      {
        id: 'alert-002',
        severity: 'Low',
        type: 'Data Export',
        description: 'Large data export performed by qa_manager',
        userId: 'user-002',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        acknowledged: true,
        acknowledgedBy: 'admin',
        acknowledgedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  };

  const mockUsers: User[] = [
    {
      id: 'user-001',
      username: 'admin',
      email: 'admin@medtech.com',
      fullName: 'System Administrator',
      role: 'Admin',
      permissions: [],
      department: 'IT & Quality Systems',
      title: 'Quality Systems Administrator',
      status: 'Active',
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-01-01'),
      mustChangePassword: false,
      mfaEnabled: true,
      failedLoginAttempts: 0,
    },
    {
      id: 'user-002',
      username: 'qa_manager',
      email: 'qa.manager@medtech.com',
      fullName: 'Sarah Johnson',
      role: 'QA Manager',
      permissions: [],
      department: 'Quality Assurance',
      title: 'QA Manager',
      status: 'Active',
      lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-01-15'),
      mustChangePassword: false,
      mfaEnabled: true,
      failedLoginAttempts: 0,
    },
    {
      id: 'user-003',
      username: 'engineer',
      email: 'engineer@medtech.com',
      fullName: 'Michael Chen',
      role: 'Engineer',
      permissions: [],
      department: 'Engineering',
      title: 'Senior Design Engineer',
      status: 'Active',
      lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-02-01'),
      mustChangePassword: false,
      mfaEnabled: false,
      failedLoginAttempts: 0,
    },
    {
      id: 'user-023',
      username: 'jdoe',
      email: 'john.doe@medtech.com',
      fullName: 'John Doe',
      role: 'Viewer',
      permissions: [],
      department: 'Operations',
      title: 'Production Operator',
      status: 'Locked',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date('2025-08-15'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2025-08-15'),
      mustChangePassword: true,
      mfaEnabled: false,
      failedLoginAttempts: 5,
      accountLockedUntil: new Date(Date.now() + 30 * 60 * 1000),
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'Locked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const getAlertBadge = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">
            Administration Panel
          </h1>
          <p className="text-surface-600 mt-1">
            User Management & System Configuration
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Total Users</p>
              <p className="text-3xl font-bold text-surface-900 mt-1">
                {adminDashboard.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {adminDashboard.activeUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Locked Accounts</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {adminDashboard.lockedAccounts}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">System Health</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {adminDashboard.systemHealth}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'roles', label: 'Roles & Permissions', icon: Shield },
            { id: 'security', label: 'Security Alerts', icon: AlertTriangle },
            { id: 'system', label: 'System Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as typeof activeTab)
              }
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-surface-600 hover:text-surface-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Agents Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              AI Agents Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">
                    Vigilance Watchman
                  </span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <p className="text-sm text-green-700">Running • 12 tasks processed today</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">
                    Audit-Ready RAG
                  </span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <p className="text-sm text-green-700">Running • 8 queries answered</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">
                    Risk Predictor
                  </span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <p className="text-sm text-green-700">Running • 2 predictions made</p>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              Storage Usage
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">
                  {adminDashboard.storageUsed} GB / {adminDashboard.storageLimit} GB
                </span>
                <span className="font-medium text-surface-900">
                  {Math.round((adminDashboard.storageUsed / adminDashboard.storageLimit) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{
                    width: `${(adminDashboard.storageUsed / adminDashboard.storageLimit) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as UserRole | 'All')}
                  className="pl-10 pr-8 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="QA Manager">QA Manager</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      MFA
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-surface-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-surface-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {user.department}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        {user.mfaEnabled ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-surface-300" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {adminDashboard.securityAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card border-2 ${getAlertBadge(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <AlertTriangle
                    className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                      alert.severity === 'Critical'
                        ? 'text-red-600'
                        : alert.severity === 'High'
                        ? 'text-orange-600'
                        : alert.severity === 'Medium'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-white rounded-full">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      {alert.ipAddress && (
                        <span>IP: {alert.ipAddress}</span>
                      )}
                      <span>
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button className="btn-sm btn-primary">
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            Role Definitions
          </h3>
          <p className="text-surface-600 mb-6">
            Manage role-based access control and permissions
          </p>
          <div className="space-y-4">
            {(['Admin', 'QA Manager', 'Engineer', 'Auditor', 'Viewer'] as UserRole[]).map((role) => (
              <div
                key={role}
                className="p-4 border border-surface-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <div>
                      <h4 className="font-medium text-surface-900">{role}</h4>
                      <p className="text-sm text-surface-600">
                        {mockUsers.filter((u) => u.role === role).length} users
                      </p>
                    </div>
                  </div>
                  <button className="btn-sm btn-outline">
                    Edit Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              System Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-surface-900">
                    AI Agents
                  </h4>
                  <p className="text-sm text-surface-600">
                    Manage local AI model deployment
                  </p>
                </div>
                <button className="btn-sm btn-primary">Configure</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-surface-900">
                    Database Backup
                  </h4>
                  <p className="text-sm text-surface-600">
                    Last backup: 2 hours ago
                  </p>
                </div>
                <button className="btn-sm btn-outline">Backup Now</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-surface-900">
                    Audit Trail Export
                  </h4>
                  <p className="text-sm text-surface-600">
                    Export system audit logs
                  </p>
                </div>
                <button className="btn-sm btn-outline">Export</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
