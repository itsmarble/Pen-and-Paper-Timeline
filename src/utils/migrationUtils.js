// Migration utilities for transitioning between event formats
import { OptimizedEvent, EventCollection } from './eventUtils.js';
import logger from './logger';

/**
 * Migration utilities for upgrading event data structures
 */
export class EventMigration {
  
  /**
   * Migrate legacy event format to optimized format
   * @param {Array} legacyEvents - Array of legacy event objects
   * @returns {EventCollection} - Optimized event collection
   */
  static migrateLegacyEvents(legacyEvents) {
    if (!Array.isArray(legacyEvents)) {
      console.warn('migrateLegacyEvents: Input is not an array, returning empty collection');
      return new EventCollection([]);
    }

    const migratedEvents = legacyEvents.map(legacyEvent => {
      try {
        return this.migrateSingleEvent(legacyEvent);
      } catch (error) {
        logger.error('Error migrating event:', legacyEvent, error);
        return null;
      }
    }).filter(Boolean);

    return new EventCollection(migratedEvents);
  }

  /**
   * Migrate a single legacy event to optimized format
   * @param {Object} legacyEvent - Legacy event object
   * @returns {OptimizedEvent} - Optimized event instance
   */
  static migrateSingleEvent(legacyEvent) {
    if (!legacyEvent || typeof legacyEvent !== 'object') {
      throw new Error('Invalid legacy event data');
    }

    // Create base optimized event data
    const optimizedData = {
      id: legacyEvent.id || Date.now() + Math.random(),
      name: legacyEvent.name || legacyEvent.title || '',
      description: legacyEvent.description || '',
      entry_date: legacyEvent.entry_date || legacyEvent.date || '',
      entry_time: legacyEvent.entry_time || legacyEvent.time || '',
      end_date: legacyEvent.end_date || '',
      end_time: legacyEvent.end_time || '',
      hasEndDateTime: legacyEvent.hasEndDateTime || false,
      location: legacyEvent.location || legacyEvent.place || '',
      tags: Array.isArray(legacyEvent.tags) ? legacyEvent.tags : [],
      created_at: legacyEvent.created_at || new Date().toISOString(),
      updated_at: legacyEvent.updated_at || new Date().toISOString()
    };

    // Handle various legacy date formats
    if (legacyEvent.datetime) {
      const dt = new Date(legacyEvent.datetime);
      if (!isNaN(dt)) {
        optimizedData.entry_date = dt.toISOString().split('T')[0];
        optimizedData.entry_time = dt.toTimeString().substr(0, 5);
      }
    }

    // Handle legacy tag formats
    if (typeof legacyEvent.tags === 'string') {
      optimizedData.tags = legacyEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    // Ensure required fields have defaults
    if (!optimizedData.name) {
      optimizedData.name = 'Unbenanntes Event';
    }
    
    if (!optimizedData.description) {
      optimizedData.description = 'Keine Beschreibung verfügbar';
    }

    return new OptimizedEvent(optimizedData);
  }

  /**
   * Migrate Campaign Log v4 format to current format
   * @param {Object} campaignLogData - Campaign log v4 data
   * @returns {Array} - Array of migrated events
   */
  static migrateCampaignLogV4(campaignLogData) {
    if (!campaignLogData.entries || !Array.isArray(campaignLogData.entries)) {
      return [];
    }

    return campaignLogData.entries.map(entry => {
      try {
        // Convert date format from DD.MM.YYYY to YYYY-MM-DD
        const convertedDate = this.convertDateFormat(entry.entry_date);
        
        // Extract name from description (first line or first 50 characters)
        const description = entry.description || '';
        const name = this.extractNameFromDescription(description);
        
        // Convert real-time timestamp to ISO format if available
        const createdAt = this.convertRealTimeToISO(entry.last_modified_realtime);
        
        return {
          id: entry.id || Date.now() + Math.random(),
          name: name,
          description: description,
          entry_date: convertedDate,
          entry_time: entry.entry_time || '',
          end_date: '', // Campaign log v4 doesn't seem to have end dates
          end_time: '',
          hasEndDateTime: false,
          location: '', // Not present in v4 format
          tags: Array.isArray(entry.tags) ? entry.tags : [],
          created_at: createdAt,
          updated_at: createdAt
        };
      } catch (error) {
        console.warn('Error migrating campaign log entry:', entry, error);
        return null;
      }
    }).filter(Boolean); // Remove null entries
  }

  /**
   * Convert date format from DD.MM.YYYY to YYYY-MM-DD
   * @param {string} dateString - Date in DD.MM.YYYY format
   * @returns {string} - Date in YYYY-MM-DD format
   */
  static convertDateFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return '';
    }

    // Handle DD.MM.YYYY format
    const dateMatch = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // If already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    console.warn('Unknown date format:', dateString);
    return dateString; // Return original if can't parse
  }

  /**
   * Extract a meaningful name from description
   * @param {string} description - Event description
   * @returns {string} - Extracted name
   */
  static extractNameFromDescription(description) {
    if (!description || typeof description !== 'string') {
      return 'Unnamed Event';
    }

    // Split by newlines and take first line
    const firstLine = description.split('\n')[0].trim();
    
    // If first line is too long, truncate it
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...';
    }
    
    // If first line is too short, use it as is or fallback
    if (firstLine.length < 3) {
      return description.length > 50 ? description.substring(0, 47) + '...' : description;
    }
    
    return firstLine;
  }

  /**
   * Convert real-time timestamp to ISO format
   * @param {string} realTimeString - Timestamp in DD.MM.YYYY HH:MM format
   * @returns {string} - ISO timestamp
   */
  static convertRealTimeToISO(realTimeString) {
    if (!realTimeString || typeof realTimeString !== 'string') {
      return new Date().toISOString();
    }

    // Handle DD.MM.YYYY HH:MM format
    const timeMatch = realTimeString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const [, day, month, year, hour, minute] = timeMatch;
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
      return date.toISOString();
    }

    return new Date().toISOString();
  }

  /**
   * Check if events need migration
   * @param {Array} events - Array of events to check
   * @returns {boolean} - True if migration is needed
   */
  static needsMigration(events) {
    if (!Array.isArray(events) || events.length === 0) {
      return false;
    }

    // Check if any event lacks the optimized structure markers
    return events.some(event => {
      return !(event.created_at && event.updated_at) || 
             !Object.prototype.hasOwnProperty.call(event, 'hasEndDateTime') ||
             typeof event.name === 'undefined' ||
             typeof event.description === 'undefined';
    });
  }

  /**
   * Backup events before migration
   * @param {Array} events - Events to backup
   * @returns {string} - JSON string backup
   */
  static createBackup(events) {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      events: events,
      migration_info: {
        original_count: events.length,
        backup_reason: 'Pre-migration backup'
      }
    };
    
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restore events from backup
   * @param {string} backupJson - JSON backup string
   * @returns {Array} - Restored events array
   */
  static restoreFromBackup(backupJson) {
    try {
      const backup = JSON.parse(backupJson);
      if (backup.events && Array.isArray(backup.events)) {
        return backup.events;
      }
      throw new Error('Invalid backup format: missing events array');
    } catch (error) {
      logger.error('Error restoring from backup:', error);
      throw new Error('Failed to restore from backup: ' + error.message);
    }
  }

  /**
   * Validate migrated events
   * @param {EventCollection} eventCollection - Migrated event collection
   * @returns {Object} - Validation result
   */
  static validateMigration(eventCollection) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      statistics: {
        total_events: eventCollection.length,
        events_with_names: 0,
        events_with_descriptions: 0,
        events_with_locations: 0,
        events_with_tags: 0,
        events_with_end_times: 0
      }
    };

    eventCollection.events.forEach((event, index) => {
      // Check required fields
      if (!event.name || event.name.trim() === '') {
        results.errors.push(`Event ${index + 1}: Name ist erforderlich`);
        results.isValid = false;
      } else {
        results.statistics.events_with_names++;
      }

      if (!event.description || event.description.trim() === '') {
        results.warnings.push(`Event ${index + 1}: Keine Beschreibung vorhanden`);
      } else {
        results.statistics.events_with_descriptions++;
      }

      if (!event.entry_date) {
        results.errors.push(`Event ${index + 1}: Startdatum ist erforderlich`);
        results.isValid = false;
      }

      // Count statistics
      if (event.location && event.location.trim() !== '') {
        results.statistics.events_with_locations++;
      }

      if (event.tags && event.tags.length > 0) {
        results.statistics.events_with_tags++;
      }

      if (event.hasEndDateTime) {
        results.statistics.events_with_end_times++;
      }
    });

    return results;
  }

  /**
   * Export optimized events to JSON format for storage
   * @param {EventCollection} eventCollection - Event collection to export
   * @returns {string} - JSON string for storage
   */
  static exportToJSON(eventCollection) {
    const exportData = {
      version: '2.0',
      exported_at: new Date().toISOString(),
      events: eventCollection.toJSON(),
      metadata: {
        total_events: eventCollection.length,
        tags: eventCollection.getAllTags()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import events from JSON format
   * @param {string} jsonString - JSON string to import
   * @returns {EventCollection} - Imported event collection
   */
  static importFromJSON(jsonString) {
    const backupResult = this.importBackup(jsonString);
    
    if (!backupResult.success) {
      const errorMessage = backupResult.errors.join('; ');
      throw new Error(`Import failed: ${errorMessage}`);
    }

    // Log warnings if any
    if (backupResult.warnings.length > 0) {
      console.warn('Import warnings:', backupResult.warnings);
    }

    return backupResult.eventCollection;
  }

  /**
   * Enhanced backup import functionality for various backup formats
   * @param {string} jsonString - JSON string to import
   * @returns {Object} - Import result with detailed information
   */
  static importBackup(jsonString) {
    const result = {
      success: false,
      eventCollection: null,
      metadata: {},
      warnings: [],
      errors: [],
      statistics: {
        imported: 0,
        skipped: 0,
        migrated: 0,
        total: 0
      }
    };

    try {
      const data = JSON.parse(jsonString);
      const importResult = this.detectAndImportFormat(data);
      
      result.success = importResult.success;
      result.eventCollection = importResult.eventCollection;
      result.metadata = importResult.metadata;
      result.warnings = importResult.warnings;
      result.errors = importResult.errors;
      result.statistics = importResult.statistics;

      if (result.success) {
        // Validate the imported events
        const validation = this.validateMigration(result.eventCollection);
        result.warnings.push(...validation.warnings);
        if (!validation.isValid) {
          result.errors.push(...validation.errors);
        }
      }

    } catch (parseError) {
      result.errors.push(`JSON Parse Error: ${parseError.message}`);
      logger.error('Error parsing backup JSON:', parseError);
    }

    return result;
  }

  /**
   * Detect backup format and import accordingly
   * @param {Object|Array} data - Parsed JSON data
   * @returns {Object} - Import result
   */
  static detectAndImportFormat(data) {
    const result = {
      success: false,
      eventCollection: null,
      metadata: {},
      warnings: [],
      errors: [],
      statistics: { imported: 0, skipped: 0, migrated: 0, total: 0 }
    };

    try {
      let eventsData = [];
      let formatDetected = 'unknown';

      // Format 1: Simple array of events (events.json)
      if (Array.isArray(data)) {
        eventsData = data;
        formatDetected = 'simple-array';
        result.metadata.format = 'Simple Events Array';
        result.warnings.push('Imported from simple array format (legacy backup)');
      }
      
      // Format 2: Campaign Log v4 format (your old format)
      else if (data && data.entries && Array.isArray(data.entries) && data.version) {
        eventsData = this.migrateCampaignLogV4(data);
        formatDetected = 'campaign-log-v4';
        result.metadata = {
          format: 'Campaign Log v4 Format',
          originalVersion: data.version,
          currentDateTime: data.current_datetime,
          appearanceMode: data.appearance_mode,
          totalEntries: data.entries.length
        };
        result.warnings.push(`Imported from Campaign Log v${data.version} format`);
        result.statistics.migrated = data.entries.length;
      }
      
      // Format 3: Object with events array (events-optimized.json)
      else if (data && typeof data === 'object') {
        if (data.events && Array.isArray(data.events)) {
          eventsData = data.events;
          formatDetected = 'optimized-object';
          result.metadata = {
            format: 'Optimized Events Object',
            version: data.version,
            originalCreatedAt: data.createdAt,
            originalUpdatedAt: data.updatedAt,
            totalEvents: data.events.length
          };
        }
        
        // Format 4: Current export format with metadata
        else if (data.version && data.exported_at && data.events) {
          eventsData = data.events;
          formatDetected = 'export-format';
          result.metadata = {
            format: 'Current Export Format',
            version: data.version,
            exportedAt: data.exported_at,
            metadata: data.metadata
          };
        }
        
        // Format 5: Backup with timestamp
        else if (data.timestamp && data.events) {
          eventsData = data.events;
          formatDetected = 'backup-format';
          result.metadata = {
            format: 'Backup Format',
            timestamp: data.timestamp,
            backupVersion: data.version,
            migrationInfo: data.migration_info
          };
        }
        
        // Unknown object format
        else {
          result.errors.push('Unknown backup format: Object structure not recognized');
          return result;
        }
      }
      
      else {
        result.errors.push('Invalid backup format: Expected array or object');
        return result;
      }

      result.statistics.total = eventsData.length;

      if (eventsData.length === 0) {
        result.warnings.push('Backup contains no events');
        result.eventCollection = new EventCollection([]);
        result.success = true;
        return result;
      }

      // Check if migration is needed
      const needsMigration = this.needsMigration(eventsData);
      
      if (needsMigration) {
        result.warnings.push(`Events require migration from ${formatDetected} format`);
        result.eventCollection = this.migrateLegacyEvents(eventsData);
        result.statistics.migrated = eventsData.length;
        result.statistics.imported = result.eventCollection.length;
        result.statistics.skipped = eventsData.length - result.eventCollection.length;
      } else {
        // Events are already in current format
        const validEvents = eventsData.filter(event => {
          try {
            new OptimizedEvent(event);
            return true;
          } catch (error) {
            result.warnings.push(`Skipped invalid event: ${event.name || 'Unknown'} - ${error.message}`);
            result.statistics.skipped++;
            return false;
          }
        });

        result.eventCollection = new EventCollection(validEvents);
        result.statistics.imported = validEvents.length;
      }

      result.success = true;
      console.log(`Successfully imported ${result.statistics.imported} events from ${formatDetected} format`);

    } catch (error) {
      result.errors.push(`Import processing error: ${error.message}`);
      logger.error('Error processing backup import:', error);
    }

    return result;
  }

  /**
   * Generate detailed import report
   * @param {Object} importResult - Result from importBackup
   * @returns {string} - HTML formatted report
   */
  static generateImportReport(importResult) {
    let report = '<div class="import-report">';
    
    // Header
    report += `<h3>Import Report</h3>`;
    
    // Success/Failure status
    if (importResult.success) {
      report += `<div class="status success">✅ Import successful</div>`;
    } else {
      report += `<div class="status error">❌ Import failed</div>`;
    }
    
    // Statistics
    report += `<div class="statistics">`;
    report += `<h4>Statistics:</h4>`;
    report += `<ul>`;
    report += `<li>Total events processed: ${importResult.statistics.total}</li>`;
    report += `<li>Successfully imported: ${importResult.statistics.imported}</li>`;
    report += `<li>Events migrated: ${importResult.statistics.migrated}</li>`;
    report += `<li>Events skipped: ${importResult.statistics.skipped}</li>`;
    report += `</ul>`;
    report += `</div>`;
    
    // Metadata
    if (Object.keys(importResult.metadata).length > 0) {
      report += `<div class="metadata">`;
      report += `<h4>Backup Information:</h4>`;
      report += `<ul>`;
      Object.entries(importResult.metadata).forEach(([key, value]) => {
        report += `<li>${key}: ${value}</li>`;
      });
      report += `</ul>`;
      report += `</div>`;
    }
    
    // Warnings
    if (importResult.warnings.length > 0) {
      report += `<div class="warnings">`;
      report += `<h4>⚠️ Warnings:</h4>`;
      report += `<ul>`;
      importResult.warnings.forEach(warning => {
        report += `<li>${warning}</li>`;
      });
      report += `</ul>`;
      report += `</div>`;
    }
    
    // Errors
    if (importResult.errors.length > 0) {
      report += `<div class="errors">`;
      report += `<h4>❌ Errors:</h4>`;
      report += `<ul>`;
      importResult.errors.forEach(error => {
        report += `<li>${error}</li>`;
      });
      report += `</ul>`;
      report += `</div>`;
    }
    
    report += '</div>';
    return report;
  }

  /**
   * Compare two event arrays for deep equality (ignoring order)
   * @param {Array} eventsA
   * @param {Array} eventsB
   * @returns {boolean}
   */
  static areEventsEqual(eventsA, eventsB) {
    if (!Array.isArray(eventsA) || !Array.isArray(eventsB)) return false;
    if (eventsA.length !== eventsB.length) return false;
    // Compare sorted by id for stability
    const sortById = arr => [...arr].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const aSorted = sortById(eventsA);
    const bSorted = sortById(eventsB);
    for (let i = 0; i < aSorted.length; i++) {
      if (JSON.stringify(aSorted[i]) !== JSON.stringify(bSorted[i])) return false;
    }
    return true;
  }
}

/**
 * Utility functions for data conversion
 */
export const DataConverter = {
  
  /**
   * Convert events to different export formats
   */
  toCSV(eventCollection) {
    const headers = ['ID', 'Name', 'Beschreibung', 'Startdatum', 'Startzeit', 'Enddatum', 'Endzeit', 'Ort', 'Tags'];
    const rows = [headers.join(',')];

    eventCollection.events.forEach(event => {
      const row = [
        event.id,
        `"${event.name.replace(/"/g, '""')}"`,
        `"${event.description.replace(/"/g, '""')}"`,
        event.entry_date,
        event.entry_time,
        event.end_date,
        event.end_time,
        `"${(event.location || '').replace(/"/g, '""')}"`,
        `"${event.tags.join(', ')}"`
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  },

  /**
   * Convert events to markdown format
   */
  toMarkdown(eventCollection) {
    let markdown = '# Timeline Events\n\n';
    
    const sortedEvents = eventCollection.getSortedByDate();
    
    sortedEvents.forEach(event => {
      markdown += `## ${event.name}\n\n`;
      markdown += `**Datum:** ${event.entry_date}`;
      if (event.entry_time) markdown += ` um ${event.entry_time}`;
      markdown += '\n\n';
      
      if (event.hasEndDateTime && event.end_date) {
        markdown += `**Ende:** ${event.end_date}`;
        if (event.end_time) markdown += ` um ${event.end_time}`;
        markdown += '\n\n';
      }
      
      if (event.location) {
        markdown += `**Ort:** ${event.location}\n\n`;
      }
      
      if (event.tags.length > 0) {
        markdown += `**Tags:** ${event.tags.join(', ')}\n\n`;
      }
      
      markdown += `${event.description}\n\n`;
      markdown += '---\n\n';
    });
    
    return markdown;
  }
};

// Export utility functions
export const migrateEvents = (events) => EventMigration.migrateLegacyEvents(events);
export const needsMigration = (events) => EventMigration.needsMigration(events);
export const createBackup = (events) => EventMigration.createBackup(events);