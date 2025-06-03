#!/bin/bash

# 🚀 Pen & Paper Timeline - App Upgrade Script
# Erstellt eine neue Version der App und öffnet den Finder für einfache Installation

# Colors and symbols for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[0;37m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
HAMMER="🔨"
PACKAGE="📦"
FOLDER="📁"
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARNING="⚠️"
SPARKLES="✨"
GEAR="⚙️"
FIRE="🔥"

# Project configuration
PROJECT_NAME="Pen & Paper Timeline"
OUTPUT_DIR="dist-electron"

# Functions for beautiful output
print_header() {
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}║${WHITE}              ${SPARKLES} App Upgrade Manager ${SPARKLES}                ║${NC}"
    echo -e "${CYAN}║                                                          ║${NC}"
    echo -e "${CYAN}║${WHITE}                  ${PROJECT_NAME}                     ║${NC}"
    echo -e "${CYAN}║${DIM}              Bereitet App für Installation vor...          ║${NC}"
    echo -e "${CYAN}║                                                          ║${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success_box() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}║${WHITE}                   ${SPARKLES} Installation ${SPARKLES}                     ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║${WHITE}   1. Ziehe die App aus dem geöffneten Finder-Fenster    ║${NC}"
    echo -e "${GREEN}║${WHITE}   2. in den Ordner \"Programme\" (Applications)          ║${NC}"
    echo -e "${GREEN}║${WHITE}   3. Die alte Version wird automatisch ersetzt         ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║${WHITE}                      Fertig! 🎉                         ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_completion() {
    echo ""
    echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}║${WHITE}                ${SPARKLES} Upgrade Abgeschlossen ${SPARKLES}                ║${NC}"
    echo -e "${MAGENTA}║                                                          ║${NC}"
    echo -e "${MAGENTA}║${WHITE}                  ${FIRE} Deine App ist bereit! ${FIRE}                  ║${NC}"
    echo -e "${MAGENTA}║                                                          ║${NC}"
    echo -e "${MAGENTA}║${WHITE}   ${PACKAGE} Speicherort: ${OUTPUT_DIR}/                        ║${NC}"
    echo -e "${MAGENTA}║                                                          ║${NC}"
    echo -e "${MAGENTA}║${WHITE}           Viel Spaß mit deiner Timeline-App!           ║${NC}"
    echo -e "${MAGENTA}║                                                          ║${NC}"
    echo -e "${MAGENTA}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

log_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

log_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

log_process() {
    echo -e "${BLUE}${GEAR} $1${NC}"
}

# Check if we're in the right directory
check_project() {
    if [ ! -f "package.json" ]; then
        log_error "package.json nicht gefunden. Bitte führe das Script im Projekt-Verzeichnis aus."
        exit 1
    fi
    
    if [ ! -f "electron/main.cjs" ]; then
        log_error "Electron-Dateien nicht gefunden. Ist dies das richtige Projekt-Verzeichnis?"
        exit 1
    fi
}

# Clean old build files
clean_old_build() {
    log_process "Bereinige alte Build-Dateien..."
    
    if [ -d "${OUTPUT_DIR}" ]; then
        rm -rf "${OUTPUT_DIR}"
        log_success "Alte Build-Dateien entfernt"
    else
        log_info "Keine alten Build-Dateien gefunden"
    fi
    
    sleep 0.5
}

# Build the application
build_app() {
    echo ""
    log_process "Starte Build-Prozess..."
    log_info "Dies kann einige Minuten dauern..."
    echo ""
    
    START_TIME=$(date +%s)
    
    # Build Vite project first
    echo -e "${YELLOW}${GEAR} Baue Web-Anwendung...${NC}"
    if ! npm run build; then
        log_error "Web-Build fehlgeschlagen!"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}${GEAR} Baue Electron-Anwendung...${NC}"
    if ! npm run build-mac; then
        log_error "Electron-Build fehlgeschlagen!"
        exit 1
    fi
    
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))
    
    echo ""
    log_success "Build erfolgreich abgeschlossen! (${BUILD_TIME}s)"
    sleep 1
}

# Find the app bundle
find_app_bundle() {
    local possible_paths=(
        "${OUTPUT_DIR}/mac/Pen & Paper Timeline.app"
        "${OUTPUT_DIR}/Pen & Paper Timeline.app"
        "${OUTPUT_DIR}/mac-universal/Pen & Paper Timeline.app"
    )
    
    for app_path in "${possible_paths[@]}"; do
        if [ -d "$app_path" ]; then
            echo "$app_path"
            return 0
        fi
    done
    
    return 1
}

# Open the build directory in Finder
open_in_finder() {
    echo ""
    log_process "Öffne Build-Verzeichnis..."
    
    if [ ! -d "${OUTPUT_DIR}" ]; then
        log_error "Build-Verzeichnis nicht gefunden: ${OUTPUT_DIR}"
        return 1
    fi
    
    # Try to find the app bundle
    APP_BUNDLE=$(find_app_bundle)
    
    if [ $? -eq 0 ] && [ -d "$APP_BUNDLE" ]; then
        log_success "App gefunden: $(basename "$APP_BUNDLE")"
        # Open the parent directory of the app bundle
        open "$(dirname "$APP_BUNDLE")"
    else
        log_warning "App-Bundle nicht gefunden, öffne Build-Verzeichnis"
        if [ -d "${OUTPUT_DIR}" ]; then
            ls -la "${OUTPUT_DIR}"
            echo ""
        fi
        open "${OUTPUT_DIR}"
    fi
    
    log_success "Finder geöffnet!"
    sleep 1
}

# Main execution
main() {
    clear
    print_header
    
    check_project
    clean_old_build
    build_app
    open_in_finder
    print_success_box
    
    echo -e "${DIM}${INFO} Tipp: Du kannst auch Cmd+Drag verwenden für schnelleres Kopieren${NC}"
    
    print_completion
}

# Run the script
main
