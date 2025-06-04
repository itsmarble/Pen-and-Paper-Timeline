// Event Utilities for Pen & Paper Timeline

export class OptimizedEvent {
  constructor(data = {}) {
    this.id = data.id || Date.now();
    this.name = data.name || '';
    this.description = data.description || '';
    this.entry_date = data.entry_date || '';
    this.entry_time = data.entry_time || '';
    this.end_date = data.end_date || '';
    this.end_time = data.end_time || '';
    this.hasEndDateTime = data.hasEndDateTime || false;
    this.location = data.location || '';
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this._searchCache = null;
  }

  getStartDateTime() {
    if (!this.entry_date) return null;
    return new Date(`${this.entry_date}T${this.entry_time || '00:00'}`);
  }

  getEndDateTime() {
    if (!this.hasEndDateTime || !this.end_date) return null;
    return new Date(`${this.end_date}T${this.end_time || '23:59'}`);
  }

  getDuration() {
    if (!this.hasEndDateTime) return 0;
    const start = this.getStartDateTime();
    const end = this.getEndDateTime();
    if (!start || !end) return 0;
    return Math.floor((end - start) / (1000 * 60));
  }

  getFormattedDuration() {
    const minutes = this.getDuration();
    if (minutes === 0) return 'Momentan';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  }

  isActiveAt(gameTime) {
    const start = this.getStartDateTime();
    if (!start) return false;
    if (!this.hasEndDateTime) {
      const eventWindow = 30 * 60 * 1000;
      const windowStart = start.getTime() - eventWindow;
      const windowEnd = start.getTime() + eventWindow;
      return gameTime >= windowStart && gameTime <= windowEnd;
    }
    const end = this.getEndDateTime();
    return gameTime >= start && gameTime <= end;
  }

  getSearchableText() {
    if (!this._searchCache) {
      this._searchCache = {
        name: this.name || '',
        description: this.description || '',
        location: this.location || '',
        tags: this.tags || [],
        combined: [
          this.name,
          this.description,
          this.location,
          ...(this.tags || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
      };
    }
    return this._searchCache;
  }

  getSearchScore(searchTerm, selectedTags = []) {
    if (!searchTerm && selectedTags.length === 0) return { score: 1, matches: [] };
    let totalScore = 0;
    let matches = [];
    const maxScore = 1000;
    if (selectedTags.length > 0) {
      const hasAllTags = selectedTags.every(tag => this.tags.some(eventTag => eventTag.toLowerCase().includes(tag.toLowerCase())));
      if (!hasAllTags) return { score: 0, matches: [] };
      totalScore += selectedTags.length * 100;
      matches.push(...selectedTags.map(tag => ({ field: 'tags', value: tag, type: 'tag' })));
    }
    if (searchTerm && searchTerm.trim()) {
      const searchableData = this.getSearchableText();
      const normalizedQuery = this.normalizeText(searchTerm);
      const queryTokens = this.tokenize(normalizedQuery);
      const fieldWeights = { name: 400, description: 250, location: 200, tags: 150 };
      Object.entries(fieldWeights).forEach(([field, weight]) => {
        if (field === 'tags') {
          this.tags.forEach(tag => {
            const tagScore = this.calculateFieldScore(tag, queryTokens, normalizedQuery, weight);
            if (tagScore.score > 0) {
              totalScore += tagScore.score;
              matches.push(...tagScore.matches.map(m => ({ ...m, field: 'tags' })));
            }
          });
        } else {
          const fieldScore = this.calculateFieldScore(searchableData[field], queryTokens, normalizedQuery, weight);
          if (fieldScore.score > 0) {
            totalScore += fieldScore.score;
            matches.push(...fieldScore.matches.map(m => ({ ...m, field })));
          }
        }
      });
      const uniqueFields = new Set(matches.map(m => m.field));
      if (uniqueFields.size > 1) totalScore += uniqueFields.size * 50;
      const queryWords = normalizedQuery.split(/\s+/);
      const matchedTokens = new Set(matches.map(m => m.value));
      let queryCompleteness = 0;
      queryWords.forEach(word => {
        if (matchedTokens.has(word)) {
          queryCompleteness += 1;
        } else {
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
      const combinedText = Object.values(searchableData).join(' ');
      if (this.normalizeText(combinedText).includes(normalizedQuery)) {
        totalScore += 150;
        matches.push({ type: 'exact_phrase', value: searchTerm, field: 'combined', score: 150 });
      }
      if (normalizedQuery.length < 3) totalScore *= 0.5;
      // --- SUPER-FUZZY FALLBACK: If totalScore is 0, try aggressive fallback ---
      if (totalScore === 0 && searchTerm.trim()) {
        // Try to find the minimum edit distance to any word in any field
        const allWords = [searchableData.name, searchableData.description, searchableData.location, ...(this.tags || [])]
          .join(' ').split(/\s+/).filter(Boolean);
        let minDistance = Infinity;
        let bestWord = '';
        for (const word of allWords) {
          const normWord = this.normalizeText(word);
          const dist = this.levenshteinDistance(normWord, normalizedQuery);
          if (dist < minDistance) {
            minDistance = dist;
            bestWord = word;
          }
        }
        // If the minimum edit distance is reasonably close, give a low but nonzero score
        if (minDistance < Math.max(4, Math.floor(normalizedQuery.length * 0.5))) {
          totalScore = 0.12 * maxScore * (1 - minDistance / Math.max(normalizedQuery.length, 1));
          matches.push({ type: 'super_fuzzy', value: searchTerm, matched: bestWord, distance: minDistance, score: totalScore });
        }
      }
    }
    const normalizedScore = Math.min(totalScore / maxScore, 1);
    const adjustedScore = normalizedScore > 0 ? Math.log10(normalizedScore * 9 + 1) : 0;
    return { score: adjustedScore, matches, totalScore, breakdown: { tagBonus: selectedTags.length * 100, textScore: totalScore - (selectedTags.length * 100), multiFieldBonus: new Set(matches.map(m => m.field)).size > 1 ? new Set(matches.map(m => m.field)).size * 50 : 0 } };
  }

  normalizeText(text) {
    if (!text) return '';
    let normalized = text.toLowerCase();
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const germanReplacements = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ñ': 'n', 'ç': 'c' };
    Object.entries(germanReplacements).forEach(([from, to]) => { normalized = normalized.replace(new RegExp(from, 'g'), to); });
    normalized = normalized.replace(/[^\w\s-]/g, ' ');
    normalized = normalized.replace(/-+/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }

  tokenize(text) {
    if (!text) return [];
    const words = text.split(/\s+/).filter(word => word.length > 1);
    const tokens = new Set();
    words.forEach(word => {
      tokens.add(word);
      if (word.length > 4) {
        const stem = this.approximateGermanStem(word);
        if (stem !== word) tokens.add(stem);
      }
    });
    for (let i = 0; i < words.length - 1; i++) tokens.add(`${words[i]} ${words[i + 1]}`);
    for (let i = 0; i < words.length - 2; i++) tokens.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    words.forEach(word => { if (word.length > 3) { for (let i = 3; i <= Math.min(word.length, 8); i++) tokens.add(word.substring(0, i)); } });
    words.forEach(word => { if (word.length > 4) { for (let i = Math.max(3, word.length - 5); i < word.length; i++) tokens.add(word.substring(i)); } });
    for (let i = 0; i < words.length - 2; i++) tokens.add(`${words[i]} ${words[i + 2]}`);
    return Array.from(tokens);
  }

  approximateGermanStem(word) {
    if (word.length <= 3) return word;
    const endings = ['ungen', 'ung', 'heit', 'keit', 'schaft', 'lich', 'los', 'bar', 'sam', 'voll', 'reich', 'arm', 'frei', 'leer', 'fest', 'stark', 'schwach', 'gut', 'schlecht', 'groß', 'klein', 'neu', 'alt', 'jung', 'en', 'er', 'es', 'em', 'e', 's', 't', 'n'];
    for (const ending of endings) {
      if (word.endsWith(ending) && word.length - ending.length >= 3) {
        return word.substring(0, word.length - ending.length);
      }
    }
    return word;
  }

  calculateFieldScore(fieldText, queryTokens, originalQuery, baseWeight) {
    if (!fieldText) return { score: 0, matches: [] };
    const normalizedField = this.normalizeText(fieldText);
    let score = 0;
    let matches = [];
    if (!normalizedField) return { score: 0, matches: [] };
    if (normalizedField.includes(originalQuery)) {
      const exactBonus = baseWeight * 1.0;
      score += exactBonus;
      matches.push({ type: 'exact', value: originalQuery, score: exactBonus, position: normalizedField.indexOf(originalQuery) });
    }
    const fieldWords = normalizedField.split(/\s+/);
    const fieldTokens = new Set(fieldWords);
    queryTokens.forEach(token => {
      if (token.length < 2) return;
      if (fieldTokens.has(token)) {
        const tokenScore = baseWeight * 0.7 * Math.min(token.length / 5, 1);
        score += tokenScore;
        matches.push({ type: 'exact_token', value: token, score: tokenScore, position: normalizedField.indexOf(token) });
        return;
      }
      fieldWords.forEach(word => {
        if (word.length < 2) return;
        const jaroWinklerSim = this.jaroWinklerSimilarity(token, word);
        if (jaroWinklerSim > 0.8) {
          const fuzzyScore = baseWeight * 0.5 * jaroWinklerSim;
          score += fuzzyScore;
          matches.push({ type: 'fuzzy_jaro', value: token, matched: word, similarity: jaroWinklerSim, score: fuzzyScore });
          return;
        }
        const levenshteinSim = this.getLevenshteinSimilarity(token, word);
        if (levenshteinSim > 0.75) {
          const fuzzyScore = baseWeight * 0.3 * levenshteinSim;
          score += fuzzyScore;
          matches.push({ type: 'fuzzy_levenshtein', value: token, matched: word, similarity: levenshteinSim, score: fuzzyScore });
        }
      });
      fieldWords.forEach(word => {
        if (word.startsWith(token) && token.length >= 3) {
          const coverage = token.length / word.length;
          const prefixScore = baseWeight * 0.4 * coverage;
          score += prefixScore;
          matches.push({ type: 'prefix', value: token, matched: word, coverage, score: prefixScore });
        }
        if (token.startsWith(word) && word.length >= 3) {
          const coverage = word.length / token.length;
          const reversePrefixScore = baseWeight * 0.3 * coverage;
          score += reversePrefixScore;
          matches.push({ type: 'reverse_prefix', value: token, matched: word, coverage, score: reversePrefixScore });
        }
      });
      fieldWords.forEach(word => {
        if (word.includes(token) && token.length >= 3 && !word.startsWith(token)) {
          const substringScore = baseWeight * 0.2 * (token.length / word.length);
          score += substringScore;
          matches.push({ type: 'substring', value: token, matched: word, score: substringScore });
        }
      });
    });
    if (originalQuery.length > 3) {
      const soundexMatches = this.improvedSoundexMatch(originalQuery, normalizedField);
      if (soundexMatches.length > 0) {
        const soundexScore = baseWeight * 0.15 * soundexMatches.length;
        score += soundexScore;
        matches.push(...soundexMatches.map(match => ({ type: 'soundex', value: match.query, matched: match.target, score: soundexScore / soundexMatches.length })));
      }
    }
    if (originalQuery.length > 4) {
      const ngramScore = this.calculateNgramSimilarity(originalQuery, normalizedField);
      if (ngramScore > 0.3) {
        const ngramBonus = baseWeight * 0.25 * ngramScore;
        score += ngramBonus;
        matches.push({ type: 'ngram', value: originalQuery, similarity: ngramScore, score: ngramBonus });
      }
    }
    return { score, matches };
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[str2.length][str1.length];
  }

  getLevenshteinSimilarity(str1, str2) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  jaroWinklerSimilarity(str1, str2) {
    const jaroSim = this.jaroSimilarity(str1, str2);
    let prefix = 0;
    const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));
    for (let i = 0; i < maxPrefix; i++) {
      if (str1[i] === str2[i]) prefix++;
      else break;
    }
    return jaroSim + (0.1 * prefix * (1 - jaroSim));
  }

  jaroSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);
    let matches = 0;
    let transpositions = 0;
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
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }
    return (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;
  }

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

  getNgrams(str, n) {
    const ngrams = [];
    for (let i = 0; i <= str.length - n; i++) ngrams.push(str.substring(i, i + n));
    return ngrams;
  }

  improvedSoundex(str) {
    if (!str) return '';
    const word = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (!word) return '';
    const firstLetter = word[0];
    const mapping = { 'B': '1', 'F': '1', 'P': '1', 'V': '1', 'W': '1', 'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2', 'D': '3', 'T': '3', 'L': '4', 'M': '5', 'N': '5', 'R': '6' };
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
        if (querySoundex === textSoundex || querySoundex.substring(0, 4) === textSoundex.substring(0, 4)) {
          if (queryWord !== textWord) matches.push({ query: queryWord, target: textWord });
        }
      });
    });
    return matches;
  }

  update(data) {
    Object.assign(this, data);
    this._searchCache = null;
    this.updated_at = new Date().toISOString();
    return this;
  }

  clone() {
    return new OptimizedEvent(this);
  }

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

export class EventCollection {
  constructor(events = []) {
    this.events = events.map(event => event instanceof OptimizedEvent ? event : new OptimizedEvent(event));
    this._sortedByDate = null;
    this._tagCache = null;
    this._lastChangeHash = this._computeHash();
  }

  _invalidateCache() {
    this._sortedByDate = null;
    this._tagCache = null;
    this._lastChangeHash = this._computeHash();
  }

  _computeHash() {
    // Simple hash: JSON.stringify all events, then hashCode
    const json = JSON.stringify(this.events.map(e => e.toJSON()));
    let hash = 0, i, chr;
    for (i = 0; i < json.length; i++) {
      chr = json.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  hasChangedSince(lastHash) {
    return this._lastChangeHash !== lastHash;
  }

  getChangeHash() {
    return this._lastChangeHash;
  }

  add(eventData) {
    const event = eventData instanceof OptimizedEvent ? eventData : new OptimizedEvent(eventData);
    this.events.push(event);
    this._invalidateCache();
    return event;
  }

  remove(id) {
    const index = this.events.findIndex(event => event.id === id);
    if (index >= 0) {
      const removed = this.events.splice(index, 1)[0];
      this._invalidateCache();
      return removed;
    }
    return null;
  }

  update(id, data) {
    const event = this.findById(id);
    if (event) {
      event.update(data);
      this._invalidateCache();
      return event;
    }
    return null;
  }

  findById(id) {
    return this.events.find(event => event.id === id);
  }

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

  getAllTags() {
    if (!this._tagCache) {
      const tagSet = new Set();
      this.events.forEach(event => { event.tags.forEach(tag => tagSet.add(tag)); });
      this._tagCache = Array.from(tagSet).sort();
    }
    return this._tagCache;
  }

  search(searchTerm = '', selectedTags = [], options = {}) {
    const { minScore = 0.02, maxResults = 100, sortBy = 'relevance', includeScoring = false, boostRecent = false } = options;
    if (!searchTerm.trim() && selectedTags.length === 0) return this.getSortedByDate();
    const startTime = performance.now();
    let scoredEvents = [];
    const processedSearchTerm = this.preprocessSearchTerm(searchTerm);
    this.events.forEach(event => {
      const scoreResult = event.getSearchScore(processedSearchTerm, selectedTags);
      if (scoreResult.score >= minScore) {
        let finalScore = scoreResult.score;
        if (boostRecent) {
          const now = new Date();
          const eventDate = event.getStartDateTime();
          // Boost score for recent events within the last 30 days
          const daysDiff = Math.abs(now - eventDate) / (1000 * 60 * 60 * 24);
          if (daysDiff <= 30) {
            finalScore *= (1 + (30 - daysDiff) / 30 * 0.2);
          }
        }
        scoredEvents.push({
          event,
          score: finalScore,
          matches: includeScoring ? scoreResult.matches : undefined
        });
      }
    });

    // --- SUPER-FUZZY FALLBACK: Wenn keine oder sehr wenige Ergebnisse, mache einen zweiten, noch toleranteren Durchlauf ---
    if (scoredEvents.length < 2 && searchTerm.trim().length > 2) {
      const fallbackEvents = [];
      this.events.forEach(event => {
        // Führe getSearchScore mit leerem searchTerm aus, aber prüfe Levenshtein-Distanz von Query zu jedem Wort in allen Feldern
        const searchableData = event.getSearchableText();
        const allWords = [searchableData.name, searchableData.description, searchableData.location, ...(event.tags || [])]
          .join(' ').split(/\s+/).filter(Boolean);
        let minDistance = Infinity;
        let bestWord = '';
        const normQuery = event.normalizeText(searchTerm);
        for (const word of allWords) {
          const normWord = event.normalizeText(word);
          const dist = event.levenshteinDistance(normWord, normQuery);
          if (dist < minDistance) {
            minDistance = dist;
            bestWord = word;
          }
        }
        if (minDistance < Math.max(4, Math.floor(normQuery.length * 0.5))) {
          // Score ist absichtlich niedrig, aber >0
          const fallbackScore = 0.10 + 0.25 * (1 - minDistance / Math.max(normQuery.length, 1));
          fallbackEvents.push({
            event,
            score: fallbackScore,
            matches: [{ type: 'super_fuzzy_fallback', value: searchTerm, matched: bestWord, distance: minDistance, score: fallbackScore }]
          });
        }
      });
      // Füge Fallback-Events hinzu, die noch nicht in scoredEvents sind
      const existingIds = new Set(scoredEvents.map(e => e.event.id));
      fallbackEvents.forEach(fb => {
        if (!existingIds.has(fb.event.id)) scoredEvents.push(fb);
      });
    }

    // Sort results
    if (sortBy === 'relevance') {
      scoredEvents.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'date') {
      scoredEvents.sort((a, b) => b.event.getStartDateTime() - a.event.getStartDateTime());
    }

    // Limit results
    if (maxResults && scoredEvents.length > maxResults) {
      scoredEvents = scoredEvents.slice(0, maxResults);
    }

    const endTime = performance.now();
    console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms`);

    return includeScoring ? scoredEvents : scoredEvents.map(item => item.event);
  }

  // Suggest search terms based on event data
  getSearchSuggestions(searchTerm, maxResults = 8) {
    if (!searchTerm || searchTerm.length < 2) return [];
    const normalized = searchTerm.toLowerCase();
    const suggestions = new Set();
    this.events.forEach(event => {
      const text = event.getSearchableText().combined;
      text.split(/\s+/).forEach(word => {
        if (word.length > 1 && word.startsWith(normalized)) {
          suggestions.add(word);
        }
      });
    });
    // Return most relevant suggestions, sorted by frequency
    const suggestionArr = Array.from(suggestions);
    suggestionArr.sort((a, b) => a.localeCompare(b));
    return suggestionArr.slice(0, maxResults);
  }

  preprocessSearchTerm(searchTerm) {
    return searchTerm.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  exportToJSON() {
    return {
      version: "2.0.0",
      generatedAt: new Date().toISOString(),
      events: this.events.map(event => event.toJSON()),
      metadata: {
        totalEvents: this.events.length,
        tags: this.getAllTags(),
        dateRange: this.getDateRange()
      }
    };
  }

  getDateRange() {
    if (this.events.length === 0) return null;
    
    const dates = this.events.map(event => event.getStartDateTime()).filter(Boolean);
    if (dates.length === 0) return null;
    
    return {
      earliest: new Date(Math.min(...dates)),
      latest: new Date(Math.max(...dates))
    };
  }

  clone() {
    return new EventCollection(this.events.map(event => event.clone()));
  }

  toJSON() {
    return this.events.map(event => event.toJSON());
  }
}

export class EventValidator {
  static validateEvent(eventData) {
    const errors = [];
    // Name
    if (!eventData.name || eventData.name.trim().length === 0) {
      errors.push('Event name is required');
    }
    // Datum
    if (!eventData.entry_date || eventData.entry_date.trim().length === 0) {
      errors.push('Event date is required');
    }
    // Zeit
    if (!eventData.entry_time || eventData.entry_time.trim().length === 0) {
      errors.push('Event time is required');
    }
    // Beschreibung
    if (!eventData.description || eventData.description.trim().length === 0) {
      errors.push('Event description is required');
    }
    // Enddatum/-zeit falls hasEndDateTime aktiv
    if (eventData.hasEndDateTime) {
      if (!eventData.end_date || eventData.end_date.trim().length === 0) {
        errors.push('End date is required when a time range is set');
      }
      if (!eventData.end_time || eventData.end_time.trim().length === 0) {
        errors.push('End time is required when a time range is set');
      }
      // Endzeitpunkt muss nach Startzeitpunkt liegen
      if (eventData.end_date && eventData.end_time && eventData.entry_date && eventData.entry_time) {
        const start = new Date(`${eventData.entry_date}T${eventData.entry_time}`);
        const end = new Date(`${eventData.end_date}T${eventData.end_time}`);
        if (end <= start) {
          errors.push('End date/time must be after start date/time');
        }
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class EventFormatter {
  static formatDateTime(date, time) {
    if (!date || !time) return '';
    
    try {
      const dateTime = new Date(`${date}T${time}`);
      return dateTime.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return `${date} ${time}`;
    }
  }
  
  static formatDateRange(startDate, startTime, endDate, endTime) {
    const start = this.formatDateTime(startDate, startTime);
    if (!endDate || !endTime) return start;
    
    const end = this.formatDateTime(endDate, endTime);
    return `${start} - ${end}`;
  }
}