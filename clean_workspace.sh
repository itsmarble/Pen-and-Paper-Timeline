#!/usr/bin/env bash
# clean_workspace.sh - Sicheres Pruning von Build-, Cache- und Temp-Dateien mit verständlicher UI/UX

set -e

# Farben (funktionieren in den meisten Terminals)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Kategorien und Muster (nur garantiert temporär!)
CATEGORIES=(
  "Build-Output:dist dist-ssr build dist-electron"
  "Cache:.cache cache .pytest_cache .next .nuxt .parcel-cache node_modules/.cache"
  "Test-/Coverage-Output:coverage"
  "Output/Export:output export public"
  "Logs:*.log *.tmp *.temp"
)

clear
printf "${CYAN}${BOLD}🧹 Pen & Paper Timeline Workspace Cleaner${NC}\n"
printf "${BLUE}Dieses Tool löscht nur temporäre, automatisch wiederherstellbare Dateien/Ordner.\n"
printf "${BLUE}Keine Benutzerdaten, Quellcode, Konfigurationen oder Datenbanken werden entfernt!\n\n"

TO_DELETE=()

for entry in "${CATEGORIES[@]}"; do
  IFS=":" read -r label patterns <<< "$entry"
  found=()
  for pattern in $patterns; do
    # Verzeichnisse
    matches=( $(find . -type d -name "$pattern" -prune 2>/dev/null) )
    # Dateien
    files=( $(find . -type f -name "$pattern" 2>/dev/null) )
    found+=("${matches[@]}")
    found+=("${files[@]}")
  done
  if [ ${#found[@]} -gt 0 ]; then
    printf "\n${YELLOW}${BOLD}Kategorie:${NC} ${CYAN}$label${NC}\n"
    for f in "${found[@]}"; do
      if [ -d "$f" ]; then printf "  ${RED}Ordner${NC}: $f\n"; else printf "  ${RED}Datei${NC}: $f\n"; fi
    done
    printf "${BLUE}→ ${label} sind temporär (Build, Cache, Logs) und werden bei Bedarf automatisch neu erzeugt.\n"
    printf "${YELLOW}Löschen ist sicher.\n${NC}"
    printf "${GREEN}Alle oben gelisteten löschen? [y/N] ${NC}"
    read yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      TO_DELETE+=("${found[@]}")
    else
      printf "${BLUE}Übersprungen: $label${NC}\n"
    fi
    printf "\n"
  fi
  sleep 0.1
  printf "."
done
printf "\n"

if [ ${#TO_DELETE[@]} -eq 0 ]; then
  printf "${GREEN}Nichts zu löschen. Dein Workspace ist bereits sauber!${NC}\n"
else
  printf "\n${RED}${BOLD}Lösche ausgewählte Dateien/Ordner...${NC}\n"
  for item in "${TO_DELETE[@]}"; do
    rm -rf "$item"
    printf "${GREEN}Gelöscht:${NC} $item\n"
  done
  printf "\n${CYAN}✅ Aufräumen abgeschlossen!${NC}\n"
fi
