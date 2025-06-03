// EventCard.jsx - Optimized event display component
import React, { memo } from 'react';
import { Calendar, Clock, MapPin, Tag, Edit3, Trash2 } from 'lucide-react';

const EventCard = memo(({ 
  event, 
  status, 
  isDarkMode, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'current':
        return isDarkMode 
          ? 'border-emerald-400 bg-emerald-900/20 shadow-emerald-500/20'
          : 'border-emerald-400 bg-emerald-50 shadow-emerald-500/20';
      case 'past':
        return isDarkMode 
          ? 'border-gray-600 bg-gray-800/50 shadow-gray-500/10'
          : 'border-gray-300 bg-gray-50 shadow-gray-500/10';
      default: // future
        return isDarkMode 
          ? 'border-blue-400 bg-blue-900/20 shadow-blue-500/20'
          : 'border-blue-300 bg-blue-50 shadow-blue-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'current':
        return 'bg-emerald-500 text-white';
      case 'past':
        return isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-500 text-white';
      default: // future
        return 'bg-blue-500 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'current': return 'Aktuell';
      case 'past': return 'Vergangen';
      default: return 'Geplant';
    }
  };

  const getIndicatorSize = (status) => {
    return status === 'current' ? 'w-6 h-6' : 'w-4 h-4';
  };

  return (
    <div className={`relative transition-all duration-300 hover:scale-[1.02] ${
      status === 'current' ? 'scale-105' : ''
    }`}>
      {/* Timeline Line */}
      <div className={`absolute left-6 top-16 bottom-0 w-0.5 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`} />
      
      {/* Status Indicator */}
      <div className={`absolute left-3 top-12 rounded-full border-2 transition-all duration-300 ${
        getIndicatorSize(status)
      } ${status === 'current' ? 'animate-pulse' : ''} ${
        status === 'current' 
          ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50'
          : status === 'past'
            ? isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-400 border-gray-300'
            : 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/30'
      }`} />

      {/* Event Card */}
      <div className={`ml-16 mb-8 p-6 rounded-xl border-2 shadow-lg transition-all duration-300 ${
        getStatusColor(status)
      } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        
        {/* Status Badge & Actions */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
            {getStatusText(status)}
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(event)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  : 'hover:bg-white/80 text-gray-500 hover:text-gray-700'
              }`}
              title="Event bearbeiten"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300'
                  : 'hover:bg-red-50 text-red-500 hover:text-red-600'
              }`}
              title="Event löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${
                status === 'current' ? 'text-emerald-500' : 
                status === 'past' ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') : 'text-blue-500'
              }`} />
              <span className="font-medium">
                {new Date(event.entry_date).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${
                status === 'current' ? 'text-emerald-500' : 
                status === 'past' ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') : 'text-blue-500'
              }`} />
              <span className="font-medium">{event.entry_time}</span>
            </div>
          </div>
          
          {/* End Date/Time for ranges */}
          {event.hasEndDateTime && event.end_date && event.end_time && (
            <div className="flex items-center gap-4 pl-6 border-l-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${
                  status === 'current' ? 'text-emerald-400' : 
                  status === 'past' ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : 'text-blue-400'
                }`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  bis {event.end_date === event.entry_date 
                    ? 'selber Tag' 
                    : new Date(event.end_date).toLocaleDateString('de-DE', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${
                  status === 'current' ? 'text-emerald-400' : 
                  status === 'past' ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : 'text-blue-400'
                }`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {event.end_time}
                </span>
              </div>
              
              {/* Duration indicator */}
              <div className={`text-xs px-2 py-1 rounded-full ${
                status === 'current' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                status === 'past' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {(() => {
                  const start = new Date(`${event.entry_date}T${event.entry_time}`);
                  const end = new Date(`${event.end_date}T${event.end_time}`);
                  const diffMs = end - start;
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  
                  if (diffDays > 0) {
                    return `${diffDays}d ${diffHours % 24}h`;
                  } else {
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    return diffHours > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffMinutes}m`;
                  }
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Event Name */}
        <h3 className={`text-xl font-bold mb-2 ${
          status === 'current' ? 'text-emerald-600 dark:text-emerald-400' : 
          status === 'past' ? (isDarkMode ? 'text-gray-300' : 'text-gray-700') : 
          'text-blue-600 dark:text-blue-400'
        }`}>
          {event.name}
        </h3>

        {/* Description */}
        <p className={`text-lg leading-relaxed mb-4 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {event.description}
        </p>

        {/* Location and Tags */}
        {(event.location || (event.tags && event.tags.length > 0)) && (
          <>
            {event.location && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin className={`w-4 h-4 ${
                  status === 'current' ? 'text-emerald-500' : 
                  status === 'past' ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') : 'text-blue-500'
                }`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {event.location}
                </span>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                      status === 'current' 
                        ? isDarkMode
                          ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-600'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : status === 'past' 
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-300 border border-gray-600'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                          : isDarkMode
                            ? 'bg-blue-800/50 text-blue-300 border border-blue-600'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;