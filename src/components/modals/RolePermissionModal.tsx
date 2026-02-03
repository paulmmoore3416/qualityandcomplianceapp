import React, { useState, useEffect } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { UserRole, Permission } from '../../types';

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: UserRole, permissions: Permission[]) => void;
  role: UserRole;
  currentPermissions: Permission[];
  userCount: number;
}

const PERMISSION_GROUPS: { category: string; permissions: { key: Permission; label: string; description: string }[] }[] = [
  {
    category: 'Dashboard & Metrics',
    permissions: [
      { key: 'view_dashboard', label: 'View Dashboard', description: 'Access the main dashboard' },
      { key: 'view_metrics', label: 'View Metrics', description: 'View quality metrics and KPIs' },
      { key: 'edit_metrics', label: 'Edit Metrics', description: 'Create and edit metric entries' },
    ],
  },
  {
    category: 'Risk Management',
    permissions: [
      { key: 'view_risk', label: 'View Risk Matrix', description: 'View ISO 14971 risk assessments' },
      { key: 'edit_risk', label: 'Edit Risk Matrix', description: 'Create and modify risk assessments' },
    ],
  },
  {
    category: 'CAPA Management',
    permissions: [
      { key: 'view_capa', label: 'View CAPA', description: 'View corrective and preventive actions' },
      { key: 'edit_capa', label: 'Edit CAPA', description: 'Create and modify CAPAs' },
      { key: 'approve_capa', label: 'Approve CAPA', description: 'Approve or reject CAPAs' },
    ],
  },
  {
    category: 'Non-Conformance',
    permissions: [
      { key: 'view_ncr', label: 'View NCR', description: 'View non-conformance reports' },
      { key: 'edit_ncr', label: 'Edit NCR', description: 'Create and modify NCRs' },
    ],
  },
  {
    category: 'Document Control',
    permissions: [
      { key: 'view_documents', label: 'View Documents', description: 'Access controlled documents' },
      { key: 'edit_documents', label: 'Edit Documents', description: 'Create and edit documents' },
      { key: 'delete_documents', label: 'Delete Documents', description: 'Remove documents from system' },
      { key: 'share_documents', label: 'Share Documents', description: 'Share documents with users' },
    ],
  },
  {
    category: 'Post-Market Surveillance',
    permissions: [
      { key: 'view_vigilance', label: 'View Vigilance', description: 'View vigilance reports' },
      { key: 'edit_vigilance', label: 'Edit Vigilance', description: 'Create and modify vigilance reports' },
    ],
  },
  {
    category: 'Supplier Management',
    permissions: [
      { key: 'view_suppliers', label: 'View Suppliers', description: 'View approved supplier list' },
      { key: 'edit_suppliers', label: 'Edit Suppliers', description: 'Create and modify supplier records' },
      { key: 'approve_suppliers', label: 'Approve Suppliers', description: 'Approve or reject suppliers' },
    ],
  },
  {
    category: 'Training',
    permissions: [
      { key: 'view_training', label: 'View Training', description: 'View training records' },
      { key: 'edit_training', label: 'Edit Training', description: 'Create and assign training' },
      { key: 'verify_training', label: 'Verify Training', description: 'Verify training completion' },
    ],
  },
  {
    category: 'Change Control',
    permissions: [
      { key: 'view_change_control', label: 'View Change Control', description: 'View change requests' },
      { key: 'edit_change_control', label: 'Edit Change Control', description: 'Create and modify changes' },
      { key: 'approve_change_control', label: 'Approve Changes', description: 'Approve or reject changes' },
    ],
  },
  {
    category: 'Validation (EVT/DVP&R)',
    permissions: [
      { key: 'view_validation', label: 'View Validation', description: 'View validation reports' },
      { key: 'edit_validation', label: 'Edit Validation', description: 'Create and modify reports' },
      { key: 'approve_validation', label: 'Approve Validation', description: 'Approve validation reports' },
    ],
  },
  {
    category: 'System & Administration',
    permissions: [
      { key: 'sign_electronically', label: 'Electronic Signatures', description: '21 CFR Part 11 e-signatures' },
      { key: 'view_audit_trail', label: 'View Audit Trail', description: 'Access system audit logs' },
      { key: 'manage_users', label: 'Manage Users', description: 'Create, edit, delete users' },
      { key: 'manage_roles', label: 'Manage Roles', description: 'Edit role permissions' },
      { key: 'system_settings', label: 'System Settings', description: 'Modify system configuration' },
      { key: 'export_data', label: 'Export Data', description: 'Export compliance data' },
      { key: 'import_data', label: 'Import Data', description: 'Import data into system' },
    ],
  },
];

const ALL_PERMS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  'Admin': 'Full system access. Can manage users, roles, and all system settings.',
  'QA Manager': 'Manages quality processes. Can approve CAPAs, change controls, and validation reports.',
  'Engineer': 'Creates and edits design records. Can modify CAPAs, NCRs, and change controls.',
  'Auditor': 'Read-only access to all quality records for audit purposes. Can export data.',
  'Viewer': 'Basic read-only access to quality data. Cannot modify any records.',
  'Guest': 'Minimal access. Dashboard view only.',
  'Demo': 'Demonstration account with broad edit access but no admin privileges.',
};

export default function RolePermissionModal({ isOpen, onClose, onSave, role, currentPermissions, userCount }: RolePermissionModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    setPermissions([...currentPermissions]);
  }, [currentPermissions, isOpen]);

  const togglePermission = (perm: Permission) => {
    setPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleGroup = (group: typeof PERMISSION_GROUPS[0]) => {
    const groupPerms = group.permissions.map(p => p.key);
    const allSelected = groupPerms.every(p => permissions.includes(p));
    if (allSelected) {
      setPermissions(prev => prev.filter(p => !groupPerms.includes(p)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...groupPerms])]);
    }
  };

  const handleSave = () => {
    onSave(role, permissions);
    onClose();
  };

  if (!isOpen) return null;

  const changedCount = permissions.filter(p => !currentPermissions.includes(p)).length +
    currentPermissions.filter(p => !permissions.includes(p)).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">
                Edit Permissions: {role}
              </h2>
              <p className="text-sm text-surface-500">
                {ROLE_DESCRIPTIONS[role]} ({userCount} user{userCount !== 1 ? 's' : ''})
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-6 py-3 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
          <span className="text-sm text-surface-600">
            {permissions.length} of {ALL_PERMS.length} permissions enabled
            {changedCount > 0 && (
              <span className="ml-2 text-primary-600 font-medium">({changedCount} change{changedCount !== 1 ? 's' : ''})</span>
            )}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPermissions([...ALL_PERMS])}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium"
            >
              Grant All
            </button>
            <button
              type="button"
              onClick={() => setPermissions([])}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Revoke All
            </button>
          </div>
        </div>

        {/* Permission Groups */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-3">
          {PERMISSION_GROUPS.map(group => {
            const groupPerms = group.permissions.map(p => p.key);
            const allChecked = groupPerms.every(p => permissions.includes(p));
            const someChecked = groupPerms.some(p => permissions.includes(p));

            return (
              <div key={group.category} className="border border-surface-200 rounded-lg">
                <div
                  className="flex items-center justify-between px-4 py-3 bg-surface-50 cursor-pointer rounded-t-lg"
                  onClick={() => toggleGroup(group)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={() => toggleGroup(group)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                    />
                    <span className="font-medium text-surface-900">{group.category}</span>
                  </div>
                  <span className="text-xs text-surface-500">
                    {groupPerms.filter(p => permissions.includes(p)).length}/{groupPerms.length}
                  </span>
                </div>
                <div className="divide-y divide-surface-100">
                  {group.permissions.map(perm => {
                    const isEnabled = permissions.includes(perm.key);
                    const wasChanged = isEnabled !== currentPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-surface-50 transition-colors ${wasChanged ? 'bg-yellow-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => togglePermission(perm.key)}
                            className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                          />
                          <div>
                            <span className="text-sm text-surface-900">{perm.label}</span>
                            <p className="text-xs text-surface-500">{perm.description}</p>
                          </div>
                        </div>
                        {isEnabled && <Check className="w-4 h-4 text-green-500" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-surface-200">
          <p className="text-xs text-surface-500">
            Changes will apply to all {userCount} user{userCount !== 1 ? 's' : ''} with the {role} role.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
              disabled={changedCount === 0}
            >
              Save Permissions {changedCount > 0 && `(${changedCount} changes)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
