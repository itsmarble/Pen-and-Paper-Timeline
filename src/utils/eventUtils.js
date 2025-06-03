// Event Utilities for Pen & Paper Timeline
// Optimized event structure and utilities

/**
 * Optimized Event Class
 * Provides a modern, efficient way to handle events
 */
export class OptimizedEvent {
  constructor(data = {}) {
    // Core properties - always required
    this.id = data.id || Date.now();
    this.name = data.name || '';
    this.description = data.description || '';
    
    // Date/Time properties
    this.entry_date = data.entry_date || '';
    this.entry_time = data.entry_time || '';
    this.end_date = data.end_date || '';
    this.end_time = data.end_time || '';
    this.hasEndDateTime = data.hasEndDateTime || false;
    
    // Optional properties
    this.location = data.location || '';
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    
    // Meta properties
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Get full datetime as Date object
  getStartDateTime() {
    if (!this.entry_date) return null;
    const dateTime = `${this.entry_date}T${this.entry_time || '00:00'}`;
    return new Date(dateTime);
  }

  getEndDateTime() {
    if (!this.hasEndDateTime || !this.end_date) return null;
    const dateTime = `${this.end_date}T${this.end_time || '23:59'}`;
    return new Date(dateTime);
  }

  // Get duration in minutes
  getDuration() {
    if (!this.hasEndDateTime) return 0;
    const start = this.getStartDateTime();
    const end = this.getEndDateTime();
    if (!start || !end) return 0;
    return Math.floor((end - start) / (1000 * 60));
  }

  // Format duration for display
  getFormattedDuration() {
    const minutes = this.getDuration();
    if (minutes === 0) return 'Momentan';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  }

  // Check if event is ongoing at a specific time
  isActiveAt(gameTime) {
    const start = this.getStartDateTime();
    if (!start) return false;
    
    if (!this.hasEndDateTime) {
      // For point-in-time events, consider a ±30 minute window
      const eventWindow = 30 * 60 * 1000; // 30 minutes in milliseconds
      const windowStart = start.getTime() - eventWindow;
      const windowEnd = start.getTime() + eventWindow;
      return gameTime >= windowStart && gameTime <= windowEnd;
    }
    
    const end = this.getEndDateTime();
    return gameTime >= start && gameTime <= end;
  }

  // Get searchable text for fuzzy search with field separation
  getSearchableText() {
    return {
      name: this.name || '',
      description: this.description || '',
      location: this.location || '',
      tags: this.tags || [],
      combined: [
        this.name,
        this.description,
        this.location,
        ...this.tags
      ].filter(Boolean).join(' ').toLowerCase()
    };
  }

  // Advanced search scoring with multiple strategies
  getSearchScore(searchTerm, selectedTags = []) {
    if (!searchTerm && selectedTags.length === 0) return { score: 1, matches: [] };
    
    let totalScore = 0;
    let matches = [];
    const maxScore = 1000;
    
    // Tag filtering - mandatory match
    if (selectedTags.length > 0) {
      const hasAllTags = selectedTags.every(tag => 
        this.tags.some(eventTag => 
          eventTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasAllTags) return { score: 0, matches: [] };
      
      // Bonus for tag matches
      totalScore += selectedTags.length * 100; // Increased bonus for tag matches
      matches.push(...selectedTags.map(tag => ({ field: 'tags', value: tag, type: 'tag' })));
    }
    
    // Text search with advanced scoring
    if (searchTerm && searchTerm.trim()) {
      const searchableData = this.getSearchableText();
      const normalizedQuery = this.normalizeText(searchTerm);
      const queryTokens = this.tokenize(normalizedQuery);
      
      // Score different fields with weights
      const fieldWeights = {
        name: 400,        // Highest weight for name matches (increased)
        description: 250,  // Medium-high weight for description (increased)
        location: 200,    // Medium weight for location (increased)
        tags: 150        // Higher weight for tag content (increased)
      };
      
      Object.entries(fieldWeights).forEach(([field, weight]) => {
        if (field === 'tags') {
          // Special handling for tags array
          this.tags.forEach(tag => {
            const tagScore = this.calculateFieldScore(tag, queryTokens, normalizedQuery, weight);
            if (tagScore.score > 0) {
              totalScore += tagScore.score;
              matches.push(...tagScore.matches.map(m => ({ ...m, field: 'tags' })));
            }
          });
        } else {
          const fieldScore = this.calculateFieldScore(
            searchableData[field], 
            queryTokens, 
            normalizedQuery, 
            weight
          );
          if (fieldScore.score > 0) {
            totalScore += fieldScore.score;
            matches.push(...fieldScore.matches.map(m => ({ ...m, field })));
          }
        }
      });
      
      // Bonus for multiple field matches
      const uniqueFields = new Set(matches.map(m => m.field));
      if (uniqueFields.size > 1) {
        totalScore += uniqueFields.size * 50; // Increased multi-field bonus
      }
      
      // Bonus for query completeness (how much of the query was matched)
      const queryWords = normalizedQuery.split(/\s+/);
      const matchedTokens = new Set(matches.map(m => m.value));
      let queryCompleteness = 0;
      
      queryWords.forEach(word => {
        if (matchedTokens.has(word)) {
          queryCompleteness += 1;
        } else {
          // Check for partial matches in the matched tokens
          for (const token of matchedTokens) {
            if (token.includes(word) || word.includes(token)) {
              queryCompleteness += 0.5;
              break;
            }
          }
        }
      });
      
      const completenessBonus = (queryCompleteness / queryWords.length) * 100;
      totalScore += completenessBonus;
      
      // Bonus for exact phrase matches across fields
      const combinedText = Object.values(searchableData).join(' ');
      if (this.normalizeText(combinedText).includes(normalizedQuery)) {
        totalScore += 150; // Exact phrase bonus
        matches.push({
          type: 'exact_phrase',
          value: searchTerm,
          field: 'combined',
          score: 150
        });
      }
      
      // Penalty for very short queries that might be too generic
      if (normalizedQuery.length < 3) {
        totalScore *= 0.5;
      }
      
      // Early return if no matches found
      if (totalScore === 0 && searchTerm.trim()) {
        return { score: 0, matches: [] };
      }
    }
    
    // Normalize score to 0-1 range with better distribution
    const normalizedScore = Math.min(totalScore / maxScore, 1);
    
    // Apply logarithmic scaling for better score distribution
    const adjustedScore = normalizedScore > 0 ? Math.log10(normalizedScore * 9 + 1) : 0;
    
    return { 
      score: adjustedScore, 
      matches,
      totalScore,
      breakdown: {
        tagBonus: selectedTags.length * 100,
        textScore: totalScore - (selectedTags.length * 100),
        multiFieldBonus: new Set(matches.map(m => m.field)).size > 1 ? new Set(matches.map(m => m.field)).size * 50 : 0
      }
    };
  }

  // Advanced text normalization with comprehensive preprocessing
  normalizeText(text) {
    if (!text) return '';
    
    // Step 1: Convert to lowercase and handle special characters
    let normalized = text.toLowerCase();
    
    // Step 2: Normalize unicode characters (handle umlauts, accents, etc.)
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Step 3: German-specific character replacements
    const germanReplacements = {
      'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
      'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a',
      'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
      'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o',
      'ù': 'u', 'ú': 'u', 'û': 'u',
      'ñ': 'n', 'ç': 'c'
    };
    
    Object.entries(germanReplacements).forEach(([from, to]) => {
      normalized = normalized.replace(new RegExp(from, 'g'), to);
    });
    
    // Step 4: Handle common word variations and contractions
    const wordVariations = {
      'und': 'u', 'oder': 'o', 'der': 'd', 'die': 'd', 'das': 'd',
      'ein': 'e', 'eine': 'e', 'einer': 'e', 'einem': 'e',
      'ist': 'i', 'sind': 's', 'war': 'w', 'waren': 'w',
      'haben': 'h', 'hat': 'h', 'hatte': 'h', 'hatten': 'h'
    };
    
    // Step 5: Replace punctuation with spaces, but preserve word boundaries
    normalized = normalized.replace(/[^\w\s\-]/g, ' ');
    
    // Step 6: Handle hyphens and compound words
    normalized = normalized.replace(/\-+/g, ' ');
    
    // Step 7: Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
  }

  // Intelligent tokenization with advanced phrase extraction
  tokenize(text) {
    if (!text) return [];
    
    const words = text.split(/\s+/).filter(word => word.length > 1);
    const tokens = new Set();
    
    // Add individual words with stemming approximation
    words.forEach(word => {
      tokens.add(word);
      
      // Add word stems (simple German stemming)
      if (word.length > 4) {
        const stem = this.approximateGermanStem(word);
        if (stem !== word) tokens.add(stem);
      }
    });
    
    // Add bigrams for phrase matching
    for (let i = 0; i < words.length - 1; i++) {
      tokens.add(`${words[i]} ${words[i + 1]}`);
    }
    
    // Add trigrams for longer phrase matching
    for (let i = 0; i < words.length - 2; i++) {
      tokens.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    
    // Add prefix tokens for partial matching
    words.forEach(word => {
      if (word.length > 3) {
        for (let i = 3; i <= Math.min(word.length, 8); i++) {
          tokens.add(word.substring(0, i));
        }
      }
    });
    
    // Add suffix tokens for reverse matching
    words.forEach(word => {
      if (word.length > 4) {
        for (let i = Math.max(3, word.length - 5); i < word.length; i++) {
          tokens.add(word.substring(i));
        }
      }
    });
    
    // Add skip-gram tokens (words with one word skipped)
    for (let i = 0; i < words.length - 2; i++) {
      tokens.add(`${words[i]} ${words[i + 2]}`);
    }
    
    return Array.from(tokens);
  }

  // Simple German stemming approximation
  approximateGermanStem(word) {
    if (word.length <= 3) return word;
    
    // Common German endings to remove
    const endings = [
      'ungen', 'ung', 'heit', 'keit', 'schaft', 'lich', 'los', 'bar',
      'sam', 'voll', 'reich', 'arm', 'frei', 'leer', 'fest', 'stark',
      'schwach', 'gut', 'schlecht', 'groß', 'klein', 'neu', 'alt',
      'jung', 'en', 'er', 'es', 'em', 'e', 's', 't', 'n'
    ];
    
    for (const ending of endings) {
      if (word.endsWith(ending) && word.length - ending.length >= 3) {
        return word.substring(0, word.length - ending.length);
      }
    }
    
    return word;
  }  // Calculate field-specific score with multiple matching strategies
  calculateFieldScore(fieldText, queryTokens, originalQuery, baseWeight) {
    if (!fieldText) return { score: 0, matches: [] };
    
    const normalizedField = this.normalizeText(fieldText);
    let score = 0;
    let matches = [];
    
    // Early exit for empty field
    if (!normalizedField) return { score: 0, matches: [] };
    
    // Strategy 1: Exact phrase matching (highest score)
    if (normalizedField.includes(originalQuery)) {
      const exactBonus = baseWeight * 1.0; // Increased from 0.8
      score += exactBonus;
      matches.push({ 
        type: 'exact', 
        value: originalQuery, 
        score: exactBonus,
        position: normalizedField.indexOf(originalQuery)
      });
    }
    
    // Strategy 2: Advanced token matching
    const fieldWords = normalizedField.split(/\s+/);
    const fieldTokens = new Set(fieldWords);
    
    queryTokens.forEach(token => {
      if (token.length < 2) return; // Skip very short tokens
      
      // 1. Exact token match - highest priority
      if (fieldTokens.has(token)) {
        const tokenScore = baseWeight * 0.7 * Math.min(token.length / 5, 1); // Cap length bonus
        score += tokenScore;
        matches.push({ 
          type: 'exact_token', 
          value: token, 
          score: tokenScore,
          position: normalizedField.indexOf(token)
        });
        return; // Skip other matching for exact matches
      }
      
      // 2. Advanced fuzzy matching with Jaro-Winkler for better results
      fieldWords.forEach(word => {
        if (word.length < 2) return;
        
        const jaroWinklerSim = this.jaroWinklerSimilarity(token, word);
        if (jaroWinklerSim > 0.8) { // Higher threshold for better quality
          const fuzzyScore = baseWeight * 0.5 * jaroWinklerSim;
          score += fuzzyScore;
          matches.push({ 
            type: 'fuzzy_jaro', 
            value: token,
            matched: word,
            similarity: jaroWinklerSim,
            score: fuzzyScore
          });
          return;
        }
        
        // Fallback to Levenshtein for very similar words
        const levenshteinSim = this.getLevenshteinSimilarity(token, word);
        if (levenshteinSim > 0.75) {
          const fuzzyScore = baseWeight * 0.3 * levenshteinSim;
          score += fuzzyScore;
          matches.push({ 
            type: 'fuzzy_levenshtein', 
            value: token,
            matched: word,
            similarity: levenshteinSim,
            score: fuzzyScore
          });
        }
      });
      
      // 3. Smart prefix matching
      fieldWords.forEach(word => {
        if (word.startsWith(token) && token.length >= 3) {
          const coverage = token.length / word.length;
          const prefixScore = baseWeight * 0.4 * coverage;
          score += prefixScore;
          matches.push({ 
            type: 'prefix', 
            value: token, 
            matched: word,
            coverage,
            score: prefixScore
          });
        }
        
        // Reverse prefix (word starts with query)
        if (token.startsWith(word) && word.length >= 3) {
          const coverage = word.length / token.length;
          const reversePrefixScore = baseWeight * 0.3 * coverage;
          score += reversePrefixScore;
          matches.push({ 
            type: 'reverse_prefix', 
            value: token, 
            matched: word,
            coverage,
            score: reversePrefixScore
          });
        }
      });
      
      // 4. Substring matching for partial words
      fieldWords.forEach(word => {
        if (word.includes(token) && token.length >= 3 && !word.startsWith(token)) {
          const substringScore = baseWeight * 0.2 * (token.length / word.length);
          score += substringScore;
          matches.push({ 
            type: 'substring', 
            value: token, 
            matched: word,
            score: substringScore
          });
        }
      });
    });
    
    // Strategy 3: Enhanced Soundex matching for phonetic similarity
    if (originalQuery.length > 3) {
      const soundexMatches = this.improvedSoundexMatch(originalQuery, normalizedField);
      if (soundexMatches.length > 0) {
        const soundexScore = baseWeight * 0.15 * soundexMatches.length;
        score += soundexScore;
        matches.push(...soundexMatches.map(match => ({
          type: 'soundex',
          value: match.query,
          matched: match.target,
          score: soundexScore / soundexMatches.length
        })));
      }
    }
    
    // Strategy 4: N-gram matching for better partial matches
    if (originalQuery.length > 4) {
      const ngramScore = this.calculateNgramSimilarity(originalQuery, normalizedField);
      if (ngramScore > 0.3) {
        const ngramBonus = baseWeight * 0.25 * ngramScore;
        score += ngramBonus;
        matches.push({
          type: 'ngram',
          value: originalQuery,
          similarity: ngramScore,
          score: ngramBonus
        });
      }
    }
    
    return { score, matches };
  }

  // Levenshtein distance for fuzzy matching
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get Levenshtein similarity (0-1)
  getLevenshteinSimilarity(str1, str2) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  // Jaro-Winkler similarity for better fuzzy matching
  jaroWinklerSimilarity(str1, str2) {
    // Jaro similarity calculation
    const jaroSim = this.jaroSimilarity(str1, str2);
    
    // Add Winkler prefix bonus
    let prefix = 0;
    const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));
    
    for (let i = 0; i < maxPrefix; i++) {
      if (str1[i] === str2[i]) {
        prefix++;
      } else {
        break;
      }
    }
    
    return jaroSim + (0.1 * prefix * (1 - jaroSim));
  }

  // Jaro similarity calculation
  jaroSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < str1.length; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, str2.length);
      
      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = true;
        str2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0;
    
    // Find transpositions
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }
    
    return (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;
  }

  // N-gram similarity for partial matching
  calculateNgramSimilarity(str1, str2, n = 3) {
    const ngrams1 = this.getNgrams(str1, n);
    const ngrams2 = this.getNgrams(str2, n);
    
    if (ngrams1.length === 0 && ngrams2.length === 0) return 1;
    if (ngrams1.length === 0 || ngrams2.length === 0) return 0;
    
    const set1 = new Set(ngrams1);
    const set2 = new Set(ngrams2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  // Generate n-grams from string
  getNgrams(str, n) {
    const ngrams = [];
    for (let i = 0; i <= str.length - n; i++) {
      ngrams.push(str.substring(i, i + n));
    }
    return ngrams;
  }

  // Improved Soundex implementation for phonetic matching
  improvedSoundex(str) {
    if (!str) return '';
    
    const word = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (!word) return '';
    
    const firstLetter = word[0];
    
    // Enhanced mapping for better German phonetics
    const mapping = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1', 'W': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };
    
    let code = firstLetter;
    let prevCode = mapping[firstLetter] || '';
    
    for (let i = 1; i < word.length && code.length < 6; i++) {
      const currentCode = mapping[word[i]] || '';
      if (currentCode && currentCode !== prevCode) {
        code += currentCode;
        prevCode = currentCode;
      } else if (!currentCode) {
        prevCode = '';
      }
    }
    
    return code.padEnd(6, '0');
  }

  // Enhanced soundex matching with better algorithms
  improvedSoundexMatch(query, text) {
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);
    const matches = [];
    
    queryWords.forEach(queryWord => {
      if (queryWord.length < 3) return;
      const querySoundex = this.improvedSoundex(queryWord);
      
      textWords.forEach(textWord => {
        if (textWord.length < 3) return;
        const textSoundex = this.improvedSoundex(textWord);
        
        // Allow partial soundex matches for better recall
        if (querySoundex === textSoundex || 
            querySoundex.substring(0, 4) === textSoundex.substring(0, 4)) {
          if (queryWord !== textWord) {
            matches.push({ query: queryWord, target: textWord });
          }
        }
      });
    });
    
    return matches;
  }

  // Simplified Soundex implementation for phonetic matching
  soundex(str) {
    if (!str) return '';
    
    const word = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (!word) return '';
    
    const firstLetter = word[0];
    const mapping = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };
    
    let code = firstLetter;
    for (let i = 1; i < word.length && code.length < 4; i++) {
      const mapped = mapping[word[i]];
      if (mapped && mapped !== code[code.length - 1]) {
        code += mapped;
      }
    }
    
    return code.padEnd(4, '0');
  }

  // Find soundex matches between query and text
  soundexMatch(query, text) {
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);
    const matches = [];
    
    queryWords.forEach(queryWord => {
      if (queryWord.length < 3) return;
      const querySoundex = this.soundex(queryWord);
      
      textWords.forEach(textWord => {
        if (textWord.length < 3) return;
        const textSoundex = this.soundex(textWord);
        
        if (querySoundex === textSoundex && queryWord !== textWord) {
          matches.push({ query: queryWord, target: textWord });
        }
      });
    });
    
    return matches;
  }

  // Legacy compatibility method
  matchesSearch(searchTerm, selectedTags = []) {
    const result = this.getSearchScore(searchTerm, selectedTags);
    return result.score > 0;
  }

  // Update event and set updated_at timestamp
  update(data) {
    Object.assign(this, data);
    this.updated_at = new Date().toISOString();
    return this;
  }

  // Clone event
  clone() {
    return new OptimizedEvent(this);
  }

  // Export to JSON format
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      entry_date: this.entry_date,
      entry_time: this.entry_time,
      end_date: this.end_date,
      end_time: this.end_time,
      hasEndDateTime: this.hasEndDateTime,
      location: this.location,
      tags: [...this.tags],
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

/**
 * Event Collection Manager
 * Efficiently manages collections of events
 */
export class EventCollection {
  constructor(events = []) {
    this.events = events.map(event => 
      event instanceof OptimizedEvent ? event : new OptimizedEvent(event)
    );
    this._sortedByDate = null;
    this._tagCache = null;
  }

  // Add event
  add(eventData) {
    const event = eventData instanceof OptimizedEvent ? 
      eventData : new OptimizedEvent(eventData);
    this.events.push(event);
    this._invalidateCache();
    return event;
  }

  // Remove event by ID
  remove(id) {
    const index = this.events.findIndex(event => event.id === id);
    if (index >= 0) {
      const removed = this.events.splice(index, 1)[0];
      this._invalidateCache();
      return removed;
    }
    return null;
  }

  // Update event
  update(id, data) {
    const event = this.findById(id);
    if (event) {
      event.update(data);
      this._invalidateCache();
      return event;
    }
    return null;
  }

  // Find event by ID
  findById(id) {
    return this.events.find(event => event.id === id);
  }

  // Get events sorted by date
  getSortedByDate() {
    if (!this._sortedByDate) {
      this._sortedByDate = [...this.events].sort((a, b) => {
        const dateA = a.getStartDateTime();
        const dateB = b.getStartDateTime();
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA - dateB;
      });
    }
    return this._sortedByDate;
  }

  // Get all unique tags
  getAllTags() {
    if (!this._tagCache) {
      const tagSet = new Set();
      this.events.forEach(event => {
        event.tags.forEach(tag => tagSet.add(tag));
      });
      this._tagCache = Array.from(tagSet).sort();
    }
    return this._tagCache;
  }

  // Advanced search with intelligent ranking and scoring
  search(searchTerm = '', selectedTags = [], options = {}) {
    const {
      minScore = 0.02,          // Lower threshold for more inclusive results
      maxResults = 100,         // Maximum number of results
      sortBy = 'relevance',     // 'relevance', 'date', 'name'
      includeScoring = false,   // Whether to include scoring information
      boostRecent = false       // Boost recently created/updated events
    } = options;

    // If no search criteria, return all events sorted by date
    if (!searchTerm.trim() && selectedTags.length === 0) {
      return this.getSortedByDate();
    }

    const startTime = performance.now();
    let scoredEvents = [];

    // Preprocess search term for better matching
    const processedSearchTerm = this.preprocessSearchTerm(searchTerm);

    // Score all events
    this.events.forEach(event => {
      const scoreResult = event.getSearchScore(processedSearchTerm, selectedTags);
      
      if (scoreResult.score >= minScore) {
        let finalScore = scoreResult.score;
        
        // Apply time-based boosting if enabled
        if (boostRecent) {
          const now = new Date();
          const eventDate = event.getStartDateTime();
          if (eventDate) {
            const daysDiff = Math.abs(now - eventDate) / (1000 * 60 * 60 * 24);
            const recencyBoost = Math.max(0, 1 - (daysDiff / 365)); // Boost events within a year
            finalScore *= (1 + recencyBoost * 0.2);
          }
        }
        
        scoredEvents.push({
          event,
          score: finalScore,
          originalScore: scoreResult.score,
          matches: scoreResult.matches,
          breakdown: scoreResult.breakdown,
          ...(includeScoring ? { scoreDetails: scoreResult } : {})
        });
      }
    });

    // Apply advanced sorting with tie-breaking
    switch (sortBy) {
      case 'relevance':
        scoredEvents.sort((a, b) => {
          // Primary sort: by score (descending)
          const scoreDiff = b.score - a.score;
          if (Math.abs(scoreDiff) > 0.001) {
            return scoreDiff;
          }
          
          // Secondary sort: by number of exact matches
          const aExactMatches = a.matches.filter(m => m.type === 'exact' || m.type === 'exact_token').length;
          const bExactMatches = b.matches.filter(m => m.type === 'exact' || m.type === 'exact_token').length;
          if (aExactMatches !== bExactMatches) {
            return bExactMatches - aExactMatches;
          }
          
          // Tertiary sort: by total number of matches
          const aMatches = a.matches.length;
          const bMatches = b.matches.length;
          if (aMatches !== bMatches) {
            return bMatches - aMatches;
          }
          
          // Quaternary sort: by field diversity
          const aFields = new Set(a.matches.map(m => m.field)).size;
          const bFields = new Set(b.matches.map(m => m.field)).size;
          if (aFields !== bFields) {
            return bFields - aFields;
          }
          
          // Final sort: by date (ascending)
          const dateA = a.event.getStartDateTime();
          const dateB = b.event.getStartDateTime();
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateA - dateB;
        });
        break;
        
      case 'date':
        scoredEvents.sort((a, b) => {
          const dateA = a.event.getStartDateTime();
          const dateB = b.event.getStartDateTime();
          if (!dateA && !dateB) return b.score - a.score;
          if (!dateA) return 1;
          if (!dateB) return -1;
          const dateComparison = dateA - dateB;
          return dateComparison !== 0 ? dateComparison : b.score - a.score;
        });
        break;
        
      case 'name':
        scoredEvents.sort((a, b) => {
          const nameA = a.event.name.toLowerCase();
          const nameB = b.event.name.toLowerCase();
          const nameComparison = nameA.localeCompare(nameB);
          return nameComparison !== 0 ? nameComparison : b.score - a.score;
        });
        break;
    }

    // Limit results
    if (maxResults && scoredEvents.length > maxResults) {
      scoredEvents = scoredEvents.slice(0, maxResults);
    }

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // Enhanced search analytics
    if (searchTerm.trim()) {
      const analytics = this.generateSearchAnalytics(searchTerm, selectedTags, scoredEvents, searchTime);
      console.debug('Enhanced Search Analytics:', analytics);
    }

    // Return just the events unless scoring details are requested
    return includeScoring ? scoredEvents : scoredEvents.map(result => result.event);
  }

  // Preprocess search terms for better matching
  preprocessSearchTerm(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) return '';
    
    let processed = searchTerm.trim();
    
    // Handle quoted phrases - preserve them as single units
    const quotedPhrases = [];
    processed = processed.replace(/"([^"]+)"/g, (match, phrase) => {
      quotedPhrases.push(phrase);
      return `__QUOTED_${quotedPhrases.length - 1}__`;
    });
    
    // Expand common abbreviations and contractions
    const expansions = {
      'n': 'und',
      'u': 'und', 
      'd': 'der die das',
      'gob': 'goblin',
      'ork': 'orc',
      'elf': 'elfen',
      'zw': 'zwerg',
      'mag': 'magier'
    };
    
    // Apply expansions to individual words
    processed = processed.split(/\s+/).map(word => {
      const lowerWord = word.toLowerCase();
      return expansions[lowerWord] || word;
    }).join(' ');
    
    // Restore quoted phrases
    quotedPhrases.forEach((phrase, index) => {
      processed = processed.replace(`__QUOTED_${index}__`, `"${phrase}"`);
    });
    
    return processed;
  }

  // Generate comprehensive search analytics
  generateSearchAnalytics(searchTerm, selectedTags, scoredEvents, searchTime) {
    const analytics = {
      query: searchTerm,
      tags: selectedTags,
      resultCount: scoredEvents.length,
      searchTime: `${searchTime.toFixed(2)}ms`,
      averageScore: scoredEvents.length > 0 
        ? (scoredEvents.reduce((sum, r) => sum + r.score, 0) / scoredEvents.length).toFixed(3)
        : 0,
      topScore: scoredEvents.length > 0 ? scoredEvents[0].score.toFixed(3) : 0,
      matchTypes: {},
      fieldDistribution: {},
      scoreDistribution: {
        high: 0,    // > 0.8
        medium: 0,  // 0.4 - 0.8
        low: 0      // < 0.4
      }
    };
    
    // Analyze match types and field distribution
    scoredEvents.forEach(result => {
      // Score distribution
      if (result.score > 0.8) analytics.scoreDistribution.high++;
      else if (result.score > 0.4) analytics.scoreDistribution.medium++;
      else analytics.scoreDistribution.low++;
      
      // Match type analysis
      result.matches.forEach(match => {
        analytics.matchTypes[match.type] = (analytics.matchTypes[match.type] || 0) + 1;
        analytics.fieldDistribution[match.field] = (analytics.fieldDistribution[match.field] || 0) + 1;
      });
    });
    
    return analytics;
  }

  // Get search suggestions based on existing events
  getSearchSuggestions(partialQuery = '', limit = 5) {
    if (!partialQuery.trim()) return [];
    
    const query = partialQuery.toLowerCase();
    const suggestions = new Set();
    
    // Collect terms from all events
    this.events.forEach(event => {
      const searchableData = event.getSearchableText();
      
      // Extract potential matches from names (highest priority)
      if (event.name.toLowerCase().includes(query)) {
        suggestions.add(event.name);
      }
      
      // Extract from locations
      if (event.location && event.location.toLowerCase().includes(query)) {
        suggestions.add(event.location);
      }
      
      // Extract from tags
      event.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag);
        }
      });
      
      // Extract words from descriptions that start with the query
      const words = event.description.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(query) && word.length > query.length + 1) {
          suggestions.add(word);
        }
      });
    });
    
    // Convert to array and sort by relevance
    return Array.from(suggestions)
      .filter(suggestion => suggestion.length >= partialQuery.length)
      .sort((a, b) => {
        // Prioritize exact starts
        const aStarts = a.toLowerCase().startsWith(query);
        const bStarts = b.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Then by length (shorter is more relevant)
        return a.length - b.length;
      })
      .slice(0, limit);
  }

  // Get search analytics
  getSearchAnalytics() {
    const totalEvents = this.events.length;
    const tagStats = {};
    let totalWords = 0;
    let avgDescriptionLength = 0;
    
    this.events.forEach(event => {
      // Tag statistics
      event.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
      
      // Text statistics
      const words = event.getSearchableText().combined.split(/\s+/).length;
      totalWords += words;
      avgDescriptionLength += event.description.length;
    });
    
    const popularTags = Object.entries(tagStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count, percentage: (count / totalEvents * 100).toFixed(1) }));
    
    return {
      totalEvents,
      totalWords,
      averageWordsPerEvent: totalEvents > 0 ? Math.round(totalWords / totalEvents) : 0,
      averageDescriptionLength: totalEvents > 0 ? Math.round(avgDescriptionLength / totalEvents) : 0,
      totalTags: Object.keys(tagStats).length,
      popularTags,
      searchableFields: ['name', 'description', 'location', 'tags']
    };
  }

  // Get events active at specific time
  getActiveAt(gameTime) {
    return this.events.filter(event => event.isActiveAt(gameTime));
  }

  // Get events in date range
  getInDateRange(startDate, endDate) {
    return this.events.filter(event => {
      const eventDate = event.getStartDateTime();
      if (!eventDate) return false;
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  // Export to JSON
  toJSON() {
    return this.events.map(event => event.toJSON());
  }

  // Get size
  get length() {
    return this.events.length;
  }

  // Clone collection
  clone() {
    return new EventCollection(this.events.map(event => event.clone()));
  }

  // Invalidate caches when events change
  _invalidateCache() {
    this._sortedByDate = null;
    this._tagCache = null;
  }
}

/**
 * Event validation utilities
 */
export const EventValidator = {
  // Validate event data
  validate(eventData) {
    const errors = [];

    if (!eventData.name?.trim()) {
      errors.push('Name ist erforderlich');
    }

    if (!eventData.description?.trim()) {
      errors.push('Beschreibung ist erforderlich');
    }

    if (!eventData.entry_date || !this.isValidDate(eventData.entry_date)) {
      errors.push('Gültiges Startdatum ist erforderlich');
    }

    if (eventData.entry_time && !this.isValidTime(eventData.entry_time)) {
      errors.push('Ungültiges Startzeit-Format');
    }

    if (eventData.hasEndDateTime) {
      if (!eventData.end_date || !this.isValidDate(eventData.end_date)) {
        errors.push('Gültiges Enddatum ist erforderlich wenn Endzeit gesetzt ist');
      }
      
      if (eventData.end_time && !this.isValidTime(eventData.end_time)) {
        errors.push('Ungültiges Endzeit-Format');
      }

      // Check if end is after start
      if (eventData.entry_date && eventData.end_date) {
        const start = new Date(`${eventData.entry_date}T${eventData.entry_time || '00:00'}`);
        const end = new Date(`${eventData.end_date}T${eventData.end_time || '23:59'}`);
        
        if (end <= start) {
          errors.push('Endzeit muss nach der Startzeit liegen');
        }
      }
    }

    if (eventData.tags && !Array.isArray(eventData.tags)) {
      errors.push('Tags müssen ein Array sein');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  },

  isValidTime(timeString) {
    return timeString.match(/^\d{2}:\d{2}$/);
  }
};

/**
 * Event formatting utilities
 */
export const EventFormatter = {
  // Format date for display
  formatDate(dateString, locale = 'de-DE') {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format time for display
  formatTime(timeString) {
    if (!timeString) return '';
    return timeString;
  },

  // Format datetime for display
  formatDateTime(dateString, timeString, locale = 'de-DE') {
    const date = this.formatDate(dateString, locale);
    const time = this.formatTime(timeString);
    if (!date) return '';
    if (!time) return date;
    return `${date} um ${time}`;
  },

  // Format tags for display
  formatTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return '';
    return tags.join(', ');
  }
};

/**
 * Search highlighting and utilities
 */
export const SearchUtils = {
  // Highlight search terms in text
  highlightText(text, searchTerm, className = 'bg-yellow-200 px-1 rounded') {
    if (!text || !searchTerm) return text;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return text;
    
    // Create a regex that matches the search term (case insensitive)
    const regex = new RegExp(`(${normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    // Replace matches with highlighted versions
    return text.replace(regex, `<span class="${className}">$1</span>`);
  },

  // Get readable search summary
  getSearchSummary(searchTerm, selectedTags, resultCount, totalEvents) {
    const parts = [];
    
    if (searchTerm?.trim()) {
      parts.push(`"${searchTerm.trim()}"`);
    }
    
    if (selectedTags?.length > 0) {
      parts.push(`Tags: ${selectedTags.join(', ')}`);
    }
    
    const criteria = parts.length > 0 ? parts.join(' + ') : 'All events';
    const percentage = totalEvents > 0 ? Math.round((resultCount / totalEvents) * 100) : 0;
    
    return {
      criteria,
      resultCount,
      totalEvents,
      percentage,
      message: resultCount === 0 
        ? `No events found for ${criteria}`
        : `${resultCount} of ${totalEvents} events (${percentage}%) match ${criteria}`
    };
  },

  // Format search result with relevance info
  formatSearchResult(event, searchInfo = null) {
    const result = {
      ...event.toJSON(),
      relevance: searchInfo?.score || 1,
      matchCount: searchInfo?.matches?.length || 0,
      matchedFields: searchInfo?.matches ? 
        [...new Set(searchInfo.matches.map(m => m.field))] : [],
      highlightedText: {}
    };

    // Add highlighted versions of text fields if search info is available
    if (searchInfo?.matches) {
      const matchedTerms = [...new Set(searchInfo.matches.map(m => m.value))];
      const searchTerm = matchedTerms.join(' ');
      
      result.highlightedText = {
        name: SearchUtils.highlightText(event.name, searchTerm),
        description: SearchUtils.highlightText(event.description, searchTerm),
        location: SearchUtils.highlightText(event.location, searchTerm)
      };
    }

    return result;
  },

  // Debounce function for search input
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smart search query parser
  parseSearchQuery(query) {
    if (!query?.trim()) return { terms: [], operators: [], tags: [] };
    
    const normalizedQuery = query.trim().toLowerCase();
    
    // Extract quoted phrases
    const phrases = [];
    const phraseRegex = /"([^"]+)"/g;
    let match;
    while ((match = phraseRegex.exec(normalizedQuery)) !== null) {
      phrases.push(match[1]);
    }
    
    // Remove quotes from query for further processing
    const withoutQuotes = normalizedQuery.replace(/"[^"]*"/g, ' ').trim();
    
    // Extract tags (words starting with #)
    const tagMatches = withoutQuotes.match(/#\w+/g) || [];
    const tags = tagMatches.map(tag => tag.substring(1));
    
    // Remove tags from query
    const withoutTags = withoutQuotes.replace(/#\w+/g, ' ').trim();
    
    // Extract remaining terms
    const remainingTerms = withoutTags.split(/\s+/).filter(term => term.length > 0);
    
    // Combine all search terms
    const allTerms = [...phrases, ...remainingTerms];
    
    return {
      terms: allTerms,
      phrases,
      tags,
      operators: [], // Could be extended for AND/OR/NOT operations
      originalQuery: query
    };
  }
};

// Export convenience functions
export const createEvent = (data) => new OptimizedEvent(data);
export const createEventCollection = (events) => new EventCollection(events);