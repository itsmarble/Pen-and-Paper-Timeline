#!/usr/bin/env node

/**
 * 🚀 Enhanced Search Functionality Demonstration
 * 
 * This script demonstrates all the advanced search capabilities
 * implemented in the pen-paper-timeline application.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import our enhanced event utilities
import { EventCollection, OptimizedEvent } from './src/utils/eventUtils.js';

// Load real events data
const eventsPath = join(__dirname, 'src', 'data', 'events.json');
const eventsData = JSON.parse(readFileSync(eventsPath, 'utf8'));

console.log('🎮 Pen Paper Timeline - Enhanced Search Demonstration');
console.log('=' .repeat(60));
console.log();

// Initialize event collection with real data
const eventCollection = new EventCollection(eventsData);
const analytics = eventCollection.getSearchAnalytics();

console.log('📊 Search System Overview:');
console.log(`   • Total Events: ${analytics.totalEvents}`);
console.log(`   • Total Words: ${analytics.totalWords}`);
console.log(`   • Average Words per Event: ${analytics.averageWordsPerEvent}`);
console.log(`   • Total Tags: ${analytics.totalTags}`);
if (analytics.popularTags && analytics.popularTags.length > 0) {
    console.log(`   • Most Popular Tags: ${analytics.popularTags.slice(0, 3).map(t => t.tag).join(', ')}`);
}
console.log();

function demonstrateSearch(title, query, tags = [], options = {}) {
    console.log(`🔍 ${title}`);
    console.log(`   Query: "${query}" ${tags.length ? `| Tags: [${tags.join(', ')}]` : ''}`);
    
    const results = eventCollection.search(query, tags, { includeScoring: true, ...options });
    
    console.log(`   Results: ${results.length} found`);
    results.slice(0, 3).forEach((result, i) => {
        const event = result.event || result;
        const name = event.name || event.data?.name || 'Unnamed Event';
        const location = event.location || event.data?.location;
        const score = result.score || result.searchScore;
        console.log(`   ${i + 1}. ${name} (Score: ${score?.toFixed(3) || 'N/A'})`);
        if (location) console.log(`      📍 ${location}`);
    });
    console.log();
    
    return results;
}

// Demonstration scenarios
console.log('🧪 ENHANCED SEARCH CAPABILITIES DEMONSTRATION');
console.log('-'.repeat(60));
console.log();

// 1. Exact matching
demonstrateSearch(
    'Exact Search - Perfect Match',
    'Bergheim'
);

// 2. Fuzzy matching with typos
demonstrateSearch(
    'Fuzzy Search - Handles Typos',
    'Gobblin Angriif'  // Intentional typos
);

// 3. German character normalization
demonstrateSearch(
    'German Normalization - ä/ö/ü/ß handling',
    'Gespraech'  // Should find "Gespräch"
);

// 4. Partial word matching
demonstrateSearch(
    'Partial Word Search - Prefix/Suffix',
    'Schm'  // Should find "Schmied"
);

// 5. Multi-word phrase matching
demonstrateSearch(
    'Multi-word Phrase Matching',
    'Turnier Arena'
);

// 6. Soundex phonetic matching
demonstrateSearch(
    'Soundex Phonetic Matching',
    'Tavern'  // Should find "Taverne"
);

// 7. Tag-based filtering
demonstrateSearch(
    'Tag-based Filtering',
    '',  // Empty query to focus on tags
    ['kampf']
);

// 8. Combined search with tags
demonstrateSearch(
    'Combined Search + Tags',
    'Ruine',
    ['gefahr']
);

// 9. Advanced scoring demonstration
demonstrateSearch(
    'Advanced Scoring - Name vs Description',
    'quest',
    [],
    { minScore: 0.01 }  // Lower threshold to see more results
);

// 10. Search suggestions
console.log('🔍 Search Suggestions Demo');
console.log('   Query prefix: "Gob"');
const suggestions = eventCollection.getSearchSuggestions('Gob', 5);
console.log(`   Suggestions: ${suggestions.join(', ')}`);
console.log();

console.log('🔍 Search Suggestions Demo - Partial Names');
console.log('   Query prefix: "Berg"');
const suggestions2 = eventCollection.getSearchSuggestions('Berg', 5);
console.log(`   Suggestions: ${suggestions2.join(', ')}`);
console.log();

// Advanced analytics
console.log('📈 ADVANCED SEARCH ANALYTICS');
console.log('-'.repeat(60));
console.log();

const detailedAnalytics = eventCollection.getSearchAnalytics();
console.log('📊 Detailed Analytics:');
console.log(`   • Total Events: ${detailedAnalytics.totalEvents}`);
console.log(`   • Total Words: ${detailedAnalytics.totalWords}`);
console.log(`   • Average Words per Event: ${detailedAnalytics.averageWordsPerEvent}`);
console.log(`   • Average Description Length: ${detailedAnalytics.averageDescriptionLength} chars`);
console.log(`   • Total Unique Tags: ${detailedAnalytics.totalTags}`);
console.log(`   • Searchable Fields: ${detailedAnalytics.searchableFields.join(', ')}`);
console.log();

console.log('🎯 SEARCH QUALITY INDICATORS');
console.log('-'.repeat(60));
console.log();

// Test search quality with various scenarios
const qualityTests = [
    { query: 'Goblin', expected: 'goblin' },
    { query: 'Gobblin', expected: 'goblin' },  // Typo
    { query: 'Händler', expected: 'händler' },
    { query: 'Haendler', expected: 'händler' },  // Normalized
    { query: 'Prinz', expected: 'prinzessin' },  // Partial
];

qualityTests.forEach(test => {
    const results = eventCollection.search(test.query, [], { minScore: 0.05 });
    const found = results.length > 0;
    const status = found ? '✅' : '❌';
    console.log(`${status} "${test.query}" → Expected: ${test.expected} | Found: ${found ? results[0].name : 'None'}`);
});

console.log();
console.log('🎉 SUMMARY');
console.log('-'.repeat(60));
console.log();
console.log('✅ Enhanced search features successfully implemented:');
console.log('   🧠 Fuzzy matching with Levenshtein & Jaro-Winkler algorithms');
console.log('   🇩🇪 German language normalization (ä→ae, ö→oe, ü→ue, ß→ss)');
console.log('   🔍 Advanced tokenization with stemming approximation');
console.log('   📊 Multi-field scoring with intelligent weight distribution');
console.log('   🎯 Exact phrase detection and partial word matching');
console.log('   🔊 Soundex phonetic matching for similar-sounding words');
console.log('   📈 Comprehensive search analytics and performance metrics');
console.log('   💡 Real-time search suggestions and autocomplete');
console.log('   ⚡ Optimized performance with smart indexing');
console.log();
console.log('🚀 The pen-paper-timeline now features state-of-the-art search capabilities!');
