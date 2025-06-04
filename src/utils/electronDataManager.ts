// Data manager for Electron app - handles persistent storage
export class ElectronDataManager {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  // Check if running in Electron
  isElectronApp() {
    return this.isElectron;
  }

  // Read events from persistent storage
  async readEvents() {
    if (this.isElectron) {
      return await window.electronAPI.readEvents();
    } else {
      // Fallback for browser - use localStorage or return default
      const stored = localStorage.getItem('pen-paper-timeline-events');
      return stored ? JSON.parse(stored) : [];
    }
  }

  // Read optimized events from persistent storage
  async readOptimizedEvents() {
    if (this.isElectron) {
      return await window.electronAPI.readOptimizedEvents();
    } else {
      // Fallback for browser
      const stored = localStorage.getItem('pen-paper-timeline-optimized-events');
      return stored ? JSON.parse(stored) : { events: [] };
    }
  }

  // Write events to persistent storage
  async writeEvents(events) {
    if (this.isElectron) {
      return await window.electronAPI.writeEvents(events);
    } else {
      // Fallback for browser
      localStorage.setItem('pen-paper-timeline-events', JSON.stringify(events));
      return true;
    }
  }

  // Write optimized events to persistent storage
  async writeOptimizedEvents(optimizedEvents) {
    if (this.isElectron) {
      return await window.electronAPI.writeOptimizedEvents(optimizedEvents);
    } else {
      // Fallback for browser
      localStorage.setItem('pen-paper-timeline-optimized-events', JSON.stringify(optimizedEvents));
      return true;
    }
  }

  // Create backup
  async createBackup() {
    if (this.isElectron) {
      return await window.electronAPI.createBackup();
    } else {
      // For browser, export as downloadable file
      const events = await this.readEvents();
      const optimizedEvents = await this.readOptimizedEvents();
      
      const backup = {
        timestamp: new Date().toISOString(),
        events,
        optimizedEvents
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeline-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return 'Browser download';
    }
  }

  // Get data path (Electron only)
  async getDataPath() {
    if (this.isElectron) {
      return await window.electronAPI.getDataPath();
    }
    return null;
  }

  // Open data folder (Electron only)
  async openDataFolder() {
    if (this.isElectron) {
      return await window.electronAPI.openDataFolder();
    } else {
      // For browser, show a message that this feature is only available in the desktop app
      alert('Diese Funktion ist nur in der Desktop-App verfügbar. Im Browser werden die Daten im Browser-Speicher gespeichert.');
      return false;
    }
  }

  // Set up menu event listeners (Electron only)
  setupMenuListeners(callbacks) {
    if (this.isElectron) {
      if (callbacks.onNewEvent) {
        window.electronAPI.onMenuNewEvent(callbacks.onNewEvent);
      }
      if (callbacks.onImportEvents) {
        window.electronAPI.onMenuImportEvents(callbacks.onImportEvents);
      }
      if (callbacks.onExportEvents) {
        window.electronAPI.onMenuExportEvents(callbacks.onExportEvents);
      }
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.isElectron) {
      window.electronAPI.removeAllListeners('menu-new-event');
      window.electronAPI.removeAllListeners('menu-import-events');
      window.electronAPI.removeAllListeners('menu-export-events');
    }
  }
}

// Create singleton instance
export const dataManager = new ElectronDataManager();
