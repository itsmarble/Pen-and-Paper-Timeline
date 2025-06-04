import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Moon,
  Sun,
  Folder,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { EventCollection, EventValidator, EventFormatter, OptimizedEvent } from '../utils/eventUtils.js';
import { EventMigration } from '../utils/migrationUtils.js';
import { dataManager } from '../utils/electronDataManager.js';
import EventCard from './EventCard';
import EditEventForm from './EditEventForm';
import DateTimePicker from './DateTimePicker';
import CurrentGameTimePicker from './CurrentGameTimePicker';
import UnifiedTimeNavigator from './UnifiedTimeNavigator';
import logger from '../utils/logger';
import SearchResultCard from './SearchResultCard';
import SettingsModal from './SettingsModal';
import debounce from 'lodash.debounce';

const Timeline = () => {
  // Initialize with empty collection, load data in useEffect
  const [eventCollection, setEventCollection] = useState(() => new EventCollection([]));

  const [currentGameTime, setCurrentGameTime] = useState(new Date('2024-03-16T12:00:00'));
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(1000);
  const [newEvent, setNewEvent] = useState({
    name: '',
    entry_date: '',
    entry_time: '',
    end_date: '',
    end_time: '',
    description: '',
    location: '',
    tags: [],
    hasEndDateTime: false
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [lastSavedData, setLastSavedData] = useState(null);
  const fileInputRef = useRef(null);

  // Load data on mount and set up auto-save
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load optimized events first
        const optimizedData = await dataManager.readOptimizedEvents();
        if (optimizedData.events && Array.isArray(optimizedData.events) && optimizedData.events.length > 0) {
          setEventCollection(new EventCollection(optimizedData.events));
          console.log('Loaded optimized events from persistent storage');
          return;
        }

        // Fallback to legacy events
        const legacyData = await dataManager.readEvents();
        if (Array.isArray(legacyData) && legacyData.length > 0) {
          const migratedCollection = EventMigration.migrateLegacyEvents(legacyData);
          setEventCollection(new EventCollection(migratedCollection.events));
          // Save migrated data as optimized format
          await dataManager.writeOptimizedEvents({
            version: "2.0.0",
            migratedAt: new Date().toISOString(),
            events: migratedCollection.toJSON()
          });
          console.log('Migrated legacy events to optimized format');
        } else {
          console.log('No existing data found, starting with empty collection');
        }

        // Load saved preferences from localStorage (non-critical data)
        const savedTime = localStorage.getItem('timeline-current-time');
        const savedDarkMode = localStorage.getItem('timeline-dark-mode');
        const savedInterval = localStorage.getItem('timeline-autosave');
        
        if (savedTime) {
          try {
            setCurrentGameTime(new Date(savedTime));
          } catch {
            console.warn('Could not load saved time');
          }
        }

        if (savedDarkMode === 'true') {
          setIsDarkMode(true);
        }
        if (savedInterval) {
          const val = parseInt(savedInterval, 10);
          if (!isNaN(val)) setAutoSaveInterval(val);
        }

      } catch (error) {
        logger.error('Error loading data:', error);
        setNotification({
          type: 'error',
          message: 'Fehler beim Laden der Daten: ' + error.message
        });
      }
    };

    loadData();

    // Set up menu listeners for Electron
    dataManager.setupMenuListeners({
      onNewEvent: () => setShowAddForm(true),
      onImportEvents: () => {
        try {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        } catch (error) {
          setNotification({
            type: 'error',
            message: 'Import fehlgeschlagen: ' + error.message
          });
        }
      },
      onExportEvents: () => {
        try {
          exportData();
        } catch (error) {
          setNotification({
            type: 'error',
            message: 'Export fehlgeschlagen: ' + error.message
          });
        }
      }
    });

    // Cleanup function
    return () => {
      dataManager.cleanup();
    };
  }, []);

  // Auto-save to persistent storage
  useEffect(() => {
    const saveData = async () => {
      // Change detection: only save if data changed
      const currentData = JSON.stringify(eventCollection.toJSON());
      if (currentData !== lastSavedData) {
        try {
          await dataManager.writeOptimizedEvents({
            version: "2.0.0",
            updatedAt: new Date().toISOString(),
            events: eventCollection.toJSON()
          });
          await dataManager.writeEvents(eventCollection.toJSON());
          setLastSavedData(currentData);
        } catch (error) {
          logger.error('Error saving data:', error);
          setNotification({
            type: 'error',
            message: 'Fehler beim Speichern: ' + error.message
          });
        }
      }
      localStorage.setItem('timeline-current-time', currentGameTime.toISOString());
      localStorage.setItem('timeline-autosave', autoSaveInterval.toString());
    };

    // Debounce saves to avoid too frequent writes
    const timeoutId = setTimeout(saveData, autoSaveInterval);
    return () => clearTimeout(timeoutId);
  }, [eventCollection, currentGameTime, autoSaveInterval, lastSavedData]);

  // Debounce searchTerm updates
  useEffect(() => {
    const handler = debounce((value) => setDebouncedSearchTerm(value), 300);
    handler(searchTerm);
    return () => handler.cancel();
  }, [searchTerm]);

  // Enhanced search and filtering using optimized event collection
  const filteredAndSortedEventsWithScores = useMemo(() => {
    // Use the advanced search with detailed options
    return eventCollection.search(debouncedSearchTerm, selectedTags, {
      minScore: 0.05,
      maxResults: 200,
      sortBy: 'relevance',
      includeScoring: true // <-- get scoring details for UI
    });
  }, [eventCollection, debouncedSearchTerm, selectedTags]);

  // Get search suggestions for autocomplete
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return eventCollection.getSearchSuggestions(searchTerm, 8);
  }, [eventCollection, searchTerm]);

  useEffect(() => {
    setFocusedSuggestionIndex(-1);
  }, [searchSuggestions, searchTerm]);

  // Search analytics for debugging and optimization
  const searchAnalytics = useMemo(() => {
    // Minimal analytics: count unique terms in all events
    const termSet = new Set();
    eventCollection.events.forEach(event => {
      const text = event.getSearchableText().combined;
      text.split(/\s+/).forEach(word => {
        if (word.length > 1) termSet.add(word);
      });
    });
    return {
      totalUniqueTerms: termSet.size
    };
  }, [eventCollection]);

  // Get all available tags from the optimized collection
  const allTags = useMemo(() => {
    return eventCollection.getAllTags();
  }, [eventCollection]);

  // Event-Status bestimmen using optimized event methods
  const getEventStatus = (event) => {
    try {
      // Ensure we have an OptimizedEvent instance
      let optimizedEvent = event;
      if (!(event instanceof OptimizedEvent)) {
        optimizedEvent = new OptimizedEvent(event);
      }
      
      // Use optimized event methods
      const isActive = optimizedEvent.isActiveAt(currentGameTime);
      if (isActive) {
        return 'current';
      }
      
      const startDateTime = optimizedEvent.getStartDateTime();
      if (!startDateTime) return 'unknown';
      
      const status = startDateTime > currentGameTime ? 'future' : 'past';
      
      return status;
    } catch (error) {
      logger.error('Error determining event status:', error, event);
      return 'unknown';
    }
  };

  // Notification System
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Dark Mode Toggle
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('timeline-dark-mode', newDarkMode.toString());
  }, [isDarkMode]);

  // Export/Import Functions with optimized format
  const exportData = useCallback(() => {
    const exportData = EventMigration.exportToJSON(eventCollection);
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Timeline erfolgreich exportiert!');
  }, [eventCollection, showNotification]);

  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCollection = EventMigration.importFromJSON(e.target.result);
        // importedCollection is already an EventCollection, so use as is
        setEventCollection(importedCollection);
        showNotification('Timeline erfolgreich importiert!');
      } catch (error) {
        logger.error('Import error:', error);
        showNotification('Fehler beim Importieren der Datei!', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [showNotification]);

  // Open data folder function
  const openDataFolder = useCallback(async () => {
    try {
      await dataManager.openDataFolder();
      showNotification('Datenordner geöffnet!');
    } catch (error) {
      logger.error('Error opening data folder:', error);
      showNotification('Fehler beim Öffnen des Datenordners!', 'error');
    }
  }, [showNotification]);

  const handleSearchKeyDown = useCallback((e) => {
    if (searchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => (prev - 1 + searchSuggestions.length) % searchSuggestions.length);
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      setSearchTerm(searchSuggestions[focusedSuggestionIndex]);
      setFocusedSuggestionIndex(-1);
    }
  }, [searchSuggestions, focusedSuggestionIndex]);

  // Zeit-Navigation
  // Event-Management
  const handleAddEvent = useCallback((eventDataFromForm) => {
    // Use the event data from the form, not from newEvent state!
    const eventToAdd = {
      id: Date.now(),
      ...eventDataFromForm,
      tags: eventDataFromForm.tags || []
    };

    // Validate event data before adding (includes all required fields)
    const validation = EventValidator.validateEvent(eventToAdd);
    if (!validation.isValid) {
      showNotification(`Event-Daten sind ungültig: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    // Validate end date/time if range is enabled (redundant, but keep for user-friendly error)
    if (eventToAdd.hasEndDateTime && (!eventToAdd.end_date || !eventToAdd.end_time)) {
      showNotification('Bitte End-Datum und End-Zeit ausfüllen!', 'error');
      return;
    }
    // Validate that end date/time is after start date/time
    if (eventToAdd.hasEndDateTime) {
      const startDateTime = new Date(`${eventToAdd.entry_date}T${eventToAdd.entry_time}`);
      const endDateTime = new Date(`${eventToAdd.end_date}T${eventToAdd.end_time}`);
      if (endDateTime <= startDateTime) {
        showNotification('End-Zeit muss nach der Start-Zeit liegen!', 'error');
        return;
      }
    }

    const newCollection = eventCollection.clone();
    newCollection.add(eventToAdd);
    setEventCollection(newCollection);

    setNewEvent({
      name: '',
      entry_date: '',
      entry_time: '',
      end_date: '',
      end_time: '',
      description: '',
      location: '',
      tags: [],
      hasEndDateTime: false
    });
    setShowAddForm(false);
    showNotification('Event erfolgreich hinzugefügt!');
  }, [eventCollection, showNotification]);

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event.id);
  }, []);

  const handleSaveEdit = useCallback((updatedEvent) => {
    // Validate updated event data
    const validation = EventValidator.validateEvent(updatedEvent);
    if (!validation.isValid) {
      showNotification(`Event-Daten sind ungültig: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    
    const newCollection = eventCollection.clone();
    newCollection.update(updatedEvent.id, updatedEvent);
    setEventCollection(newCollection);
    
    setEditingEvent(null);
    showNotification('Event erfolgreich bearbeitet!');
  }, [eventCollection, showNotification]);

  const handleDeleteEvent = useCallback((eventId) => {
    if (window.confirm('Möchten Sie dieses Event wirklich löschen?')) {
      const newCollection = eventCollection.clone();
      newCollection.remove(eventId);
      setEventCollection(newCollection);
      
      showNotification('Event erfolgreich gelöscht!');
    }
  }, [eventCollection, showNotification]);

  const addTagToNewEvent = useCallback(() => {
    const newTag = prompt('Neuen Tag hinzufügen:');
    if (newTag && newTag.trim() && !newEvent.tags.includes(newTag.trim())) {
      setNewEvent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
  }, [newEvent.tags]);

  const removeTagFromNewEvent = useCallback((tagToRemove) => {
    setNewEvent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const toggleTagFilter = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setShowAddForm(true);
            break;
          case 's':
            e.preventDefault();
            exportData();
            break;
          case 'd':
            e.preventDefault();
            toggleDarkMode();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setEditingEvent(null);
        setIsEditingTime(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [exportData, toggleDarkMode]);

  // Memoized rendering of EventCards for performance
  const renderedEventCards = useMemo(() => {
    return filteredAndSortedEventsWithScores.map((result) => {
      // Support both {event, score} and plain event
      const event = result.event || result;
      const status = getEventStatus(event);
      if (editingEvent === event.id) {
        return (
          <div key={event.id} className="ml-16 mb-8">
            <EditEventForm
              event={event}
              isDarkMode={isDarkMode}
              currentGameTime={currentGameTime}
              onSave={handleSaveEdit}
              onCancel={() => setEditingEvent(null)}
            />
          </div>
        );
      } else {
        return (
          <EventCard
            key={event.id}
            event={event}
            status={status}
            isDarkMode={isDarkMode}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        );
      }
    });
  }, [filteredAndSortedEventsWithScores, editingEvent, isDarkMode, currentGameTime, handleSaveEdit, handleEditEvent, handleDeleteEvent, getEventStatus]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Show EditEventForm for adding a new event */}
      {showAddForm && (
        <EditEventForm
          event={newEvent}
          isDarkMode={isDarkMode}
          currentGameTime={currentGameTime}
          onSave={handleAddEvent}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          isDarkMode={isDarkMode}
          autoSaveInterval={autoSaveInterval}
          onAutoSaveIntervalChange={setAutoSaveInterval}
          onToggleDarkMode={toggleDarkMode}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Notification System */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-white/20'
      }`}>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
                }`}>
                  Campaign Timeline
                </h1>
                <div className={`flex items-center gap-2 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isEditingTime ? (
                    <CurrentGameTimePicker
                      currentTime={currentGameTime}
                      onTimeChange={(newTime) => {
                        setCurrentGameTime(newTime);
                        setIsEditingTime(false);
                        showNotification('Zeit erfolgreich geändert!');
                      }}
                      onCancel={() => setIsEditingTime(false)}
                      isDarkMode={isDarkMode}
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        Aktuelle Zeit: {currentGameTime.toLocaleDateString('de-DE')} {currentGameTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => setIsEditingTime(true)}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        title="Zeit bearbeiten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search, Filter and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              {/* Enhanced Search Bar with Suggestions */}
              <div className="relative flex-1 lg:flex-none">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🧠 KI-Suche: Tippfehler-tolerant, Deutsche Umlaute, Teilwörter, Soundex, Multi-Feld..."
                  className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors w-full sm:w-96 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 placeholder-gray-500'
                  }`}
                  title="🚀 Ultra-Intelligente Suche: Fuzzy-Matching • Levenshtein & Jaro-Winkler • Soundex • Deutsche Normalisierung • Phrase-Matching • N-Gram-Analyse • Multi-Feld-Scoring (Name:400%, Beschreibung:250%, Ort:200%, Tags:150%) • Echtzeit-Suggestions"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyDown={handleSearchKeyDown}
                />
                
                {/* Search Suggestions Dropdown */}
                {searchSuggestions.length > 0 && searchTerm.length >= 2 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-2">
                      <div className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 Vorschläge:
                      </div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchTerm(suggestion)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            isDarkMode
                              ? index === focusedSuggestionIndex
                                ? 'bg-gray-700 text-white'
                                : 'hover:bg-gray-700 text-gray-200'
                              : index === focusedSuggestionIndex
                                ? 'bg-gray-200'
                                : 'hover:bg-gray-50 text-gray-800'
                          }`}
                          aria-selected={focusedSuggestionIndex === index}
                          aria-label={`Vorschlag ${suggestion}`}
                        >
                          <span className="flex items-center gap-2">
                            <Search className="w-3 h-3 opacity-50" />
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Search Tips Tooltip */}
                {searchTerm.length === 0 && isSearchFocused && (
                  <div className={`absolute top-full left-0 right-0 mt-1 p-3 border rounded-xl shadow-lg text-xs ${
                    isDarkMode 
                      ? 'bg-gray-800/95 border-gray-600 text-gray-300' 
                      : 'bg-blue-50/95 border-blue-200 text-blue-800'
                  }`}>
                    <div className="font-medium mb-1">🚀 KI-Powered Search Features:</div>
                    <ul className="space-y-1">
                      <li>• 🧠 "Gobblin Angrif" → "Goblin Angriff" (Fuzzy-Match)</li>
                      <li>• 🇩🇪 "Händler" = "Haendler" (Deutsche Normalisierung)</li>
                      <li>• 🔍 "Prinz" findet "Prinzessin" (Teilwort-Suche)</li>
                      <li>• 🎯 Soundex: "Schmidt" findet "Schmitt"</li>
                      <li>• ⚡ Multi-Feld mit intelligenter Gewichtung</li>
                      <li>• 📊 Kombiniere mit Tag-Filtern für Präzision</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="relative">
                  <details className="relative">
                    <summary className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}>
                      <Filter className="w-4 h-4" />
                      Tags ({selectedTags.length})
                    </summary>
                    <div className={`absolute right-0 mt-2 p-3 border rounded-xl shadow-lg z-50 min-w-48 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {allTags.map(tag => (
                          <label key={tag} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={() => toggleTagFilter(tag)}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isDarkMode ? 'Hell-Modus (Ctrl+D)' : 'Dunkel-Modus (Ctrl+D)'}
                  aria-label={isDarkMode ? 'Hell-Modus einschalten' : 'Dunkel-Modus einschalten'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={exportData}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Daten exportieren (Ctrl+S)"
                  aria-label="Daten exportieren"
                >
                  <Download className="w-4 h-4" />
                </button>

                <label className={`p-2 rounded-xl cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Daten importieren"
                aria-label="Daten importieren">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={openDataFolder}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Datenordner öffnen"
                  aria-label="Datenordner öffnen"
                >
                  <Folder className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Einstellungen"
                  aria-label="Einstellungen"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                  title="Neues Event hinzufügen (Ctrl+N)"
                  aria-label="Neues Event hinzufügen"
                >
                  <Plus className="w-4 h-4" />
                  Event
                </button>
              </div>
            </div>
          </div>

          {/* Beautiful Time Navigation */}
          <UnifiedTimeNavigator
            currentTime={currentGameTime}
            onTimeChange={setCurrentGameTime}
            isDarkMode={isDarkMode}
            compact={true}
            showQuickJump={false}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-xl border transition-colors ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aktuelle Events</p>
                <p className="text-xl font-bold text-emerald-500">
                  {filteredAndSortedEventsWithScores.filter(event => getEventStatus(event) === 'current').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border transition-colors ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Geplante Events</p>
                <p className="text-xl font-bold text-blue-500">
                  {filteredAndSortedEventsWithScores.filter(event => getEventStatus(event) === 'future').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border transition-colors ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-500'
              }`}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vergangene Events</p>
                <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filteredAndSortedEventsWithScores.filter(event => getEventStatus(event) === 'past').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Results Info */}
        {(searchTerm || selectedTags.length > 0) && (
          <div className={`mb-4 p-3 rounded-lg border text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
               style={{maxWidth: 480}}>
            <div className="font-semibold mb-1">🔍 Suchergebnis</div>
            <ul className="list-disc pl-5">
              <li>{filteredAndSortedEventsWithScores.length} von {eventCollection.length} Events gefunden</li>
              <li>Gewichtung: Name &gt; Beschreibung &gt; Ort &gt; Tags</li>
            </ul>
          </div>
        )}

        {/* Timeline / Search Results */}
        <div className="relative">
          {filteredAndSortedEventsWithScores.length === 0 ? (
            <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Keine Events gefunden</h3>
              <p className="mb-4">
                {searchTerm || selectedTags.length > 0 
                  ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                  : 'Erstellen Sie Ihr erstes Event, um die Timeline zu starten.'
                }
              </p>
              {!searchTerm && selectedTags.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Erstes Event erstellen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {renderedEventCards}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
