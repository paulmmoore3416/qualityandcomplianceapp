import { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import {
  Settings,
  Bell,
  Database,
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Lock,
  Eye,
  Monitor,
  Link,
  FileArchive,
  Users,
  CheckCircle,
  AlertTriangle,
  Globe,
  Key,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type SettingsTab =
  | 'general'
  | 'security'
  | 'appearance'
  | 'notifications'
  | 'data'
  | 'audit'
  | 'integrations'
  | 'compliance'
  | 'users';

export default function SettingsView() {
  const { loadData } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // General
  const [companyName, setCompanyName] = useState('Medical Device Company');
  const [defaultUser, setDefaultUser] = useState('Quality Engineer');
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  // Security
  const [sessionTimeout, setSessionTimeout] = useState('480');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [lockoutDuration, setLockoutDuration] = useState('15');
  const [minPasswordLength, setMinPasswordLength] = useState('12');
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState('90');

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBadges, setShowBadges] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Notifications
  const [alertThreshold, setAlertThreshold] = useState('24');
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [capaAlerts, setCAPAAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [certExpiryAlerts, setCertExpiryAlerts] = useState(true);
  const [trainingAlerts, setTrainingAlerts] = useState(true);
  const [regulatoryAlerts, setRegulatoryAlerts] = useState(true);
  const [reminderDays, setReminderDays] = useState('7');

  // Audit & Records
  const [retentionYears, setRetentionYears] = useState('10');
  const [autoArchive, setAutoArchive] = useState(false);
  const [archiveAfterDays, setArchiveAfterDays] = useState('365');
  const [auditLogLevel, setAuditLogLevel] = useState('Full');
  const [requireReasonForChange, setRequireReasonForChange] = useState(true);
  const [exportSchedule, setExportSchedule] = useState('Monthly');

  // Integrations
  const [apiEnabled, setApiEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['capa.created', 'ncr.created']);
  const [erpSystem, setErpSystem] = useState('None');
  const [ldapEnabled, setLdapEnabled] = useState(false);
  const [ldapServer, setLdapServer] = useState('');

  // Compliance
  const [deviceClassification, setDeviceClassification] = useState('Class III (High Risk)');

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'audit', label: 'Audit & Records', icon: FileArchive },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'users', label: 'Users & Roles', icon: Users },
  ];

  const handleExportData = () => {
    const data = localStorage.getItem('medtech-compliance-state');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medtech-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            localStorage.setItem('medtech-compliance-state', JSON.stringify(data));
            loadData();
            alert('Data imported successfully');
          } catch {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveSettings = () => {
    // Save to localStorage
    const settings = {
      companyName, defaultUser, autoSave, language, timezone, dateFormat,
      sessionTimeout, mfaRequired, maxLoginAttempts, lockoutDuration,
      minPasswordLength, requireUppercase, requireNumbers, requireSpecial, passwordExpiry,
      theme, density, sidebarCollapsed, showBadges, animationsEnabled,
      alertThreshold, emailAlerts, emailAddress,
      retentionYears, autoArchive, archiveAfterDays, auditLogLevel,
      requireReasonForChange, exportSchedule,
    };
    localStorage.setItem('medtech-settings', JSON.stringify(settings));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently delete ALL compliance data including metrics, CAPAs, NCRs, risk assessments, documents, and training records.\n\nThis action CANNOT be undone.\n\nType "DELETE" to confirm.'
    );
    if (confirmed) {
      const input = window.prompt('Type DELETE to confirm:');
      if (input === 'DELETE') {
        localStorage.removeItem('medtech-compliance-state');
        loadData();
        alert('All data has been cleared.');
      }
    }
  };

  const toggleWebhookEvent = (event: string) => {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure application preferences and compliance settings
          </p>
        </div>
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Settings saved
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 space-y-1 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-surface-100'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ─── General ─── */}
          {activeTab === 'general' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input" />
                  <p className="text-xs text-gray-500 mt-1">Appears in reports and audit documentation</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default User Name</label>
                  <input type="text" value={defaultUser} onChange={(e) => setDefaultUser(e.target.value)} className="input" />
                  <p className="text-xs text-gray-500 mt-1">Pre-filled when recording metric values</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input" title="Select language">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Deutsch</option>
                    <option>Français</option>
                    <option>Español</option>
                    <option>日本語</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input" title="Select timezone">
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Denver</option>
                    <option>America/Los_Angeles</option>
                    <option>Europe/London</option>
                    <option>Europe/Berlin</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="input" title="Select date format">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Enable auto-save</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">Automatically save changes after each action</p>
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          )}

          {/* ─── Security ─── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-600" />
                  Session & Access
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                    <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="input" title="Select session timeout">
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                      <option value="480">8 hours</option>
                      <option value="0">Never (not recommended)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Failed Login Attempts</label>
                    <select value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} className="input" title="Select max login attempts">
                      <option value="3">3 attempts</option>
                      <option value="5">5 attempts</option>
                      <option value="10">10 attempts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Lockout Duration (minutes)</label>
                    <select value={lockoutDuration} onChange={(e) => setLockoutDuration(e.target.value)} className="input" title="Select lockout duration">
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="1440">24 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
                    <select value={passwordExpiry} onChange={(e) => setPasswordExpiry(e.target.value)} className="input" title="Select password expiry">
                      <option value="0">Never</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={mfaRequired} onChange={(e) => setMfaRequired(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Require Multi-Factor Authentication (MFA)</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Recommended for 21 CFR Part 11 compliance. Requires all users to use TOTP or SMS MFA.
                  </p>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary-600" />
                  Password Policy
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                    <select value={minPasswordLength} onChange={(e) => setMinPasswordLength(e.target.value)} className="input" title="Select minimum password length">
                      <option value="8">8 characters</option>
                      <option value="10">10 characters</option>
                      <option value="12">12 characters (recommended)</option>
                      <option value="16">16 characters</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Require uppercase letters (A–Z)', value: requireUppercase, setter: setRequireUppercase },
                    { label: 'Require numbers (0–9)', value: requireNumbers, setter: setRequireNumbers },
                    { label: 'Require special characters (!@#$...)', value: requireSpecial, setter: setRequireSpecial },
                  ].map(({ label, value, setter }) => (
                    <label key={label} className="flex items-center gap-3">
                      <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>21 CFR Part 11.300</strong> — Electronic signatures require controls ensuring
                    their uniqueness to the signer, including combination of identification code and password.
                  </p>
                </div>
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Security Settings
              </button>
            </div>
          )}

          {/* ─── Appearance ─── */}
          {activeTab === 'appearance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary-600" />
                Appearance
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                        theme === t ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-7 rounded',
                        t === 'light' ? 'bg-white border border-surface-300' :
                        t === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800 border border-surface-300'
                      )} />
                      <span className={cn('text-sm font-medium capitalize', theme === t ? 'text-primary-700' : 'text-gray-600')}>
                        {t === 'system' ? 'System Default' : t}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Display Density</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['compact', 'normal', 'spacious'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensity(d)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                        density === d ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'
                      )}
                    >
                      <div className="w-full space-y-1">
                        {[d === 'compact' ? 'h-1' : d === 'normal' ? 'h-1.5' : 'h-2'].map((h, i) => (
                          <div key={i} className={cn('w-full rounded bg-surface-300', h)} />
                        ))}
                        <div className="w-3/4 rounded bg-surface-200 h-1" />
                      </div>
                      <span className={cn('text-sm font-medium capitalize', density === d ? 'text-primary-700' : 'text-gray-600')}>
                        {d}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Show notification badges on navigation', value: showBadges, setter: setShowBadges },
                  { label: 'Enable animations and transitions', value: animationsEnabled, setter: setAnimationsEnabled },
                  { label: 'Collapse sidebar by default', value: sidebarCollapsed, setter: setSidebarCollapsed },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="flex items-center gap-3">
                    <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Appearance
              </button>
            </div>
          )}

          {/* ─── Notifications ─── */}
          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Lead Time (days before due)</label>
                  <select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className="input" title="Select reminder days">
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (hours)</label>
                  <select value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} className="input" title="Select alert threshold">
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Pre-overdue alert timing</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Enable email notifications</span>
                </label>
                {emailAlerts && (
                  <div className="mt-3 ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Email</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="input max-w-md"
                      placeholder="quality@company.com"
                    />
                  </div>
                )}
              </div>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Alert Types</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'CAPA approaching / overdue', value: capaAlerts, setter: setCAPAAlerts },
                    { label: 'Metric threshold breach', value: overdueAlerts, setter: setOverdueAlerts },
                    { label: 'Risk assessment changes', value: riskAlerts, setter: setRiskAlerts },
                    { label: 'Certification expiry', value: certExpiryAlerts, setter: setCertExpiryAlerts },
                    { label: 'Training overdue', value: trainingAlerts, setter: setTrainingAlerts },
                    { label: 'Regulatory reporting deadlines', value: regulatoryAlerts, setter: setRegulatoryAlerts },
                  ].map(({ label, value, setter }) => (
                    <label key={label} className="flex items-center gap-2">
                      <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Notification Settings
              </button>
            </div>
          )}

          {/* ─── Data Management ─── */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

                <div className="bg-surface-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Backup & Restore</h4>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleExportData} className="btn-secondary gap-2">
                      <Download className="w-4 h-4" />
                      Export Data (JSON)
                    </button>
                    <button type="button" onClick={handleImportData} className="btn-secondary gap-2">
                      <Upload className="w-4 h-4" />
                      Import Data
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Export your data for backup or transfer. Per ISO 13485:4.2.5 — Control of records.
                  </p>
                </div>

                <div className="bg-surface-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Sync Status
                  </h4>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">All data saved locally</span>
                  </div>
                  <button type="button" onClick={() => loadData()} className="btn-ghost btn-sm gap-2 mt-3 text-primary-600">
                    <RefreshCw className="w-3 h-3" />
                    Refresh Data
                  </button>
                </div>
              </div>

              <div className="card bg-red-50 border-red-200 space-y-3">
                <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h4>
                <button type="button" onClick={handleClearAllData} className="btn-danger btn-sm gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
                <p className="text-xs text-red-600">
                  This action cannot be undone. All metric values, CAPAs, NCRs, and risk assessments
                  will be permanently deleted. You will be prompted to type DELETE to confirm.
                </p>
              </div>
            </div>
          )}

          {/* ─── Audit & Records ─── */}
          {activeTab === 'audit' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-primary-600" />
                Audit & Records Management
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record Retention Period (years)</label>
                  <select value={retentionYears} onChange={(e) => setRetentionYears(e.target.value)} className="input" title="Select retention period">
                    <option value="5">5 years</option>
                    <option value="7">7 years (EU MDR minimum)</option>
                    <option value="10">10 years (recommended)</option>
                    <option value="15">15 years</option>
                    <option value="permanent">Permanent</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    EU MDR requires minimum 10 years for Class IIb/III. FDA requires 2 years minimum.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audit Log Level</label>
                  <select value={auditLogLevel} onChange={(e) => setAuditLogLevel(e.target.value)} className="input" title="Select audit log level">
                    <option>Full (all changes)</option>
                    <option>Standard (key fields)</option>
                    <option>Minimal (creates/deletes only)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Export</label>
                  <select value={exportSchedule} onChange={(e) => setExportSchedule(e.target.value)} className="input" title="Select export schedule">
                    <option>Off</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Archive After (days)</label>
                  <input
                    type="number"
                    value={archiveAfterDays}
                    onChange={(e) => setArchiveAfterDays(e.target.value)}
                    className="input"
                    disabled={!autoArchive}
                    min="30"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={autoArchive} onChange={(e) => setAutoArchive(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Enable automatic archiving of closed records</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={requireReasonForChange} onChange={(e) => setRequireReasonForChange(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Require reason for change when editing records</span>
                </label>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary-800 mb-2">Regulatory Record-Keeping Requirements</h4>
                <div className="grid grid-cols-3 gap-3 text-xs text-primary-700">
                  <div>
                    <p className="font-semibold">ISO 13485:4.2.5</p>
                    <p>QMS records: life of device + 2 years minimum</p>
                  </div>
                  <div>
                    <p className="font-semibold">EU MDR Annex IX</p>
                    <p>Technical documentation: 10 years (15 for Class III)</p>
                  </div>
                  <div>
                    <p className="font-semibold">FDA 21 CFR 820.180</p>
                    <p>Device history records: 2 years minimum</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Audit Settings
              </button>
            </div>
          )}

          {/* ─── Integrations ─── */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" />
                  API & Webhooks
                </h3>

                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={apiEnabled} onChange={(e) => setApiEnabled(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Enable REST API access</span>
                  </label>
                  {apiEnabled && (
                    <div className="mt-3 ml-7 space-y-3">
                      <div className="flex items-center gap-2 bg-surface-50 rounded-lg p-3">
                        <span className="text-xs text-gray-500">API Key:</span>
                        <code className="text-xs font-mono text-gray-700 flex-1">mk_live_••••••••••••••••••••••••</code>
                        <button type="button" className="btn-ghost btn-sm text-xs text-primary-600">Regenerate</button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Base URL: <code className="font-mono">http://localhost:3001/api</code>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="input"
                    placeholder="https://your-system.com/webhooks/medtech"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Webhook Events</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'capa.created', 'capa.closed', 'ncr.created', 'ncr.closed',
                      'risk.threshold_breach', 'complaint.created',
                      'supplier.added', 'training.assigned',
                    ].map((event) => (
                      <label key={event} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes(event)}
                          onChange={() => toggleWebhookEvent(event)}
                          className="w-4 h-4 rounded"
                        />
                        <code className="text-xs text-gray-600">{event}</code>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Enterprise Integrations</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ERP System</label>
                    <select value={erpSystem} onChange={(e) => setErpSystem(e.target.value)} className="input" title="Select ERP system">
                      <option>None</option>
                      <option>SAP</option>
                      <option>Oracle ERP</option>
                      <option>Microsoft Dynamics</option>
                      <option>NetSuite</option>
                      <option>Custom / Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={ldapEnabled} onChange={(e) => setLdapEnabled(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Enable LDAP / Active Directory authentication</span>
                  </label>
                  {ldapEnabled && (
                    <div className="mt-3 ml-7">
                      <label className="block text-sm font-medium text-gray-700 mb-1">LDAP Server URL</label>
                      <input
                        type="text"
                        value={ldapServer}
                        onChange={(e) => setLdapServer(e.target.value)}
                        className="input max-w-md"
                        placeholder="ldap://company.local:389"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Integration Settings
              </button>
            </div>
          )}

          {/* ─── Compliance ─── */}
          {activeTab === 'compliance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Configuration</h3>

              <div className="bg-primary-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary-800 mb-3">Active Quality Standards</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'ISO 13485:2016', desc: 'Medical Devices QMS', required: true },
                    { name: 'ISO 14971:2019', desc: 'Risk Management', required: true },
                    { name: 'ISO 10993', desc: 'Biocompatibility', required: false },
                    { name: 'ISO 9001:2015', desc: 'General QMS', required: false },
                    { name: 'IEC 62304:2006+A1', desc: 'Software Lifecycle', required: false },
                    { name: 'IEC 60601-1', desc: 'Electrical Safety', required: false },
                    { name: 'IEC 62366-1', desc: 'Usability Engineering', required: false },
                    { name: 'ISO 15223-1', desc: 'Labeling Symbols', required: false },
                    { name: 'ISO 17664', desc: 'Reprocessing', required: false },
                    { name: 'ISO 11135', desc: 'EO Sterilization', required: false },
                    { name: 'ISO 11137', desc: 'Radiation Sterilization', required: false },
                    { name: 'ISO 11607', desc: 'Sterile Packaging', required: false },
                    { name: 'ISO 14644', desc: 'Cleanrooms', required: false },
                    { name: 'ISO 14155', desc: 'Clinical Investigation', required: false },
                  ].map((std) => (
                    <label key={std.name} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={std.required}
                        disabled={std.required}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-primary-700 font-medium">{std.name}</span>
                      <span className="text-xs text-primary-600">— {std.desc}</span>
                      {std.required && <span className="text-xs text-red-500">(required)</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Regulatory Markets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'FDA (US)', reg: '21 CFR Part 820 / QSR' },
                    { name: 'EU MDR', reg: '2017/745' },
                    { name: 'EU IVDR', reg: '2017/746' },
                    { name: 'Health Canada', reg: 'CMDR SOR/98-282' },
                    { name: 'TGA (Australia)', reg: 'TG Act 1989' },
                    { name: 'PMDA (Japan)', reg: 'PAL / MHLW Ordinance 169' },
                    { name: 'ANVISA (Brazil)', reg: 'RDC 751/2022' },
                    { name: 'MDSAP', reg: 'Multi-Market Single Audit' },
                  ].map((market, idx) => (
                    <label key={market.name} className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked={idx < 2} className="w-4 h-4 rounded" />
                      <span className="text-sm text-gray-700 font-medium">{market.name}</span>
                      <span className="text-xs text-gray-500">— {market.reg}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Classification</label>
                <select
                  value={deviceClassification}
                  onChange={(e) => setDeviceClassification(e.target.value)}
                  className="input max-w-md"
                  title="Select device classification"
                >
                  <option>Class I (Low Risk)</option>
                  <option>Class II (Medium Risk)</option>
                  <option>Class III (High Risk)</option>
                  <option>IVD Class A</option>
                  <option>IVD Class B</option>
                  <option>IVD Class C</option>
                  <option>IVD Class D</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Affects default risk thresholds, record retention requirements, and clinical evidence requirements
                </p>
              </div>

              <button type="button" onClick={handleSaveSettings} className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Compliance Settings
              </button>
            </div>
          )}

          {/* ─── Users & Roles ─── */}
          {activeTab === 'users' && (
            <div className="card space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Users & Role Management
                </h3>
                <button type="button" className="btn-primary btn-sm gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              <div className="border border-surface-200 rounded-lg overflow-hidden">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'System Administrator', username: 'admin', role: 'Admin', dept: 'IT & Quality', status: 'Active', lastLogin: 'Today' },
                      { name: 'Sarah Johnson', username: 'qa_manager', role: 'QA Manager', dept: 'Quality Assurance', status: 'Active', lastLogin: 'Today' },
                      { name: 'Michael Chen', username: 'engineer', role: 'Engineer', dept: 'Engineering', status: 'Active', lastLogin: 'Yesterday' },
                      { name: 'Demo User', username: 'demo', role: 'Demo', dept: 'Demonstration', status: 'Active', lastLogin: 'N/A' },
                    ].map((user) => (
                      <tr key={user.username}>
                        <td>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </td>
                        <td>
                          <span className="badge bg-primary-100 text-primary-700">{user.role}</span>
                        </td>
                        <td className="text-sm text-gray-600">{user.dept}</td>
                        <td>
                          <span className="badge bg-green-100 text-green-700">{user.status}</span>
                        </td>
                        <td className="text-sm text-gray-500">{user.lastLogin}</td>
                        <td>
                          <button type="button" className="btn-ghost btn-sm text-xs text-primary-600">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Role Permissions Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { role: 'Admin', desc: 'Full system access including user management, system settings, and all modules' },
                    { role: 'QA Manager', desc: 'Approve CAPAs, NCRs, change controls; view all modules; manage training' },
                    { role: 'Engineer', desc: 'Create/edit CAPAs, NCRs, risk assessments; view documents and metrics' },
                    { role: 'Demo', desc: 'Read-only access to all modules for demonstration purposes' },
                  ].map((r) => (
                    <div key={r.role} className="bg-white rounded border border-surface-200 p-3">
                      <p className="font-semibold text-gray-800 mb-1">{r.role}</p>
                      <p className="text-gray-500">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small utility for Plus icon in users tab
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
