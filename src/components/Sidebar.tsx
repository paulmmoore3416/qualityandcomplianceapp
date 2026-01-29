import { useAppStore } from '../stores/app-store';
import { useAuthStore } from '../stores/auth-store';
import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  ClipboardCheck,
  FileWarning,
  GitBranch,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Truck,
  GraduationCap,
  FileText,
  GitCommit,
  Bot,
  UserCog,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';

type ViewType = 'dashboard' | 'metrics' | 'risk' | 'capa' | 'ncr' | 'lifecycle' | 'audit' | 'settings' | 'vigilance' | 'suppliers' | 'training' | 'changecontrol' | 'documents' | 'aiagents' | 'admin';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  category?: 'core' | 'pms' | 'support';
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activeView, setActiveView, getCAPAStats, getNCRStats, getUnacknowledgedAlerts } = useAppStore();
  const { currentUser, logout } = useAuthStore();

  const capaStats = getCAPAStats();
  const ncrStats = getNCRStats();
  const alertCount = getUnacknowledgedAlerts().length;

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'core' },
    { id: 'metrics', label: 'Metrics', icon: BarChart3, category: 'core' },
    { id: 'risk', label: 'Risk Matrix', icon: AlertTriangle, badge: alertCount > 0 ? alertCount : undefined, category: 'core' },
    { id: 'capa', label: 'CAPA', icon: ClipboardCheck, badge: capaStats.overdue > 0 ? capaStats.overdue : undefined, category: 'core' },
    { id: 'ncr', label: 'NCR', icon: FileWarning, badge: ncrStats.open > 0 ? ncrStats.open : undefined, category: 'core' },
    { id: 'vigilance', label: 'Vigilance', icon: Bell, category: 'pms' },
    { id: 'lifecycle', label: 'Lifecycle', icon: GitBranch, category: 'core' },
    { id: 'aiagents', label: 'AI Agents', icon: Bot, category: 'pms' },
    { id: 'changecontrol', label: 'Change Control', icon: GitCommit, category: 'support' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, category: 'support' },
    { id: 'training', label: 'Training', icon: GraduationCap, category: 'support' },
    { id: 'documents', label: 'Documents', icon: FileText, category: 'support' },
    { id: 'audit', label: 'Audit Mode', icon: Shield, category: 'core' },
    { id: 'admin', label: 'Admin Panel', icon: UserCog, category: 'support' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'support' },
  ];

  // Filter navigation items based on user role
  // Only Admin users can access the Admin Panel
  const navItems = allNavItems.filter(item => {
    if (item.id === 'admin') {
      return currentUser?.role === 'Admin';
    }
    return true;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-surface-200 transition-all duration-300 z-40 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">MedTech</h1>
              <p className="text-xs text-gray-500">Compliance Suite</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-md hover:bg-surface-100 text-gray-500 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-surface-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute left-10 top-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-surface-200">
        {sidebarOpen ? (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.role || 'Guest'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="p-2">
            <button
              type="button"
              onClick={logout}
              className="w-full p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {/* ISO Standards Badge */}
      {sidebarOpen && (
        <div className="p-4 border-t border-surface-200">
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Compliance Standards</p>
            <div className="flex flex-wrap gap-1">
              <span className="badge-blue text-[10px]">ISO 13485</span>
              <span className="badge-blue text-[10px]">ISO 14971</span>
              <span className="badge-blue text-[10px]">ISO 10993</span>
              <span className="badge-blue text-[10px]">ISO 9001</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
