import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Shield, Mail, Phone, Building2, Briefcase, Eye, EyeOff } from 'lucide-react';
import { User, UserRole, Permission } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user?: User | null;
}

const ALL_PERMISSIONS: { key: Permission; label: string; category: string }[] = [
  { key: 'view_dashboard', label: 'View Dashboard', category: 'Dashboard' },
  { key: 'view_metrics', label: 'View Metrics', category: 'Metrics' },
  { key: 'edit_metrics', label: 'Edit Metrics', category: 'Metrics' },
  { key: 'view_risk', label: 'View Risk Matrix', category: 'Risk' },
  { key: 'edit_risk', label: 'Edit Risk Matrix', category: 'Risk' },
  { key: 'view_capa', label: 'View CAPA', category: 'CAPA' },
  { key: 'edit_capa', label: 'Edit CAPA', category: 'CAPA' },
  { key: 'approve_capa', label: 'Approve CAPA', category: 'CAPA' },
  { key: 'view_ncr', label: 'View NCR', category: 'NCR' },
  { key: 'edit_ncr', label: 'Edit NCR', category: 'NCR' },
  { key: 'view_documents', label: 'View Documents', category: 'Documents' },
  { key: 'edit_documents', label: 'Edit Documents', category: 'Documents' },
  { key: 'delete_documents', label: 'Delete Documents', category: 'Documents' },
  { key: 'share_documents', label: 'Share Documents', category: 'Documents' },
  { key: 'view_vigilance', label: 'View Vigilance', category: 'Vigilance' },
  { key: 'edit_vigilance', label: 'Edit Vigilance', category: 'Vigilance' },
  { key: 'view_suppliers', label: 'View Suppliers', category: 'Suppliers' },
  { key: 'edit_suppliers', label: 'Edit Suppliers', category: 'Suppliers' },
  { key: 'approve_suppliers', label: 'Approve Suppliers', category: 'Suppliers' },
  { key: 'view_training', label: 'View Training', category: 'Training' },
  { key: 'edit_training', label: 'Edit Training', category: 'Training' },
  { key: 'verify_training', label: 'Verify Training', category: 'Training' },
  { key: 'view_change_control', label: 'View Change Control', category: 'Change Control' },
  { key: 'edit_change_control', label: 'Edit Change Control', category: 'Change Control' },
  { key: 'approve_change_control', label: 'Approve Change Control', category: 'Change Control' },
  { key: 'view_validation', label: 'View Validation', category: 'Validation' },
  { key: 'edit_validation', label: 'Edit Validation', category: 'Validation' },
  { key: 'approve_validation', label: 'Approve Validation', category: 'Validation' },
  { key: 'sign_electronically', label: 'Electronic Signatures', category: 'System' },
  { key: 'view_audit_trail', label: 'View Audit Trail', category: 'System' },
  { key: 'manage_users', label: 'Manage Users', category: 'Admin' },
  { key: 'manage_roles', label: 'Manage Roles', category: 'Admin' },
  { key: 'system_settings', label: 'System Settings', category: 'Admin' },
  { key: 'export_data', label: 'Export Data', category: 'Data' },
  { key: 'import_data', label: 'Import Data', category: 'Data' },
];

const ROLE_DEFAULTS: Record<UserRole, Permission[]> = {
  'Admin': ALL_PERMISSIONS.map(p => p.key),
  'QA Manager': [
    'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
    'view_capa', 'edit_capa', 'approve_capa', 'view_ncr', 'edit_ncr',
    'view_documents', 'edit_documents', 'share_documents', 'view_vigilance', 'edit_vigilance',
    'view_suppliers', 'edit_suppliers', 'view_training', 'edit_training', 'verify_training',
    'view_change_control', 'edit_change_control', 'approve_change_control',
    'view_validation', 'edit_validation', 'approve_validation',
    'sign_electronically', 'view_audit_trail', 'export_data',
  ],
  'Engineer': [
    'view_dashboard', 'view_metrics', 'view_risk', 'view_capa', 'edit_capa',
    'view_ncr', 'edit_ncr', 'view_documents', 'edit_documents', 'share_documents',
    'view_vigilance', 'view_suppliers', 'view_training',
    'view_change_control', 'edit_change_control', 'view_validation', 'edit_validation',
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
    'view_documents', 'edit_documents', 'share_documents', 'view_vigilance', 'edit_vigilance',
    'view_suppliers', 'edit_suppliers', 'view_training', 'edit_training',
    'view_change_control', 'edit_change_control', 'view_validation', 'edit_validation',
    'sign_electronically', 'view_audit_trail', 'export_data',
  ],
};

const ROLES: UserRole[] = ['Admin', 'QA Manager', 'Engineer', 'Auditor', 'Viewer', 'Guest', 'Demo'];

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    role: 'Viewer' as UserRole,
    status: 'Active' as User['status'],
    mfaEnabled: false,
    mustChangePassword: true,
    password: '',
  });

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'details' | 'permissions'>('details');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        title: user.title || '',
        role: user.role,
        status: user.status,
        mfaEnabled: user.mfaEnabled,
        mustChangePassword: user.mustChangePassword,
        password: '',
      });
      setPermissions(user.permissions);
    } else {
      setFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        department: '',
        title: '',
        role: 'Viewer',
        status: 'Active',
        mfaEnabled: false,
        mustChangePassword: true,
        password: '',
      });
      setPermissions(ROLE_DEFAULTS['Viewer']);
    }
    setActiveSection('details');
    setErrors({});
  }, [user, isOpen]);

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    setPermissions(ROLE_DEFAULTS[role] || []);
  };

  const togglePermission = (perm: Permission) => {
    setPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleCategoryAll = (category: string) => {
    const categoryPerms = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.key);
    const allSelected = categoryPerms.every(p => permissions.includes(p));
    if (allSelected) {
      setPermissions(prev => prev.filter(p => !categoryPerms.includes(p)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...categoryPerms])]);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (!isEditing && !formData.password) errs.password = 'Password is required for new users';
    if (formData.password && formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const now = new Date();
    const savedUser: User = {
      id: user?.id || `user-${uuidv4().substring(0, 8)}`,
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      permissions,
      department: formData.department || undefined,
      title: formData.title || undefined,
      phone: formData.phone || undefined,
      status: formData.status,
      lastLogin: user?.lastLogin,
      createdAt: user?.createdAt || now,
      updatedAt: now,
      passwordLastChanged: user?.passwordLastChanged || now,
      mustChangePassword: formData.mustChangePassword,
      mfaEnabled: formData.mfaEnabled,
      failedLoginAttempts: user?.failedLoginAttempts || 0,
      accountLockedUntil: user?.accountLockedUntil,
    };
    onSave(savedUser);
    onClose();
  };

  if (!isOpen) return null;

  const permissionCategories = [...new Set(ALL_PERMISSIONS.map(p => p.category))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">
                {isEditing ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="text-sm text-surface-500">
                {isEditing ? `Editing ${user.fullName}` : 'Create a new user account'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-surface-200 px-6">
          <button
            type="button"
            onClick={() => setActiveSection('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            User Details
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('permissions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'permissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            Permissions ({permissions.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeSection === 'details' && (
            <div className="space-y-5">
              {/* Full Name & Username */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.fullName ? 'border-red-500' : 'border-surface-300'}`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.username ? 'border-red-500' : 'border-surface-300'}`}
                    placeholder="jdoe"
                    disabled={isEditing}
                  />
                  {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-surface-300'}`}
                      placeholder="john.doe@medtech.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Department & Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Engineering"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Senior Engineer"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <p className="text-xs text-surface-500 mt-1">Changing role resets permissions to defaults</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Locked">Locked</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Password (new users or reset) */}
              {(!isEditing || formData.password) && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    {isEditing ? 'New Password' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? 'border-red-500' : 'border-surface-300'}`}
                      placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
              )}
              {isEditing && !formData.password && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, password: ' ' }))}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Reset Password
                </button>
              )}

              {/* Security toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mfaEnabled}
                    onChange={e => setFormData(prev => ({ ...prev, mfaEnabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700">Enable Multi-Factor Authentication (MFA)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mustChangePassword}
                    onChange={e => setFormData(prev => ({ ...prev, mustChangePassword: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700">Require password change on next login</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-surface-600">
                  {permissions.length} of {ALL_PERMISSIONS.length} permissions enabled for <strong>{formData.role}</strong>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPermissions(ALL_PERMISSIONS.map(p => p.key))}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-surface-300">|</span>
                  <button
                    type="button"
                    onClick={() => setPermissions([])}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                  <span className="text-surface-300">|</span>
                  <button
                    type="button"
                    onClick={() => setPermissions(ROLE_DEFAULTS[formData.role] || [])}
                    className="text-xs text-surface-600 hover:text-surface-800 font-medium"
                  >
                    Reset to Role Default
                  </button>
                </div>
              </div>

              {permissionCategories.map(category => {
                const catPerms = ALL_PERMISSIONS.filter(p => p.category === category);
                const allChecked = catPerms.every(p => permissions.includes(p.key));
                const someChecked = catPerms.some(p => permissions.includes(p.key));

                return (
                  <div key={category} className="border border-surface-200 rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-2.5 bg-surface-50 cursor-pointer"
                      onClick={() => toggleCategoryAll(category)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                          onChange={() => toggleCategoryAll(category)}
                          className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-surface-900">{category}</span>
                      </div>
                      <span className="text-xs text-surface-500">
                        {catPerms.filter(p => permissions.includes(p.key)).length}/{catPerms.length}
                      </span>
                    </div>
                    <div className="px-4 py-2 grid grid-cols-2 gap-1">
                      {catPerms.map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.includes(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="w-3.5 h-3.5 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-xs text-surface-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary">
            {isEditing ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
