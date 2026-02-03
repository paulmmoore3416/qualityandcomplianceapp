import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session, Permission, UserRole } from '../types';

interface AuthState {
  currentUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  loginWithSSO: (provider: 'google' | 'github' | 'microsoft') => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  updateUser: (user: Partial<User>) => void;
}

// Mock user data - in production, this would come from a backend
// NOTE: For security, demo credentials are loaded from environment variables during development
// NEVER hardcode passwords in production code
const MOCK_USERS: { username: string; password: string; user: User }[] = [
  {
    username: process.env.REACT_APP_DEMO_ADMIN_USERNAME || 'admin-dev',
    password: process.env.REACT_APP_DEMO_ADMIN_PASSWORD || 'dev-password',
    user: {
      id: 'user-001',
      username: 'admin',
      email: 'admin@medtech.com',
      fullName: 'System Administrator',
      role: 'Admin',
      permissions: [
        'view_dashboard',
        'view_metrics',
        'edit_metrics',
        'view_risk',
        'edit_risk',
        'view_capa',
        'edit_capa',
        'approve_capa',
        'view_ncr',
        'edit_ncr',
        'view_documents',
        'edit_documents',
        'delete_documents',
        'share_documents',
        'view_vigilance',
        'edit_vigilance',
        'view_suppliers',
        'edit_suppliers',
        'approve_suppliers',
        'view_training',
        'edit_training',
        'verify_training',
        'view_change_control',
        'edit_change_control',
        'approve_change_control',
        'view_validation',
        'edit_validation',
        'approve_validation',
        'sign_electronically',
        'view_audit_trail',
        'manage_users',
        'manage_roles',
        'system_settings',
        'export_data',
        'import_data',
      ],
      department: 'IT & Quality Systems',
      title: 'Quality Systems Administrator',
      status: 'Active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-01-01'),
      mustChangePassword: false,
      mfaEnabled: true,
      failedLoginAttempts: 0,
    },
  },
  {
    username: process.env.REACT_APP_DEMO_QA_USERNAME || 'qa_manager-dev',
    password: process.env.REACT_APP_DEMO_QA_PASSWORD || 'dev-password',
    user: {
      id: 'user-002',
      username: 'qa_manager',
      email: 'qa.manager@medtech.com',
      fullName: 'Sarah Johnson',
      role: 'QA Manager',
      permissions: [
        'view_dashboard',
        'view_metrics',
        'edit_metrics',
        'view_risk',
        'edit_risk',
        'view_capa',
        'edit_capa',
        'approve_capa',
        'view_ncr',
        'edit_ncr',
        'view_documents',
        'edit_documents',
        'share_documents',
        'view_vigilance',
        'edit_vigilance',
        'view_suppliers',
        'edit_suppliers',
        'view_training',
        'edit_training',
        'verify_training',
        'view_change_control',
        'edit_change_control',
        'approve_change_control',
        'view_validation',
        'edit_validation',
        'approve_validation',
        'sign_electronically',
        'view_audit_trail',
        'export_data',
      ],
      department: 'Quality Assurance',
      title: 'QA Manager',
      status: 'Active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-01-15'),
      mustChangePassword: false,
      mfaEnabled: true,
      failedLoginAttempts: 0,
    },
  },
  {
    username: process.env.REACT_APP_DEMO_ENG_USERNAME || 'engineer-dev',
    password: process.env.REACT_APP_DEMO_ENG_PASSWORD || 'dev-password',
    user: {
      id: 'user-003',
      username: 'engineer',
      email: 'engineer@medtech.com',
      fullName: 'Michael Chen',
      role: 'Engineer',
      permissions: [
        'view_dashboard',
        'view_metrics',
        'view_risk',
        'view_capa',
        'edit_capa',
        'view_ncr',
        'edit_ncr',
        'view_documents',
        'edit_documents',
        'share_documents',
        'view_vigilance',
        'view_suppliers',
        'view_training',
        'view_change_control',
        'edit_change_control',
        'view_validation',
        'edit_validation',
      ],
      department: 'Engineering',
      title: 'Senior Design Engineer',
      status: 'Active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-02-01'),
      mustChangePassword: false,
      mfaEnabled: false,
      failedLoginAttempts: 0,
    },
  },
  {
    username: process.env.REACT_APP_DEMO_AUDITOR_USERNAME || 'auditor-dev',
    password: process.env.REACT_APP_DEMO_AUDITOR_PASSWORD || 'dev-password',
    user: {
      id: 'user-004',
      username: 'auditor',
      email: 'auditor@medtech.com',
      fullName: 'Lisa Anderson',
      role: 'Auditor',
      permissions: [
        'view_dashboard',
        'view_metrics',
        'view_risk',
        'view_capa',
        'view_ncr',
        'view_documents',
        'view_vigilance',
        'view_suppliers',
        'view_training',
        'view_change_control',
        'view_validation',
        'view_audit_trail',
        'export_data',
      ],
      department: 'Regulatory Affairs',
      title: 'Internal Auditor',
      status: 'Active',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2024-02-15'),
      mustChangePassword: false,
      mfaEnabled: true,
      failedLoginAttempts: 0,
    },
  },
  {
    username: process.env.REACT_APP_DEMO_USER_USERNAME || 'demo-dev',
    password: process.env.REACT_APP_DEMO_USER_PASSWORD || 'dev-password',
    user: {
      id: 'user-005',
      username: 'demo',
      email: 'demo@medtech.com',
      fullName: 'Demo User',
      role: 'Demo',
      permissions: [
        'view_dashboard',
        'view_metrics',
        'edit_metrics',
        'view_risk',
        'edit_risk',
        'view_capa',
        'edit_capa',
        'view_ncr',
        'edit_ncr',
        'view_documents',
        'edit_documents',
        'share_documents',
        'view_vigilance',
        'edit_vigilance',
        'view_suppliers',
        'edit_suppliers',
        'view_training',
        'edit_training',
        'view_change_control',
        'edit_change_control',
        'view_validation',
        'edit_validation',
        'sign_electronically',
        'view_audit_trail',
        'export_data',
        // Note: Demo users do NOT have admin/system access
        // No: manage_users, manage_roles, system_settings
      ],
      department: 'Demonstration',
      title: 'Demo Account',
      status: 'Active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
      passwordLastChanged: new Date('2026-01-01'),
      mustChangePassword: false,
      mfaEnabled: false,
      failedLoginAttempts: 0,
    },
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string): Promise<boolean> => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );

        if (mockUser) {
          const session: Session = {
            id: `session-${Date.now()}`,
            userId: mockUser.user.id,
            token: `token-${Math.random().toString(36).substring(7)}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
            lastActivity: new Date(),
          };

          set({
            currentUser: { ...mockUser.user, lastLogin: new Date() },
            session,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        }

        set({ isLoading: false });
        return false;
      },

      loginWithSSO: async (provider: 'google' | 'github' | 'microsoft'): Promise<boolean> => {
        set({ isLoading: true });

        // Simulate SSO authentication
        // In production, this would integrate with real OAuth providers
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, create a mock SSO user
        // In production, this would be replaced with real OAuth flow
        const ssoUser: User = {
          id: `sso-${provider}-${Date.now()}`,
          username: `${provider}_user`,
          email: `user@${provider}.com`,
          fullName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} SSO User`,
          role: 'Demo',
          permissions: [
            'view_dashboard',
            'view_metrics',
            'edit_metrics',
            'view_risk',
            'edit_risk',
            'view_capa',
            'edit_capa',
            'view_ncr',
            'edit_ncr',
            'view_documents',
            'edit_documents',
            'share_documents',
            'view_vigilance',
            'edit_vigilance',
            'view_suppliers',
            'edit_suppliers',
            'view_training',
            'edit_training',
            'view_change_control',
            'edit_change_control',
            'view_validation',
            'edit_validation',
            'sign_electronically',
            'view_audit_trail',
            'export_data',
          ],
          department: 'SSO Users',
          title: `${provider} SSO Account`,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
          passwordLastChanged: new Date(),
          mustChangePassword: false,
          mfaEnabled: true,
          failedLoginAttempts: 0,
        };

        const session: Session = {
          id: `session-${Date.now()}`,
          userId: ssoUser.id,
          token: `sso-token-${Math.random().toString(36).substring(7)}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
          lastActivity: new Date(),
        };

        set({
          currentUser: { ...ssoUser, lastLogin: new Date() },
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      },

      logout: () => {
        set({
          currentUser: null,
          session: null,
          isAuthenticated: false,
        });
      },

      checkPermission: (permission: Permission): boolean => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return currentUser.permissions.includes(permission);
      },

      hasRole: (role: UserRole): boolean => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return currentUser.role === role;
      },

      updateUser: (userUpdate: Partial<User>) => {
        const { currentUser } = get();
        if (currentUser) {
          set({
            currentUser: {
              ...currentUser,
              ...userUpdate,
              updatedAt: new Date(),
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
