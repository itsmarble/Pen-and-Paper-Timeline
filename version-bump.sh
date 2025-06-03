#!/bin/bash

# Version Bump and Build Script
# Usage: ./version-bump.sh [major|minor|patch]

VERSION_TYPE=${1:-patch}

echo "🔢 Bumping version ($VERSION_TYPE) and building new app..."
echo "=================================================="

# Bump version in package.json
echo "📈 Updating version..."
npm version $VERSION_TYPE --no-git-tag-version

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "   ✅ New version: $NEW_VERSION"

# Build the app
echo "🔨 Building app..."
CSC_IDENTITY_AUTO_DISCOVERY=false npm run build-mac

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! New version $NEW_VERSION is ready"
    echo "============================================="
    echo "📁 App location: dist-electron/mac/Pen & Paper Timeline.app"
    echo "💿 DMG file: dist-electron/Pen & Paper Timeline-$NEW_VERSION.dmg"
    echo ""
    echo "📋 To install the update:"
    echo "   1. Close the current app if running"
    echo "   2. Copy the new app over the old one"
    echo "   3. Your data will be preserved automatically"
    echo ""
    echo "🚀 Ready to use!"
else
    echo "❌ Build failed"
    exit 1
fi
