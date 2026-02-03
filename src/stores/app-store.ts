import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  MetricValue,
  RiskAssessment,
  CAPA,
  NCR,
  ComplianceAlert,
  LifecycleRecord,
  Lot,
  DashboardMetric,
  ValidationReport,
  Supplier,
  TrainingRecord,
  ChangeControl,
  Complaint,
  DocumentMetadata,
} from '../types';
import { METRICS_CONFIG, getMetricStatus } from '../data/metrics-config';
import {
  generateComplianceAlerts,
  createAuditEntry,
} from '../lib/compliance-engine';

// Inter-module link type
export interface ModuleLink {
  sourceType: 'capa' | 'ncr' | 'risk' | 'validation' | 'change_control' | 'supplier' | 'complaint';
  sourceId: string;
  targetType: 'capa' | 'ncr' | 'risk' | 'validation' | 'change_control' | 'supplier' | 'complaint' | 'document';
  targetId: string;
  linkType: 'triggered_by' | 'resolves' | 'references' | 'supersedes' | 'related_to';
  createdAt: Date;
  createdBy: string;
}

interface AppState {
  // Data
  metricValues: MetricValue[];
  riskAssessments: RiskAssessment[];
  capas: CAPA[];
  ncrs: NCR[];
  alerts: ComplianceAlert[];
  lifecycleRecords: LifecycleRecord[];
  lots: Lot[];
  validationReports: ValidationReport[];
  suppliers: Supplier[];
  trainingRecords: TrainingRecord[];
  changeControls: ChangeControl[];
  complaints: Complaint[];
  documents: DocumentMetadata[];
  moduleLinks: ModuleLink[];

  // UI State
  sidebarOpen: boolean;
  activeView: 'dashboard' | 'metrics' | 'risk' | 'capa' | 'ncr' | 'lifecycle' | 'audit' | 'settings' | 'vigilance' | 'suppliers' | 'training' | 'changecontrol' | 'documents' | 'aiagents' | 'admin' | 'validation' | 'analytics';
  auditMode: boolean;
  selectedMetricId: string | null;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: AppState['activeView']) => void;
  setAuditMode: (enabled: boolean) => void;
  setSelectedMetricId: (id: string | null) => void;

  // Metric Actions
  addMetricValue: (metricId: string, value: number, inputs: Record<string, number>, user: string, notes?: string) => void;
  getLatestMetricValue: (metricId: string) => MetricValue | null;
  getMetricHistory: (metricId: string, limit?: number) => MetricValue[];
  getDashboardMetrics: () => DashboardMetric[];

  // Risk Assessment Actions
  addRiskAssessment: (assessment: Omit<RiskAssessment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRiskAssessment: (id: string, updates: Partial<RiskAssessment>) => void;
  getRiskAssessmentsByMetric: (metricId: string) => RiskAssessment[];

  // CAPA Actions
  addCAPA: (capa: Omit<CAPA, 'id' | 'createdAt'>) => void;
  updateCAPA: (id: string, updates: Partial<CAPA>) => void;
  getCAPAStats: () => { total: number; open: number; overdue: number; closedThisMonth: number };

  // NCR Actions
  addNCR: (ncr: Omit<NCR, 'id' | 'createdAt'>) => void;
  updateNCR: (id: string, updates: Partial<NCR>) => void;
  getNCRStats: () => { total: number; open: number; byType: Record<string, number> };

  // Alert Actions
  addAlert: (alert: Omit<ComplianceAlert, 'id' | 'timestamp'>) => void;
  acknowledgeAlert: (id: string) => void;
  getUnacknowledgedAlerts: () => ComplianceAlert[];

  // Lifecycle Actions
  addLifecycleRecord: (record: Omit<LifecycleRecord, 'id'>) => void;
  updateLifecycleRecord: (id: string, updates: Partial<LifecycleRecord>) => void;

  // Lot Actions
  addLot: (lot: Omit<Lot, 'id'>) => void;
  updateLot: (id: string, updates: Partial<Lot>) => void;

  // Validation Report Actions
  addValidationReport: (report: Omit<ValidationReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateValidationReport: (id: string, updates: Partial<ValidationReport>) => void;
  getValidationStats: () => { total: number; draft: number; inProgress: number; underReview: number; approved: number; passRate: number; byType: Record<string, number> };
  getValidationReportById: (id: string) => ValidationReport | undefined;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  getSupplierStats: () => { total: number; approved: number; conditional: number; critical: number };

  // Training Actions
  addTrainingRecord: (record: Omit<TrainingRecord, 'id'>) => void;
  updateTrainingRecord: (id: string, updates: Partial<TrainingRecord>) => void;
  getTrainingStats: () => { total: number; completed: number; overdue: number; complianceRate: number };

  // Change Control Actions
  addChangeControl: (cc: Omit<ChangeControl, 'id' | 'createdAt'>) => void;
  updateChangeControl: (id: string, updates: Partial<ChangeControl>) => void;
  getChangeControlStats: () => { total: number; pending: number; approved: number; implemented: number };

  // Inter-Module Linking
  addModuleLink: (link: Omit<ModuleLink, 'createdAt'>) => void;
  removeModuleLink: (sourceType: string, sourceId: string, targetType: string, targetId: string) => void;
  getLinkedEntities: (entityType: string, entityId: string) => ModuleLink[];
  getLinksForEntity: (entityType: string, entityId: string) => { incoming: ModuleLink[]; outgoing: ModuleLink[] };

  // Data Persistence
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;

  // Export
  exportAuditReport: () => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Initial Data
  metricValues: [],
  riskAssessments: [],
  capas: [],
  ncrs: [],
  alerts: [],
  lifecycleRecords: [],
  lots: [],
  validationReports: [],
  suppliers: [],
  trainingRecords: [],
  changeControls: [],
  complaints: [],
  documents: [],
  moduleLinks: [],

  // Initial UI State
  sidebarOpen: true,
  activeView: 'dashboard',
  auditMode: false,
  selectedMetricId: null,

  // UI Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  setAuditMode: (enabled) => set({ auditMode: enabled }),
  setSelectedMetricId: (id) => set({ selectedMetricId: id }),

  // Metric Actions
  addMetricValue: (metricId, value, inputs, user, notes) => {
    const state = get();
    const previousValue = state.getLatestMetricValue(metricId);

    const auditEntry = createAuditEntry(
      `Metric value recorded: ${value}`,
      'ISO 13485:8.4',
      previousValue?.value,
      value,
      user
    );

    const newValue: MetricValue = {
      id: uuidv4(),
      metricId,
      value,
      inputs,
      timestamp: new Date(),
      notes,
      linkedRiskAssessments: [],
      auditTrail: [auditEntry],
    };

    // Generate compliance alerts
    const newAlerts = generateComplianceAlerts(metricId, value, previousValue?.value);

    set({
      metricValues: [...state.metricValues, newValue],
      alerts: [...state.alerts, ...newAlerts],
    });

    // Auto-save
    get().saveData();
  },

  getLatestMetricValue: (metricId) => {
    const values = get().metricValues.filter((v) => v.metricId === metricId);
    if (values.length === 0) return null;
    return values.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  },

  getMetricHistory: (metricId, limit = 30) => {
    return get()
      .metricValues.filter((v) => v.metricId === metricId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  getDashboardMetrics: () => {
    const state = get();
    return METRICS_CONFIG.map((metric) => {
      const currentValue = state.getLatestMetricValue(metric.id);
      const history = state.getMetricHistory(metric.id, 7);

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      let changePercent: number | undefined;

      if (history.length >= 2) {
        const latest = history[0].value;
        const previous = history[1].value;
        const change = ((latest - previous) / previous) * 100;
        changePercent = change;

        if (metric.threshold.direction === 'higher-better') {
          trend = change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable';
        } else {
          trend = change < -2 ? 'improving' : change > 2 ? 'declining' : 'stable';
        }
      }

      const status = currentValue ? getMetricStatus(metric, currentValue.value) : 'green';

      return {
        metric,
        currentValue,
        trend,
        status,
        changePercent,
      };
    });
  },

  // Risk Assessment Actions
  addRiskAssessment: (assessment) => {
    const newAssessment: RiskAssessment = {
      ...assessment,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      riskAssessments: [...state.riskAssessments, newAssessment],
    }));
    get().saveData();
  },

  updateRiskAssessment: (id, updates) => {
    set((state) => ({
      riskAssessments: state.riskAssessments.map((ra) =>
        ra.id === id ? { ...ra, ...updates, updatedAt: new Date() } : ra
      ),
    }));
    get().saveData();
  },

  getRiskAssessmentsByMetric: (metricId) => {
    return get().riskAssessments.filter((ra) => ra.metricId === metricId);
  },

  // CAPA Actions
  addCAPA: (capa) => {
    const newCAPA: CAPA = {
      ...capa,
      id: uuidv4(),
      createdAt: new Date(),
    };
    set((state) => ({
      capas: [...state.capas, newCAPA],
    }));
    get().saveData();
  },

  updateCAPA: (id, updates) => {
    set((state) => ({
      capas: state.capas.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().saveData();
  },

  getCAPAStats: () => {
    const capas = get().capas;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: capas.length,
      open: capas.filter((c) => c.status !== 'Closed').length,
      overdue: capas.filter((c) => c.status !== 'Closed' && new Date(c.dueDate) < now).length,
      closedThisMonth: capas.filter(
        (c) => c.status === 'Closed' && c.closedAt && new Date(c.closedAt) >= monthStart
      ).length,
    };
  },

  // NCR Actions
  addNCR: (ncr) => {
    const newNCR: NCR = {
      ...ncr,
      id: uuidv4(),
      createdAt: new Date(),
    };
    set((state) => ({
      ncrs: [...state.ncrs, newNCR],
    }));
    get().saveData();
  },

  updateNCR: (id, updates) => {
    set((state) => ({
      ncrs: state.ncrs.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
    get().saveData();
  },

  getNCRStats: () => {
    const ncrs = get().ncrs;
    const byType: Record<string, number> = {};
    ncrs.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return {
      total: ncrs.length,
      open: ncrs.filter((n) => n.status !== 'Closed').length,
      byType,
    };
  },

  // Alert Actions
  addAlert: (alert) => {
    const newAlert: ComplianceAlert = {
      ...alert,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set((state) => ({
      alerts: [...state.alerts, newAlert],
    }));
  },

  acknowledgeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    }));
    get().saveData();
  },

  getUnacknowledgedAlerts: () => {
    return get()
      .alerts.filter((a) => !a.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Lifecycle Actions
  addLifecycleRecord: (record) => {
    const newRecord: LifecycleRecord = {
      ...record,
      id: uuidv4(),
    };
    set((state) => ({
      lifecycleRecords: [...state.lifecycleRecords, newRecord],
    }));
    get().saveData();
  },

  updateLifecycleRecord: (id, updates) => {
    set((state) => ({
      lifecycleRecords: state.lifecycleRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    get().saveData();
  },

  // Lot Actions
  addLot: (lot) => {
    const newLot: Lot = {
      ...lot,
      id: uuidv4(),
    };
    set((state) => ({
      lots: [...state.lots, newLot],
    }));
    get().saveData();
  },

  updateLot: (id, updates) => {
    set((state) => ({
      lots: state.lots.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
    get().saveData();
  },

  // Validation Report Actions
  addValidationReport: (report) => {
    const newReport: ValidationReport = {
      ...report,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      validationReports: [...state.validationReports, newReport],
    }));
    get().saveData();
  },

  updateValidationReport: (id, updates) => {
    set((state) => ({
      validationReports: state.validationReports.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      ),
    }));
    get().saveData();
  },

  getValidationStats: () => {
    const reports = get().validationReports;
    const byType: Record<string, number> = {};
    reports.forEach((r) => {
      byType[r.type] = (byType[r.type] || 0) + 1;
    });
    const approved = reports.filter((r) => r.status === 'Approved');
    const passRate = approved.length > 0
      ? (approved.filter((r) => r.overallConclusion === 'Pass').length / approved.length) * 100
      : 0;
    return {
      total: reports.length,
      draft: reports.filter((r) => r.status === 'Draft').length,
      inProgress: reports.filter((r) => r.status === 'In Progress').length,
      underReview: reports.filter((r) => r.status === 'Under Review').length,
      approved: approved.length,
      passRate,
      byType,
    };
  },

  getValidationReportById: (id) => {
    return get().validationReports.find((r) => r.id === id);
  },

  // Supplier Actions
  addSupplier: (supplier) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: uuidv4(),
      createdAt: new Date(),
    };
    set((state) => ({
      suppliers: [...state.suppliers, newSupplier],
    }));
  },

  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  getSupplierStats: () => {
    const suppliers = get().suppliers;
    return {
      total: suppliers.length,
      approved: suppliers.filter((s) => s.status === 'Approved').length,
      conditional: suppliers.filter((s) => s.status === 'Conditional').length,
      critical: suppliers.filter((s) => s.riskLevel === 'Critical').length,
    };
  },

  // Training Actions
  addTrainingRecord: (record) => {
    const newRecord: TrainingRecord = {
      ...record,
      id: uuidv4(),
    };
    set((state) => ({
      trainingRecords: [...state.trainingRecords, newRecord],
    }));
  },

  updateTrainingRecord: (id, updates) => {
    set((state) => ({
      trainingRecords: state.trainingRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },

  getTrainingStats: () => {
    const records = get().trainingRecords;
    const completed = records.filter((r) => r.status === 'Completed').length;
    const overdue = records.filter((r) => r.status === 'Overdue').length;
    return {
      total: records.length,
      completed,
      overdue,
      complianceRate: records.length > 0 ? (completed / records.length) * 100 : 100,
    };
  },

  // Change Control Actions
  addChangeControl: (cc) => {
    const newCC: ChangeControl = {
      ...cc,
      id: uuidv4(),
      createdAt: new Date(),
    };
    set((state) => ({
      changeControls: [...state.changeControls, newCC],
    }));
  },

  updateChangeControl: (id, updates) => {
    set((state) => ({
      changeControls: state.changeControls.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  getChangeControlStats: () => {
    const ccs = get().changeControls;
    return {
      total: ccs.length,
      pending: ccs.filter((c) => c.status === 'Pending Review').length,
      approved: ccs.filter((c) => c.status === 'Approved').length,
      implemented: ccs.filter((c) => c.status === 'Implemented').length,
    };
  },

  // Inter-Module Linking
  addModuleLink: (link) => {
    const newLink: ModuleLink = {
      ...link,
      createdAt: new Date(),
    };
    set((state) => ({
      moduleLinks: [...state.moduleLinks, newLink],
    }));
  },

  removeModuleLink: (sourceType, sourceId, targetType, targetId) => {
    set((state) => ({
      moduleLinks: state.moduleLinks.filter(
        (l) =>
          !(l.sourceType === sourceType &&
            l.sourceId === sourceId &&
            l.targetType === targetType &&
            l.targetId === targetId)
      ),
    }));
  },

  getLinkedEntities: (entityType, entityId) => {
    return get().moduleLinks.filter(
      (l) =>
        (l.sourceType === entityType && l.sourceId === entityId) ||
        (l.targetType === entityType && l.targetId === entityId)
    );
  },

  getLinksForEntity: (entityType, entityId) => {
    const links = get().moduleLinks;
    return {
      incoming: links.filter((l) => l.targetType === entityType && l.targetId === entityId),
      outgoing: links.filter((l) => l.sourceType === entityType && l.sourceId === entityId),
    };
  },

  // Data Persistence - now handled by Zustand persist middleware
  loadData: async () => {
    // With persist middleware, data is auto-loaded from localStorage
    // This method now only handles Electron API for desktop app
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.loadData('app-state');
        if (result.success && result.data) {
          const data = result.data as Partial<AppState>;
          set({
            metricValues: data.metricValues || [],
            riskAssessments: data.riskAssessments || [],
            capas: data.capas || [],
            ncrs: data.ncrs || [],
            alerts: data.alerts || [],
            lifecycleRecords: data.lifecycleRecords || [],
            lots: data.lots || [],
            validationReports: data.validationReports || [],
            suppliers: data.suppliers || [],
            trainingRecords: data.trainingRecords || [],
            changeControls: data.changeControls || [],
            complaints: data.complaints || [],
            documents: data.documents || [],
            moduleLinks: data.moduleLinks || [],
          });
        }
      } catch (error) {
        console.error('Failed to load data from Electron:', error);
      }
    }
  },

  saveData: async () => {
    // With persist middleware, data is auto-saved
    // This method now only handles Electron API sync
    if (window.electronAPI) {
      const state = get();
      const dataToSave = {
        metricValues: state.metricValues,
        riskAssessments: state.riskAssessments,
        capas: state.capas,
        ncrs: state.ncrs,
        alerts: state.alerts,
        lifecycleRecords: state.lifecycleRecords,
        lots: state.lots,
        validationReports: state.validationReports,
        suppliers: state.suppliers,
        trainingRecords: state.trainingRecords,
        changeControls: state.changeControls,
        complaints: state.complaints,
        documents: state.documents,
        moduleLinks: state.moduleLinks,
      };

      try {
        await window.electronAPI.saveData('app-state', dataToSave);
      } catch (error) {
        console.error('Failed to save data to Electron:', error);
      }
    }
  },

  // Export Audit Report
  exportAuditReport: () => {
    const state = get();
    const now = new Date();

    const report = {
      generatedAt: now.toISOString(),
      summary: {
        metricsTracked: METRICS_CONFIG.length,
        metricValuesRecorded: state.metricValues.length,
        activeRiskAssessments: state.riskAssessments.filter((r) => r.status !== 'Closed').length,
        openCAPAs: state.capas.filter((c) => c.status !== 'Closed').length,
        openNCRs: state.ncrs.filter((n) => n.status !== 'Closed').length,
        unacknowledgedAlerts: state.getUnacknowledgedAlerts().length,
        totalSuppliers: state.suppliers.length,
        trainingComplianceRate: state.getTrainingStats().complianceRate,
        pendingChangeControls: state.changeControls.filter((c) => c.status === 'Pending Review').length,
      },
      metrics: state.getDashboardMetrics().map((dm) => ({
        id: dm.metric.id,
        name: dm.metric.name,
        currentValue: dm.currentValue?.value,
        status: dm.status,
        trend: dm.trend,
        isoReferences: dm.metric.isoMappings.map((m) => `${m.standard}:${m.clause}`),
      })),
      capas: state.capas,
      ncrs: state.ncrs,
      riskAssessments: state.riskAssessments,
      suppliers: state.suppliers.map((s) => ({
        name: s.name,
        code: s.supplierCode,
        status: s.status,
        riskLevel: s.riskLevel,
      })),
      validationReports: state.validationReports.map((vr) => ({
        reportNumber: vr.reportNumber,
        title: vr.title,
        type: vr.type,
        category: vr.category,
        status: vr.status,
        overallConclusion: vr.overallConclusion,
        testsTotal: vr.testResults.length,
        testsPassed: vr.testResults.filter((tr) => tr.outcome === 'Pass').length,
        testsFailed: vr.testResults.filter((tr) => tr.outcome === 'Fail').length,
      })),
      moduleLinks: state.moduleLinks.length,
    };

    return JSON.stringify(report, null, 2);
  },
}),
    {
      name: 'medtech-app-state',
      partialize: (state) => ({
        metricValues: state.metricValues,
        riskAssessments: state.riskAssessments,
        capas: state.capas,
        ncrs: state.ncrs,
        alerts: state.alerts,
        lifecycleRecords: state.lifecycleRecords,
        lots: state.lots,
        validationReports: state.validationReports,
        suppliers: state.suppliers,
        trainingRecords: state.trainingRecords,
        changeControls: state.changeControls,
        complaints: state.complaints,
        documents: state.documents,
        moduleLinks: state.moduleLinks,
      }),
    }
  )
);
