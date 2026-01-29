import { exec } from 'child_process';
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
  const { model, prompt, temperature = 0.2, maxTokens = 1024 } = options;
  // For portability, use `ollama run` which prints response to stdout
  // Use --json on newer versions if available
  try {
    // Prepare command, ensure prompt is passed safely by using --prompt and quoting
    const cmd = `ollama run ${model} --json --prompt ${JSON.stringify(prompt)} --temp ${temperature} --max-tokens ${maxTokens}`;
    const { stdout } = await execAsync(cmd, { timeout: (options.timeoutMs || 30000) });

    // Parse json if possible
    try {
      const parsed = JSON.parse(stdout);
      // parsed could be { output: '...' } or array
      if (typeof parsed === 'string') return { success: true, output: parsed };
      if (Array.isArray(parsed)) return { success: true, output: parsed.map((p) => (p.output || JSON.stringify(p))).join('\n') };
      if (parsed && (parsed.output || parsed.text)) return { success: true, output: parsed.output || parsed.text };
      return { success: true, output: String(stdout) };
    } catch (_) {
      return { success: true, output: stdout };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Simple mock fallback for dev when Ollama not available
export async function mockRunPrompt(prompt: string): Promise<string> {
  // A basic deterministic echo-style response with metadata
  return `MockLLM Response for prompt:\n${prompt}\n\n[Confidence: 0.95]\n[Source: local-mock]`;
}
