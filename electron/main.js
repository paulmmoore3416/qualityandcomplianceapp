"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
function createWindow() {
    const mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC handlers for data persistence
const dataPath = path.join(electron_1.app.getPath('userData'), 'compliance-data');
electron_1.ipcMain.handle('save-data', async (_event, key, data) => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }
        fs.writeFileSync(path.join(dataPath, `${key}.json`), JSON.stringify(data, null, 2));
        return { success: true };
    }
    catch (error) {
        return { success: false, error: String(error) };
    }
});
electron_1.ipcMain.handle('load-data', async (_event, key) => {
    try {
        const filePath = path.join(dataPath, `${key}.json`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return { success: true, data: JSON.parse(data) };
        }
        return { success: true, data: null };
    }
    catch (error) {
        return { success: false, error: String(error) };
    }
});
electron_1.ipcMain.handle('export-report', async (_event, content, filename) => {
    try {
        const exportPath = path.join(electron_1.app.getPath('documents'), 'MedTech Reports');
        if (!fs.existsSync(exportPath)) {
            fs.mkdirSync(exportPath, { recursive: true });
        }
        fs.writeFileSync(path.join(exportPath, filename), content);
        return { success: true, path: path.join(exportPath, filename) };
    }
    catch (error) {
        return { success: false, error: String(error) };
    }
});
