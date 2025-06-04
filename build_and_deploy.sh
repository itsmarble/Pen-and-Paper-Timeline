#!/usr/bin/env zsh
# ==================================================
#   Pen & Paper Timeline: macOS Build & Deploy Skript
# ==================================================
#
# Dieses Skript räumt auf, baut die Electron-App neu
# und kopiert sie als .app in den /Applications-Ordner.
#
# Anwendung:
#   1. Skript ins Projektverzeichnis legen (z.B. build_and_deploy.sh)
#   2. chmod +x build_and_deploy.sh
#   3. ./build_and_deploy.sh
# ==================================================

set -e

APP_NAME="Pen & Paper Timeline.app"
BUILD_OUTPUT_DIR="dist-electron/mac"
APP_BUNDLE_PATH="$BUILD_OUTPUT_DIR/$APP_NAME"
DEST_APP_PATH="/Applications/$APP_NAME"

# Farben und Emojis
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function info() { echo "${YELLOW}👉 $1${NC}"; }
function success() { echo "${GREEN}✅ $1${NC}"; }
function fail() { echo "${RED}❌ $1${NC}"; }

info "Starte sauberen Rebuild und Deployment für $APP_NAME ..."

# 0. Laufende Instanzen der App beenden
info "Beende laufende Instanzen von $APP_NAME falls vorhanden ..."
pgrep -x "Pen & Paper Timeline" | xargs -r kill && success "Alle laufenden Instanzen wurden beendet." || info "Keine laufenden Instanzen gefunden."

# 1. App im Programme-Ordner entfernen
if [ -d "$DEST_APP_PATH" ]; then
  info "Entferne alte Version in $DEST_APP_PATH ..."
  rm -rf "$DEST_APP_PATH" || { fail "Konnte alte App nicht entfernen."; exit 1; }
  success "Alte Version entfernt."
else
  info "Keine alte Version in $DEST_APP_PATH gefunden."
fi

# 2. Build-Output-Verzeichnis aufräumen
if [ -d "$BUILD_OUTPUT_DIR" ]; then
  info "Lösche vorherigen Build-Output ($BUILD_OUTPUT_DIR) ..."
  rm -rf "$BUILD_OUTPUT_DIR" || { fail "Konnte Build-Output nicht löschen."; exit 1; }
  success "Build-Output entfernt."
else
  info "Kein vorheriger Build-Output gefunden."
fi

# 3. Node-Module-Cache optional aufräumen (nur falls gewünscht)
info "Lösche node_modules/.cache (optional) ..."
rm -rf node_modules/.cache || true

# 4. Frischen Build erzeugen
info "Starte Electron-Build (npm run build-mac) ..."
npm run build-mac || { fail "Build fehlgeschlagen."; exit 1; }
success "Build erfolgreich abgeschlossen."

# 5. Prüfen, ob .app existiert
if [ ! -d "$APP_BUNDLE_PATH" ]; then
  fail "$APP_BUNDLE_PATH wurde nicht gefunden! Build fehlgeschlagen?"
  exit 1
fi
success "App-Bundle gefunden: $APP_BUNDLE_PATH"

# 6. App ins Programme-Verzeichnis kopieren
info "Kopiere $APP_NAME nach /Applications ..."
cp -R "$APP_BUNDLE_PATH" "/Applications/" || { fail "Kopieren nach /Applications fehlgeschlagen."; exit 1; }
success "$APP_NAME erfolgreich nach /Applications kopiert."

echo "\n${GREEN}🎉 Fertig! Die aktuelle Version von $APP_NAME ist jetzt im Programme-Ordner.${NC}"
