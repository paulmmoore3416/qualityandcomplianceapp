import React, { useState } from 'react';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  UserPlus,
  Settings,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  MoreHorizontal,
  KeyRound,
  Download,
  Database,
  Bot,
} from 'lucide-react';
import { User, UserRole, Permission, AdminDashboard, SecurityAlert } from '../../types';
import UserModal from '../modals/UserModal';
import RolePermissionModal from '../modals/RolePermissionModal';

// Default permissions per role (mirrors auth-store)
const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  'Admin': [
    'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
    'view_capa', 'edit_capa', 'approve_capa', 'view_ncr', 'edit_ncr',
    'view_documents', 'edit_documents', 'delete_documents', 'share_documents',
    'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers', 'approve_suppliers',
    'view_training', 'edit_training', 'verify_training',
    'view_change_control', 'edit_change_control', 'approve_change_control',
    'view_validation', 'edit_validation', 'approve_validation',
    'sign_electronically', 'view_audit_trail',
    'manage_users', 'manage_roles', 'system_settings', 'export_data', 'import_data',
  ],
  'QA Manager': [
    'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
    'view_capa', 'edit_capa', 'approve_capa', 'view_ncr', 'edit_ncr',
    'view_documents', 'edit_documents', 'share_documents',
    'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
    'view_training', 'edit_training', 'verify_training',
    'view_change_control', 'edit_change_control', 'approve_change_control',
    'view_validation', 'edit_validation', 'approve_validation',
    'sign_electronically', 'view_audit_trail', 'export_data',
  ],
  'Engineer': [
    'view_dashboard', 'view_metrics', 'view_risk',
    'view_capa', 'edit_capa', 'view_ncr', 'edit_ncr',
    'view_documents', 'edit_documents', 'share_documents',
    'view_vigilance', 'view_suppliers', 'view_training',
    'view_change_control', 'edit_change_control',
    'view_validation', 'edit_validation',
  ],
  'Auditor': [
    'view_dashboard', 'view_metrics', 'view_risk', 'view_capa', 'view_ncr',
    'view_documents', 'view_vigilance', 'view_suppliers', 'view_training',
    'view_change_control', 'view_validation', 'view_audit_trail', 'export_data',
  ],
  'Viewer': [
    'view_dashboard', 'view_metrics', 'view_risk', 'view_capa', 'view_ncr',
    'view_documents', 'view_vigilance', 'view_suppliers', 'view_training',
    'view_change_control', 'view_validation',
  ],
  'Guest': ['view_dashboard'],
  'Demo': [
    'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
    'view_capa', 'edit_capa', 'view_ncr', 'edit_ncr',
    'view_documents', 'edit_documents', 'share_documents',
    'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
    'view_training', 'edit_training',
    'view_change_control', 'edit_change_control',
    'view_validation', 'edit_validation',
    'sign_electronically', 'view_audit_trail', 'export_data',
  ],
};

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'roles' | 'security' | 'system'
  >('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');

  // User management state
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-001',
      username: 'admin',
      email: 'admin@medtech.com',
      fullName: 'System Administrator',
      role: 'Admin',
      permissions: ROLE_DEFAULT_PERMISSIONS['Admin'],
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
      permissions: ROLE_DEFAULT_PERMISSIONS['QA Manager'],
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
      permissions: ROLE_DEFAULT_PERMISSIONS['Engineer'],
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
      id: 'user-004',
      username: 'auditor',
      email: 'auditor@medtech.com',
      fullName: 'Lisa Anderson',
      role: 'Auditor',
      permissions: ROLE_DEFAULT_PERMISSIONS['Auditor'],
      department: 'Regulatory Affairs',
      title: 'Internal Auditor',
      status: 'Active',
      lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000),
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-02-15'),
      mustChangePassword: false,
      mfaEnabled: true,
      failedLoginAttempts: 0,
    },
    {
      id: 'user-023',
      username: 'jdoe',
      email: 'john.doe@medtech.com',
      fullName: 'John Doe',
      role: 'Viewer',
      permissions: ROLE_DEFAULT_PERMISSIONS['Viewer'],
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
  ]);

  // Security alerts state
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
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
  ]);

  // Role permissions state
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Permission[]>>({
    ...ROLE_DEFAULT_PERMISSIONS,
  });

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionMenuUser, setActionMenuUser] = useState<string | null>(null);

  // Computed stats
  const adminDashboard: AdminDashboard = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    lockedAccounts: users.filter(u => u.status === 'Locked').length,
    pendingApprovals: users.filter(u => u.status === 'Pending').length,
    systemHealth: 'Healthy',
    aiAgentsRunning: 3,
    storageUsed: 245.8,
    storageLimit: 1024,
    recentActivity: [],
    securityAlerts,
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ---- User Actions ----
  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
    setActionMenuUser(null);
  };

  const handleSaveUser = (savedUser: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === savedUser.id);
      if (exists) {
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
      }
      return [...prev, savedUser];
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setShowDeleteConfirm(null);
    setActionMenuUser(null);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      if (u.status === 'Active') {
        return { ...u, status: 'Inactive' as const, updatedAt: new Date() };
      }
      return { ...u, status: 'Active' as const, updatedAt: new Date() };
    }));
    setActionMenuUser(null);
  };

  const handleUnlockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        status: 'Active' as const,
        failedLoginAttempts: 0,
        accountLockedUntil: undefined,
        updatedAt: new Date(),
      };
    }));
    setActionMenuUser(null);
  };

  const handleResetPassword = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        mustChangePassword: true,
        passwordLastChanged: new Date(),
        updatedAt: new Date(),
      };
    }));
    setActionMenuUser(null);
  };

  const handleToggleMfa = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return { ...u, mfaEnabled: !u.mfaEnabled, updatedAt: new Date() };
    }));
    setActionMenuUser(null);
  };

  // ---- Alert Actions ----
  const handleAcknowledgeAlert = (alertId: string) => {
    setSecurityAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return { ...a, acknowledged: true, acknowledgedBy: 'admin', acknowledgedAt: new Date() };
    }));
  };

  // ---- Role Actions ----
  const handleEditRole = (role: UserRole) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleSaveRolePermissions = (role: UserRole, permissions: Permission[]) => {
    setRolePermissions(prev => ({ ...prev, [role]: permissions }));
    setUsers(prev => prev.map(u => {
      if (u.role !== role) return u;
      return { ...u, permissions, updatedAt: new Date() };
    }));
  };

  // ---- System Actions ----
  const handleExportAuditTrail = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      users: users.map(({ permissions: _p, ...rest }) => rest),
      securityAlerts,
      rolePermissions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackup = () => {
    const data = { users, securityAlerts, rolePermissions, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---- Helpers ----
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Inactive
          </span>
        );
      case 'Locked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" /> Locked
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const getAlertBadge = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Administration Panel</h1>
          <p className="text-surface-600 mt-1">User Management & System Configuration</p>
        </div>
        <button type="button" onClick={handleAddUser} className="btn-primary flex items-center gap-2">
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
              <p className="text-3xl font-bold text-surface-900 mt-1">{adminDashboard.totalUsers}</p>
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
              <p className="text-3xl font-bold text-green-600 mt-1">{adminDashboard.activeUsers}</p>
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
              <p className="text-3xl font-bold text-red-600 mt-1">{adminDashboard.lockedAccounts}</p>
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
              <p className="text-lg font-bold text-green-600 mt-1">{adminDashboard.systemHealth}</p>
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
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-surface-600 hover:text-surface-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'security' && securityAlerts.filter(a => !a.acknowledged).length > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  {securityAlerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">AI Agents Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Vigilance Watchman', 'Audit-Ready RAG', 'Risk Predictor'].map(name => (
                <div key={name} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">{name}</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-green-700">Running</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Storage Usage</h3>
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
                  style={{ width: `${(adminDashboard.storageUsed / adminDashboard.storageLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Users by Role</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(['Admin', 'QA Manager', 'Engineer', 'Auditor', 'Viewer'] as UserRole[]).map(role => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <div key={role} className="p-3 bg-surface-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-surface-900">{count}</p>
                    <p className="text-xs text-surface-600 mt-1">{role}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or username..."
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

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">MFA</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-surface-900">{user.fullName}</div>
                          <div className="text-sm text-surface-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">{user.department}</td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        {user.mfaEnabled ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-surface-300" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                            title="User actions"
                          >
                            <MoreHorizontal className="w-5 h-5 text-surface-500" />
                          </button>

                          {actionMenuUser === user.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuUser(null)} />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-surface-200 z-20 py-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditUser(user)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                                >
                                  <Settings className="w-4 h-4" />
                                  Edit User
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetPassword(user.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                                >
                                  <KeyRound className="w-4 h-4" />
                                  Reset Password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleMfa(user.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                                >
                                  <Shield className="w-4 h-4" />
                                  {user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                                </button>
                                {user.status === 'Locked' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockUser(user.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    <Unlock className="w-4 h-4" />
                                    Unlock Account
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(user.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                                  >
                                    {user.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                )}
                                <div className="border-t border-surface-200 my-1" />
                                <button
                                  type="button"
                                  onClick={() => { setShowDeleteConfirm(user.id); setActionMenuUser(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-surface-500">
                        No users found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {securityAlerts.length === 0 && (
            <div className="card text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-surface-600">No security alerts.</p>
            </div>
          )}
          {securityAlerts.map((alert) => (
            <div key={alert.id} className={`card border-2 ${getAlertBadge(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <AlertTriangle
                    className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                      alert.severity === 'Critical' ? 'text-red-600'
                        : alert.severity === 'High' ? 'text-orange-600'
                        : alert.severity === 'Medium' ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-white rounded-full">{alert.severity}</span>
                      {alert.acknowledged && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Acknowledged</span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      {alert.acknowledgedBy && (
                        <span>Acknowledged by {alert.acknowledgedBy} at {new Date(alert.acknowledgedAt!).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    type="button"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="btn-sm btn-primary"
                  >
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
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Role Definitions</h3>
          <p className="text-surface-600 mb-6">Manage role-based access control and permissions for each user role.</p>
          <div className="space-y-4">
            {(['Admin', 'QA Manager', 'Engineer', 'Auditor', 'Viewer'] as UserRole[]).map((role) => {
              const roleUsers = users.filter(u => u.role === role);
              const perms = rolePermissions[role] || [];
              return (
                <div key={role} className="p-4 border border-surface-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <div>
                        <h4 className="font-medium text-surface-900">{role}</h4>
                        <p className="text-sm text-surface-600">
                          {roleUsers.length} user{roleUsers.length !== 1 ? 's' : ''} &middot; {perms.length} permissions
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditRole(role)}
                      className="btn-sm btn-secondary"
                    >
                      Edit Permissions
                    </button>
                  </div>
                  {roleUsers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {roleUsers.map(u => (
                        <span key={u.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 text-surface-700 rounded text-xs">
                          {u.fullName}
                          {u.status === 'Locked' && <Lock className="w-3 h-3 text-red-500" />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-surface-900">AI Agents</h4>
                    <p className="text-sm text-surface-600">Manage local AI model deployment</p>
                  </div>
                </div>
                <button type="button" className="btn-sm btn-primary">Configure</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-surface-900">Database Backup</h4>
                    <p className="text-sm text-surface-600">Export system data as JSON backup</p>
                  </div>
                </div>
                <button type="button" onClick={handleBackup} className="btn-sm btn-secondary">Backup Now</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-medium text-surface-900">Audit Trail Export</h4>
                    <p className="text-sm text-surface-600">Export system audit logs for compliance</p>
                  </div>
                </div>
                <button type="button" onClick={handleExportAuditTrail} className="btn-sm btn-secondary">Export</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">Delete User</h3>
              <p className="text-sm text-surface-600 mb-6">
                Are you sure you want to delete <strong>{users.find(u => u.id === showDeleteConfirm)?.fullName}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button type="button" onClick={() => setShowDeleteConfirm(null)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={() => handleDeleteUser(showDeleteConfirm)} className="btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => { setShowUserModal(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        user={editingUser}
      />

      {/* Role Permission Modal */}
      {editingRole && (
        <RolePermissionModal
          isOpen={showRoleModal}
          onClose={() => { setShowRoleModal(false); setEditingRole(null); }}
          onSave={handleSaveRolePermissions}
          role={editingRole}
          currentPermissions={rolePermissions[editingRole] || []}
          userCount={users.filter(u => u.role === editingRole).length}
        />
      )}
    </div>
  );
};

export default AdminView;
