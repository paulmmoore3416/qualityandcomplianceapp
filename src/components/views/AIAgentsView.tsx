import React, { useState } from 'react';
import {
  Bot,
  Brain,
  TrendingUp,
  Play,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Search,
  FileSearch,
  Shield,
  Zap,
  X,
} from 'lucide-react';
import {
  AIAgent,
  AgentType,
  VigilanceWatchmanTask,
  AuditRAGQuery,
  RiskPrediction,
} from '../../types';
import { AIAgentSettingsModal } from '../modals/AIAgentSettingsModal';
import AIAgentRunModal from '../modals/AIAgentRunModal';

export const AIAgentsView: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResponse, setRagResponse] = useState<AuditRAGQuery | null>(null);  const [settingsAgent, setSettingsAgent] = useState<AIAgent | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [aiInstalled, setAiInstalled] = useState<boolean | null>(null);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runResponse, setRunResponse] = useState<string | undefined>(undefined);
  const [runLoading, setRunLoading] = useState(false);
  const [testPromptText, setTestPromptText] = useState('Please summarize recent vigilance tasks and list top 3 recommended actions.');
  // Mock AI Agents data
  const agents: AIAgent[] = [
    {
      id: 'agent-001',
      name: 'Vigilance Watchman',
      type: 'Vigilance Watchman',
      status: 'Running',
      version: '2.1.0',
      description:
        'Monitors incoming complaints/emails, extracts hazards, maps to ISO 14971 risk file, and auto-generates change control requests.',
      lastRun: new Date(Date.now() - 15 * 60 * 1000),
      nextScheduledRun: new Date(Date.now() + 45 * 60 * 1000),
      totalExecutions: 1247,
      successfulExecutions: 1189,
      failedExecutions: 58,
      averageExecutionTime: 4.2,
      configuration: {
        enabled: true,
        autoRun: true,
        schedule: '*/15 * * * *',
        maxConcurrentTasks: 5,
        timeout: 30000,
        retryAttempts: 3,
        modelName: 'llama3.1:70b',
        temperature: 0.1,
        maxTokens: 4096,
        systemPrompt: 'You are a medical device vigilance expert...',
        isLocalDeployment: true,
        endpoint: 'http://localhost:11434',
      },
      metrics: {
        tasksProcessed: 1247,
        tasksQueued: 3,
        tasksFailed: 58,
        averageResponseTime: 4200,
        hallucinationDetections: 12,
        confidenceScores: [0.92, 0.88, 0.95, 0.91, 0.89],
      },
    },
    {
      id: 'agent-002',
      name: 'Audit-Ready RAG',
      type: 'Audit-Ready RAG',
      status: 'Running',
      version: '1.8.0',
      description:
        'Retrieval-Augmented Generation system for ISO compliance queries. Ask questions about your quality system and get instant, citation-backed answers.',
      lastRun: new Date(Date.now() - 5 * 60 * 1000),
      totalExecutions: 892,
      successfulExecutions: 884,
      failedExecutions: 8,
      averageExecutionTime: 2.8,
      configuration: {
        enabled: true,
        autoRun: false,
        maxConcurrentTasks: 10,
        timeout: 15000,
        retryAttempts: 2,
        modelName: 'mistral:7b',
        temperature: 0.2,
        maxTokens: 2048,
        systemPrompt: 'You are an ISO 13485 compliance expert...',
        isLocalDeployment: true,
        endpoint: 'http://localhost:11434',
      },
      metrics: {
        tasksProcessed: 892,
        tasksQueued: 0,
        tasksFailed: 8,
        averageResponseTime: 2800,
        hallucinationDetections: 4,
        confidenceScores: [0.94, 0.96, 0.93, 0.97, 0.95],
      },
    },
    {
      id: 'agent-003',
      name: 'Risk Predictor',
      type: 'Risk Predictor',
      status: 'Running',
      version: '2.0.3',
      description:
        'Analyzes key metric trends to predict quality escapes before NCRs occur. Monitors FPY, cycle time, and other KPIs for early warning detection.',
      lastRun: new Date(Date.now() - 60 * 60 * 1000),
      nextScheduledRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
      totalExecutions: 456,
      successfulExecutions: 442,
      failedExecutions: 14,
      averageExecutionTime: 8.5,
      configuration: {
        enabled: true,
        autoRun: true,
        schedule: '0 */3 * * *',
        maxConcurrentTasks: 2,
        timeout: 60000,
        retryAttempts: 3,
        modelName: 'llama3.1:70b',
        temperature: 0.15,
        maxTokens: 8192,
        systemPrompt: 'You are a manufacturing quality analytics expert...',
        isLocalDeployment: true,
        endpoint: 'http://localhost:11434',
      },
      metrics: {
        tasksProcessed: 456,
        tasksQueued: 0,
        tasksFailed: 14,
        averageResponseTime: 8500,
        hallucinationDetections: 7,
        confidenceScores: [0.89, 0.91, 0.88, 0.93, 0.90],
      },
    },
  ];

  // Mock recent tasks for Vigilance Watchman
  const recentVigilanceTasks: VigilanceWatchmanTask[] = [
    {
      id: 'task-001',
      status: 'Completed',
      sourceType: 'Email',
      sourceData: 'Customer complaint: Catheter tip separated during procedure',
      extractedHazards: ['Component separation', 'Procedure failure'],
      linkedRiskIds: ['HAZARD-CS-012'],
      generatedChangeControlId: 'CC-2026-018',
      confidence: 0.92,
      processingTime: 3.8,
      warnings: [],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3800),
    },
    {
      id: 'task-002',
      status: 'Completed',
      sourceType: 'PDF',
      sourceData: 'Complaint form: Device packaging integrity issue',
      extractedHazards: ['Sterility compromise', 'Package breach'],
      linkedRiskIds: ['HAZARD-PKG-004'],
      confidence: 0.88,
      processingTime: 4.2,
      warnings: ['Low confidence on hazard classification'],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 4200),
    },
  ];

  // Mock recent predictions for Risk Predictor
  const recentPredictions: RiskPrediction[] = [
    {
      id: 'pred-001',
      predictionType: 'Performance Decline',
      severity: 'Medium',
      confidence: 0.87,
      affectedMetrics: ['First Pass Yield', 'Cycle Time'],
      triggerData: [
        {
          metricId: 'fpy',
          currentValue: 94.2,
          threshold: 95.0,
          trend: 'declining',
        },
        {
          metricId: 'cycle_time',
          currentValue: 142,
          threshold: 120,
          trend: 'increasing',
        },
      ],
      recommendedActions: [
        'Investigate recent process changes',
        'Review operator training records',
        'Check equipment calibration status',
      ],
      autoGeneratedChangeControl: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 'pred-002',
      predictionType: 'Threshold Breach',
      severity: 'High',
      confidence: 0.93,
      affectedMetrics: ['NCR Rate'],
      triggerData: [
        {
          metricId: 'ncr_rate',
          currentValue: 4.8,
          threshold: 3.0,
          trend: 'increasing',
        },
      ],
      recommendedActions: [
        'Initiate root cause analysis',
        'Review recent supplier changes',
        'Trigger change control CC-2026-019',
      ],
      autoGeneratedChangeControl: true,
      changeControlId: 'CC-2026-019',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      acknowledgedBy: 'Sarah Johnson',
      acknowledgedAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  ];

  const handleRAGQuery = () => {
    // Mock RAG response
    const mockResponse: AuditRAGQuery = {
      id: `query-${Date.now()}`,
      query: ragQuery,
      userId: 'user-001',
      response: `Based on your quality system records, all 412 batches manufactured in Q4 2025 have proper UDI-DI tags recorded in the production database. The UDI compliance rate is 100% for the period, meeting ISO 13485:2016 Clause 4.2.5 requirements for unique device identification.`,
      sources: [
        '/documents/production/batch-records-q4-2025.pdf',
        '/database/udi-tracking/2025-q4.db',
        '/procedures/SOP-UDI-001-Rev-C.pdf',
      ],
      confidence: 0.96,
      isoReferences: [
        {
          standard: 'ISO 13485:2016',
          clause: '4.2.5',
          description: 'Control of Records',
        },
        {
          standard: 'EU MDR 2017/745',
          clause: 'Article 27',
          description: 'UDI system',
        },
      ],
      relatedDocuments: ['DOC-001', 'DOC-045', 'SOP-UDI-001'],
      processingTime: 2.4,
      timestamp: new Date(),
    };

    setRagResponse(mockResponse);
  };

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'Vigilance Watchman':
        return <Bot className="w-8 h-8 text-primary-600" />;
      case 'Audit-Ready RAG':
        return <Brain className="w-8 h-8 text-purple-600" />;
      case 'Risk Predictor':
        return <TrendingUp className="w-8 h-8 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: AIAgent['status']) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Running
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <Clock className="w-3 h-3" />
            Idle
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <AlertTriangle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const handleOpenSettings = (agent: AIAgent) => {
    setSettingsAgent(agent);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async (agentId: string, settings: Partial<AIAgent['configuration']>) => {
    // In a real implementation, this would save to backend
    console.log('Saving settings for agent:', agentId, settings);

    // For now, we'll just log. In production, this would update the backend
    // and refresh the agent data
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setSettingsAgent(null);
  };

  return (
    <div className="space-y-6">
      <AIAgentRunModal open={runModalOpen} onClose={() => setRunModalOpen(false)} title={agents.find(a => a.type === selectedAgent)?.name || 'AI Agent'} response={runResponse} loading={runLoading} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">
            AI Agents
          </h1>
          <p className="text-surface-600 mt-1">
            Local LLM-Powered Compliance Automation • Edge AI Deployment
          </p>
        </div>
        <button 
          onClick={() => {
            if (agents.length > 0) {
              handleOpenSettings(agents[0]);
            }
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Configure Agents
        </button>
      </div>

      {/* AI Deployment Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              Edge AI Deployment - Air-Gapped Security
            </h3>
            <p className="text-surface-700 mb-3">
              All AI agents run locally using Ollama. Patient data and trade secrets never leave your facility's network.
              HIPAA compliant • 21 CFR Part 11 compatible • ISO 27001 aligned
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-surface-700">Ollama v0.1.23</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-surface-700">Local Endpoint: http://localhost:11434</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-surface-700">Hallucination Detection: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedAgent(agent.type)}
          >
            <div className="flex items-start justify-between mb-4">
              {getAgentIcon(agent.type)}
              {getStatusBadge(agent.status)}
            </div>

            <h3 className="text-xl font-semibold text-surface-900 mb-2">
              {agent.name}
            </h3>
            <p className="text-sm text-surface-600 mb-4 line-clamp-3">
              {agent.description}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {((agent.successfulExecutions / agent.totalExecutions) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">Avg Response Time</span>
                <span className="font-semibold text-surface-900">
                  {agent.averageExecutionTime.toFixed(1)}s
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">Total Tasks</span>
                <span className="font-semibold text-surface-900">
                  {agent.totalExecutions.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAgent(agent.type)}
                className="btn-sm btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => handleOpenSettings(agent)}
                className="btn-sm btn-outline"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Details View */}
      {selectedAgent && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {getAgentIcon(selectedAgent)}
              <div>
                <h2 className="text-2xl font-semibold text-surface-900">
                  {agents.find(a => a.type === selectedAgent)?.name}
                </h2>
                <p className="text-surface-600">Agent Details & Performance Metrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  const agent = agents.find(a => a.type === selectedAgent);
                  if (!agent) return;
                  const status: any = await window.electronAPI.aiAgentStatus(agent.id);
                  const shouldToggle = status?.status !== 'running';
                  if (shouldToggle) {
                    await window.electronAPI.aiStartAgent(agent.id, 60000);
                    alert('Agent start requested');
                  } else {
                    await window.electronAPI.aiStopAgent(agent.id);
                    alert('Agent stop requested');
                  }
                }}
                className="btn-sm btn-outline"
              >
                Start/Stop
              </button>

              <button
                onClick={async () => {
                  const agent = agents.find(a => a.type === selectedAgent);
                  if (!agent) return;
                  setRunLoading(true);
                  setRunModalOpen(true);
                  setRunResponse(undefined);
                  const prompt = `${agent.configuration?.systemPrompt || ''}\n\n${testPromptText}`;
                  try {
                    const res: any = await window.electronAPI.aiRunPrompt({ model: agent.configuration?.modelName || 'mock', prompt, temperature: agent.configuration?.temperature || 0.2, maxTokens: agent.configuration?.maxTokens || 1024, timeoutMs: agent.configuration?.timeout || 15000 });
                    setRunResponse(res.output || res.error || JSON.stringify(res));
                  } catch (err) {
                    setRunResponse('Error running prompt: ' + String(err));
                  } finally {
                    setRunLoading(false);
                  }
                }}
                className="btn-sm btn-primary"
              >
                Run Test Prompt
              </button>

              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


        </div>

          {selectedAgent === 'Risk Predictor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Recent Predictions</h3>
                  <div className="space-y-3">
                    {recentPredictions.map((prediction) => (
                      <div key={prediction.id} className="p-4 bg-surface-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-surface-900">{prediction.predictionType}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prediction.severity === 'High' ? 'bg-red-100 text-red-700' :
                            prediction.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {prediction.severity}
                          </span>
                        </div>
                        <p className="text-sm text-surface-600 mb-2">
                          Affected: {prediction.affectedMetrics.join(', ')}
                        </p>
                        <div className="flex items-center justify-between text-xs text-surface-500">
                          <span>Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
                          <span>{prediction.recommendedActions.length} actions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Prediction Accuracy</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">Predictions Made</span>
                      <span className="font-semibold text-surface-900">456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">Accuracy Rate</span>
                      <span className="font-semibold text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">False Positives</span>
                      <span className="font-semibold text-surface-900">5.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">Issues Prevented</span>
                      <span className="font-semibold text-green-600">28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedAgent === 'Audit-Ready RAG' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Query History</h3>
                  <div className="space-y-3">
                    {ragResponse && (
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <p className="text-sm text-surface-900 mb-2 font-medium">Latest Query:</p>
                        <p className="text-sm text-surface-600 mb-2">"{ragResponse.query}"</p>
                        <div className="flex items-center justify-between text-xs text-surface-500">
                          <span>Confidence: {(ragResponse.confidence * 100).toFixed(0)}%</span>
                          <span>{ragResponse.processingTime.toFixed(1)}s</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Knowledge Base Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">Documents Indexed</span>
                      <span className="font-semibold text-surface-900">2,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">Queries Processed</span>
                      <span className="font-semibold text-surface-900">1,203</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">Avg Response Time</span>
                      <span className="font-semibold text-surface-900">2.4s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-600">ISO References</span>
                      <span className="font-semibold text-surface-900">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit-Ready RAG Interface */}


      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-surface-900">
            Audit-Ready RAG - Ask Your Quality System
          </h3>
        </div>

        <p className="text-sm text-surface-600 mb-4">
          Ask questions about ISO compliance, batch records, validation status, or any quality system documentation.
        </p>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="e.g., Are we compliant with ISO 13485:2016 Clause 7.5.8?"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRAGQuery()}
            className="flex-1 px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleRAGQuery}
            className="btn-primary flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Query
          </button>
        </div>

        {ragResponse && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-3 mb-3">
              <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-surface-900 mb-3">{ragResponse.response}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-surface-700">
                      Confidence: {(ragResponse.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-surface-500">•</span>
                    <span className="text-surface-600">
                      {ragResponse.processingTime}s processing time
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-surface-700 mb-1">
                      ISO References:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ragResponse.isoReferences.map((ref, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {ref.standard} {ref.clause}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-surface-700 mb-1">
                      Sources:
                    </p>
                    <div className="space-y-1">
                      {ragResponse.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-surface-600 flex items-center gap-2"
                        >
                          <FileSearch className="w-3 h-3" />
                          {source}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vigilance Watchman Recent Tasks */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-surface-900">
              Vigilance Watchman - Recent Tasks
            </h3>
          </div>

          <div className="space-y-3">
            {recentVigilanceTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-surface-50 rounded-lg border border-surface-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-surface-700">
                    {task.sourceType}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-surface-900 mb-2">{task.sourceData}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {task.extractedHazards.map((hazard, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                    >
                      {hazard}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-surface-600">
                  <span>Confidence: {(task.confidence * 100).toFixed(0)}%</span>
                  {task.generatedChangeControlId && (
                    <span className="font-medium text-primary-600">
                      → {task.generatedChangeControlId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Predictor Recent Predictions */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-surface-900">
              Risk Predictor - Recent Predictions
            </h3>
          </div>

          <div className="space-y-3">
            {recentPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className={`p-3 rounded-lg border-2 ${
                  prediction.severity === 'High'
                    ? 'bg-red-50 border-red-300'
                    : prediction.severity === 'Medium'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-blue-50 border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-surface-900">
                    {prediction.predictionType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      prediction.severity === 'High'
                        ? 'bg-red-100 text-red-700'
                        : prediction.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {prediction.severity}
                  </span>
                </div>
                <div className="space-y-1 mb-2">
                  {prediction.triggerData.map((data, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-medium">{data.metricId}:</span>{' '}
                      {data.currentValue} (threshold: {data.threshold}){' '}
                      <span
                        className={
                          data.trend === 'increasing'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }
                      >
                        ↑ {data.trend}
                      </span>
                    </div>
                  ))}
                </div>
                {prediction.autoGeneratedChangeControl && (
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-3 h-3 text-orange-600" />
                    <span className="font-medium text-orange-600">
                      Auto-generated: {prediction.changeControlId}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Agent Settings Modal */}
      {showSettingsModal && (
        <AIAgentSettingsModal
          agent={settingsAgent}
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default AIAgentsView;
