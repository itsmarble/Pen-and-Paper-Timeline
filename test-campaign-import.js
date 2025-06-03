#!/usr/bin/env node

// Test script for importing Campaign Log v4 format
import fs from 'fs';
import path from 'path';
import { EventMigration } from './src/utils/migrationUtils.js';

const campaignLogPath = '/Users/maxbohn/Desktop/cthulu/campaign_log_v4.json';

async function testImport() {
  try {
    console.log('🔄 Testing Campaign Log v4 import...\n');
    
    // Read the campaign log file
    const campaignLogContent = fs.readFileSync(campaignLogPath, 'utf8');
    console.log('✅ Campaign log file loaded successfully');
    
    // Parse and import
    const importResult = EventMigration.importBackup(campaignLogContent);
    
    console.log('\n📊 Import Results:');
    console.log('Success:', importResult.success);
    console.log('Total events:', importResult.statistics.total);
    console.log('Imported:', importResult.statistics.imported);
    console.log('Migrated:', importResult.statistics.migrated);
    console.log('Skipped:', importResult.statistics.skipped);
    
    if (importResult.metadata) {
      console.log('\n📝 Metadata:');
      Object.entries(importResult.metadata).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });
    }
    
    if (importResult.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      importResult.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (importResult.errors.length > 0) {
      console.log('\n❌ Errors:');
      importResult.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (importResult.success && importResult.eventCollection) {
      console.log('\n📋 Sample events:');
      const events = importResult.eventCollection.events.slice(0, 3);
      events.forEach((event, index) => {
        console.log(`\n  Event ${index + 1}:`);
        console.log(`    ID: ${event.id}`);
        console.log(`    Name: ${event.name}`);
        console.log(`    Date: ${event.entry_date} ${event.entry_time}`);
        console.log(`    Description: ${event.description.substring(0, 100)}...`);
        console.log(`    Tags: ${event.tags.join(', ')}`);
      });
      
      // Save converted events to test file
      const outputPath = '/Users/maxbohn/pen_and_paper_timeline/imported-events-test.json';
      const exportData = EventMigration.exportToJSON(importResult.eventCollection);
      fs.writeFileSync(outputPath, exportData);
      console.log(`\n💾 Converted events saved to: ${outputPath}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testImport();
