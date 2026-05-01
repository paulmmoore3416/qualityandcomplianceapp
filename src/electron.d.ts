export interface ElectronAPI {
  saveData: (key: string, data: any) => Promise<{ success: boolean; error?: string }>;
  loadData: (key: string) => Promise<{ success: boolean; data: any; error?: string }>;
  exportReport: (content: string, filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  
  // AI / Ollama integration
  aiIsInstalled: () => Promise<boolean>;
  aiListModels: () => Promise<{ name: string }[]>;
  aiPullModel: (modelName: string) => Promise<{ success: boolean; message?: string }>;
  aiRunPrompt: (opts: { model: string; prompt: string; temperature?: number; maxTokens?: number; timeoutMs?: number }) => Promise<{ success: boolean; output?: string; error?: string; mocked?: boolean }>;
  aiStartAgent: (agentId: string, scheduleMs: number) => Promise<{ success: boolean; error?: string }>;
  aiStopAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>;
  aiAgentStatus: (agentId: string) => Promise<{ status: 'running' | 'stopped' }>;
  aiAgentLogs: (agentId: string) => Promise<string[]>;
  aiAgentCommand: (agentId: string, command: string) => Promise<{ success: boolean; output: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
