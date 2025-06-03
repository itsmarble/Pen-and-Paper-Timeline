// Test Campaign Log v4 import using CommonJS
const fs = require('fs');
const path = require('path');

// Read and test the campaign log
const campaignLogPath = '/Users/maxbohn/Desktop/cthulu/campaign_log_v4.json';

console.log('🔄 Testing Campaign Log v4 import...\n');

try {
  // Read the file
  const content = fs.readFileSync(campaignLogPath, 'utf8');
  console.log('✅ File read successfully, size:', content.length, 'bytes');
  
  // Parse JSON
  const data = JSON.parse(content);
  console.log('✅ JSON parsed successfully');
  console.log('📊 Campaign Log Info:');
  console.log('  - Version:', data.version || 'unknown');
  console.log('  - Entries:', data.entries?.length || 0);
  console.log('  - Appearance mode:', data.appearance_mode);
  console.log('  - Current datetime:', data.current_datetime);
  
  if (data.entries && data.entries.length > 0) {
    console.log('\n📝 Sample entry:');
    const entry = data.entries[0];
    console.log('  - ID:', entry.id);
    console.log('  - Date:', entry.entry_date);
    console.log('  - Time:', entry.entry_time);
    console.log('  - Description:', entry.description.substring(0, 50) + '...');
    console.log('  - Tags:', entry.tags);
  }
  
  // Test date conversion
  console.log('\n🔄 Testing date conversion...');
  
  function convertDateFormat(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  const testDate = data.entries[0]?.entry_date;
  if (testDate) {
    const converted = convertDateFormat(testDate);
    console.log(`  - Original: ${testDate} → Converted: ${converted}`);
  }
  
  console.log('\n✅ Campaign Log v4 format validation successful!');
  console.log('\n🎯 Ready to import through the application UI.');
  console.log('   Use the "Import Backup" button in the timeline to upload this file.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
