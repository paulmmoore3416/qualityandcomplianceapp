const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.token = null;
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new ApiError(response.status, error.error || 'Request failed', error.details);
    }

    return response.json();
  }

  // ─── Auth ────────────────────────────────────────────────
  async login(username: string, password: string) {
    const result = await this.request<{
      token: string;
      user: Record<string, unknown>;
      session: Record<string, unknown>;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = result.token;
    return result;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
    }
  }

  async getMe() {
    return this.request<{ user: Record<string, unknown> }>('/api/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getUsers() {
    return this.request<{ users: Record<string, unknown>[] }>('/api/auth/users');
  }

  // ─── Compliance Data ────────────────────────────────────
  async getModule(module: string, page = 1, limit = 50) {
    return this.request<{
      module: string;
      items: Record<string, unknown>[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/compliance/${module}?page=${page}&limit=${limit}`);
  }

  async getRecord(module: string, id: string) {
    return this.request<Record<string, unknown>>(`/api/compliance/${module}/${id}`);
  }

  async createRecord(module: string, data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/api/compliance/${module}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(module: string, id: string, data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/api/compliance/${module}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(module: string, id: string) {
    return this.request<{ message: string }>(`/api/compliance/${module}/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkSync(module: string, items: Record<string, unknown>[]) {
    return this.request<{ message: string; created: number; updated: number; total: number }>(
      `/api/compliance/bulk/${module}`,
      {
        method: 'POST',
        body: JSON.stringify({ items }),
      }
    );
  }

  // ─── Audit Trail ────────────────────────────────────────
  async getAuditTrail(filters: Record<string, string | number> = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null) params.set(key, String(val));
    });
    return this.request<{
      entries: Record<string, unknown>[];
      count: number;
    }>(`/api/audit?${params.toString()}`);
  }

  async getAuditStats() {
    return this.request<Record<string, unknown>>('/api/audit/stats');
  }

  async getEntityAudit(type: string, id: string) {
    return this.request<{
      entries: Record<string, unknown>[];
      count: number;
    }>(`/api/audit/entity/${type}/${id}`);
  }

  // ─── Export ─────────────────────────────────────────────
  async exportData(format: 'json' | 'csv' = 'json', module?: string) {
    const params = new URLSearchParams({ format });
    if (module) params.set('module', module);
    return this.request<Record<string, unknown>>(`/api/export/data?${params.toString()}`);
  }

  async exportAudit(format: 'json' | 'csv' = 'json') {
    return this.request<Record<string, unknown>>(`/api/export/audit?format=${format}`);
  }

  async getComplianceReport() {
    return this.request<Record<string, unknown>>('/api/export/report');
  }

  // ─── Health ─────────────────────────────────────────────
  async getHealth() {
    return this.request<Record<string, unknown>>('/api/health');
  }

  async getDetailedHealth() {
    return this.request<Record<string, unknown>>('/api/health/detailed');
  }

  // ─── Dedicated Modules (typed tables) ───────────────────
  async getModuleData(module: string, page = 1, limit = 100, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return this.request<{ module: string; items: Record<string, unknown>[]; pagination: Record<string, number> }>(`/api/modules/${module}?${params.toString()}`);
  }

  async getModuleRecord(module: string, id: string) {
    return this.request<Record<string, unknown>>(`/api/modules/${module}/${id}`);
  }

  async createModuleRecord(module: string, data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/api/modules/${module}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateModuleRecord(module: string, id: string, data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/api/modules/${module}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteModuleRecord(module: string, id: string) {
    return this.request<{ message: string; id: string }>(`/api/modules/${module}/${id}`, { method: 'DELETE' });
  }

  // ─── System / Cockpit ───────────────────────────────────
  async getSystemInfo() {
    return this.request<Record<string, unknown>>('/api/system/info');
  }

  async getSystemMetrics() {
    return this.request<Record<string, unknown>>('/api/system/metrics');
  }

  async getDbStats() {
    return this.request<Record<string, unknown>>('/api/system/db-stats');
  }

  async getSites() {
    return this.request<{ sites: Record<string, unknown>[] }>('/api/system/sites');
  }

  async createSite(data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/api/system/sites', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSite(id: string, data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/api/system/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSite(id: string) {
    return this.request<{ message: string }>(`/api/system/sites/${id}`, { method: 'DELETE' });
  }

  async getSystemLogs(limit = 100, level?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (level) params.set('level', level);
    return this.request<{ logs: Record<string, unknown>[] }>(`/api/system/logs?${params.toString()}`);
  }

  async getSystemUsers() {
    return this.request<{ users: Record<string, unknown>[] }>('/api/system/users');
  }

  async createSystemUser(data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/api/system/users', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSystemUser(id: string, data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/api/system/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSystemUser(id: string) {
    return this.request<{ message: string }>(`/api/system/users/${id}`, { method: 'DELETE' });
  }

  async getActiveSessions() {
    return this.request<{ sessions: Record<string, unknown>[]; count: number }>('/api/system/sessions');
  }

  async revokeSession(id: string) {
    return this.request<{ message: string }>(`/api/system/sessions/${id}/revoke`, { method: 'POST' });
  }
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const api = new ApiService();
export default api;
