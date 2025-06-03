// Simple test for Campaign Log v4 import
import fs from 'fs';

console.log('🔄 Starting simple test...');

try {
  // First test: just read the file
  const campaignLogPath = '/Users/maxbohn/Desktop/cthulu/campaign_log_v4.json';
  console.log('Reading file:', campaignLogPath);
  
  const content = fs.readFileSync(campaignLogPath, 'utf8');
  console.log('✅ File read successfully, length:', content.length);
  
  // Parse JSON
  const data = JSON.parse(content);
  console.log('✅ JSON parsed successfully');
  console.log('Version:', data.version);
  console.log('Entries count:', data.entries?.length || 0);
  
  // Test import
  console.log('\n🔄 Testing import...');
  const { EventMigration } = await import('./src/utils/migrationUtils.js');
  console.log('✅ Migration utils imported');
  
  const result = EventMigration.importBackup(content);
  console.log('✅ Import completed');
  console.log('Events imported:', result.events?.length || 0);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
