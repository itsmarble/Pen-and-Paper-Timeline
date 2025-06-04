// DateTimePicker.jsx - Beautiful date and time picker component with unified navigation
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, CalendarDays, Timer, ChevronLeft, ChevronRight } from 'lucide-react';
import UnifiedTimeNavigator from './UnifiedTimeNavigator';

const DateTimePicker = ({ 
  date, 
  time, 
  endDate, 
  endTime, 
  onDateChange, 
  onTimeChange, 
  onEndDateChange, 
  onEndTimeChange, 
  hasEndDateTime = false,
  onToggleRange,
  isDarkMode,
  currentGameTime = new Date(), // Add currentGameTime prop with fallback
  label = "Datum & Zeit",
  required = false,
  inputClassName = '',
  buttonClassName = ''
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  
  // Calendar navigation state - initialize to currentGameTime instead of today
  const [currentMonth, setCurrentMonth] = useState(() => {
    const gameTime = currentGameTime || new Date();
    return new Date(gameTime.getFullYear(), gameTime.getMonth(), 1);
  });
  const [endCurrentMonth, setEndCurrentMonth] = useState(() => {
    const gameTime = currentGameTime || new Date();
    return new Date(gameTime.getFullYear(), gameTime.getMonth(), 1);
  });
  
  // Navigation time for UnifiedTimeNavigator
  const [navTime, setNavTime] = useState(() => currentGameTime || new Date());
  const [endNavTime, setEndNavTime] = useState(() => currentGameTime || new Date());
  
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);
  const endTimePickerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsTimePickerOpen(false);
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target)) {
        setIsEndDatePickerOpen(false);
      }
      if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target)) {
        setIsEndTimePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update navigation time when currentGameTime changes
  useEffect(() => {
    if (currentGameTime) {
      setNavTime(new Date(currentGameTime));
      setEndNavTime(new Date(currentGameTime));
      setCurrentMonth(new Date(currentGameTime.getFullYear(), currentGameTime.getMonth(), 1));
      setEndCurrentMonth(new Date(currentGameTime.getFullYear(), currentGameTime.getMonth(), 1));
    }
  }, [currentGameTime]);

  // Handle unified navigator time changes
  const handleUnifiedNavTimeChange = (newTime) => {
    setNavTime(newTime);
    setCurrentMonth(new Date(newTime.getFullYear(), newTime.getMonth(), 1));
    // Optionally update the selected date if no date is currently selected
    if (!date) {
      const dateStr = newTime.toISOString().split('T')[0];
      onDateChange(dateStr);
    }
  };

  // Handle end date unified navigator time changes
  const handleEndUnifiedNavTimeChange = (newTime) => {
    setEndNavTime(newTime);
    setEndCurrentMonth(new Date(newTime.getFullYear(), newTime.getMonth(), 1));
    // Optionally update the selected end date if no end date is currently selected
    if (!endDate) {
      const dateStr = newTime.toISOString().split('T')[0];
      onEndDateChange(dateStr);
    }
  };

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (monthDate) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days = [];

    // Empty cells for days from previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
    }

    return days;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Datum wählen';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Heute';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Morgen';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Gestern';
    }
    
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return 'Zeit wählen';
    return timeStr;
  };

  const baseInputClass = `group w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 cursor-pointer backdrop-blur-sm ${
    isDarkMode 
      ? 'bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80 hover:border-gray-500 shadow-lg shadow-gray-900/20' 
      : 'bg-white/90 border-gray-300 hover:bg-white hover:border-gray-400 shadow-lg shadow-gray-200/50 hover:shadow-xl'
  }`;

  const dropdownClass = `absolute top-full left-0 mt-3 w-full border-2 rounded-2xl shadow-2xl z-50 max-h-64 overflow-hidden backdrop-blur-md transition-all duration-300 ${
    isDarkMode 
      ? 'bg-gray-800/95 border-gray-600 shadow-gray-900/50' 
      : 'bg-white/95 border-gray-200 shadow-gray-900/10'
  }`;

  const calendarDropdownClass = `absolute top-full left-0 mt-3 w-96 border-2 rounded-2xl shadow-2xl z-50 backdrop-blur-md transition-all duration-300 ${
    isDarkMode 
      ? 'bg-gray-800/95 border-gray-600 shadow-gray-900/50' 
      : 'bg-white/95 border-gray-200 shadow-gray-900/10'
  }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            {label} {required && <span className="text-red-500">*</span>}
          </div>
        </label>
        {onToggleRange && (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={hasEndDateTime}
                onChange={(e) => onToggleRange(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                hasEndDateTime 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30' 
                  : isDarkMode 
                    ? 'bg-gray-600 shadow-inner' 
                    : 'bg-gray-300 shadow-inner'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                  hasEndDateTime ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </div>
            <span className={`text-sm font-medium transition-colors ${
              hasEndDateTime 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Zeitraum
            </span>
          </label>
        )}
      </div>

      {/* Start Date/Time */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className={baseInputClass}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                } group-hover:scale-110`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{formatDisplayDate(date)}</span>
                  {date && (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-all duration-300 ${
                isDatePickerOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'
              }`} />
            </div>
          </button>
          
          {isDatePickerOpen && (
            <div className={calendarDropdownClass}>
              {/* Unified Time Navigator */}
              <div className={`p-3 border-b ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className="mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {navTime.toLocaleDateString('de-DE', { 
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <UnifiedTimeNavigator
                  currentTime={navTime}
                  onTimeChange={handleUnifiedNavTimeChange}
                  isDarkMode={isDarkMode}
                  className="scale-95"
                />
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
                    <div
                      key={day}
                      className={`text-xs font-medium text-center p-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays(currentMonth).map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2"></div>;
                    }

                    const dateStr = day.toISOString().split('T')[0];
                    const isSelected = date === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isPast = day < new Date().setHours(0, 0, 0, 0);

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          onDateChange(dateStr);
                          setIsDatePickerOpen(false);
                        }}
                        className={`p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : isToday
                            ? isDarkMode
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-500'
                              : 'bg-blue-50 text-blue-600 border border-blue-300'
                            : isPast
                            ? isDarkMode
                              ? 'text-gray-500 hover:bg-gray-700/50'
                              : 'text-gray-400 hover:bg-gray-100'
                            : isDarkMode
                            ? 'text-gray-200 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Picker */}
        <div className="relative" ref={timePickerRef}>
          <button
            type="button"
            onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
            className={baseInputClass}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                } group-hover:scale-110`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{formatDisplayTime(time)}</span>
                  {time && (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Uhrzeit
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-all duration-300 ${
                isTimePickerOpen ? 'rotate-180 text-indigo-500' : 'text-gray-400'
              }`} />
            </div>
          </button>
          
          {isTimePickerOpen && (
            <div className={dropdownClass}>
              <div className="overflow-y-auto max-h-64 p-2">
                {timeOptions.map((timeOption) => {
                  const isSelected = time === timeOption;
                  const hour = parseInt(timeOption.split(':')[0]);
                  const isNightTime = hour >= 22 || hour < 6;
                  const isMorning = hour >= 6 && hour < 12;
                  const isEvening = hour >= 18 && hour < 22;
                  
                  return (
                    <button
                      type="button"
                      key={timeOption}
                      onClick={() => {
                        onTimeChange(timeOption);
                        setIsTimePickerOpen(false);
                      }}
                      className={`px-4 py-3 mx-1 cursor-pointer transition-all duration-200 flex items-center justify-between rounded-xl ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                          : isDarkMode
                            ? 'hover:bg-gray-700/70 text-gray-200 hover:text-white'
                            : 'hover:bg-indigo-50 text-gray-900 hover:text-indigo-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-medium">{timeOption}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : isNightTime 
                              ? isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              : isMorning 
                                ? isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                : isEvening 
                                  ? isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                  : isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isNightTime ? '🌙' : isMorning ? '🌅' : isEvening ? '🌆' : '☀️'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* End Date/Time (if range is enabled) */}
      {hasEndDateTime && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-px bg-gradient-to-r from-transparent to-transparent ${
              isDarkMode ? 'via-gray-600' : 'via-gray-300'
            }`}></div>
            <label className={`text-sm font-semibold px-4 py-2 rounded-full ${
              isDarkMode 
                ? 'bg-gray-700 text-green-400 border border-gray-600' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Bis (Ende)
              </div>
            </label>
            <div className={`flex-1 h-px bg-gradient-to-r from-transparent to-transparent ${
              isDarkMode ? 'via-gray-600' : 'via-gray-300'
            }`}></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* End Date Picker */}
            <div className="relative" ref={endDatePickerRef}>
              <button
                type="button"
                onClick={() => setIsEndDatePickerOpen(!isEndDatePickerOpen)}
                className={baseInputClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all duration-200 ${
                      isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                    } group-hover:scale-110`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{formatDisplayDate(endDate)}</span>
                      {endDate && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-all duration-300 ${
                    isEndDatePickerOpen ? 'rotate-180 text-green-500' : 'text-gray-400'
                  }`} />
                </div>
              </button>
              
              {isEndDatePickerOpen && (
                <div className={calendarDropdownClass}>
                  {/* Unified Time Navigator */}
                  <div className={`p-3 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {endNavTime.toLocaleDateString('de-DE', { 
                          year: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                    <UnifiedTimeNavigator
                      currentTime={endNavTime}
                      onTimeChange={handleEndUnifiedNavTimeChange}
                      isDarkMode={isDarkMode}
                      className="scale-95"
                    />
                  </div>

                  {/* Calendar Grid */}
                  <div className="p-4">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
                        <div
                          key={day}
                          className={`text-xs font-medium text-center p-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(endCurrentMonth).map((day, index) => {
                        if (!day) {
                          return <div key={index} className="p-2"></div>;
                        }

                        const dateStr = day.toISOString().split('T')[0];
                        const isSelected = endDate === dateStr;
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const isPast = day < new Date().setHours(0, 0, 0, 0);
                        
                        // Validate that end date is not before start date
                        const isBeforeStart = date && day < new Date(date);

                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (!isBeforeStart) {
                                onEndDateChange(dateStr);
                                setIsEndDatePickerOpen(false);
                              }
                            }}
                            disabled={isBeforeStart}
                            className={`p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                              isBeforeStart
                                ? 'text-gray-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                : isToday
                                ? isDarkMode
                                  ? 'bg-green-900/30 text-green-300 border border-green-500'
                                  : 'bg-green-50 text-green-600 border border-green-300'
                                : isPast
                                ? isDarkMode
                                  ? 'text-gray-500 hover:bg-gray-700/50'
                                  : 'text-gray-400 hover:bg-gray-100'
                                : isDarkMode
                                ? 'text-gray-200 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* End Time Picker */}
            <div className="relative" ref={endTimePickerRef}>
              <button
                type="button"
                onClick={() => setIsEndTimePickerOpen(!isEndTimePickerOpen)}
                className={baseInputClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all duration-200 ${
                      isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                    } group-hover:scale-110`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{formatDisplayTime(endTime)}</span>
                      {endTime && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          End-Zeit
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-all duration-300 ${
                    isEndTimePickerOpen ? 'rotate-180 text-green-500' : 'text-gray-400'
                  }`} />
                </div>
              </button>
              
              {isEndTimePickerOpen && (
                <div className={dropdownClass}>
                  <div className="overflow-y-auto max-h-64 p-2">
                    {timeOptions.map((timeOption) => {
                      const isSelected = endTime === timeOption;
                      const hour = parseInt(timeOption.split(':')[0]);
                      const isNightTime = hour >= 22 || hour < 6;
                      const isMorning = hour >= 6 && hour < 12;
                      const isEvening = hour >= 18 && hour < 22;
                      
                      return (
                        <button
                          type="button"
                          key={timeOption}
                          onClick={() => {
                            onEndTimeChange(timeOption);
                            setIsEndTimePickerOpen(false);
                          }}
                          className={`px-4 py-3 mx-1 cursor-pointer transition-all duration-200 flex items-center justify-between rounded-xl ${
                            isSelected
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-[1.02]'
                              : isDarkMode
                                ? 'hover:bg-gray-700/70 text-gray-200 hover:text-white'
                                : 'hover:bg-green-50 text-gray-900 hover:text-green-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-medium">{timeOption}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : isNightTime 
                                  ? isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                  : isMorning 
                                    ? isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                    : isEvening 
                                      ? isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                      : isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isNightTime ? '🌙' : isMorning ? '🌅' : isEvening ? '🌆' : '☀️'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
