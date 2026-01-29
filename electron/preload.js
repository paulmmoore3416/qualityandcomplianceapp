"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    saveData: (key, data) => electron_1.ipcRenderer.invoke('save-data', key, data),
    loadData: (key) => electron_1.ipcRenderer.invoke('load-data', key),
    exportReport: (content, filename) => electron_1.ipcRenderer.invoke('export-report', content, filename),
});
