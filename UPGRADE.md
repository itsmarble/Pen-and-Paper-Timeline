# 🚀 App Upgrade Guide

Diese Datei erklärt, wie du die **Pen & Paper Timeline** App einfach aktualisieren kannst.

## 🎯 Schnell-Upgrade

Du hast **zwei Optionen** für das Upgrade:

### Option 1: Node.js Script (Empfohlen)
```bash
npm run upgrade
```

### Option 2: Shell Script
```bash
npm run upgrade-shell
# oder direkt:
./upgrade-app.sh
```

## 🎨 Was passiert beim Upgrade?

1. **🧹 Bereinigung**: Alte Build-Dateien werden entfernt
2. **🔨 Web-Build**: Die React-Anwendung wird mit Vite gebaut
3. **📦 App-Build**: Die Electron-App wird für macOS erstellt
4. **📁 Finder**: Das Build-Verzeichnis wird automatisch geöffnet
5. **✨ Installation**: Du ziehst die App einfach in den Programme-Ordner

## 📋 Schritt-für-Schritt Anleitung

### 1. Upgrade starten
```bash
npm run upgrade
```

### 2. Warten
Das Script zeigt dir schöne Status-Updates während des Build-Prozesses. Dies dauert normalerweise 1-3 Minuten.

### 3. Finder öffnet sich
Das Script öffnet automatisch den Finder mit dem Build-Verzeichnis.

### 4. App installieren
- Ziehe die **Pen & Paper Timeline.app** aus dem Finder-Fenster
- In den **Programme** (Applications) Ordner
- Die alte Version wird automatisch ersetzt

### 5. Fertig! 🎉
Deine App ist jetzt aktualisiert und bereit zur Nutzung.

## 🛠️ Build-Ausgabe

Die App wird in folgendem Verzeichnis erstellt:
```
dist-electron/
├── mac/
│   └── Pen & Paper Timeline.app  ← Diese Datei installieren
├── Pen & Paper Timeline-1.0.0.dmg
└── Pen & Paper Timeline-1.0.0-mac.zip
```

## 💡 Tipps

- **Schneller kopieren**: Halte `Cmd` gedrückt und ziehe die App für schnelleres Kopieren
- **DMG verwenden**: Du kannst auch die `.dmg` Datei öffnen für eine traditionelle macOS-Installation
- **Backup**: Das Script erstellt automatisch ein Backup deiner Daten vor dem Upgrade

## 🔧 Fehlerbehandlung

Falls etwas schief geht:

1. **Build-Fehler**: Stelle sicher, dass alle Dependencies installiert sind:
   ```bash
   npm install
   ```

2. **Finder öffnet nicht**: Du kannst das Build-Verzeichnis manuell öffnen:
   ```bash
   open dist-electron
   ```

3. **App nicht gefunden**: Prüfe den Inhalt des Build-Verzeichnisses:
   ```bash
   ls -la dist-electron/
   ```

## 🎨 Features der Upgrade-Scripts

- ✨ **Schöne UI**: Farbige Ausgabe mit Emojis und Boxen
- 📊 **Progress-Updates**: Echtzeitinformationen über den Build-Status
- 🧹 **Auto-Cleanup**: Automatisches Entfernen alter Build-Dateien
- 📁 **Auto-Open**: Automatisches Öffnen des Finders
- ⏱️ **Build-Zeit**: Anzeige der benötigten Build-Zeit
- 🔍 **Fehlerbehandlung**: Detaillierte Fehlermeldungen bei Problemen

## 📝 Hinweise

- Das Script funktioniert nur auf **macOS**
- Du benötigst **Node.js** und **npm**
- Alle Dependencies müssen installiert sein (`npm install`)
- Der Build-Prozess kann je nach System 1-3 Minuten dauern

---

*Happy Upgrading! 🚀✨*
