import { v4 as uuidv4 } from 'uuid';
import {
  RiskAssessment,
  RiskLevel,
  SeverityLevel,
  ProbabilityLevel,
  Metric,
  MetricValue,
  ComplianceAlert,
  AuditEntry,
  ISOMapping,
} from '../types';
import { getMetricStatus, getMetricById } from '../data/metrics-config';

// ===============================
// ISO 14971 RISK ASSESSMENT ENGINE
// ===============================

/**
 * Risk Matrix following ISO 14971:2019 guidelines
 * Severity (1-5) x Probability (1-5) = Risk Index (1-25)
 */
export const RISK_MATRIX: Record<number, RiskLevel> = {
  // Risk Index ranges
  // 1-4: Low
  // 5-9: Medium
  // 10-15: High
  // 16-25: Critical
};

export function calculateRiskIndex(severity: SeverityLevel, probability: ProbabilityLevel): number {
  return severity * probability;
}

export function getRiskLevel(riskIndex: number): RiskLevel {
  if (riskIndex <= 4) return 'Low';
  if (riskIndex <= 9) return 'Medium';
  if (riskIndex <= 15) return 'High';
  return 'Critical';
}

export function isMitigationRequired(riskLevel: RiskLevel): boolean {
  return riskLevel === 'High' || riskLevel === 'Critical';
}

/**
 * Create a risk assessment following ISO 14971 process
 */
export function createRiskAssessment(
  metricId: string,
  hazardDescription: string,
  severity: SeverityLevel,
  probability: ProbabilityLevel,
  mitigationPlan?: string
): RiskAssessment {
  const riskIndex = calculateRiskIndex(severity, probability);
  const riskLevel = getRiskLevel(riskIndex);
  const mitigationRequired = isMitigationRequired(riskLevel);

  return {
    id: uuidv4(),
    metricId,
    hazardDescription,
    severity,
    probability,
    riskIndex,
    riskLevel,
    mitigationRequired,
    mitigationPlan: mitigationRequired ? mitigationPlan : undefined,
    status: mitigationRequired ? 'Open' : 'Closed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Evaluate if a metric value triggers risk reassessment
 * Per ISO 14971:2019 Clause 10 - Production and post-production activities
 */
export function evaluateMetricRisk(
  metric: Metric,
  value: number,
  previousValue?: number
): { requiresReassessment: boolean; reason: string; suggestedAction: string } {
  const status = getMetricStatus(metric, value);
  const previousStatus = previousValue ? getMetricStatus(metric, previousValue) : null;

  // Status degradation triggers reassessment
  if (previousStatus && status !== previousStatus) {
    if (
      (previousStatus === 'green' && status !== 'green') ||
      (previousStatus === 'yellow' && status === 'red')
    ) {
      return {
        requiresReassessment: true,
        reason: `Metric status degraded from ${previousStatus} to ${status}`,
        suggestedAction: `Update Risk Management File per ISO 14971:7.3. Review residual risk evaluation for ${metric.name}.`,
      };
    }
  }

  // Critical metrics in red status always require review
  if (status === 'red' && metric.riskImpact.includes('Critical')) {
    return {
      requiresReassessment: true,
      reason: `Critical metric ${metric.name} in red status`,
      suggestedAction: `Immediate CAPA initiation per ISO 13485:8.5.2. Update risk controls per ISO 14971:7.1.`,
    };
  }

  return {
    requiresReassessment: false,
    reason: 'Metric within acceptable parameters',
    suggestedAction: 'Continue routine monitoring',
  };
}

// ===============================
// COMPLIANCE CALCULATIONS
// ===============================

/**
 * Calculate First Pass Yield (FPY)
 * ISO 13485:8.2.6 - Monitoring and measurement of product
 */
export function calculateFPY(totalStarted: number, passedFirstTime: number): number {
  if (totalStarted === 0) return 0;
  return (passedFirstTime / totalStarted) * 100;
}

/**
 * Calculate NCR Rate
 * ISO 13485:8.3 - Control of nonconforming product
 */
export function calculateNCRRate(totalNCRs: number, totalUnits: number): number {
  if (totalUnits === 0) return 0;
  return (totalNCRs / totalUnits) * 100;
}

/**
 * Calculate CAPA Closure Rate
 * ISO 13485:8.5.2/8.5.3 - Corrective and preventive action
 */
export function calculateCAPAClosureRate(closedCAPAs: number, totalOpenCAPAs: number): number {
  const totalCAPAs = closedCAPAs + totalOpenCAPAs;
  if (totalCAPAs === 0) return 100;
  return (closedCAPAs / totalCAPAs) * 100;
}

/**
 * Calculate Overall Equipment Effectiveness (OEE)
 * ISO 13485:6.3 - Infrastructure
 */
export function calculateOEE(
  availability: number,
  performance: number,
  quality: number
): { oee: number; components: { availability: number; performance: number; quality: number } } {
  // All inputs should be percentages (0-100)
  const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
  return {
    oee,
    components: { availability, performance, quality },
  };
}

/**
 * Calculate Lot Acceptance Rate
 * ISO 13485:7.5.1 - Control of production and service provision
 */
export function calculateLAR(releasedLots: number, totalLots: number): number {
  if (totalLots === 0) return 0;
  return (releasedLots / totalLots) * 100;
}

/**
 * Calculate Inventory Turns
 * ISO 13485:7.5.11 - Preservation of product
 */
export function calculateInventoryTurns(cogs: number, avgInventoryValue: number): number {
  if (avgInventoryValue === 0) return 0;
  return cogs / avgInventoryValue;
}

/**
 * Calculate Scrap Rate
 * ISO 13485:8.3 - Control of nonconforming product
 */
export function calculateScrapRate(scrapValue: number, totalMaterialValue: number): number {
  if (totalMaterialValue === 0) return 0;
  return (scrapValue / totalMaterialValue) * 100;
}

// ===============================
// COMPLIANCE ALERTS & GUARDRAILS
// ===============================

/**
 * Generate compliance alerts based on metric values
 */
export function generateComplianceAlerts(
  metricId: string,
  value: number,
  previousValue?: number
): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const metric = getMetricById(metricId);

  if (!metric) return alerts;

  const status = getMetricStatus(metric, value);
  const riskEvaluation = evaluateMetricRisk(metric, value, previousValue);

  // Generate alert based on status
  if (status === 'red') {
    alerts.push({
      id: uuidv4(),
      type: 'Critical',
      title: `${metric.shortName} Critical Alert`,
      message: `${metric.name} has reached critical threshold (${value}${metric.unit}). ${riskEvaluation.suggestedAction}`,
      isoReference: metric.isoMappings[0],
      linkedEntityType: 'Metric',
      linkedEntityId: metricId,
      timestamp: new Date(),
      acknowledged: false,
    });
  } else if (status === 'yellow') {
    alerts.push({
      id: uuidv4(),
      type: 'Warning',
      title: `${metric.shortName} Warning`,
      message: `${metric.name} approaching threshold (${value}${metric.unit}). Review recommended.`,
      isoReference: metric.isoMappings[0],
      linkedEntityType: 'Metric',
      linkedEntityId: metricId,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  // Add risk reassessment alert if needed
  if (riskEvaluation.requiresReassessment) {
    alerts.push({
      id: uuidv4(),
      type: 'Critical',
      title: 'Risk Reassessment Required',
      message: `${riskEvaluation.reason}. ${riskEvaluation.suggestedAction}`,
      isoReference: { standard: 'ISO 14971', clause: '10', description: 'Production and post-production activities' },
      linkedEntityType: 'Metric',
      linkedEntityId: metricId,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  return alerts;
}

/**
 * ISO 10993 Biocompatibility Guardrail
 * Triggers alert when material changes affect biocompatibility
 */
export function evaluateBiocompatibilityRisk(
  materialChanged: boolean,
  supplierChanged: boolean,
  processChanged: boolean
): ComplianceAlert | null {
  if (materialChanged || supplierChanged) {
    return {
      id: uuidv4(),
      type: 'Critical',
      title: 'ISO 10993 Reassessment Required',
      message: materialChanged
        ? 'Material change detected. Full biocompatibility reassessment required per ISO 10993-1 before batch release.'
        : 'Supplier change detected. Biocompatibility equivalence evaluation required per ISO 10993-18.',
      isoReference: {
        standard: 'ISO 10993',
        clause: '10993-1',
        description: 'Evaluation and testing within a risk management process',
      },
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  if (processChanged) {
    return {
      id: uuidv4(),
      type: 'Warning',
      title: 'Process Change Review Required',
      message: 'Manufacturing process change may affect extractables/leachables profile. Review ISO 10993-18 requirements.',
      isoReference: {
        standard: 'ISO 10993',
        clause: '10993-18',
        description: 'Chemical characterization of medical device materials',
      },
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

// ===============================
// AUDIT TRAIL (ALCOA+ COMPLIANCE)
// ===============================

/**
 * Create audit entry following ALCOA+ principles
 * Attributable, Legible, Contemporaneous, Original, Accurate
 */
export function createAuditEntry(
  action: string,
  isoClause: string,
  previousValue?: unknown,
  newValue?: unknown,
  user: string = 'System'
): AuditEntry {
  return {
    id: uuidv4(),
    action,
    previousValue,
    newValue,
    isoClause,
    timestamp: new Date(),
    user,
  };
}

/**
 * Record metric value with full audit trail
 */
export function recordMetricValue(
  metricId: string,
  value: number,
  inputs: Record<string, number>,
  user: string,
  notes?: string
): MetricValue {
  const metric = getMetricById(metricId);

  const auditEntry = createAuditEntry(
    `Metric value recorded: ${value}`,
    metric?.isoMappings[0]?.clause || 'ISO 13485:8.4',
    undefined,
    value,
    user
  );

  return {
    id: uuidv4(),
    metricId,
    value,
    inputs,
    timestamp: new Date(),
    notes,
    linkedRiskAssessments: [],
    auditTrail: [auditEntry],
  };
}

// ===============================
// LIFECYCLE MANAGEMENT
// ===============================

/**
 * Get recommended metrics for lifecycle phase
 */
export function getLifecycleMetrics(phase: string): string[] {
  const phaseMetrics: Record<string, string[]> = {
    Design: ['M022', 'M023'], // Software defect density, Design verification
    Verification: ['M023', 'M001'], // Design verification, FPY
    Validation: ['M001', 'M006', 'M020'], // FPY, OOS Rate, SAL
    Production: ['M001', 'M002', 'M003', 'M010', 'M012', 'M019'], // FPY, NCR, CAPA, OEE, Throughput, Scrap
    'Post-Market': ['M009', 'M003', 'M008'], // Complaint Rate, CAPA, Audit Resolution
  };

  return phaseMetrics[phase] || [];
}

/**
 * Check if metric change requires design control update
 * Per ISO 13485:7.3 - Design and development
 */
export function requiresDesignControlUpdate(
  metricId: string,
  changeType: 'specification' | 'process' | 'material' | 'supplier'
): { required: boolean; scope: string; isoReference: ISOMapping } {
  const designControlTriggers = ['M001', 'M020', 'M021', 'M022', 'M023'];

  if (designControlTriggers.includes(metricId) || changeType === 'specification') {
    return {
      required: true,
      scope: `Design change review required for ${changeType} change affecting metric`,
      isoReference: {
        standard: 'ISO 13485:2016',
        clause: '7.3.9',
        description: 'Control of design and development changes',
      },
    };
  }

  return {
    required: false,
    scope: 'No design control update required',
    isoReference: {
      standard: 'ISO 13485:2016',
      clause: '7.5.1',
      description: 'Control of production and service provision',
    },
  };
}
