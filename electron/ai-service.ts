import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ModelInfo {
  name: string;
  size?: string;
}

export async function isOllamaInstalled(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('ollama --version');
    return stdout && stdout.length > 0;
  } catch (err) {
    return false;
  }
}

export async function listOllamaModels(): Promise<ModelInfo[]> {
  // Try `ollama list` or `ollama ls` depending on version
  try {
    const { stdout } = await execAsync('ollama list --json');
    // Some versions return json array
    try {
      const parsed = JSON.parse(stdout);
      if (Array.isArray(parsed)) {
        return parsed.map((m: any) => ({ name: m.name || m.model || m }));
      }
    } catch (_) {
      // Fallback to parse lines
      return stdout
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
    }
  } catch (err) {
    // Try simple ls
    try {
      const { stdout } = await execAsync('ollama ls');
      return stdout
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
    } catch (err2) {
      // No Ollama or command failed
      return [];
    }
  }
}

export async function pullOllamaModel(modelName: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Use `ollama pull <model>` if available
    await execAsync(`ollama pull ${modelName}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || String(err) };
  }
}

export async function runOllamaPrompt(options: { model: string; prompt: string; temperature?: number; maxTokens?: number; timeoutMs?: number }): Promise<{ success: boolean; output?: string; error?: string }> {
  const { model, prompt, temperature = 0.2, maxTokens = 1024, timeoutMs = 30000 } = options;
  
  // SECURITY: Validate model name to prevent command injection
  if (!/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_.-]+$/.test(model)) {
    return { success: false, error: 'Invalid model name format. Must be name:tag (e.g., llama2:13b)' };
  }
  
  // SECURITY: Validate temperature and maxTokens
  if (temperature < 0 || temperature > 2) {
    return { success: false, error: 'Temperature must be between 0 and 2' };
  }
  
  if (maxTokens < 1 || maxTokens > 32000) {
    return { success: false, error: 'Max tokens must be between 1 and 32000' };
  }
  
  // Use spawn instead of exec to avoid shell injection
  return new Promise((resolve) => {
    const args = ['run', model];
    
    const child = spawn('ollama', args, {
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data: any) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data: any) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code: number) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(output);
          if (typeof parsed === 'string') {
            resolve({ success: true, output: parsed });
          } else if (Array.isArray(parsed)) {
            resolve({ success: true, output: parsed.map((p) => (p.output || JSON.stringify(p))).join('\n') });
          } else if (parsed && (parsed.output || parsed.text)) {
            resolve({ success: true, output: parsed.output || parsed.text });
          } else {
            resolve({ success: true, output: String(output) });
          }
        } catch (_) {
          resolve({ success: true, output });
        }
      } else {
        resolve({ success: false, error: errorOutput || `Process exited with code ${code}` });
      }
    });
    
    child.on('error', (err: Error) => {
      resolve({ success: false, error: err.message });
    });
    
    // SECURITY: Send prompt via stdin to avoid command line injection
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// Simple mock fallback for dev when Ollama not available
export async function mockRunPrompt(prompt: string): Promise<string> {
  // A basic deterministic echo-style response with metadata
  return `MockLLM Response for prompt:\n${prompt}\n\n[Confidence: 0.95]\n[Source: local-mock]`;
}
