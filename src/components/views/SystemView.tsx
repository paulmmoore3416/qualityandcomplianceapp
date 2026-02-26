import React, { useState, useEffect, useCallback } from 'react';
import {
  Server, Cpu, HardDrive, Wifi, Globe, Users, Activity, Shield,
  RefreshCw, Plus, Trash2, Edit2, CheckCircle, AlertTriangle, XCircle,
  Database, Clock, Monitor, Network, BarChart3, FileText,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth-store';

interface SystemInfo {
  server: { hostname: string; platform: string; osType: string; osRelease: string; nodeVersion: string; appVersion: string; environment: string };
  network: { primaryIp: string; interfaces: { name: string; family: string; address: string }[] };
  cpu: { cores: number; model: string; loadPercent: string; loadAvg: number[] };
  memory: { totalMB: number; usedMB: number; freeMB: number; percentUsed: string };
  process: { pid: number; uptimeFormatted: string; requestCount: number; errorCount: number; errorRate: string; memoryUsage: { rssMB: number; heapUsedMB: number } };
}

interface Site {
  id: string; site_name: string; site_code: string; description: string;
  city: string; state: string; country: string; ip_address: string;
  server_hostname: string; server_port: number; status: string; is_primary: number;
  last_heartbeat: string; contact_name: string; contact_email: string;
  server_version: string; cpu_cores: number; total_memory_gb: number;
}

interface DbStats { tables: Record<string, number>; dbSizeMB: string }

const STATUS_COLOR: Record<string, string> = {
  Active: 'text-green-600 bg-green-50',
  Warning: 'text-yellow-600 bg-yellow-50',
  Offline: 'text-red-600 bg-red-50',
};

function StatusDot({ status }: { status: string }) {
  const color = status === 'Active' ? 'bg-green-500' : status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color} mr-2`} />;
}

function MetricBar({ label, value, color = 'bg-blue-500' }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export default function SystemView() {
  const { currentUser } = useAuthStore();
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'database' | 'users'>('overview');
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [showAddSite, setShowAddSite] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [siteForm, setSiteForm] = useState({ site_name: '', site_code: '', description: '', city: '', state: '', country: 'USA', ip_address: '', server_hostname: '', server_port: 3001, contact_name: '', contact_email: '', notes: '' });
  const [error, setError] = useState('');

  const isDeveloper = currentUser?.role === 'Admin' || currentUser?.role === 'Developer';

  const fetchData = useCallback(async () => {
    if (!isDeveloper) return;
    setRefreshing(true);
    try {
      const [infoRes, sitesRes, dbRes, usersRes] = await Promise.allSettled([
        api.getSystemInfo(),
        api.getSites(),
        api.getDbStats(),
        api.getSystemUsers(),
      ]);
      if (infoRes.status === 'fulfilled') setInfo(infoRes.value as SystemInfo);
      if (sitesRes.status === 'fulfilled') setSites((sitesRes.value as { sites: Site[] }).sites);
      if (dbRes.status === 'fulfilled') setDbStats(dbRes.value as DbStats);
      if (usersRes.status === 'fulfilled') setUsers((usersRes.value as { users: Record<string, unknown>[] }).users);
    } catch (e) { console.warn('System info fetch failed', e); }
    setLoading(false);
    setRefreshing(false);
  }, [isDeveloper]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (!isDeveloper) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Administrator Access Required</h2>
          <p className="text-gray-500 mt-2">The System Cockpit is restricted to Administrators and Developers.</p>
        </div>
      </div>
    );
  }

  const handleAddSite = async () => {
    setError('');
    try {
      await api.createSite(siteForm as Record<string, unknown>);
      setShowAddSite(false);
      setSiteForm({ site_name: '', site_code: '', description: '', city: '', state: '', country: 'USA', ip_address: '', server_hostname: '', server_port: 3001, contact_name: '', contact_email: '', notes: '' });
      fetchData();
    } catch (e: unknown) { setError((e as Error).message); }
  };

  const handleUpdateSite = async () => {
    if (!editSite) return;
    setError('');
    try {
      await api.updateSite(editSite.id, siteForm as Record<string, unknown>);
      setEditSite(null);
      fetchData();
    } catch (e: unknown) { setError((e as Error).message); }
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm('Delete this site record?')) return;
    try { await api.deleteSite(id); fetchData(); }
    catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Monitor className="w-7 h-7 text-blue-600" />
            System Cockpit
          </h1>
          <p className="text-sm text-gray-500 mt-1">Multi-site administration & server monitoring — Administrator/Developer platform</p>
        </div>
        <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Server Overview', icon: Server },
          { id: 'sites', label: 'Sites', icon: Globe },
          { id: 'database', label: 'Database', icon: Database },
          { id: 'users', label: 'Users', icon: Users },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          Loading system data...
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && info && (
            <div className="space-y-6">
              {/* Server Identity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Hostname</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{info.server.hostname}</p>
                  <p className="text-xs text-gray-500">{info.server.osType} {info.server.osRelease}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                      <Network className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">IP Address</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{info.network.primaryIp}</p>
                  <p className="text-xs text-gray-500">{info.network.interfaces.length} network interface(s)</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Uptime</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{info.process.uptimeFormatted}</p>
                  <p className="text-xs text-gray-500">App v{info.server.appVersion} • Node {info.server.nodeVersion}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Requests</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{info.process.requestCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Error rate: {info.process.errorRate}%</p>
                </div>
              </div>

              {/* Resource Meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">CPU</h3>
                  </div>
                  <MetricBar label="Load" value={parseFloat(info.cpu.loadPercent)} color="bg-blue-500" />
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p>{info.cpu.cores} cores • {info.cpu.model.split('@')[0].trim()}</p>
                    <p>Load avg: {info.cpu.loadAvg.map(v => v.toFixed(2)).join(' / ')}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <HardDrive className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800">Memory</h3>
                  </div>
                  <MetricBar label="System" value={parseFloat(info.memory.percentUsed)} color="bg-green-500" />
                  <MetricBar label="Process Heap" value={(info.process.memoryUsage.heapUsedMB / info.memory.totalMB) * 100} color="bg-teal-400" />
                  <div className="mt-3 text-xs text-gray-500">
                    <p>{info.memory.usedMB.toLocaleString()} MB used / {info.memory.totalMB.toLocaleString()} MB total</p>
                    <p>Process RSS: {info.process.memoryUsage.rssMB} MB</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Wifi className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Network Interfaces</h3>
                  </div>
                  <div className="space-y-2">
                    {info.network.interfaces.slice(0, 4).map((iface, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">{iface.name} ({iface.family})</span>
                        <span className="font-mono font-semibold text-gray-800">{iface.address}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sites Tab */}
          {activeTab === 'sites' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{sites.length} registered site(s)</p>
                <button onClick={() => { setShowAddSite(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  <Plus className="w-4 h-4" /> Add Site
                </button>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

              {/* Site Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sites.map(site => (
                  <div key={site.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusDot status={site.status} />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{site.site_name}</h3>
                          {site.is_primary === 1 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Primary</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{site.site_code} • {site.city}, {site.state}</p>
                      </div>
                      {!site.is_primary && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditSite(site); setSiteForm({ site_name: site.site_name, site_code: site.site_code, description: site.description||'', city: site.city||'', state: site.state||'', country: site.country||'USA', ip_address: site.ip_address||'', server_hostname: site.server_hostname||'', server_port: site.server_port||3001, contact_name: site.contact_name||'', contact_email: site.contact_email||'', notes: '' }); setError(''); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteSite(site.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex gap-1"><span className="text-gray-500">IP:</span><span className="font-mono font-medium text-gray-800">{site.ip_address || '—'}</span></div>
                      <div className="flex gap-1"><span className="text-gray-500">Host:</span><span className="font-medium text-gray-800 truncate">{site.server_hostname || '—'}</span></div>
                      <div className="flex gap-1"><span className="text-gray-500">Port:</span><span className="font-mono font-medium text-gray-800">{site.server_port}</span></div>
                      <div className="flex gap-1"><span className="text-gray-500">Version:</span><span className="font-medium text-gray-800">{site.server_version || '—'}</span></div>
                      {site.contact_name && <div className="col-span-2 flex gap-1"><span className="text-gray-500">Contact:</span><span className="font-medium text-gray-800">{site.contact_name}</span></div>}
                    </div>

                    {site.last_heartbeat && (
                      <p className="text-xs text-gray-400 mt-3">Last heartbeat: {new Date(site.last_heartbeat).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Add/Edit Site Modal */}
              {(showAddSite || editSite) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">{editSite ? 'Edit Site' : 'Add New Site'}</h3>
                    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'site_name', label: 'Site Name', span: 2 },
                        { key: 'site_code', label: 'Site Code' },
                        { key: 'ip_address', label: 'IP Address' },
                        { key: 'server_hostname', label: 'Hostname' },
                        { key: 'server_port', label: 'Port', type: 'number' },
                        { key: 'city', label: 'City' },
                        { key: 'state', label: 'State' },
                        { key: 'country', label: 'Country' },
                        { key: 'contact_name', label: 'Contact Name' },
                        { key: 'contact_email', label: 'Contact Email' },
                        { key: 'description', label: 'Description', span: 2 },
                      ].map(f => (
                        <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                          <input type={f.type || 'text'} value={String((siteForm as Record<string, unknown>)[f.key] ?? '')}
                            onChange={e => setSiteForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? parseInt(e.target.value)||3001 : e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={editSite ? handleUpdateSite : handleAddSite} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        {editSite ? 'Update' : 'Add Site'}
                      </button>
                      <button onClick={() => { setShowAddSite(false); setEditSite(null); setError(''); }} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && dbStats && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">SQLite Database — compliance.db</h3>
                  <span className="ml-auto text-sm font-semibold text-gray-600">{dbStats.dbSizeMB} MB</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(dbStats.tables).map(([table, count]) => (
                    <div key={table} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-500 truncate">{table.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{(count as number).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-blue-800">Primary Storage</span></div>
                  <p className="text-xs text-blue-700">SQLite WAL mode for user data, compliance records, audit trail, and all module data. ACID compliant.</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-purple-600" /><span className="text-sm font-semibold text-purple-800">Log Analytics</span></div>
                  <p className="text-xs text-purple-700">System logs table optimized for append-only writes. Upgrade path: Elasticsearch or ClickHouse.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-green-600" /><span className="text-sm font-semibold text-green-800">Report Storage</span></div>
                  <p className="text-xs text-green-700">Report metadata in DB; files in local filesystem. Upgrade path: S3-compatible object storage (MinIO, R2).</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{users.length} system user(s)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Username</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Department</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {users.map(user => (
                      <tr key={user.id as string} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.full_name as string}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{user.username as string}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-red-100 text-red-700' : user.role === 'Developer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role as string}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{(user.department as string) || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                            {user.status === 'Active' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {user.status as string}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {user.last_login ? new Date(user.last_login as string).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        © 2026 MedTech Compliance Solutions — A Moore Family Businesses LLC Subsidiary
        <br />Administrator & Developer Platform
      </div>
    </div>
  );
}
