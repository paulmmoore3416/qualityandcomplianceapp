import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { AIAgent } from '../../types';

interface AIAgentSettingsModalProps {
  agent: AIAgent | null;
  onClose: () => void;
  onSave: (agentId: string, settings: Partial<AIAgent['configuration']>) => void;
}

export const AIAgentSettingsModal: React.FC<AIAgentSettingsModalProps> = ({
  agent,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<Partial<AIAgent['configuration']>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (agent?.configuration) {
      setSettings(agent.configuration);
      setHasChanges(false);
    }
  }, [agent]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!agent) return;

    setIsSaving(true);
    try {
      await onSave(agent.id, settings);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (agent?.configuration) {
      setSettings(agent.configuration);
      setHasChanges(false);
    }
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              {agent.type === 'Vigilance Watchman' && <span className="text-primary-600 font-bold">👁️</span>}
              {agent.type === 'Audit-Ready RAG' && <span className="text-purple-600 font-bold">🧠</span>}
              {agent.type === 'Risk Predictor' && <span className="text-orange-600 font-bold">📈</span>}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-surface-900">{agent.name} Settings</h2>
              <p className="text-sm text-surface-600">Version {agent.version}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">General Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Agent Status
                </label>
                <select
                  value={settings.enabled ? 'enabled' : 'disabled'}
                  onChange={(e) => handleSettingChange('enabled', e.target.value === 'enabled')}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Auto Run
                </label>
                <select
                  value={settings.autoRun ? 'enabled' : 'disabled'}
                  onChange={(e) => handleSettingChange('autoRun', e.target.value === 'enabled')}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  value={settings.schedule || ''}
                  onChange={(e) => handleSettingChange('schedule', e.target.value)}
                  placeholder="0 */6 * * *"
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-surface-500">Format: minute hour day month day-of-week</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Max Concurrent Tasks
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxConcurrentTasks || 1}
                  onChange={(e) => handleSettingChange('maxConcurrentTasks', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Performance & Reliability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={(settings.timeout || 60000) / 1000}
                  onChange={(e) => handleSettingChange('timeout', parseInt(e.target.value) * 1000)}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.retryAttempts || 0}
                  onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* AI Model Settings */}
          <div>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">AI Model Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Model Name
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={settings.modelName || ''}
                    onChange={(e) => handleSettingChange('modelName', e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select local model...</option>
                  </select>
                  <button
                    onClick={async () => {
                      // open model picker (fetch available models)
                      try {
                        const models: any[] = await window.electronAPI.aiListModels();
                        const names = models.map((m) => m.name).filter(Boolean);
                        const pick = window.prompt('Available models:\n' + names.join('\n') + '\n\nEnter model name to select/pull:');
                        if (pick) {
                          handleSettingChange('modelName', pick);
                          const shouldPull = window.confirm('Pull model "' + pick + '" now? (This may download several GB)');
                          if (shouldPull) {
                            const res: any = await window.electronAPI.aiPullModel(pick);
                            if (!res.success) alert('Model pull failed: ' + (res.message || 'unknown'));
                            else alert('Model pulled successfully');
                          }
                        }
                      } catch (err) {
                        alert('Error listing models or interacting with Ollama.');
                      }
                    }}
                    className="btn-ghost"
                  >
                    Pull
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.01"
                  value={settings.temperature || 0.7}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-surface-500">Lower = more focused, Higher = more creative</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="32768"
                  value={settings.maxTokens || 4096}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Deployment Type
                </label>
                <select
                  value={settings.isLocalDeployment ? 'local' : 'cloud'}
                  onChange={(e) => handleSettingChange('isLocalDeployment', e.target.value === 'local')}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="local">Local (Ollama/Ollamafile)</option>
                  <option value="cloud">Cloud API</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-surface-700">
                API Endpoint / Base URL
              </label>
              <input
                type="url"
                value={settings.endpoint || ''}
                onChange={(e) => handleSettingChange('endpoint', e.target.value)}
                placeholder="http://localhost:11434 or https://api.openai.com/v1"
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Agent-Specific Settings */}
          {agent.type === 'Vigilance Watchman' && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Vigilance Watchman Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="auto-cc"
                    checked={settings.autoGenerateChangeControl || false}
                    onChange={(e) => handleSettingChange('autoGenerateChangeControl', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="auto-cc" className="text-sm font-medium text-surface-700">
                    Auto-generate Change Control requests for critical hazards
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-700">
                    Risk Threshold for Auto-CC
                  </label>
                  <select
                    value={settings.riskThreshold || 'high'}
                    onChange={(e) => handleSettingChange('riskThreshold', e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="critical">Critical Only</option>
                    <option value="high">High and Critical</option>
                    <option value="medium">Medium and Above</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {agent.type === 'Risk Predictor' && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Risk Predictor Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-700">
                    Prediction Sensitivity
                  </label>
                  <select
                    value={settings.predictionSensitivity || 'medium'}
                    onChange={(e) => handleSettingChange('predictionSensitivity', e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low (Fewer false positives)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Catch more issues)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-700">
                    Lookback Period (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.lookbackHours || 24}
                    onChange={(e) => handleSettingChange('lookbackHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {agent.type === 'Audit-Ready RAG' && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-4">RAG System Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-700">
                    Knowledge Base Path
                  </label>
                  <input
                    type="text"
                    value={settings.knowledgeBasePath || '/documents'}
                    onChange={(e) => handleSettingChange('knowledgeBasePath', e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-700">
                    Max Context Length
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    value={settings.maxContextLength || 4000}
                    onChange={(e) => handleSettingChange('maxContextLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="include-audit-trail"
                    checked={settings.includeAuditTrail || true}
                    onChange={(e) => handleSettingChange('includeAuditTrail', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="include-audit-trail" className="text-sm font-medium text-surface-700">
                    Include audit trail references in responses
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* System Prompt */}
          <div>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">System Prompt</h3>
            <div className="space-y-2">
              <textarea
                value={settings.systemPrompt || ''}
                onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Enter the system prompt that defines the AI agent's behavior and role..."
              />
              <p className="text-xs text-surface-500">
                This prompt defines the AI agent's role, behavior, and response guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-surface-200">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};