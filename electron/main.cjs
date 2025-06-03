const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const electronLog = require('electron-log');

// Keep a global reference of the window object
let mainWindow;
let isDev = false;

// Set up data directory
const userDataPath = app.getPath('userData');
const dataDir = path.join(userDataPath, 'data');
const eventsFile = path.join(dataDir, 'events.json');
const optimizedEventsFile = path.join(dataDir, 'events-optimized.json');
const configFile = path.join(dataDir, 'config.json');
const backupDir = path.join(dataDir, 'backups');

// --- electron-log integration ---
electronLog.transports.file.level = 'info'; // Log info and above to file
// Optional: also log to console in dev mode
if (process.env.NODE_ENV === 'development') {
  electronLog.transports.console.level = 'info';
}
// Replace log function to use electron-log
function log(level, ...args) {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ');
  electronLog[level](msg);
}

// Log unhandled errors globally
process.on('uncaughtException', (err) => {
  log('error', 'Uncaught Exception:', err.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled Rejection:', reason);
});

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });
    log('info', 'Data directory ensured at:', dataDir);
  } catch (error) {
    log('error', 'Error creating data directory:', error);
  }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    // Copy default events if they don't exist
    if (!existsSync(eventsFile)) {
      const defaultEventsPath = path.join(__dirname, '..', 'src', 'data', 'events.json');
      if (existsSync(defaultEventsPath)) {
        const defaultEvents = await fs.readFile(defaultEventsPath, 'utf8');
        await fs.writeFile(eventsFile, defaultEvents);
        log('info', 'Initialized events.json from default');
      } else {
        // Create empty events array if no default exists
        await fs.writeFile(eventsFile, JSON.stringify([], null, 2));
        log('info', 'Created empty events.json');
      }
    }

    // Copy default optimized events if they don't exist
    if (!existsSync(optimizedEventsFile)) {
      const defaultOptimizedPath = path.join(__dirname, '..', 'src', 'data', 'events-optimized.json');
      if (existsSync(defaultOptimizedPath)) {
        const defaultOptimized = await fs.readFile(defaultOptimizedPath, 'utf8');
        await fs.writeFile(optimizedEventsFile, defaultOptimized);
        log('info', 'Initialized events-optimized.json from default');
      } else {
        // Create empty optimized events structure
        const emptyOptimized = {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          events: []
        };
        await fs.writeFile(optimizedEventsFile, JSON.stringify(emptyOptimized, null, 2));
        log('info', 'Created empty events-optimized.json');
      }
    }

    // Initialize config if it doesn't exist
    if (!existsSync(configFile)) {
      const defaultConfig = {
        version: "1.0.0",
        theme: "light",
        autoBackup: true,
        maxBackups: 10
      };
      await fs.writeFile(configFile, JSON.stringify(defaultConfig, null, 2));
      log('info', 'Created default config.json');
    }
  } catch (error) {
    log('error', 'Error initializing data files:', error);
  }
}

// Create backup of current data
async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
    const backup = {
      timestamp: new Date().toISOString(),
      events: existsSync(eventsFile) ? JSON.parse(await fs.readFile(eventsFile, 'utf8')) : [],
      optimizedEvents: existsSync(optimizedEventsFile) ? JSON.parse(await fs.readFile(optimizedEventsFile, 'utf8')) : { events: [] },
      config: existsSync(configFile) ? JSON.parse(await fs.readFile(configFile, 'utf8')) : {}
    };
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    log('info', 'Backup created at:', backupPath);
    // Clean up old backups (keep last 10)
    await cleanOldBackups();
    return backupPath;
  } catch (error) {
    log('error', 'Error creating backup:', error);
    throw error;
  }
}

// Clean up old backups
async function cleanOldBackups() {
  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.stat(path.join(backupDir, file)).then(stats => stats.mtime)
      }));
    // Resolve all stat promises
    const backupsWithTime = await Promise.all(
      backupFiles.map(async (backup) => ({
        ...backup,
        time: await backup.time
      }))
    );
    // Sort by modification time (newest first)
    backupsWithTime.sort((a, b) => b.time - a.time);
    // Delete old backups (keep only latest 10)
    if (backupsWithTime.length > 10) {
      const toDelete = backupsWithTime.slice(10);
      for (const backup of toDelete) {
        await fs.unlink(backup.path);
        log('info', 'Deleted old backup:', backup.name);
      }
    }
  } catch (error) {
    log('error', 'Error cleaning old backups:', error);
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });
  log('info', 'BrowserWindow created');
  // Set app icon
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.icns');
    if (existsSync(iconPath)) {
      mainWindow.setIcon(iconPath);
      log('info', 'App icon set:', iconPath);
    }
  }
  // Load the app
  if (isDev) {
    log('info', 'Loading app in development mode');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    log('info', 'Loading app from file:', path.join(__dirname, '..', 'dist', 'index.html'));
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    log('info', 'Main window ready to show');
    mainWindow.show();
  });
  // Handle window closed
  mainWindow.on('closed', () => {
    log('info', 'Main window closed');
    mainWindow = null;
  });
  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log('info', 'External link opened:', url);
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Set up application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Event',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-event');
          }
        },
        {
          label: 'Import Events',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('menu-import-events', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Export Events',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              defaultPath: `events-export-${new Date().toISOString().split('T')[0]}.json`,
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled) {
              mainWindow.webContents.send('menu-export-events', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Create Backup',
          click: async () => {
            try {
              const backupPath = await createBackup();
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Backup Created',
                message: `Backup successfully created at:\n${backupPath}`
              });
            } catch (error) {
              dialog.showErrorBox('Backup Failed', `Failed to create backup: ${error.message}`);
            }
          }
        },
        {
          label: 'Open Data Folder',
          click: () => {
            shell.openPath(dataDir);
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for data operations
ipcMain.handle('read-events', async () => {
  try {
    if (existsSync(eventsFile)) {
      const data = await fs.readFile(eventsFile, 'utf8');
      log('info', 'Read events.json');
      return JSON.parse(data);
    }
    log('warn', 'events.json does not exist');
    return [];
  } catch (error) {
    log('error', 'Error reading events:', error);
    return [];
  }
});

ipcMain.handle('read-optimized-events', async () => {
  try {
    if (existsSync(optimizedEventsFile)) {
      const data = await fs.readFile(optimizedEventsFile, 'utf8');
      log('info', 'Read events-optimized.json');
      return JSON.parse(data);
    }
    log('warn', 'events-optimized.json does not exist');
    return { events: [] };
  } catch (error) {
    log('error', 'Error reading optimized events:', error);
    return { events: [] };
  }
});

ipcMain.handle('write-events', async (event, events) => {
  try {
    await fs.writeFile(eventsFile, JSON.stringify(events, null, 2));
    log('info', 'Wrote events.json');
    return true;
  } catch (error) {
    log('error', 'Error writing events:', error);
    throw error;
  }
});

ipcMain.handle('write-optimized-events', async (event, optimizedEvents) => {
  try {
    await fs.writeFile(optimizedEventsFile, JSON.stringify(optimizedEvents, null, 2));
    log('info', 'Wrote events-optimized.json');
    return true;
  } catch (error) {
    log('error', 'Error writing optimized events:', error);
    throw error;
  }
});

ipcMain.handle('create-backup', async () => {
  try {
    const backupPath = await createBackup();
    log('info', 'IPC: Backup created at', backupPath);
    return backupPath;
  } catch (error) {
    log('error', 'IPC: Error creating backup:', error);
    throw error;
  }
});

ipcMain.handle('get-data-path', () => {
  log('info', 'IPC: get-data-path called');
  return dataDir;
});

ipcMain.handle('open-data-folder', async () => {
  try {
    await shell.openPath(dataDir);
    log('info', 'IPC: Data folder opened');
    return true;
  } catch (error) {
    log('error', 'IPC: Error opening data folder:', error);
    throw error;
  }
});

// Listen for log messages from renderer
ipcMain.handle('renderer-log', (event, level, ...args) => {
  log(level, '[renderer]', ...args);
});

// App event handlers
app.whenReady().then(async () => {
  // Check if running in development
  isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  log('info', 'App starting, isDev:', isDev);
  await ensureDataDirectory();
  await initializeDataFiles();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  log('info', 'All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  log('info', 'App activate');
  if (mainWindow === null) {
    createWindow();
  }
});
app.on('before-quit', async () => {
  // Create backup before quitting
  try {
    await createBackup();
  } catch (error) {
    log('error', 'Error creating backup on quit:', error);
  }
});
