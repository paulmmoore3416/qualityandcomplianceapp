import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session, Permission, UserRole } from '../types';
import api from '../services/api';

interface AuthState {
  currentUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendAvailable: boolean;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  loginWithSSO: (provider: 'google' | 'github' | 'microsoft') => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  updateUser: (user: Partial<User>) => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      backendAvailable: false,

      login: async (username: string, password: string): Promise<boolean> => {
        set({ isLoading: true });

        try {
          // Try backend API first
          const result = await api.login(username, password);
          const userData = result.user as Record<string, unknown>;
          const sessionData = result.session as Record<string, unknown>;

          const user: User = {
            id: userData.id as string,
            username: userData.username as string,
            email: userData.email as string,
            fullName: userData.fullName as string,
            role: userData.role as UserRole,
            permissions: userData.permissions as Permission[],
            department: userData.department as string,
            title: userData.title as string,
            status: (userData.status as 'Active' | 'Inactive' | 'Locked' | 'Pending') || 'Active',
            lastLogin: new Date(),
            createdAt: new Date(userData.createdAt as string),
            updatedAt: new Date(userData.updatedAt as string),
            passwordLastChanged: new Date(userData.passwordLastChanged as string),
            mustChangePassword: userData.mustChangePassword as boolean,
            mfaEnabled: userData.mfaEnabled as boolean,
            failedLoginAttempts: 0,
          };

          const session: Session = {
            id: sessionData.id as string,
            userId: sessionData.userId as string,
            token: result.token,
            ipAddress: sessionData.ipAddress as string,
            userAgent: sessionData.userAgent as string,
            createdAt: new Date(sessionData.createdAt as string),
            expiresAt: new Date(sessionData.expiresAt as string),
            lastActivity: new Date(),
          };

          set({
            currentUser: user,
            session,
            isAuthenticated: true,
            isLoading: false,
            backendAvailable: true,
          });

          return true;
        } catch (err) {
          console.warn('Backend login failed, trying fallback:', err);

          // Fallback to mock auth if backend is unavailable
          const mockResult = await tryMockLogin(username, password);
          if (mockResult) {
            set({
              currentUser: mockResult.user,
              session: mockResult.session,
              isAuthenticated: true,
              isLoading: false,
              backendAvailable: false,
            });
            return true;
          }

          set({ isLoading: false });
          return false;
        }
      },

      loginWithSSO: async (provider: 'google' | 'github' | 'microsoft'): Promise<boolean> => {
        set({ isLoading: true });

        // SSO mock - in production integrate with real OAuth providers
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const ssoUser: User = {
          id: `sso-${provider}-${Date.now()}`,
          username: `${provider}_user`,
          email: `user@${provider}.com`,
          fullName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} SSO User`,
          role: 'Demo',
          permissions: [
            'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
            'view_capa', 'edit_capa', 'view_ncr', 'edit_ncr',
            'view_documents', 'edit_documents', 'share_documents',
            'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
            'view_training', 'edit_training', 'view_change_control', 'edit_change_control',
            'view_validation', 'edit_validation', 'sign_electronically',
            'view_audit_trail', 'export_data',
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
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
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
        try {
          api.logout().catch(() => {});
        } catch {
          // ignore
        }
        api.setToken(null);
        set({
          currentUser: null,
          session: null,
          isAuthenticated: false,
          backendAvailable: false,
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

      restoreSession: async () => {
        const { session } = get();
        if (session?.token) {
          api.setToken(session.token);
          try {
            await api.getMe();
            set({ backendAvailable: true });
          } catch {
            // Token may be expired - keep local state but mark backend as unavailable
            set({ backendAvailable: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrate: () => {
        return (state) => {
          // Restore API token on rehydration
          if (state?.session?.token) {
            api.setToken(state.session.token);
          }
        };
      },
    }
  )
);

// Listen for auth expiry events
if (typeof window !== 'undefined') {
  window.addEventListener('auth:expired', () => {
    useAuthStore.getState().logout();
  });
}

// Fallback mock login for when backend is unavailable
async function tryMockLogin(username: string, password: string): Promise<{ user: User; session: Session } | null> {
  const MOCK_USERS = [
    { username: 'admin', password: 'admin123', role: 'Admin' as UserRole, fullName: 'System Administrator', email: 'admin@medtech.com', department: 'IT & Quality Systems', title: 'Quality Systems Administrator' },
    { username: 'qa_manager', password: 'qa123', role: 'QA Manager' as UserRole, fullName: 'Sarah Johnson', email: 'qa.manager@medtech.com', department: 'Quality Assurance', title: 'QA Manager' },
    { username: 'engineer', password: 'eng123', role: 'Engineer' as UserRole, fullName: 'Michael Chen', email: 'engineer@medtech.com', department: 'Engineering', title: 'Senior Design Engineer' },
    { username: 'demo', password: 'demo123', role: 'Demo' as UserRole, fullName: 'Demo User', email: 'demo@medtech.com', department: 'Demonstration', title: 'Demo Account' },
  ];

  await new Promise((resolve) => setTimeout(resolve, 300));

  const match = MOCK_USERS.find(u => u.username === username && u.password === password);
  if (!match) return null;

  const allPerms: Permission[] = [
    'view_dashboard', 'view_metrics', 'edit_metrics', 'view_risk', 'edit_risk',
    'view_capa', 'edit_capa', 'approve_capa', 'view_ncr', 'edit_ncr',
    'view_documents', 'edit_documents', 'delete_documents', 'share_documents',
    'view_vigilance', 'edit_vigilance', 'view_suppliers', 'edit_suppliers',
    'approve_suppliers', 'view_training', 'edit_training', 'verify_training',
    'view_change_control', 'edit_change_control', 'approve_change_control',
    'view_validation', 'edit_validation', 'approve_validation',
    'sign_electronically', 'view_audit_trail', 'manage_users', 'manage_roles',
    'system_settings', 'export_data', 'import_data',
  ];

  const user: User = {
    id: `mock-${match.username}`,
    username: match.username,
    email: match.email,
    fullName: match.fullName,
    role: match.role,
    permissions: match.role === 'Admin' ? allPerms : allPerms.filter(p => !p.startsWith('manage_') && p !== 'system_settings'),
    department: match.department,
    title: match.title,
    status: 'Active',
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passwordLastChanged: new Date('2024-01-01'),
    mustChangePassword: false,
    mfaEnabled: false,
    failedLoginAttempts: 0,
  };

  const session: Session = {
    id: `session-${Date.now()}`,
    userId: user.id,
    token: `mock-token-${Math.random().toString(36).substring(7)}`,
    ipAddress: '127.0.0.1',
    userAgent: navigator.userAgent,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivity: new Date(),
  };

  return { user, session };
}
