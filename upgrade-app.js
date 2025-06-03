#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for beautiful terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

// Emoji and symbols
const symbols = {
  rocket: '🚀',
  hammer: '🔨',
  package: '📦',
  folder: '📁',
  check: '✅',
  cross: '❌',
  info: 'ℹ️',
  warning: '⚠️',
  sparkles: '✨',
  gear: '⚙️',
  fire: '🔥'
};

class UpgradeManager {
  constructor() {
    this.projectName = 'Pen & Paper Timeline';
    this.version = this.getVersion();
    this.outputDir = 'dist-electron';
  }

  getVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
      return packageJson.version;
    } catch (error) {
      return '1.0.0';
    }
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logBox(title, content, color = 'blue') {
    const width = 60;
    const titleLine = `${symbols.sparkles} ${title} ${symbols.sparkles}`;
    const padding = Math.max(0, Math.floor((width - titleLine.length) / 2));
    
    console.log(`${colors[color]}${'═'.repeat(width)}${colors.reset}`);
    console.log(`${colors[color]}║${' '.repeat(padding)}${colors.bright}${titleLine}${colors.reset}${colors[color]}${' '.repeat(width - padding - titleLine.length)}║${colors.reset}`);
    console.log(`${colors[color]}║${' '.repeat(width - 2)}║${colors.reset}`);
    
    content.forEach(line => {
      const contentPadding = Math.max(0, Math.floor((width - 2 - line.length) / 2));
      console.log(`${colors[color]}║${' '.repeat(contentPadding)}${colors.white}${line}${colors.reset}${colors[color]}${' '.repeat(width - 2 - contentPadding - line.length)}║${colors.reset}`);
    });
    
    console.log(`${colors[color]}║${' '.repeat(width - 2)}║${colors.reset}`);
    console.log(`${colors[color]}${'═'.repeat(width)}${colors.reset}\n`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async showWelcome() {
    this.logBox('App Upgrade Manager', [
      `${this.projectName}`,
      `Version: ${this.version}`,
      '',
      'Bereitet App für Installation vor...'
    ], 'cyan');
  }

  async cleanOldBuild() {
    this.log(`${symbols.gear} Bereinige alte Build-Dateien...`, 'yellow');
    
    try {
      if (fs.existsSync(this.outputDir)) {
        execSync(`rm -rf ${this.outputDir}`, { stdio: 'pipe' });
        this.log(`${symbols.check} Alte Build-Dateien entfernt`, 'green');
      } else {
        this.log(`${symbols.info} Keine alten Build-Dateien gefunden`, 'dim');
      }
    } catch (error) {
      this.log(`${symbols.warning} Warnung beim Entfernen alter Dateien: ${error.message}`, 'yellow');
    }
    
    await this.sleep(500);
  }

  async buildApp() {
    this.log(`\n${symbols.hammer} Starte Build-Prozess...`, 'blue');
    this.log(`${symbols.info} Dies kann einige Minuten dauern...`, 'dim');
    
    const startTime = Date.now();
    
    try {
      // Build Vite project first
      this.log(`${symbols.gear} Baue Web-Anwendung...`, 'yellow');
      execSync('npm run build', { stdio: 'pipe' });
      
      // Build Electron app
      this.log(`${symbols.gear} Baue Electron-Anwendung...`, 'yellow');
      execSync('npm run build-mac', { stdio: 'pipe' });
      
      const buildTime = Math.round((Date.now() - startTime) / 1000);
      this.log(`\n${symbols.check} Build erfolgreich abgeschlossen! (${buildTime}s)`, 'green');
      
    } catch (error) {
      this.log(`\n${symbols.cross} Build fehlgeschlagen:`, 'red');
      this.log(error.message, 'red');
      process.exit(1);
    }
    
    await this.sleep(1000);
  }

  async findAppBundle() {
    const possiblePaths = [
      path.join(__dirname, this.outputDir, 'mac', 'Pen & Paper Timeline.app'),
      path.join(__dirname, this.outputDir, 'Pen & Paper Timeline.app'),
      path.join(__dirname, this.outputDir, 'mac-universal', 'Pen & Paper Timeline.app'),
    ];

    for (const appPath of possiblePaths) {
      if (fs.existsSync(appPath)) {
        return appPath;
      }
    }

    // If not found, list what's actually in the output directory
    if (fs.existsSync(path.join(__dirname, this.outputDir))) {
      this.log(`${symbols.info} Verfügbare Dateien im Build-Verzeichnis:`, 'cyan');
      const files = this.listDirectory(path.join(__dirname, this.outputDir));
      files.forEach(file => this.log(`  ${symbols.folder} ${file}`, 'dim'));
    }

    return null;
  }

  listDirectory(dir, prefix = '') {
    const items = [];
    try {
      const entries = fs.readdirSync(dir);
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          items.push(`${prefix}${entry}/`);
          if (prefix.length < 6) { // Limit recursion depth
            items.push(...this.listDirectory(fullPath, prefix + '  '));
          }
        } else {
          items.push(`${prefix}${entry}`);
        }
      });
    } catch (error) {
      // Ignore errors
    }
    return items;
  }

  async openInFinder() {
    this.log(`\n${symbols.folder} Öffne Build-Verzeichnis...`, 'blue');
    
    const outputPath = path.join(__dirname, this.outputDir);
    
    if (!fs.existsSync(outputPath)) {
      this.log(`${symbols.cross} Build-Verzeichnis nicht gefunden: ${outputPath}`, 'red');
      return false;
    }

    try {
      // Check if app bundle exists
      const appBundle = await this.findAppBundle();
      
      if (appBundle) {
        this.log(`${symbols.check} App gefunden: ${path.basename(appBundle)}`, 'green');
        // Open the parent directory of the app bundle
        execSync(`open "${path.dirname(appBundle)}"`, { stdio: 'pipe' });
      } else {
        this.log(`${symbols.warning} App-Bundle nicht gefunden, öffne Build-Verzeichnis`, 'yellow');
        execSync(`open "${outputPath}"`, { stdio: 'pipe' });
      }
      
      this.log(`${symbols.check} Finder geöffnet!`, 'green');
      return true;
      
    } catch (error) {
      this.log(`${symbols.cross} Fehler beim Öffnen des Finders: ${error.message}`, 'red');
      return false;
    }
  }

  async showInstructions() {
    await this.sleep(1000);
    
    this.logBox('Installation', [
      '1. Ziehe die App aus dem geöffneten Finder-Fenster',
      '2. in den Ordner "Programme" (Applications)',
      '3. Die alte Version wird automatisch ersetzt',
      '',
      'Fertig! 🎉'
    ], 'green');

    this.log(`${symbols.info} Tipp: Du kannst auch Cmd+Drag verwenden für schnelleres Kopieren`, 'dim');
  }

  async showCompletion() {
    this.logBox('Upgrade Abgeschlossen', [
      `${symbols.fire} Deine App ist bereit!`,
      '',
      `${symbols.package} App-Version: ${this.version}`,
      `${symbols.folder} Speicherort: dist-electron/`,
      '',
      'Viel Spaß mit deiner Timeline-App!'
    ], 'magenta');
  }

  async run() {
    try {
      console.clear();
      await this.showWelcome();
      await this.cleanOldBuild();
      await this.buildApp();
      await this.openInFinder();
      await this.showInstructions();
      await this.showCompletion();
      
    } catch (error) {
      this.log(`\n${symbols.cross} Unerwarteter Fehler: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the upgrade manager
const upgradeManager = new UpgradeManager();
upgradeManager.run();
