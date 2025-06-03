# Pen & Paper Timeline - Standalone macOS App

## 🎉 Your App is Ready!

You now have a standalone macOS application that can be double-clicked to run, with persistent data storage and easy upgrade capabilities.

## 📱 Using Your App

### Installation
1. Your app is located at: `dist-electron/mac/Pen & Paper Timeline.app`
2. Copy this app to your Applications folder (or anywhere you prefer)
3. Double-click to run!

### First Launch
- On first launch, macOS may show a security warning since the app isn't code-signed
- Go to **System Preferences > Security & Privacy > General**
- Click "Open Anyway" next to the warning about the app
- Alternatively, right-click the app and select "Open", then click "Open" in the dialog

## 💾 Data Storage

Your timeline data is automatically saved to:
```
~/Library/Application Support/Pen & Paper Timeline/data/
```

This includes:
- `events.json` - Your timeline events
- `events-optimized.json` - Optimized event data for fast searching
- `config.json` - App settings
- `backups/` - Automatic backups of your data

## 🔄 Upgrading Your App

### Method 1: Automatic Upgrade Script
1. Open Terminal
2. Navigate to your project folder: `cd /path/to/pen_and_paper_timeline`
3. Run: `./upgrade.sh`
4. The script will:
   - Create a backup of your data
   - Build the new version
   - Tell you where to find the new app

### Method 2: Manual Upgrade
1. Make any code changes you want
2. Run: `npm run build-mac`
3. Copy the new app from `dist-electron/mac/` to replace your old one
4. Your data is automatically preserved

## 🛠 Development

### Making Changes
1. Edit your React components in `src/`
2. Edit Electron main process in `electron/main.js`
3. Test with: `npm run electron-dev`
4. Build new version with: `npm run build-mac`

### Available Scripts
- `npm run dev` - Start development server (web only)
- `npm run electron-dev` - Start Electron app in development mode
- `npm run build` - Build React app for production
- `npm run build-mac` - Build complete macOS app (with code signing disabled)
- `npm run electron` - Run Electron app in production mode

**Note**: The build commands automatically disable code signing with `CSC_IDENTITY_AUTO_DISCOVERY=false` for personal use.

## 📁 Project Structure

```
pen_and_paper_timeline/
├── src/                    # React app source
├── electron/              # Electron main & preload scripts (.cjs files)
├── dist/                  # Built React app
├── dist-electron/         # Built Electron apps
│   ├── mac/              # macOS app bundle
│   ├── *.dmg             # DMG installer
│   └── *.zip             # Zip distribution
├── build/                # App assets (icons, etc.)
├── upgrade.sh            # Upgrade script
└── package.json          # Dependencies & build config
```

## 🔧 Customization

### App Icon
Replace `build/icon.icns` with your custom icon (must be .icns format)

### App Name
Edit `productName` in `package.json` under the `build` section

### App Version
Update `version` in `package.json`

## 🚨 Troubleshooting

### App Won't Open
- Check Security & Privacy settings
- Try right-clicking and selecting "Open"
- If still failing, rebuild with: `CSC_IDENTITY_AUTO_DISCOVERY=false npm run build-mac`

### ES Module vs CommonJS Issues
- Electron files use `.cjs` extension to avoid conflicts with React's ES modules
- Main file: `electron/main.cjs`, Preload: `electron/preload.cjs`

### Data Not Persisting
- Check that the app has write permissions
- Data location: `~/Library/Application Support/Pen & Paper Timeline/`

### Build Errors
- Run `npm install` to ensure dependencies are installed
- Check that Node.js and npm are up to date
- Try deleting `node_modules` and running `npm install` again

## 📦 Distribution

### Sharing Your App
1. **DMG File**: Share `Pen & Paper Timeline-1.0.0.dmg` - users can drag to Applications
2. **ZIP File**: Share `Pen & Paper Timeline-1.0.0-mac.zip` - extract and use
3. **App Bundle**: Share the `.app` folder directly

### Code Signing (Optional)
For wider distribution, you might want to code sign:
1. Get an Apple Developer account
2. Add your certificate details to `package.json`
3. Remove `CSC_IDENTITY_AUTO_DISCOVERY=false` from build commands

## 🎯 Key Features

✅ **Double-click to run** - No need for terminal or development setup
✅ **Persistent data** - Your timelines are saved between sessions  
✅ **Auto-backup** - Automatic backups protect your data
✅ **Easy upgrades** - Simple script to upgrade while preserving data
✅ **Self-contained** - All dependencies bundled in the app
✅ **macOS native** - Proper macOS app bundle with icon and menus

## 🎊 You're All Set!

Your Pen & Paper Timeline is now a fully functional standalone macOS application. You can:
- Double-click to run it anytime
- Make improvements to the code
- Rebuild and upgrade easily
- Keep your data safe with automatic backups

Happy timeline building! 🚀
