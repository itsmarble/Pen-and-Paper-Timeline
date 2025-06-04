// CurrentGameTimePicker.jsx - Custom date and time picker for current game time
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';

const CurrentGameTimePicker = ({ 
  currentTime, 
  onTimeChange, 
  onCancel, 
  isDarkMode 
}) => {
  const [selectedDate, setSelectedDate] = useState(currentTime.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(
    currentTime.toTimeString().slice(0, 5)
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
  });

  const containerRef = useRef(null);
  const timePickerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days from previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const jumpToYear = (year) => {
    const newDate = new Date(year, currentMonth.getMonth(), 1);
    setCurrentMonth(newDate);
    setSelectedDate(new Date(year, currentMonth.getMonth(), Math.min(new Date(selectedDate).getDate(), getDaysInMonth(newDate))).toISOString().split('T')[0]);
  };

  const handleSave = () => {
    const newDateTime = new Date(`${selectedDate}T${selectedTime}`);
    onTimeChange(newDateTime);
  };

  const timeOptions = generateTimeOptions();

  return (
    <div ref={containerRef} className={`flex items-center gap-3 p-4 rounded-2xl shadow-lg transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
    }`}>
      {/* Date Display/Picker */}
      <div className="relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-3 px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80 hover:border-gray-500 shadow-lg shadow-gray-900/20' 
              : 'bg-white/90 border-gray-300 hover:bg-white hover:border-gray-400 shadow-lg shadow-gray-200/50 hover:shadow-xl'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all duration-200 ${
            isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {new Date(selectedDate).toLocaleDateString('de-DE', { 
                weekday: 'short', 
                day: '2-digit', 
                month: 'short' 
              })}
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(selectedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </button>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div className={`absolute top-full left-0 mt-2 w-80 border-2 rounded-2xl shadow-2xl z-50 backdrop-blur-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/95 border-gray-600' 
              : 'bg-white/95 border-gray-200'
          }`}>
            {/* Calendar Header - Simplified */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              {/* Previous Month */}
              <button
                onClick={() => navigateMonth(-1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Vorheriger Monat"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Month/Year Display with Direct Year Input */}
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentMonth.toLocaleDateString('de-DE', { month: 'long' })}
                </span>
                <input
                  type="number"
                  value={currentMonth.getFullYear()}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year && year >= 1 && year <= 9999) {
                      jumpToYear(year);
                    }
                  }}
                  className={`w-20 px-2 py-1 text-sm text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  title="Jahr direkt eingeben"
                />
              </div>
              
              {/* Next Month */}
              <button
                onClick={() => navigateMonth(1)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Nächster Monat"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
                {generateCalendarDays().map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2"></div>;
                  }

                  const dateStr = day.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setShowCalendar(false);
                      }}
                      className={`p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : isToday
                          ? isDarkMode
                            ? 'bg-blue-900/30 text-blue-300 border border-blue-500'
                            : 'bg-blue-50 text-blue-600 border border-blue-300'
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
          onClick={() => setShowTimePicker(!showTimePicker)}
          className={`flex items-center gap-2 px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80 hover:border-gray-500 shadow-lg shadow-gray-900/20' 
              : 'bg-white/90 border-gray-300 hover:bg-white hover:border-gray-400 shadow-lg shadow-gray-200/50 hover:shadow-xl'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all duration-200 ${
            isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{selectedTime}</span>
        </button>

        {/* Time Dropdown */}
        {showTimePicker && (
          <div className={`absolute top-full left-0 mt-3 w-full border-2 rounded-2xl shadow-2xl z-50 max-h-64 overflow-hidden backdrop-blur-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/95 border-gray-600 shadow-gray-900/50' 
              : 'bg-white/95 border-gray-200 shadow-gray-900/10'
          }`}>
            <div className="overflow-y-auto max-h-64 p-2">
              {timeOptions.map((timeOption) => {
                const isSelected = selectedTime === timeOption;
                const hour = parseInt(timeOption.split(':')[0]);
                const isNightTime = hour >= 22 || hour < 6;
                const isMorning = hour >= 6 && hour < 12;
                const isEvening = hour >= 18 && hour < 22;
                
                return (
                  <div
                    key={timeOption}
                    onClick={() => {
                      setSelectedTime(timeOption);
                      setShowTimePicker(false);
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <button
        onClick={handleSave}
        className={`p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
          isDarkMode 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' 
            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
        } shadow-lg`}
        title="Speichern"
      >
        <Save className="w-4 h-4" />
      </button>
      
      <button
        onClick={onCancel}
        className={`p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
          isDarkMode 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
        } shadow-lg`}
        title="Abbrechen"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CurrentGameTimePicker;
