import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class ComplianceAgentService {
  private static instance: ComplianceAgentService;
  private process: ChildProcess | null = null;
  private isStopping: boolean = false;
  private logs: string[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  public static getInstance(): ComplianceAgentService {
    if (!ComplianceAgentService.instance) {
      ComplianceAgentService.instance = new ComplianceAgentService();
    }
    return ComplianceAgentService.instance;
  }

  private addLog(message: string) {
    this.logs.push(`${new Date().toISOString()} - ${message}`);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  public getLogs(): string[] {
    return this.logs;
  }

  public async start(): Promise<{ success: boolean; error?: string }> {
    if (this.process) {
      return { success: true };
    }

    try {
      const agentDir = path.join(process.cwd(), 'compliance-agent');
      const mainPy = path.join(agentDir, 'main.py');

      if (!fs.existsSync(mainPy)) {
        return { success: false, error: `Compliance agent main.py not found at ${mainPy}` };
      }

      this.addLog('Starting Compliance Agent...');
      this.process = spawn('python3', [mainPy], {
        cwd: agentDir,
        stdio: 'pipe',
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });

      this.process.stdout?.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) {
          console.log(`[ComplianceAgent]: ${msg}`);
          this.addLog(msg);
        }
      });

      this.process.stderr?.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) {
          console.error(`[ComplianceAgent ERROR]: ${msg}`);
          this.addLog(`ERROR: ${msg}`);
        }
      });

      this.process.on('close', (code) => {
        const msg = `Compliance Agent process exited with code ${code}`;
        console.log(msg);
        this.addLog(msg);
        this.process = null;
      });

      return { success: true };
    } catch (err) {
      const errorMsg = String(err);
      this.addLog(`FATAL ERROR: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  public async stop(): Promise<{ success: boolean; error?: string }> {
    if (!this.process) {
      return { success: true };
    }

    this.isStopping = true;
    this.addLog('Stopping Compliance Agent...');
    return new Promise((resolve) => {
      this.process?.on('close', () => {
        this.isStopping = false;
        resolve({ success: true });
      });

      this.process?.kill('SIGTERM');

      setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL');
          this.isStopping = false;
          resolve({ success: true });
        }
      }, 5000);
    });
  }

  public getStatus(): 'running' | 'stopped' {
    return this.process ? 'running' : 'stopped';
  }

  public async runCommand(command: string): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      const agentDir = path.join(process.cwd(), 'compliance-agent');
      this.addLog(`Running command: make ${command}`);
      
      const child = spawn('make', [command], {
        cwd: agentDir,
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.addLog(`Command 'make ${command}' completed successfully`);
          resolve({ success: true, output });
        } else {
          this.addLog(`Command 'make ${command}' failed with code ${code}`);
          resolve({ success: false, output, error: error || `Exit code ${code}` });
        }
      });
    });
  }
}
