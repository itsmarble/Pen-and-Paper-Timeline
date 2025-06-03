# Campaign Log v4 Import Instructions

## ✅ Campaign Log v4 Import Support is Ready!

Your pen & paper timeline application now supports importing Campaign Log v4 format files.

## How to Test the Import

1. **Open the Application**: The app is currently running at http://localhost:5173/

2. **Use the Import Button**: 
   - Look for the Upload icon (📤) in the top toolbar
   - Click on it to open the file picker

3. **Select Your Campaign Log**: 
   - Browse to `/Users/maxbohn/Desktop/cthulu/campaign_log_v4.json`
   - Select and open the file

## What Gets Converted

The import process will automatically convert:

### ✅ **Date Format**: 
- `"08.08.1923"` → `"1923-08-08"` (ISO format)

### ✅ **Field Mapping**:
- `entry_date` → `entry_date` (converted)
- `entry_time` → `entry_time` 
- `description` → `description` + `name` (extracted from description)
- `tags` → `tags`
- `id` → `id`

### ✅ **Timestamp Conversion**:
- `"27.03.2025 19:12"` → ISO format timestamps

### ✅ **Event Detection**:
- The system detects Campaign Log v4 by checking for:
  - `entries` array
  - `appearance_mode` field
  - Date format `DD.MM.YYYY`

## Expected Results

From your campaign log file, you should see **20+ events** imported, including:

- **1923-08-08**: "Letzter Tag des Einführungsabenteuers"
- **1933-03-13**: "Flug Frankfurt Bolivien auf Einladung des zweiten Kreis" (tagged: "Zweiter Kreis")
- **1933-03-12**: "Brief von Shapiro an Dr. Ursini im Lager"
- And many more...

## Troubleshooting

If the import doesn't work:

1. **Check Console**: Open browser developer tools (F12) and check for error messages
2. **File Format**: Ensure the file is valid JSON
3. **File Size**: Make sure the file isn't corrupted

## Backup Notice

⚠️ **Always backup your existing timeline data before importing!**

The import will add to your existing events, not replace them.

---

🎉 **Your Campaign Log v4 import functionality is ready to use!**
