import { Metric } from '../types';

export const METRICS_CONFIG: Metric[] = [
  // ===============================
  // QUALITY & COMPLIANCE METRICS (KCIs)
  // ===============================
  {
    id: 'M001',
    name: 'First Pass Yield',
    shortName: 'FPY',
    category: 'Quality',
    description: 'Percentage of products produced correctly without rework or defects on the first attempt. A key indicator of process stability and capability.',
    formula: '(Units_Passed_First_Time / Total_Units_Started) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.2.6', description: 'Monitoring and measurement of product' },
      { standard: 'ISO 9001', clause: '9.1', description: 'Monitoring, measurement, analysis and evaluation' },
      { standard: 'ISO 14971', clause: '7.3', description: 'Residual risk evaluation' },
    ],
    riskImpact: 'High - Correlates directly to Process Stability. Low FPY indicates potential systematic issues requiring ISO 14971 risk reassessment.',
    threshold: {
      green: 95,
      yellow: 90,
      red: 85,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'If manual tracking is error-prone, implement digital batch records (eDBR) to capture real-time pass/fail at each gate. Consider Statistical Process Control (SPC) charts for trend analysis.',
  },
  {
    id: 'M002',
    name: 'Non-Conformance Report Rate',
    shortName: 'NCR Rate',
    category: 'Quality',
    description: 'Rate of defective or non-conforming products identified during manufacturing. Tracks quality escapes and process deviations.',
    formula: '(Total_NCRs / Total_Units_Produced) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.3', description: 'Control of nonconforming product' },
      { standard: 'ISO 9001', clause: '8.7', description: 'Control of nonconforming outputs' },
      { standard: 'ISO 14971', clause: '10', description: 'Production and post-production activities' },
    ],
    riskImpact: 'Critical - High NCR rates trigger mandatory risk assessment updates. Each NCR must be evaluated for patient safety impact.',
    threshold: {
      green: 1,
      yellow: 3,
      red: 5,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Integrate with PLM software to auto-generate NCRs from floor rejects. Implement Pareto analysis to identify top failure modes.',
  },
  {
    id: 'M003',
    name: 'CAPA Closure Rate',
    shortName: 'CAPA Rate',
    category: 'Compliance',
    description: 'Percentage of Corrective and Preventive Actions closed within target timeframe. Key audit metric for regulatory compliance.',
    formula: '(Closed_CAPAs / Total_Open_CAPAs) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.5.2', description: 'Corrective action' },
      { standard: 'ISO 13485:2016', clause: '8.5.3', description: 'Preventive action' },
      { standard: 'ISO 9001', clause: '10.2', description: 'Nonconformity and corrective action' },
    ],
    riskImpact: 'Critical - Regulatory Audit Red Flag. Open/overdue CAPAs indicate systemic QMS failures.',
    threshold: {
      green: 90,
      yellow: 75,
      red: 60,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Automate 30-60-90 day alerts. Use Root Cause Analysis templates (5-Why, Fishbone) to prevent CAPA stagnation. Implement escalation matrix for overdue items.',
  },
  {
    id: 'M004',
    name: 'CAPA Overdue Rate',
    shortName: 'Overdue CAPA',
    category: 'Compliance',
    description: 'Percentage of CAPAs that have exceeded their target closure date. Critical metric for regulatory audits.',
    formula: '(Overdue_CAPAs / Total_Open_CAPAs) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.5.2', description: 'Corrective action' },
      { standard: 'ISO 9001', clause: '10.2', description: 'Nonconformity and corrective action' },
    ],
    riskImpact: 'Critical - Direct indicator of QMS health. Zero tolerance typically required for Class III devices.',
    threshold: {
      green: 5,
      yellow: 10,
      red: 15,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Implement a 72-hour pre-overdue alert system for operations managers. Consider weekly CAPA review meetings for high-risk items.',
  },
  {
    id: 'M005',
    name: 'Lot Acceptance Rate',
    shortName: 'LAR',
    category: 'Quality',
    description: 'Percentage of manufactured lots released versus rejected or scrapped. Indicates overall manufacturing quality and yield.',
    formula: '(Released_Lots / Total_Lots_Manufactured) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.1', description: 'Control of production and service provision' },
      { standard: 'ISO 13485:2016', clause: '8.2.6', description: 'Monitoring and measurement of product' },
    ],
    riskImpact: 'High - Impacts Inventory Turns and COGS. Low LAR indicates systematic quality issues.',
    threshold: {
      green: 98,
      yellow: 95,
      red: 90,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Implement in-process controls to catch issues before lot completion. Use sampling plans per ISO 2859-1 or ANSI/ASQ Z1.4.',
  },
  {
    id: 'M006',
    name: 'Out-of-Specification Rate',
    shortName: 'OOS Rate',
    category: 'Quality',
    description: 'Frequency of testing results falling outside authorized specifications. Triggers investigation and potential CAPA.',
    formula: '(OOS_Results / Total_Tests) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.2.6', description: 'Monitoring and measurement of product' },
      { standard: 'ISO 13485:2016', clause: '8.3', description: 'Control of nonconforming product' },
    ],
    riskImpact: 'High - Each OOS requires documented investigation. Trending OOS indicates process drift.',
    threshold: {
      green: 1,
      yellow: 2,
      red: 3,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Implement OOS investigation SOP with laboratory error vs. manufacturing error distinction. Use LIMS for automatic flagging.',
  },
  {
    id: 'M007',
    name: 'Out-of-Trend Rate',
    shortName: 'OOT Rate',
    category: 'Quality',
    description: 'Frequency of results showing statistical trends toward specification limits, even if currently within spec.',
    formula: '(OOT_Results / Total_Tests) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.4', description: 'Analysis of data' },
      { standard: 'ISO 9001', clause: '9.1.3', description: 'Analysis and evaluation' },
    ],
    riskImpact: 'Medium - Early warning indicator. OOT trending should trigger preventive action before OOS occurs.',
    threshold: {
      green: 2,
      yellow: 4,
      red: 6,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Use statistical trending rules (Western Electric rules, Nelson rules) for early detection. Implement control charts with warning limits.',
  },
  {
    id: 'M008',
    name: 'Audit Finding Resolution Rate',
    shortName: 'Audit Resolution',
    category: 'Compliance',
    description: 'Number of audit findings closed within target timeframe. Key indicator of audit readiness and QMS effectiveness.',
    formula: '(Resolved_Findings / Total_Findings) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.2.4', description: 'Internal audit' },
      { standard: 'ISO 9001', clause: '9.2', description: 'Internal audit' },
    ],
    riskImpact: 'High - Unresolved audit findings during regulatory inspection indicate systemic QMS issues.',
    threshold: {
      green: 95,
      yellow: 85,
      red: 75,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Categorize findings by severity (Critical/Major/Minor) with differentiated timelines. Track average days-to-closure.',
  },
  {
    id: 'M009',
    name: 'Complaint Rate',
    shortName: 'Complaint Rate',
    category: 'Compliance',
    description: 'Rate of customer complaints received per units shipped. Key post-market surveillance metric.',
    formula: '(Total_Complaints / Units_Shipped) × 1000',
    unit: 'per 1000 units',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.2.1', description: 'Feedback' },
      { standard: 'ISO 13485:2016', clause: '8.2.2', description: 'Complaint handling' },
      { standard: 'ISO 14971', clause: '10', description: 'Production and post-production activities' },
    ],
    riskImpact: 'Critical - Complaints may indicate safety issues requiring MDR/Vigilance reporting. Feeds into risk management file updates.',
    threshold: {
      green: 0.5,
      yellow: 1,
      red: 2,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Implement complaint trending dashboard. Auto-flag complaints with reportable terms (injury, death, malfunction).',
  },

  // ===============================
  // OPERATIONAL PERFORMANCE METRICS (KPIs)
  // ===============================
  {
    id: 'M010',
    name: 'Overall Equipment Effectiveness',
    shortName: 'OEE',
    category: 'Operational',
    description: 'Combines availability, performance, and quality rates to measure overall machine efficiency. Gold standard for manufacturing performance.',
    formula: 'Availability × Performance × Quality (each as decimal)',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '6.3', description: 'Infrastructure' },
      { standard: 'ISO 13485:2016', clause: '7.5.1', description: 'Control of production and service provision' },
    ],
    riskImpact: 'Medium - Low OEE may indicate equipment reliability issues affecting product quality consistency.',
    threshold: {
      green: 85,
      yellow: 70,
      red: 55,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Break down OEE into components (Availability, Performance, Quality) to identify specific improvement areas. Implement TPM (Total Productive Maintenance).',
  },
  {
    id: 'M011',
    name: 'Cycle Time',
    shortName: 'Cycle Time',
    category: 'Operational',
    description: 'Time taken to complete a specific manufacturing process or product from start to finish. Key efficiency metric.',
    formula: 'End_Time - Start_Time',
    unit: 'minutes',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.1', description: 'Control of production and service provision' },
      { standard: 'ISO 9001', clause: '8.5.1', description: 'Control of production and service provision' },
    ],
    riskImpact: 'Low - Primarily efficiency metric, but compressed cycle times may compromise quality if not validated.',
    threshold: {
      green: 100, // Target cycle time as baseline
      yellow: 110,
      red: 120,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Monitor cycle time alongside FPY - efficiency gains that reduce quality are counterproductive. Validate any cycle time reductions per ISO 13485:7.5.6.',
  },
  {
    id: 'M012',
    name: 'Throughput',
    shortName: 'Throughput',
    category: 'Operational',
    description: 'Number of units produced over a specific period. Measures production capacity utilization.',
    formula: 'Total_Units_Produced / Time_Period',
    unit: 'units/hour',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.1', description: 'Control of production and service provision' },
      { standard: 'ISO 9001', clause: '8.5.1', description: 'Control of production and service provision' },
    ],
    riskImpact: 'Low - Primarily operational metric. Track Compliant Units per Hour rather than raw throughput.',
    threshold: {
      green: 100, // As percentage of target
      yellow: 90,
      red: 80,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Calculate "Compliant Throughput" = Throughput × FPY to avoid efficiency vs. quality conflicts.',
  },
  {
    id: 'M013',
    name: 'Unplanned Downtime',
    shortName: 'Downtime',
    category: 'Operational',
    description: 'Equipment reliability metric tracking unexpected production stops. Impacts delivery and may indicate maintenance issues.',
    formula: '(Unplanned_Stop_Time / Total_Available_Time) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '6.3', description: 'Infrastructure' },
      { standard: 'ISO 13485:2016', clause: '7.5.6', description: 'Validation of processes for production and service provision' },
    ],
    riskImpact: 'Medium - Frequent unplanned downtime may indicate equipment degradation affecting process validation status.',
    threshold: {
      green: 5,
      yellow: 10,
      red: 15,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Implement predictive maintenance using equipment monitoring. Track Mean Time Between Failures (MTBF) and Mean Time To Repair (MTTR).',
  },
  {
    id: 'M014',
    name: 'Changeover Time',
    shortName: 'Changeover',
    category: 'Operational',
    description: 'Time required when switching production lines between products. Impacts flexibility and throughput.',
    formula: 'End_Changeover - Start_Changeover',
    unit: 'minutes',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.1', description: 'Control of production and service provision' },
      { standard: 'ISO 13485:2016', clause: '7.5.2', description: 'Cleanliness of product' },
    ],
    riskImpact: 'Medium - Shortening changeover must not bypass Line Clearance protocols. Cross-contamination risk if rushed.',
    threshold: {
      green: 30, // Target in minutes
      yellow: 45,
      red: 60,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Apply SMED (Single-Minute Exchange of Dies) principles while maintaining line clearance verification. Document any changeover procedure changes per change control.',
  },
  {
    id: 'M015',
    name: 'Production Attainment',
    shortName: 'Attainment',
    category: 'Operational',
    description: 'Percentage of time production targets are met. Key indicator of planning accuracy and execution capability.',
    formula: '(Actual_Production / Planned_Production) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.1', description: 'Planning of product realization' },
      { standard: 'ISO 9001', clause: '8.1', description: 'Operational planning and control' },
    ],
    riskImpact: 'Low - Primarily planning metric. Chronic under-attainment may indicate capacity or yield issues.',
    threshold: {
      green: 95,
      yellow: 90,
      red: 85,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Analyze root causes of missed targets. Consider capacity planning tools and realistic yield assumptions in production planning.',
  },

  // ===============================
  // FINANCIAL & LOGISTICS METRICS
  // ===============================
  {
    id: 'M016',
    name: 'Cost of Goods Sold Per Unit',
    shortName: 'COGS/Unit',
    category: 'Financial',
    description: 'Total direct and indirect costs to manufacture a single device. Critical for pricing and profitability analysis.',
    formula: 'Total_Manufacturing_Cost / Units_Produced',
    unit: '$',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '6.1', description: 'Provision of resources' },
      { standard: 'ISO 9001', clause: '7.1', description: 'Resources' },
    ],
    riskImpact: 'Low - Financial metric. However, cost pressure should never compromise quality or compliance.',
    threshold: {
      green: 100, // Target cost as baseline percentage
      yellow: 105,
      red: 110,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Include Cost of Poor Quality (COPQ) in analysis - scrap, rework, complaints, recalls. Quality improvements often reduce total COGS.',
  },
  {
    id: 'M017',
    name: 'Inventory Turns',
    shortName: 'Inv Turns',
    category: 'Financial',
    description: 'Measures how often inventory is replaced over a period. Impacts cash flow, storage costs, and material freshness.',
    formula: 'COGS / Average_Inventory_Value',
    unit: 'turns/year',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.11', description: 'Preservation of product' },
      { standard: 'ISO 13485:2016', clause: '4.2.5', description: 'Control of records' },
    ],
    riskImpact: 'Medium - Low turns may indicate expiring materials (shelf life management). Requires ISO 10993 reassessment if material age affects biocompatibility.',
    threshold: {
      green: 12,
      yellow: 8,
      red: 4,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Implement FEFO (First Expired, First Out) for materials with shelf life. Track material age vs. biocompatibility testing validity.',
  },
  {
    id: 'M018',
    name: 'Lead Time to Customer',
    shortName: 'Lead Time',
    category: 'Financial',
    description: 'Time from order receipt to delivery. Critical for customer satisfaction and market competitiveness.',
    formula: 'Delivery_Date - Order_Date',
    unit: 'days',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.2.1', description: 'Determination of requirements related to product' },
      { standard: 'ISO 9001', clause: '8.2.1', description: 'Customer communication' },
    ],
    riskImpact: 'Low - Customer satisfaction metric. Rushed deliveries should not bypass final QC or documentation requirements.',
    threshold: {
      green: 14,
      yellow: 21,
      red: 30,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Map lead time components (manufacturing, QC release, shipping). Identify bottlenecks without compromising quality release criteria.',
  },
  {
    id: 'M019',
    name: 'Scrap Rate',
    shortName: 'Scrap Rate',
    category: 'Financial',
    description: 'Percentage of materials wasted or unusable during manufacturing. Direct cost and environmental impact.',
    formula: '(Scrapped_Materials_Value / Total_Materials_Used_Value) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '8.3', description: 'Control of nonconforming product' },
      { standard: 'ISO 10993', clause: '10993-1', description: 'Evaluation and testing within a risk management process' },
    ],
    riskImpact: 'Medium - High scrap may indicate process issues. Material changes to reduce scrap require ISO 10993 reassessment.',
    threshold: {
      green: 2,
      yellow: 4,
      red: 6,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Categorize scrap by root cause (material, process, operator, equipment). Any material substitution to reduce scrap requires full biocompatibility evaluation.',
  },

  // ===============================
  // STERILIZATION METRICS
  // ===============================
  {
    id: 'M020',
    name: 'Sterility Assurance Level',
    shortName: 'SAL',
    category: 'Quality',
    description: 'Probability of a single viable microorganism occurring on a device after sterilization. Industry standard is 10^-6.',
    formula: 'Log reduction based on bioburden and D-value',
    unit: 'probability',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.5', description: 'Particular requirements for sterile medical devices' },
      { standard: 'ISO 13485:2016', clause: '7.5.7', description: 'Particular requirements for validation of processes for sterilization' },
      { standard: 'ISO 11135', clause: '10', description: 'Validation' },
      { standard: 'ISO 11137', clause: '11137-2', description: 'Establishing the sterilization dose' },
    ],
    riskImpact: 'Critical - Direct patient safety metric. Sterility failures are typically Class I recalls.',
    threshold: {
      green: -6, // 10^-6 expressed as log
      yellow: -5,
      red: -4,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Maintain robust bioburden monitoring program. Validate any packaging or load configuration changes. Conduct periodic dose audits.',
  },
  {
    id: 'M021',
    name: 'Bioburden Level',
    shortName: 'Bioburden',
    category: 'Quality',
    description: 'Population of viable microorganisms on a product prior to sterilization. Critical input for sterilization validation.',
    formula: 'CFU count per ISO 11737-1 methodology',
    unit: 'CFU',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.5.5', description: 'Particular requirements for sterile medical devices' },
      { standard: 'ISO 11135', clause: '8', description: 'Product definition' },
      { standard: 'ISO 14644', clause: '14644-1', description: 'Classification of air cleanliness by particle concentration' },
    ],
    riskImpact: 'High - Elevated bioburden may exceed sterilization process capability. Indicates cleanroom or handling issues.',
    threshold: {
      green: 100,
      yellow: 500,
      red: 1000,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Trend bioburden results by product family. Investigate spikes immediately. Review cleanroom gowning and environmental monitoring data.',
  },

  // ===============================
  // SOFTWARE/DESIGN METRICS (IEC 62304)
  // ===============================
  {
    id: 'M022',
    name: 'Software Defect Density',
    shortName: 'Defect Density',
    category: 'Quality',
    description: 'Number of confirmed defects per thousand lines of code. Key indicator of software quality.',
    formula: '(Total_Confirmed_Defects / KLOC) × 1000',
    unit: 'defects/KLOC',
    isoMappings: [
      { standard: 'IEC 62304', clause: '5.7', description: 'Software system testing' },
      { standard: 'IEC 62304', clause: '8.1', description: 'Problem reports' },
      { standard: 'ISO 14971', clause: '7.1', description: 'Risk control option analysis' },
    ],
    riskImpact: 'High - For Class B and C software, defect density directly relates to residual risk. Track by software safety class.',
    threshold: {
      green: 1,
      yellow: 3,
      red: 5,
      direction: 'lower-better',
    },
    workaroundSuggestion: 'Implement static code analysis tools. Track defects by severity and software safety classification. Conduct code reviews per IEC 62304.',
  },
  {
    id: 'M023',
    name: 'Design Verification Pass Rate',
    shortName: 'Design Ver',
    category: 'Quality',
    description: 'Percentage of design verification tests passing on first execution. Indicates design maturity.',
    formula: '(Tests_Passed_First_Time / Total_Tests_Executed) × 100',
    unit: '%',
    isoMappings: [
      { standard: 'ISO 13485:2016', clause: '7.3.6', description: 'Design and development verification' },
      { standard: 'ISO 14971', clause: '7.2', description: 'Implementation of risk control measures' },
    ],
    riskImpact: 'High - Low pass rates indicate design issues requiring risk management file updates and potential design changes.',
    threshold: {
      green: 95,
      yellow: 85,
      red: 75,
      direction: 'higher-better',
    },
    workaroundSuggestion: 'Link verification tests to design inputs and risk controls. Track requirements coverage matrix. Implement design reviews before verification.',
  },
];

// Export metric lookup helper
export function getMetricById(id: string): Metric | undefined {
  return METRICS_CONFIG.find(m => m.id === id);
}

export function getMetricsByCategory(category: Metric['category']): Metric[] {
  return METRICS_CONFIG.filter(m => m.category === category);
}

export function getMetricStatus(metric: Metric, value: number): 'green' | 'yellow' | 'red' {
  const { threshold } = metric;

  if (threshold.direction === 'higher-better') {
    if (value >= threshold.green) return 'green';
    if (value >= threshold.yellow) return 'yellow';
    return 'red';
  } else {
    if (value <= threshold.green) return 'green';
    if (value <= threshold.yellow) return 'yellow';
    return 'red';
  }
}
