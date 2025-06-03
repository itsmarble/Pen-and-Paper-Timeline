#!/bin/bash

# Quick launcher for Pen & Paper Timeline
# This script opens your app from wherever it is

APP_NAME="Pen & Paper Timeline.app"

# Common locations to check
LOCATIONS=(
    "~/Desktop/$APP_NAME"
    "~/Applications/$APP_NAME"
    "/Applications/$APP_NAME"
    "./dist-electron/mac/$APP_NAME"
    "dist-electron/mac/$APP_NAME"
)

echo "🔍 Looking for $APP_NAME..."

for location in "${LOCATIONS[@]}"; do
    # Expand ~ to home directory
    expanded_location="${location/#\~/$HOME}"
    
    if [ -d "$expanded_location" ]; then
        echo "✅ Found app at: $expanded_location"
        echo "🚀 Launching..."
        open "$expanded_location"
        exit 0
    fi
done

echo "❌ Could not find $APP_NAME in common locations"
echo "   Checked:"
for location in "${LOCATIONS[@]}"; do
    echo "   - $location"
done
echo ""
echo "💡 To fix this:"
echo "   1. Build the app: npm run build-mac"
echo "   2. Copy the app to Applications or Desktop"
echo "   3. Or update this script with your app's location"
