import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (key: string, data: unknown) => ipcRenderer.invoke('save-data', key, data),
  loadData: (key: string) => ipcRenderer.invoke('load-data', key),
  exportReport: (content: string, filename: string) => ipcRenderer.invoke('export-report', content, filename),

  // AI / Ollama integration
  aiIsInstalled: () => ipcRenderer.invoke('ai-is-installed'),
  aiListModels: () => ipcRenderer.invoke('ai-list-models'),
  aiPullModel: (modelName: string) => ipcRenderer.invoke('ai-pull-model', modelName),
  aiRunPrompt: (opts: { model: string; prompt: string; temperature?: number; maxTokens?: number; timeoutMs?: number }) => ipcRenderer.invoke('ai-run-prompt', opts),
  aiStartAgent: (agentId: string, scheduleMs: number) => ipcRenderer.invoke('ai-start-agent', agentId, scheduleMs),
  aiStopAgent: (agentId: string) => ipcRenderer.invoke('ai-stop-agent', agentId),
  aiAgentStatus: (agentId: string) => ipcRenderer.invoke('ai-agent-status', agentId),
});
