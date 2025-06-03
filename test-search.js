// Quick test for the enhanced search functionality
import { EventCollection } from './src/utils/eventUtils.js';

// Sample test data
const testEvents = [
  {
    id: 1,
    name: "Goblin Angriff auf die Stadt",
    date: "2024-03-15T10:00:00",
    description: "Eine Gruppe von Goblins greift die Stadtmauern an. Die Wachen kämpfen tapfer.",
    location: "Stadtmauern von Königsfeld",
    tags: ["Kampf", "Goblins", "Stadt", "Verteidigung"]
  },
  {
    id: 2,
    name: "Handel mit dem Zwergenhändler",
    date: "2024-03-16T14:30:00",
    description: "Erfolgreicher Handel mit seltenen Erzen und magischen Gegenständen.",
    location: "Marktplatz",
    tags: ["Handel", "Zwerge", "Magie", "Erze"]
  },
  {
    id: 3,
    name: "Rettung der Prinzessin",
    date: "2024-03-17T09:15:00",
    description: "Die entführte Prinzessin wurde aus dem Turm des bösen Zauberers befreit.",
    location: "Zaubererturm",
    tags: ["Rettung", "Prinzessin", "Zauberer", "Turm"]
  },
  {
    id: 4,
    name: "Drachenkampf am Vulkan",
    date: "2024-03-18T16:45:00",
    description: "Epischer Kampf gegen den roten Drachen Flammenherz am Feuervulkan.",
    location: "Feuervulkan",
    tags: ["Drachen", "Kampf", "Vulkan", "Episch"]
  }
];

// Initialize the event collection
const eventCollection = new EventCollection(testEvents);

console.log("🧪 Testing Enhanced Search Functionality\n");
console.log("=".repeat(50));

// Test 1: Exact search
console.log("\n1. Exact Search Test:");
const exactResults = eventCollection.search("Goblin Angriff");
console.log(`Query: "Goblin Angriff" -> Found ${exactResults.length} results`);
exactResults.forEach(event => console.log(`  - ${event.name} (Score: ${event.searchScore?.toFixed(3)})`));

// Test 2: Fuzzy search with typos
console.log("\n2. Fuzzy Search Test (with typos):");
const fuzzyResults = eventCollection.search("Gobblin Angrif");
console.log(`Query: "Gobblin Angrif" -> Found ${fuzzyResults.length} results`);
fuzzyResults.forEach(event => console.log(`  - ${event.name} (Score: ${event.searchScore?.toFixed(3)})`));

// Test 3: Partial word search
console.log("\n3. Partial Word Search Test:");
const partialResults = eventCollection.search("Prinz");
console.log(`Query: "Prinz" -> Found ${partialResults.length} results`);
partialResults.forEach(event => console.log(`  - ${event.name} (Score: ${event.searchScore?.toFixed(3)})`));

// Test 4: German character normalization
console.log("\n4. German Character Normalization Test:");
const germanResults = eventCollection.search("Händler");
console.log(`Query: "Händler" -> Found ${germanResults.length} results`);
germanResults.forEach(event => console.log(`  - ${event.name} (Score: ${event.searchScore?.toFixed(3)})`));

// Test 5: Multi-field search
console.log("\n5. Multi-field Search Test:");
const multiResults = eventCollection.search("Zauberer Turm");
console.log(`Query: "Zauberer Turm" -> Found ${multiResults.length} results`);
multiResults.forEach(event => console.log(`  - ${event.name} (Score: ${event.searchScore?.toFixed(3)})`));

// Test 6: Tag search
console.log("\n6. Tag-based Search Test:");
const tagResults = eventCollection.search("", ["Kampf"]);
console.log(`Query: Tag "Kampf" -> Found ${tagResults.length} results`);
tagResults.forEach(event => console.log(`  - ${event.name}`));

// Test 7: Search suggestions
console.log("\n7. Search Suggestions Test:");
const suggestions = eventCollection.getSearchSuggestions("Drag", 3);
console.log(`Query: "Drag" -> Suggestions: ${suggestions.join(", ")}`);

// Test 8: Search analytics
console.log("\n8. Search Analytics:");
const analytics = eventCollection.getSearchAnalytics();
console.log(`Total events: ${analytics.totalEvents}`);
console.log(`Total unique terms: ${analytics.totalUniqueTerms}`);
console.log(`Most common terms: ${analytics.mostCommonTerms.slice(0, 3).join(", ")}`);

console.log("\n" + "=".repeat(50));
console.log("✅ Search tests completed!");
