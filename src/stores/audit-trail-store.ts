import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditEntry } from '../types';

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'view' | 'export'
  | 'login' | 'logout' | 'approve' | 'reject' | 'submit'
  | 'assign' | 'complete' | 'archive' | 'restore';

export type AuditEntityType =
  | 'user' | 'capa' | 'ncr' | 'risk' | 'metric' | 'document'
  | 'supplier' | 'training' | 'change_control' | 'validation'
  | 'complaint' | 'adverse_event' | 'system' | 'session';

export interface ExtendedAuditEntry extends AuditEntry {
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

interface AuditTrailState {
  entries: ExtendedAuditEntry[];
  isRecording: boolean;

  // Actions
  logAction: (entry: Omit<ExtendedAuditEntry, 'id' | 'timestamp'>) => void;
  getEntriesByEntity: (entityType: AuditEntityType, entityId: string) => ExtendedAuditEntry[];
  getEntriesByUser: (userId: string) => ExtendedAuditEntry[];
  getEntriesByDateRange: (start: Date, end: Date) => ExtendedAuditEntry[];
  getRecentEntries: (limit: number) => ExtendedAuditEntry[];
  exportAuditLog: (filters?: { entityType?: AuditEntityType; userId?: string; startDate?: Date; endDate?: Date }) => string;
  clearOldEntries: (daysToKeep: number) => void;
  setRecording: (enabled: boolean) => void;
}

const generateId = () => `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAuditTrailStore = create<AuditTrailState>()(
  persist(
    (set, get) => ({
      entries: [],
      isRecording: true,

      logAction: (entry) => {
        if (!get().isRecording) return;

        const newEntry: ExtendedAuditEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          entries: [newEntry, ...state.entries].slice(0, 10000), // Keep last 10k entries
        }));
      },

      getEntriesByEntity: (entityType, entityId) => {
        return get().entries.filter(
          (e) => e.entityType === entityType && e.entityId === entityId
        );
      },

      getEntriesByUser: (userId) => {
        return get().entries.filter((e) => e.user === userId);
      },

      getEntriesByDateRange: (start, end) => {
        return get().entries.filter((e) => {
          const timestamp = new Date(e.timestamp);
          return timestamp >= start && timestamp <= end;
        });
      },

      getRecentEntries: (limit) => {
        return get().entries.slice(0, limit);
      },

      exportAuditLog: (filters) => {
        let filtered = get().entries;

        if (filters?.entityType) {
          filtered = filtered.filter((e) => e.entityType === filters.entityType);
        }
        if (filters?.userId) {
          filtered = filtered.filter((e) => e.user === filters.userId);
        }
        if (filters?.startDate) {
          filtered = filtered.filter((e) => new Date(e.timestamp) >= filters.startDate!);
        }
        if (filters?.endDate) {
          filtered = filtered.filter((e) => new Date(e.timestamp) <= filters.endDate!);
        }

        return JSON.stringify({
          exportedAt: new Date().toISOString(),
          totalEntries: filtered.length,
          filters,
          entries: filtered,
        }, null, 2);
      },

      clearOldEntries: (daysToKeep) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        set((state) => ({
          entries: state.entries.filter((e) => new Date(e.timestamp) >= cutoffDate),
        }));
      },

      setRecording: (enabled) => {
        set({ isRecording: enabled });
      },
    }),
    {
      name: 'medtech-audit-trail',
      partialize: (state) => ({
        entries: state.entries.slice(0, 5000), // Persist last 5k entries
        isRecording: state.isRecording,
      }),
    }
  )
);

// Helper function to log audit action with current user context
export function logAuditAction(
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  details: {
    entityName?: string;
    previousValue?: unknown;
    newValue?: unknown;
    isoClause?: string;
    metadata?: Record<string, unknown>;
  },
  user: string
) {
  useAuditTrailStore.getState().logAction({
    action: `${action}_${entityType}`,
    entityType,
    entityId,
    entityName: details.entityName,
    previousValue: details.previousValue,
    newValue: details.newValue,
    isoClause: details.isoClause || '',
    user,
    metadata: details.metadata,
  });
}
