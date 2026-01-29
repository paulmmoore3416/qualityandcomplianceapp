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
} from 'lucide-react';
import { cn } from '../../lib/utils';

type SettingsTab = 'general' | 'notifications' | 'data' | 'compliance';

export default function SettingsView() {
  const { loadData } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [companyName, setCompanyName] = useState('Medical Device Company');
  const [defaultUser, setDefaultUser] = useState('Quality Engineer');
  const [alertThreshold, setAlertThreshold] = useState('24');
  const [autoSave, setAutoSave] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'compliance', label: 'Compliance', icon: Shield },
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure application preferences and compliance settings
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-surface-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input max-w-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in reports and audit documentation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default User Name
                </label>
                <input
                  type="text"
                  value={defaultUser}
                  onChange={(e) => setDefaultUser(e.target.value)}
                  className="input max-w-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pre-filled when recording metric values
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable auto-save</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Automatically save changes after each action
                </p>
              </div>

              <button className="btn-primary gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (hours)
                </label>
                <select
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="input max-w-md"
                >
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pre-overdue alert timing for CAPAs
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Email notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Receive email alerts for critical compliance events
                </p>
              </div>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Alert Types</h4>
                <div className="space-y-2">
                  {[
                    'Metric threshold breach (red status)',
                    'CAPA approaching due date',
                    'CAPA overdue',
                    'Risk assessment requires mitigation',
                    'ISO 10993 reassessment triggered',
                  ].map((alert, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-sm text-gray-600">{alert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Backup & Restore</h4>
                <div className="flex gap-3">
                  <button onClick={handleExportData} className="btn-secondary gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button onClick={handleImportData} className="btn-secondary gap-2">
                    <Upload className="w-4 h-4" />
                    Import Data
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Export your data for backup or transfer to another system.
                  Per ISO 13485:4.2.5 - Control of records.
                </p>
              </div>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sync Status</h4>
                <div className="flex items-center gap-2 text-green-600">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">All data saved locally</span>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-700 mb-3">Danger Zone</h4>
                <button className="btn-danger btn-sm gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
                <p className="text-xs text-red-600 mt-2">
                  This action cannot be undone. All metric values, CAPAs, NCRs, and risk
                  assessments will be permanently deleted.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Settings</h3>

              <div className="bg-primary-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary-800 mb-3">Active Standards</h4>
                <div className="space-y-2">
                  {[
                    { name: 'ISO 13485:2016', desc: 'Medical Devices QMS' },
                    { name: 'ISO 14971:2019', desc: 'Risk Management' },
                    { name: 'ISO 10993', desc: 'Biocompatibility' },
                    { name: 'ISO 9001:2015', desc: 'General QMS' },
                    { name: 'IEC 62304', desc: 'Software Lifecycle' },
                    { name: 'IEC 60601-1', desc: 'Electrical Safety' },
                  ].map((std, idx) => (
                    <label key={idx} className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-sm text-primary-700 font-medium">{std.name}</span>
                      <span className="text-xs text-primary-600">- {std.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Regulatory Markets</h4>
                <div className="space-y-2">
                  {[
                    { name: 'FDA (US)', reg: '21 CFR Part 820' },
                    { name: 'EU MDR', reg: '2017/745' },
                    { name: 'EU IVDR', reg: '2017/746' },
                    { name: 'Health Canada', reg: 'CMDR' },
                  ].map((market, idx) => (
                    <label key={idx} className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked={idx < 2} className="w-4 h-4 rounded" />
                      <span className="text-sm text-gray-700 font-medium">{market.name}</span>
                      <span className="text-xs text-gray-500">- {market.reg}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Classification
                </label>
                <select className="input max-w-md">
                  <option>Class I (Low Risk)</option>
                  <option>Class II (Medium Risk)</option>
                  <option selected>Class III (High Risk)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Affects default risk thresholds and required documentation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
