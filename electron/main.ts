import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    title: 'MedTech Compliance Suite',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f8fafc',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for data persistence
const dataPath = path.join(app.getPath('userData'), 'compliance-data');

ipcMain.handle('save-data', async (_event, key: string, data: unknown) => {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dataPath, `${key}.json`),
      JSON.stringify(data, null, 2)
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('load-data', async (_event, key: string) => {
  try {
    const filePath = path.join(dataPath, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('export-report', async (_event, content: string, filename: string) => {
  try {
    const exportPath = path.join(app.getPath('documents'), 'MedTech Reports');
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }
    fs.writeFileSync(path.join(exportPath, filename), content);
    return { success: true, path: path.join(exportPath, filename) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// AI / Ollama related IPC handlers
import { isOllamaInstalled, listOllamaModels, pullOllamaModel, runOllamaPrompt, mockRunPrompt } from './ai-service';

ipcMain.handle('ai-is-installed', async () => {
  return await isOllamaInstalled();
});

ipcMain.handle('ai-list-models', async () => {
  const models = await listOllamaModels();
  return models;
});

ipcMain.handle('ai-pull-model', async (_event, modelName: string) => {
  const res = await pullOllamaModel(modelName);
  return res;
});

ipcMain.handle('ai-run-prompt', async (_event, opts: any) => {
  const installed = await isOllamaInstalled();
  if (!installed) {
    // Use mock response
    const out = await mockRunPrompt(opts.prompt || '');
    return { success: true, output: out, mocked: true };
  }

  const res = await runOllamaPrompt(opts);
  return res;
});

// Simple in-memory agent manager for background tasks (mocking behavior)
interface AgentRuntime {
  id: string;
  interval?: NodeJS.Timer;
  status: 'running' | 'stopped';
}
const agentRuntimes: Record<string, AgentRuntime> = {};

ipcMain.handle('ai-start-agent', async (_event, agentId: string, scheduleMs: number) => {
  if (agentRuntimes[agentId]?.status === 'running') return { success: true };
  const rt: AgentRuntime = { id: agentId, status: 'running' };
  rt.interval = setInterval(() => {
    // In a real implementation, schedule tasks here
    console.log(`Agent ${agentId} executing scheduled run`);
  }, scheduleMs || 60000);
  agentRuntimes[agentId] = rt;
  return { success: true };
});

ipcMain.handle('ai-stop-agent', async (_event, agentId: string) => {
  const rt = agentRuntimes[agentId];
  if (rt?.interval) {
    clearInterval(rt.interval);
  }
  agentRuntimes[agentId] = { id: agentId, status: 'stopped' };
  return { success: true };
});

ipcMain.handle('ai-agent-status', async (_event, agentId: string) => {
  const rt = agentRuntimes[agentId];
  return { status: rt?.status ?? 'stopped' };
});
