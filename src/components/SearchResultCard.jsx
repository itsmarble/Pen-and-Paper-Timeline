import React from 'react';
import { BadgeCheck, Search, Tag, Info, Star } from 'lucide-react';

// Helper to highlight matched terms in text
function highlightMatches(text, matches) {
  if (!matches || matches.length === 0) return text;
  let result = [];
  let lastIndex = 0;
  // Sort matches by position
  const sorted = matches
    .filter(m => typeof m.position === 'number' && m.position >= 0)
    .sort((a, b) => a.position - b.position);
  sorted.forEach((match, i) => {
    const { position, value } = match;
    if (position > lastIndex) {
      result.push(text.slice(lastIndex, position));
    }
    result.push(
      <mark key={i} className="bg-yellow-200 rounded px-1 text-black font-semibold">
        {text.substr(position, value.length)}
      </mark>
    );
    lastIndex = position + value.length;
  });
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

// Badge for match type
function MatchBadge({ type }) {
  const map = {
    exact: { icon: <BadgeCheck size={14} />, label: 'Exakt' },
    exact_token: { icon: <Search size={14} />, label: 'Wort' },
    fuzzy_jaro: { icon: <Star size={14} />, label: 'Fuzzy' },
    fuzzy_levenshtein: { icon: <Star size={14} />, label: 'Fuzzy' },
    tag: { icon: <Tag size={14} />, label: 'Tag' },
    prefix: { icon: <Info size={14} />, label: 'Präfix' },
    reverse_prefix: { icon: <Info size={14} />, label: 'Präfix' },
    substring: { icon: <Info size={14} />, label: 'Teilwort' },
    soundex: { icon: <Info size={14} />, label: 'Klang' },
    ngram: { icon: <Info size={14} />, label: 'N-Gramm' },
    exact_phrase: { icon: <BadgeCheck size={14} />, label: 'Phrase' },
    super_fuzzy: { icon: <Star size={14} />, label: 'Sehr Fuzzy' },
    super_fuzzy_fallback: { icon: <Star size={14} />, label: 'Fallback' },
  };
  const entry = map[type] || { icon: <Info size={14} />, label: type };
  return (
    <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 rounded px-1.5 py-0.5 text-xs mr-1" title={type}>
      {entry.icon} {entry.label}
    </span>
  );
}

const SearchResultCard = ({ event, matches = [], score = null, onClick }) => {
  // Group matches by field
  const fieldMatches = {};
  matches.forEach(m => {
    if (!fieldMatches[m.field]) fieldMatches[m.field] = [];
    fieldMatches[m.field].push(m);
  });
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-lg transition cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {highlightMatches(event.name, fieldMatches.name || [])}
        </div>
        {score !== null && (
          <div className="flex items-center gap-1">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-2 rounded bg-green-400" style={{ width: `${Math.round(score * 100)}%` }} />
            </div>
            <span className="text-xs text-gray-500 ml-1">{Math.round(score * 100)}%</span>
          </div>
        )}
      </div>
      <div className="text-gray-700 dark:text-gray-200 mb-1">
        {highlightMatches(event.description, fieldMatches.description || [])}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
        {event.location && (
          <span className="inline-flex items-center"><MapPin size={14} className="mr-1" />{highlightMatches(event.location, fieldMatches.location || [])}</span>
        )}
        {event.tags && event.tags.length > 0 && event.tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1"><Tag size={12} className="mr-1" />{tag}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {/* Show unique match types as badges */}
        {Array.from(new Set(matches.map(m => m.type))).map((type, i) => (
          <MatchBadge key={i} type={type} />
        ))}
      </div>
    </div>
  );
};

export default SearchResultCard;
