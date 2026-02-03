import { useAppStore } from '../stores/app-store';
import { useAuthStore } from '../stores/auth-store';
import { Bell, Shield, ShieldCheck, Search, Download, User, LogOut, Moon, Sun, Command } from 'lucide-react';
import { cn, formatDateTime } from '../lib/utils';
import { useState, useCallback } from 'react';
import { useThemeStore } from '../stores/theme-store';
import { useKeyboardStore } from '../stores/keyboard-store';
import GlobalSearch, { SearchResultType } from './GlobalSearch';
import CollaborationIndicator from './CollaborationIndicator';

export default function Header() {
  const { activeView, auditMode, setAuditMode, getUnacknowledgedAlerts, exportAuditReport, setActiveView } = useAppStore();
  const { currentUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { openCommandPalette } = useKeyboardStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const alerts = getUnacknowledgedAlerts();
  const criticalAlerts = alerts.filter(a => a.type === 'Critical');

  const handleSearchNavigate = useCallback((type: SearchResultType, _id: string) => {
    // Navigate to the appropriate view based on result type
    const viewMap: Record<SearchResultType, string> = {
      capa: 'capa',
      ncr: 'ncr',
      risk: 'risk',
      document: 'documents',
      supplier: 'suppliers',
      training: 'training',
      change_control: 'changecontrol',
      validation: 'validation',
      metric: 'metrics',
    };
    setActiveView(viewMap[type] as typeof activeView);
    setShowSearch(false);
  }, [setActiveView]);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    analytics: 'Advanced Analytics',
    metrics: 'Metrics Management',
    risk: 'ISO 14971 Risk Matrix',
    capa: 'CAPA Management',
    ncr: 'Non-Conformance Reports',
    lifecycle: 'Lifecycle Management',
    audit: 'Audit Mode',
    settings: 'Settings',
    vigilance: 'Post-Market Vigilance',
    suppliers: 'Supplier Management',
    training: 'Training Records',
    changecontrol: 'Change Control',
    documents: 'Document Control',
    aiagents: 'AI Agents',
    admin: 'Administration',
    validation: 'Validation Reports',
  };

  const handleExport = () => {
    const report = exportAuditReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-16 bg-white dark:bg-gh-surface border-b border-surface-200 dark:border-gh-border flex items-center justify-between px-6">
      {/* Left: Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{viewTitles[activeView]}</h1>
        <p className="text-xs text-gray-500">
          {formatDateTime(new Date())}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 pl-3 pr-2 py-2 w-64 text-sm bg-surface-50 dark:bg-gh-overlay border border-surface-200 dark:border-gh-border rounded-lg hover:border-primary-300 dark:hover:border-gh-blue transition-colors text-left"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="flex-1 text-gray-400">Search...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-surface-400 bg-surface-200 dark:bg-gh-border rounded">
            ⌘K
          </kbd>
        </button>

        {/* Command Palette Button */}
        <button
          onClick={openCommandPalette}
          className="p-2 rounded-lg bg-surface-100 dark:bg-gh-overlay hover:bg-surface-200 dark:hover:bg-gh-border transition-colors"
          title="Command Palette (⌘K)"
        >
          <Command className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExport}
          className="btn-secondary btn-sm gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg transition-colors',
            theme === 'dark'
              ? 'bg-gh-overlay text-gh-yellow hover:bg-gh-border'
              : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
          )}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Audit Mode Toggle */}
        <button
          onClick={() => setAuditMode(!auditMode)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            auditMode
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
          )}
        >
          {auditMode ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              Audit Mode ON
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Audit Mode
            </>
          )}
        </button>

        {/* Collaboration Indicator */}
        <CollaborationIndicator compact />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-surface-900">
                {currentUser?.fullName}
              </p>
              <p className="text-xs text-surface-500">{currentUser?.role}</p>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gh-surface rounded-lg shadow-lg dark:shadow-dark-elevated border border-surface-200 dark:border-gh-border z-20">
                <div className="p-4 border-b border-surface-200">
                  <p className="font-medium text-surface-900">
                    {currentUser?.fullName}
                  </p>
                  <p className="text-sm text-surface-600">
                    {currentUser?.email}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {currentUser?.department} • {currentUser?.title}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Alerts */}
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-surface-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {alerts.length > 0 && (
              <span className={cn(
                'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full',
                criticalAlerts.length > 0
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-white'
              )}>
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={handleSearchNavigate}
      />
    </header>
  );
}
