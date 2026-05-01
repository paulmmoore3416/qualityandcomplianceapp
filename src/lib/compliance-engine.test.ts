import { describe, it, expect } from 'vitest';
import { 
  calculateRiskIndex, 
  getRiskLevel, 
  isMitigationRequired,
  createRiskAssessment,
  evaluateMetricRisk,
  generateComplianceAlerts
} from './compliance-engine';
import { Metric } from '../types';

describe('Compliance Engine', () => {
  describe('ISO 14971 Risk Assessment', () => {
    it('should calculate risk index correctly', () => {
      expect(calculateRiskIndex(3, 4)).toBe(12);
      expect(calculateRiskIndex(1, 1)).toBe(1);
      expect(calculateRiskIndex(5, 5)).toBe(25);
    });

    it('should return correct risk levels', () => {
      expect(getRiskLevel(1)).toBe('Low');
      expect(getRiskLevel(4)).toBe('Low');
      expect(getRiskLevel(5)).toBe('Medium');
      expect(getRiskLevel(9)).toBe('Medium');
      expect(getRiskLevel(10)).toBe('High');
      expect(getRiskLevel(15)).toBe('High');
      expect(getRiskLevel(16)).toBe('Critical');
      expect(getRiskLevel(25)).toBe('Critical');
    });

    it('should determine if mitigation is required', () => {
      expect(isMitigationRequired('Low')).toBe(false);
      expect(isMitigationRequired('Medium')).toBe(false);
      expect(isMitigationRequired('High')).toBe(true);
      expect(isMitigationRequired('Critical')).toBe(true);
    });

    it('should create a valid risk assessment', () => {
      const assessment = createRiskAssessment(
        'metric-1',
        'Potential data loss',
        4,
        3
      );
      expect(assessment.metricId).toBe('metric-1');
      expect(assessment.riskIndex).toBe(12);
      expect(assessment.riskLevel).toBe('High');
      expect(assessment.mitigationRequired).toBe(true);
      expect(assessment.status).toBe('Open');
    });
  });

  describe('Metric Risk Evaluation', () => {
    const mockMetric: Metric = {
      id: 'yield',
      name: 'Yield',
      description: 'First pass yield',
      unit: '%',
      category: 'quality',
      target: 98,
      warningThreshold: 95,
      criticalThreshold: 90,
      higherIsBetter: true,
      riskImpact: 'Critical'
    };

    it('should trigger reassessment on status degradation', () => {
      const evaluation = evaluateMetricRisk(mockMetric, 89, 99); // excellent -> critical
      expect(evaluation.requiresReassessment).toBe(true);
      expect(evaluation.reason).toContain('status degraded');
    });

    it('should trigger reassessment on critical breach with high impact', () => {
      const evaluation = evaluateMetricRisk(mockMetric, 85); // critical
      expect(evaluation.requiresReassessment).toBe(true);
      expect(evaluation.reason).toContain('critical status');
    });

    it('should not trigger reassessment for stable good metrics', () => {
      const evaluation = evaluateMetricRisk(mockMetric, 99, 98);
      expect(evaluation.requiresReassessment).toBe(false);
    });
  });

  describe('Compliance Alerts', () => {
    it('should generate critical alerts for critical status', () => {
      const alerts = generateComplianceAlerts('yield', 85);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('Critical');
      expect(alerts[0].title).toContain('Critical Alert');
    });

    it('should generate warning alerts for warning status', () => {
      const alerts = generateComplianceAlerts('yield', 92);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('Warning');
    });
  });
});
