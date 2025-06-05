import React from 'react';
import { BadgeCheck, Search, Tag, Info, Star, Calendar, MapPin, Edit3, Trash2, Target, Zap } from 'lucide-react';

// Helper to highlight matched terms in text (improved version)
const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-semibold">
        {part}
      </mark>
    ) : part
  );
};

const SearchResultCard = ({ 
  event, 
  status, 
  isDarkMode, 
  onEdit, 
  onDelete, 
  searchTerm, 
  searchScore = 0,
  matchedFields = [],
  matches = [],
  breakdown = null,
  onClick = () => {}
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'current': return 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'future': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'past': return 'border-l-gray-400 bg-gray-50 dark:bg-gray-800/50';
      default: return 'border-l-gray-300';
    }
  };

  const getRelevanceIcon = () => {
    if (searchScore > 0.8) return <Star className="w-4 h-4 text-yellow-500" />;
    if (searchScore > 0.5) return <Target className="w-4 h-4 text-orange-500" />;
    return <Zap className="w-4 h-4 text-gray-400" />;
  };

  // Group matches by field for better organization
  const fieldMatches = {};
  matches.forEach(m => {
    if (!fieldMatches[m.field]) fieldMatches[m.field] = [];
    fieldMatches[m.field].push(m);
  });

  return (
    <div className={`mb-6 border-l-4 rounded-r-xl shadow-sm transition-all hover:shadow-md ${
      getStatusColor()
    } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      
      {/* Header with relevance score */}
      {searchTerm && (
        <div className={`px-4 py-2 border-b flex items-center justify-between ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            {getRelevanceIcon()}
            <span className={`text-sm font-medium ${
              searchScore > 0.7 ? 'text-green-600 dark:text-green-400' :
              searchScore > 0.4 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-gray-500'
            }`}>
              {Math.round(searchScore * 100)}% Relevanz
            </span>
          </div>
          
          {/* Matched fields indicators */}
          <div className="flex gap-1">
            {matchedFields.includes('name') && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                Name
              </span>
            )}
            {matchedFields.includes('description') && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                Beschreibung
              </span>
            )}
            {matchedFields.includes('location') && (
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                Ort
              </span>
            )}
            {matchedFields.includes('tags') && (
              <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                Tags
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Event Title with highlighting */}
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {highlightText(event.name, searchTerm)}
          </h3>
          
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(event)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Event bearbeiten"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:bg-red-800 hover:text-red-300'
                  : 'text-gray-500 hover:bg-red-100 hover:text-red-700'
              }`}
              title="Event löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <div>
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {new Date(`${event.entry_date}T${event.entry_time}`).toLocaleDateString('de-DE')}
              </div>
              <div className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {new Date(`${event.entry_date}T${event.entry_time}`).toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {highlightText(event.location, searchTerm)}
              </span>
            </div>
          )}
        </div>

        {/* Description with highlighting */}
        {event.description && (
          <div className={`mb-4 text-sm leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {highlightText(event.description, searchTerm)}
          </div>
        )}

        {/* Tags with highlighting */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-700'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                <Tag className="w-3 h-3" />
                {highlightText(tag, searchTerm)}
              </span>
            ))}
          </div>
        )}

        {/* Advanced search score breakdown */}
        {breakdown && searchTerm && (
          <div className={`mt-4 p-3 rounded-lg text-xs ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="font-medium mb-2">Score-Aufschlüsselung:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Text-Score: +{Math.round(breakdown.textScore || 0)}</div>
              <div>Tag-Bonus: +{Math.round(breakdown.tagBonus || 0)}</div>
              <div>Multi-Feld: +{Math.round(breakdown.multiFieldBonus || 0)}</div>
              <div>Gesamt: {Math.round(searchScore * 100)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultCard;
