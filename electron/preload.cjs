const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Data operations
  readEvents: () => ipcRenderer.invoke('read-events'),
  readOptimizedEvents: () => ipcRenderer.invoke('read-optimized-events'),
  writeEvents: (events) => ipcRenderer.invoke('write-events', events),
  writeOptimizedEvents: (optimizedEvents) => ipcRenderer.invoke('write-optimized-events', optimizedEvents),
  
  // Backup operations
  createBackup: () => ipcRenderer.invoke('create-backup'),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  openDataFolder: () => ipcRenderer.invoke('open-data-folder'),
  
  // Menu event listeners
  onMenuNewEvent: (callback) => ipcRenderer.on('menu-new-event', callback),
  onMenuImportEvents: (callback) => ipcRenderer.on('menu-import-events', callback),
  onMenuExportEvents: (callback) => ipcRenderer.on('menu-export-events', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isElectron: true,

  // Logging from renderer
  log: (level, ...args) => ipcRenderer.invoke('renderer-log', level, ...args),
});
