# AI Integration Reference Documentation

## Overview
This document provides comprehensive documentation for the AI agent integration in the MedTech Compliance Suite. It covers the complete architecture, implementation details, API contracts, and maintenance procedures for the AI backend components.

## Architecture Overview

### Core Components
- **Frontend**: React/TypeScript UI with Electron IPC communication
- **Backend**: Node.js Electron main process with Ollama service wrappers
- **AI Engine**: Ollama local LLM hosting with medical device compliance models
- **IPC Bridge**: Secure communication between frontend and backend services

### File Structure
```
electron/
├── main.ts              # Electron main process with IPC handlers
├── preload.ts           # IPC API exposure to renderer
└── ai-service.ts        # Ollama service wrappers and utilities

src/
├── components/
│   ├── views/
│   │   └── AIAgentsView.tsx          # Main AI agents management UI
│   └── modals/
│       ├── AIAgentRunModal.tsx       # AI response display modal
│       └── AIAgentSettingsModal.tsx  # Agent configuration modal
├── types/
│   └── index.ts                      # TypeScript type definitions
└── stores/
    └── app-store.ts                  # Application state management
```

## Backend Implementation

### AI Service Layer (`electron/ai-service.ts`)

#### Core Functions
```typescript
// Check if Ollama is installed and accessible
isOllamaInstalled(): Promise<boolean>

// List available Ollama models
listOllamaModels(): Promise<string[]>

// Download and install a specific model
pullOllamaModel(modelName: string): Promise<void>

// Execute a prompt against a model
runOllamaPrompt(params: {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{output: string} | {error: string}>
```

#### Mock Fallback
When Ollama is unavailable, the service provides mock responses for development:
```typescript
mockRunPrompt(params: PromptParams): Promise<{output: string}>
```

### IPC Handlers (`electron/main.ts`)

#### AI-Related IPC Channels
- `ai-is-installed`: Check Ollama installation status
- `ai-list-models`: Retrieve available models
- `ai-pull-model`: Download specific model
- `ai-run-prompt`: Execute AI prompt
- `ai-start-agent`: Start background agent process
- `ai-stop-agent`: Stop background agent process
- `ai-agent-status`: Get agent runtime status

#### Agent Runtime Management
```typescript
interface AgentRuntime {
  id: string;
  status: 'running' | 'stopped' | 'error';
  startTime?: Date;
  intervalId?: NodeJS.Timeout;
  config: AgentConfig;
}
```

### Preload API (`electron/preload.ts`)

#### Exposed APIs
```typescript
window.electronAPI = {
  // AI operations
  aiIsInstalled: () => ipcRenderer.invoke('ai-is-installed'),
  aiListModels: () => ipcRenderer.invoke('ai-list-models'),
  aiPullModel: (model: string) => ipcRenderer.invoke('ai-pull-model', model),
  aiRunPrompt: (params: PromptParams) => ipcRenderer.invoke('ai-run-prompt', params),
  aiStartAgent: (id: string, interval: number) => ipcRenderer.invoke('ai-start-agent', id, interval),
  aiStopAgent: (id: string) => ipcRenderer.invoke('ai-stop-agent', id),
  aiAgentStatus: (id: string) => ipcRenderer.invoke('ai-agent-status', id),
  // ... other APIs
}
```

## Frontend Implementation

### AI Agents View (`src/components/views/AIAgentsView.tsx`)

#### State Management
```typescript
const [agents, setAgents] = useState<Agent[]>(defaultAgents);
const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
const [runLoading, setRunLoading] = useState(false);
const [runResponse, setRunResponse] = useState<string | undefined>();
const [runModalOpen, setRunModalOpen] = useState(false);
```

#### Agent Types
```typescript
interface Agent {
  id: string;
  type: 'Risk Predictor' | 'Audit-Ready RAG' | 'Compliance Coach' | 'Vigilance Analyzer';
  name: string;
  description: string;
  status: 'idle' | 'running' | 'error';
  configuration: AgentConfig;
  totalExecutions: number;
  successfulExecutions: number;
  averageExecutionTime: number;
}
```

#### Key Functions
- `handleOpenSettings(agent)`: Open agent configuration modal
- `handleSaveSettings(config)`: Persist agent settings and start/stop agent
- `handleRunTestPrompt()`: Execute test prompt and display results

### Agent Configuration Modal (`src/components/modals/AIAgentSettingsModal.tsx`)

#### Features
- Model selection from available Ollama models
- Model download/installation
- Parameter configuration (temperature, max tokens, timeout)
- System prompt customization
- Agent scheduling configuration

## Type Definitions

### Core Types (`src/types/index.ts`)
```typescript
interface ElectronAPI {
  // AI APIs
  aiIsInstalled: () => Promise<boolean>;
  aiListModels: () => Promise<string[]>;
  aiPullModel: (model: string) => Promise<void>;
  aiRunPrompt: (params: PromptParams) => Promise<any>;
  aiStartAgent: (id: string, interval: number) => Promise<void>;
  aiStopAgent: (id: string) => Promise<void>;
  aiAgentStatus: (id: string) => Promise<any>;
}

interface PromptParams {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

interface AgentConfig {
  modelName: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  schedule?: {
    enabled: boolean;
    interval: number; // milliseconds
  };
}
```

## Installation & Setup

### Prerequisites
1. Node.js 18+ and npm
2. Ollama installed and running
3. Medical device compliance LLMs (recommended models below)

### Recommended Ollama Models
```bash
# Medical Device Compliance Models
ollama pull llama2:13b-chat         # General compliance analysis
ollama pull mistral:7b-instruct     # Regulatory guidance
ollama pull codellama:13b-instruct  # Technical documentation analysis
ollama pull llama2:7b-chat          # Fallback model
```

### Installation Steps
1. **Install Ollama**:
   ```bash
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama service**:
   ```bash
   ollama serve
   ```

3. **Download required models**:
   ```bash
   ollama pull llama2:7b-chat
   ollama pull mistral:7b-instruct
   ```

4. **Install application dependencies**:
   ```bash
   npm install
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## API Contracts

### IPC Message Format
All IPC communications follow this pattern:
```typescript
// Request
ipcRenderer.invoke('channel-name', ...args)

// Response
Promise<SuccessResult | ErrorResult>
```

### Error Handling
```typescript
interface ErrorResult {
  error: string;
  details?: any;
}

interface SuccessResult {
  output?: string;
  data?: any;
  status?: string;
}
```

## Agent Types & Capabilities

### 1. Risk Predictor
**Purpose**: Proactive risk identification and mitigation recommendations
**Key Features**:
- Real-time risk assessment
- Predictive analytics on compliance metrics
- Automated change control suggestions
- Confidence scoring and action prioritization

### 2. Audit-Ready RAG
**Purpose**: Intelligent document analysis and audit preparation
**Key Features**:
- Retrieval-augmented generation for compliance documents
- Query processing against regulatory requirements
- Automated gap analysis
- Audit trail generation

### 3. Compliance Coach
**Purpose**: Interactive compliance guidance and training
**Key Features**:
- Contextual compliance advice
- Regulatory interpretation assistance
- Training content generation
- Best practice recommendations

### 4. Vigilance Analyzer
**Purpose**: Post-market surveillance and adverse event analysis
**Key Features**:
- Vigilance report processing
- Trend analysis and pattern recognition
- Regulatory reporting assistance
- Risk signal detection

## Maintenance & Updates

### Adding New Agent Types
1. **Define agent configuration** in `defaultAgents` array
2. **Add agent-specific UI components** in `AIAgentsView.tsx`
3. **Implement backend logic** if required
4. **Update type definitions**
5. **Test integration** with IPC handlers

### Model Management
```typescript
// Check available models
const models = await window.electronAPI.aiListModels();

// Download new model
await window.electronAPI.aiPullModel('new-model-name');

// Update agent configuration
agent.configuration.modelName = 'new-model-name';
```

### Performance Monitoring
- Track agent execution times
- Monitor success rates
- Log error patterns
- Optimize prompt engineering

### Security Considerations
- All AI operations run locally (no external API calls)
- IPC communication is secured by Electron's context isolation
- No sensitive data transmitted externally
- Model outputs validated before display

## Troubleshooting

### Common Issues

#### Ollama Not Found
**Symptoms**: `ai-is-installed` returns false
**Solution**:
```bash
# Check if Ollama is installed
which ollama

# Install if missing
curl -fsSL https://ollama.ai/install.sh | sh

# Start service
ollama serve
```

#### Model Download Failures
**Symptoms**: `ai-pull-model` throws error
**Solution**:
```bash
# Check network connectivity
ping huggingface.co

# Manual download
ollama pull <model-name>

# Check disk space
df -h
```

#### IPC Communication Errors
**Symptoms**: `window.electronAPI is undefined`
**Solution**:
- Ensure preload script is loaded
- Check Electron main process is running
- Verify IPC channel names match

#### TypeScript Compilation Errors
**Symptoms**: Build fails with type errors
**Solution**:
- Check type definitions in `src/types/index.ts`
- Ensure all IPC handlers are properly typed
- Validate component prop interfaces

### Debug Mode
Enable debug logging:
```typescript
// In electron/main.ts
console.log('AI Service:', result);

// In renderer process
console.log('IPC Response:', response);
```

## Future Enhancements

### Planned Features
1. **Multi-model support**: Simultaneous use of different models
2. **Agent orchestration**: Complex workflows combining multiple agents
3. **Fine-tuning**: Custom model training on compliance data
4. **Integration APIs**: REST endpoints for external systems
5. **Advanced analytics**: Performance metrics and optimization

### Extension Points
- Custom agent development framework
- Plugin architecture for third-party models
- Integration with external compliance databases
- Automated regulatory update monitoring

## Version History

### v1.0.0 - Initial Implementation
- Basic Ollama integration
- Four core agent types
- IPC communication bridge
- UI components for agent management
- Mock fallback for development

### Future Versions
- Enhanced error handling
- Performance optimizations
- Additional agent types
- Advanced configuration options

---

## Contact & Support

For technical issues or feature requests:
- Check this documentation first
- Review error logs in development console
- Ensure Ollama service is running
- Verify model availability

This documentation should be updated with each major change to maintain accuracy and usefulness for future development.</content>
<parameter name="filePath">/home/paul/Documents/qualityandcomplianceapp/AISharedReference.md