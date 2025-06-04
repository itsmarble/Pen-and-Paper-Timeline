// src/utils/logger.js
// Logger utility for renderer process to send logs to main process (electron-log)

const isElectron = typeof window !== 'undefined' && window.electronAPI && window.electronAPI.log;

const logger = {
  info: (...args) => {
    if (isElectron) window.electronAPI.log('info', ...args);
    else console.info(...args);
  },
  warn: (...args) => {
    if (isElectron) window.electronAPI.log('warn', ...args);
    else console.warn(...args);
  },
  error: (...args) => {
    if (isElectron) window.electronAPI.log('error', ...args);
    else console.error(...args);
  },
  debug: (...args) => {
    if (isElectron) window.electronAPI.log('debug', ...args);
    else console.debug(...args);
  }
};

export default logger;
