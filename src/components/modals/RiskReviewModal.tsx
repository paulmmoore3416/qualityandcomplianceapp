import { useState } from 'react';
import {
  X,
  AlertTriangle,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Shield,
  BarChart3,
  GitBranch,
  Target,
  Clock,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { ChangeControl } from '../../types';

interface RiskReviewModalProps {
  onClose: () => void;
  riskTriggeredChanges: ChangeControl[];
}

type ReviewTab = 'overview' | 'analysis' | 'solutions' | 'actions' | 'timeline';

interface Solution {
  id: string;
  title: string;
  description: string;
  type: 'design' | 'process' | 'control' | 'training' | 'investigation';
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  timeline: string;
  cost?: string;
  prerequisites?: string[];
  risks?: string[];
}

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Completed';
  dependencies?: string[];
}

export default function RiskReviewModal({ onClose, riskTriggeredChanges }: RiskReviewModalProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('overview');
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);

  // Example solutions for the battery thermal hazard
  const recommendedSolutions: Solution[] = [
    {
      id: 'sol-1',
      title: 'Enhanced Thermal Monitoring System',
      description: 'Implement real-time battery temperature monitoring with automatic shutdown at threshold temperatures. Add redundant thermal sensors for fail-safe operation.',
      type: 'design',
      effort: 'High',
      impact: 'High',
      timeline: '3-4 months',
      cost: '$45,000 - $60,000',
      prerequisites: ['Design verification testing', 'Safety analysis update', 'Regulatory submission'],
      risks: ['Extended development timeline', 'Increased manufacturing cost'],
    },
    {
      id: 'sol-2',
      title: 'Battery Cell Screening Protocol',
      description: 'Implement comprehensive incoming inspection protocol for battery cells including thermal stress testing and capacity verification. Reject cells outside specifications.',
      type: 'process',
      effort: 'Medium',
      impact: 'High',
      timeline: '6-8 weeks',
      cost: '$15,000 - $25,000',
      prerequisites: ['Test equipment procurement', 'SOP development', 'Operator training'],
      risks: ['Supply chain delays', 'Increased cost per unit'],
    },
    {
      id: 'sol-3',
      title: 'Usage Pattern Analysis & User Training',
      description: 'Analyze real-world usage patterns to identify high-risk scenarios. Develop enhanced user training materials and warning labels for proper device operation and charging.',
      type: 'training',
      effort: 'Low',
      impact: 'Medium',
      timeline: '3-4 weeks',
      cost: '$5,000 - $10,000',
      prerequisites: ['Field data analysis', 'Clinical input', 'Marketing review'],
      risks: ['May not fully mitigate technical issues', 'User compliance dependent'],
    },
    {
      id: 'sol-4',
      title: 'Firmware-Level Protection',
      description: 'Implement firmware algorithms to limit charging current during high ambient temperatures, prevent overcharging, and enforce cooling periods between charge cycles.',
      type: 'design',
      effort: 'Medium',
      impact: 'High',
      timeline: '8-10 weeks',
      cost: '$20,000 - $35,000',
      prerequisites: ['Software development', 'Verification testing', 'IEC 62304 documentation'],
      risks: ['Reduced battery life perception', 'User inconvenience'],
    },
    {
      id: 'sol-5',
      title: 'Alternative Battery Supplier Qualification',
      description: 'Qualify secondary battery supplier with improved thermal safety characteristics. Conduct full comparison testing and risk analysis.',
      type: 'process',
      effort: 'High',
      impact: 'High',
      timeline: '4-6 months',
      cost: '$50,000 - $80,000',
      prerequisites: ['Supplier audit', 'Biocompatibility testing', 'Change control approval'],
      risks: ['Supply chain complexity', 'Potential performance differences'],
    },
    {
      id: 'sol-6',
      title: 'Root Cause Investigation',
      description: 'Conduct comprehensive root cause analysis of field failures including failure mode analysis, environmental testing, and comparison with design assumptions.',
      type: 'investigation',
      effort: 'Medium',
      impact: 'High',
      timeline: '6-8 weeks',
      cost: '$25,000 - $40,000',
      prerequisites: ['Sample collection', 'Lab access', 'Cross-functional team'],
      risks: ['Delays other solutions', 'May reveal additional issues'],
    },
  ];

  const generatedActionItems: ActionItem[] = [
    {
      id: 'act-1',
      title: 'Convene Risk Review Board Meeting',
      assignee: 'Risk Manager',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      priority: 'Critical',
      status: 'Not Started',
    },
    {
      id: 'act-2',
      title: 'Retrieve & Analyze Field Complaint Data',
      assignee: 'Post-Market Surveillance',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      priority: 'Critical',
      status: 'Not Started',
    },
    {
      id: 'act-3',
      title: 'Update Risk Management File (ISO 14971)',
      assignee: 'Quality Engineer',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      priority: 'High',
      status: 'Not Started',
      dependencies: ['act-2'],
    },
    {
      id: 'act-4',
      title: 'Assess Regulatory Reporting Requirements',
      assignee: 'Regulatory Affairs',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      priority: 'Critical',
      status: 'Not Started',
    },
    {
      id: 'act-5',
      title: 'Notify Notified Body / FDA (if required)',
      assignee: 'Regulatory Affairs',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      priority: 'High',
      status: 'Not Started',
      dependencies: ['act-4'],
    },
    {
      id: 'act-6',
      title: 'Evaluate Need for Field Safety Corrective Action',
      assignee: 'Risk Manager',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      priority: 'Critical',
      status: 'Not Started',
      dependencies: ['act-1', 'act-2'],
    },
    {
      id: 'act-7',
      title: 'Initiate CAPA (if required)',
      assignee: 'CAPA Coordinator',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      priority: 'High',
      status: 'Not Started',
      dependencies: ['act-6'],
    },
  ];

  const toggleSolution = (solutionId: string) => {
    setSelectedSolutions((prev) =>
      prev.includes(solutionId) ? prev.filter((id) => id !== solutionId) : [...prev, solutionId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSolutionIcon = (type: Solution['type']) => {
    switch (type) {
      case 'design':
        return <Shield className="w-5 h-5" />;
      case 'process':
        return <GitBranch className="w-5 h-5" />;
      case 'control':
        return <Target className="w-5 h-5" />;
      case 'training':
        return <Users className="w-5 h-5" />;
      case 'investigation':
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Risk Threshold Breach Review</h2>
              <p className="text-sm text-red-700">
                {riskTriggeredChanges.length} change(s) require immediate review per ISO 13485:4.1.4
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close risk review"
            aria-label="Close risk review"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-surface-200">
          {[
            { id: 'overview', label: 'Overview', icon: AlertTriangle },
            { id: 'analysis', label: 'Risk Analysis', icon: BarChart3 },
            { id: 'solutions', label: 'Solutions', icon: Lightbulb },
            { id: 'actions', label: 'Action Items', icon: CheckCircle },
            { id: 'timeline', label: 'Timeline', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReviewTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-white text-primary-600 border-t-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-surface-50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Risk Breach Summary */}
              {riskTriggeredChanges.map((cc) => (
                <div key={cc.id} className="card border-red-300 bg-red-50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-gray-600">{cc.referenceNumber}</span>
                        <span className="badge bg-red-100 text-red-700">{cc.classification}</span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{cc.title}</h3>
                      <p className="text-gray-700 mb-4">{cc.description}</p>

                      {cc.triggeredByRiskBreach && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-red-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Hazard ID</p>
                            <p className="font-mono font-semibold text-gray-900">
                              {cc.triggeredByRiskBreach.hazardId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Design Estimate</p>
                            <p className="font-semibold text-gray-900">
                              {cc.triggeredByRiskBreach.designEstimate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Actual Rate</p>
                            <p className="font-semibold text-red-600 flex items-center gap-1">
                              {cc.triggeredByRiskBreach.actualRate}%
                              <TrendingUp className="w-4 h-4" />
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Regulatory Requirements
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-yellow-900">ISO 13485:4.1.4 - Management Responsibility</p>
                              <p className="text-yellow-700">
                                When actual product performance deviates from design assumptions, immediate review and
                                appropriate action required
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-yellow-900">ISO 14971:9 - Post-Production Information</p>
                              <p className="text-yellow-700">
                                Review and update risk management file when new information indicates residual risk is no
                                longer acceptable
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-yellow-900">
                                EU MDR Article 61 / FDA 21 CFR 803 - Vigilance Reporting
                              </p>
                              <p className="text-yellow-700">
                                Assess if this constitutes a reportable serious adverse event or field safety issue
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-surface-200">
                          <p className="text-xs text-gray-500 mb-1">Affected Products</p>
                          <p className="font-medium text-gray-900">
                            {cc.impactAssessment.affectedProducts.join(', ')}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-surface-200">
                          <p className="text-xs text-gray-500 mb-1">Safety Impact</p>
                          <p className="font-medium text-red-600">{cc.impactAssessment.safetyImpact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistical Analysis
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 mb-1">Variance from Design</p>
                    <p className="text-2xl font-bold text-blue-900">+700%</p>
                    <p className="text-xs text-blue-600">Statistically significant (p &lt; 0.001)</p>
                  </div>
                  <div>
                    <p className="text-blue-700 mb-1">Sample Size</p>
                    <p className="text-2xl font-bold text-blue-900">12,450</p>
                    <p className="text-xs text-blue-600">Units in field</p>
                  </div>
                  <div>
                    <p className="text-blue-700 mb-1">Confidence Level</p>
                    <p className="text-2xl font-bold text-blue-900">99.9%</p>
                    <p className="text-xs text-blue-600">Breach is real, not statistical noise</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Potential Root Causes</h3>
                <div className="space-y-3">
                  {[
                    {
                      cause: 'Battery cell manufacturing defect',
                      likelihood: 'High',
                      evidence: 'Similar issues reported by other manufacturers using same cell supplier',
                    },
                    {
                      cause: 'Environmental conditions outside design assumptions',
                      likelihood: 'Medium',
                      evidence: 'Complaints concentrated in high-temperature regions',
                    },
                    {
                      cause: 'User behavior patterns not captured in design validation',
                      likelihood: 'Medium',
                      evidence: 'Higher occurrence in specific use scenarios',
                    },
                    {
                      cause: 'Design flaw in thermal management',
                      likelihood: 'Low',
                      evidence: 'Design verified per standards, but real-world conditions may differ',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{item.cause}</p>
                          <span
                            className={cn(
                              'badge',
                              item.likelihood === 'High'
                                ? 'bg-red-100 text-red-700'
                                : item.likelihood === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            )}
                          >
                            {item.likelihood} Likelihood
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.evidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card border-orange-300 bg-orange-50">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trend Analysis
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  Occurrence rate has been increasing over past 6 months. Immediate action required to prevent further
                  incidents.
                </p>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="p-2 bg-white rounded">
                    <p className="text-orange-600">Month 1-2</p>
                    <p className="font-bold text-gray-900">0.02%</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-orange-600">Month 3-4</p>
                    <p className="font-bold text-gray-900">0.04%</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-orange-600">Month 5-6</p>
                    <p className="font-bold text-gray-900">0.06%</p>
                  </div>
                  <div className="p-2 bg-white rounded border-2 border-red-500">
                    <p className="text-red-600">Current</p>
                    <p className="font-bold text-red-600">0.08%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solutions' && (
            <div className="space-y-4">
              <div className="card bg-green-50 border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommended Solutions & Mitigations
                </h3>
                <p className="text-sm text-green-700">
                  Select one or more solutions to pursue. Multiple solutions may be implemented in parallel for
                  comprehensive risk mitigation.
                </p>
              </div>

              {recommendedSolutions.map((solution) => (
                <div
                  key={solution.id}
                  className={cn(
                    'card cursor-pointer transition-all hover:shadow-md',
                    selectedSolutions.includes(solution.id)
                      ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-400'
                      : 'border-surface-200 hover:border-primary-300'
                  )}
                  onClick={() => toggleSolution(solution.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        selectedSolutions.includes(solution.id)
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-surface-100 text-gray-600'
                      )}
                    >
                      {getSolutionIcon(solution.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{solution.title}</h4>
                        <span className="badge badge-gray capitalize">{solution.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{solution.description}</p>

                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Effort:</span>
                          <span className={cn('font-medium', getEffortColor(solution.effort))}>
                            {solution.effort}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Impact:</span>
                          <span className={cn('font-medium', getImpactColor(solution.impact))}>
                            {solution.impact}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Timeline:</span>
                          <span className="font-medium text-gray-900">{solution.timeline}</span>
                        </div>
                        {solution.cost && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Cost:</span>
                            <span className="font-medium text-gray-900">{solution.cost}</span>
                          </div>
                        )}
                      </div>

                      {solution.prerequisites && solution.prerequisites.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {solution.prerequisites.map((prereq, idx) => (
                              <span key={idx} className="badge bg-blue-100 text-blue-700 text-xs">
                                {prereq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {solution.risks && solution.risks.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Implementation Risks:</p>
                          <div className="flex flex-wrap gap-1">
                            {solution.risks.map((risk, idx) => (
                              <span key={idx} className="badge bg-yellow-100 text-yellow-700 text-xs">
                                {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedSolutions.includes(solution.id) && (
                        <div className="mt-3 p-2 bg-primary-100 border border-primary-300 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <p className="text-sm text-primary-800">
                            Selected for implementation - Will be added to action plan
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {selectedSolutions.length > 0 && (
                <div className="card bg-primary-50 border-primary-200">
                  <p className="text-sm text-primary-900">
                    <strong>{selectedSolutions.length}</strong> solution(s) selected. Proceed to Action Items tab to
                    generate implementation plan.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="card bg-purple-50 border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Immediate Action Items (ISO 13485 Compliance)
                </h3>
                <p className="text-sm text-purple-700">
                  These actions are auto-generated based on regulatory requirements and must be completed regardless of
                  selected solutions.
                </p>
              </div>

              <div className="space-y-3">
                {generatedActionItems.map((action) => (
                  <div key={action.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={action.status === 'Completed'}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        title={`Mark ${action.title} as complete`}
                        aria-label={`Mark ${action.title} as complete`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <span className={cn('badge text-xs', getPriorityColor(action.priority))}>
                            {action.priority}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Assignee:</span>
                            <span className="font-medium text-gray-900">{action.assignee}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Due:</span>
                            <span className="font-medium text-gray-900">{formatDate(action.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Status:</span>
                            <span
                              className={cn(
                                'font-medium',
                                action.status === 'Completed'
                                  ? 'text-green-600'
                                  : action.status === 'In Progress'
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                              )}
                            >
                              {action.status}
                            </span>
                          </div>
                        </div>
                        {action.dependencies && action.dependencies.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                            <ArrowRight className="w-3 h-3" />
                            Depends on: {action.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSolutions.length > 0 && (
                <div className="card bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Solution-Specific Actions</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Additional actions will be generated for your {selectedSolutions.length} selected solution(s) after
                    approval.
                  </p>
                  <button className="btn-primary btn-sm">
                    Generate Solution Action Plan <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="card bg-indigo-50 border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Projected Timeline & Milestones
                </h3>
                <p className="text-sm text-indigo-700">
                  Estimated timeline based on selected solutions and regulatory requirements
                </p>
              </div>

              {/* Timeline visualization */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-200"></div>
                <div className="space-y-6 relative">
                  {[
                    {
                      phase: 'Immediate (0-2 weeks)',
                      items: [
                        'Risk review board meeting',
                        'Regulatory assessment',
                        'Field data analysis',
                        'RMF update initiation',
                      ],
                      status: 'Critical',
                    },
                    {
                      phase: 'Short-term (2-8 weeks)',
                      items: [
                        'Root cause investigation complete',
                        'User training materials updated',
                        'Enhanced monitoring implementation (if selected)',
                        'CAPA system documentation',
                      ],
                      status: 'High',
                    },
                    {
                      phase: 'Medium-term (2-4 months)',
                      items: [
                        'Design changes implemented',
                        'Verification testing complete',
                        'Process improvements validated',
                        'Regulatory submissions filed',
                      ],
                      status: 'Medium',
                    },
                    {
                      phase: 'Long-term (4-6 months)',
                      items: [
                        'Alternative supplier qualified (if applicable)',
                        'Full production validation',
                        'Post-market surveillance enhanced',
                        'Effectiveness monitoring established',
                      ],
                      status: 'Medium',
                    },
                  ].map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm relative z-10',
                          milestone.status === 'Critical'
                            ? 'bg-red-500'
                            : milestone.status === 'High'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">{milestone.phase}</h4>
                        <ul className="space-y-1">
                          {milestone.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card border-yellow-300 bg-yellow-50">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Timeline may vary based on selected solutions, investigation findings, and
                  regulatory feedback. Regular progress reviews recommended.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-surface-200 p-6 bg-surface-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedSolutions.length > 0 && (
                <span className="font-medium text-primary-600">
                  {selectedSolutions.length} solution(s) selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="btn-secondary">
                Close Review
              </button>
              <button className="btn-primary gap-2">
                <FileText className="w-4 h-4" />
                Generate Action Plan
              </button>
              <button className="btn-danger gap-2">
                <GitBranch className="w-4 h-4" />
                Create Change Control
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
