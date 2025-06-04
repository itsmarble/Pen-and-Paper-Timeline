// UnifiedTimeNavigator.jsx - Simple, intuitive time navigation component
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar, 
  Globe, 
  Move3D,
  SkipBack,
  SkipForward
} from 'lucide-react';

const UnifiedTimeNavigator = ({ 
  currentTime, 
  onTimeChange, 
  isDarkMode,
  className = ""
}) => {
  const [activeUnit, setActiveUnit] = useState('hour');
  const [quickJumpInput, setQuickJumpInput] = useState('');
  const [showQuickJump, setShowQuickJump] = useState(false);

  // Simple time units - no complex increment selection
  const timeUnits = {
    hour: {
      label: 'Stunden',
      icon: Clock,
      step: 1,
      fastStep: 6,
      color: 'blue'
    },
    day: {
      label: 'Tage', 
      icon: Calendar,
      step: 1,
      fastStep: 7,
      color: 'green'
    },
    month: {
      label: 'Monate',
      icon: Globe,
      step: 1,
      fastStep: 6,
      color: 'purple'
    },
    year: {
      label: 'Jahre',
      icon: Move3D,
      step: 1,
      fastStep: 10,
      color: 'orange'
    }
  };

  const currentUnit = timeUnits[activeUnit];

  // Simple time navigation
  const navigateTime = (direction, isFast = false) => {
    const newTime = new Date(currentTime);
    const amount = direction * (isFast ? currentUnit.fastStep : currentUnit.step);
    
    switch (activeUnit) {
      case 'hour':
        newTime.setHours(newTime.getHours() + amount);
        break;
      case 'day':
        newTime.setDate(newTime.getDate() + amount);
        break;
      case 'month':
        newTime.setMonth(newTime.getMonth() + amount);
        break;
      case 'year':
        newTime.setFullYear(newTime.getFullYear() + amount);
        break;
    }
    
    onTimeChange(newTime);
  };

  // Quick jump functionality
  const handleQuickJump = () => {
    const input = quickJumpInput.trim();
    let newTime = null;
    
    // Simple year jump: 2024
    if (/^\d{1,4}$/.test(input)) {
      const year = parseInt(input);
      newTime = new Date(year, currentTime.getMonth(), currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
    }
    
    if (newTime && !isNaN(newTime)) {
      onTimeChange(newTime);
      setQuickJumpInput('');
      setShowQuickJump(false);
    }
  };

  // Color schemes
  const getUnitColor = (unit, isActive) => {
    const colorMap = {
      blue: isActive 
        ? 'bg-blue-500/20 text-blue-400 border-blue-400/50'
        : 'text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10',
      green: isActive
        ? 'bg-green-500/20 text-green-400 border-green-400/50'
        : 'text-green-400/70 hover:text-green-400 hover:bg-green-500/10',
      purple: isActive
        ? 'bg-purple-500/20 text-purple-400 border-purple-400/50'
        : 'text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/10',
      orange: isActive
        ? 'bg-orange-500/20 text-orange-400 border-orange-400/50'
        : 'text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10'
    };
    
    if (isDarkMode) {
      return colorMap[timeUnits[unit].color];
    } else {
      const lightColorMap = {
        blue: isActive 
          ? 'bg-blue-100 text-blue-700 border-blue-300'
          : 'text-blue-600/70 hover:text-blue-700 hover:bg-blue-50',
        green: isActive
          ? 'bg-green-100 text-green-700 border-green-300'
          : 'text-green-600/70 hover:text-green-700 hover:bg-green-50',
        purple: isActive
          ? 'bg-purple-100 text-purple-700 border-purple-300'
          : 'text-purple-600/70 hover:text-purple-700 hover:bg-purple-50',
        orange: isActive
          ? 'bg-orange-100 text-orange-700 border-orange-300'
          : 'text-orange-600/70 hover:text-orange-700 hover:bg-orange-50'
      };
      return lightColorMap[timeUnits[unit].color];
    }
  };

  return (
    <div
      className={`relative z-10 p-4 rounded-xl backdrop-blur-md border shadow-2xl ring-1 ring-black/5 transition-all duration-300 ${
        isDarkMode
          ? 'bg-gray-800/40 border-gray-700/50'
          : 'bg-white/70 border-gray-200/50'
      } ${className}`}
    >
      
      {/* Unit Selector - Compact horizontal */}
      <div className="flex justify-center gap-1 mb-4">
        {Object.keys(timeUnits).map((unit) => {
          const unitConfig = timeUnits[unit];
          const Icon = unitConfig.icon;
          const isActive = unit === activeUnit;
          
          return (
            <button
              key={unit}
              onClick={() => setActiveUnit(unit)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'border ' : 'border border-transparent '
              }${getUnitColor(unit, isActive)}`}
              title={`${unitConfig.label} navigieren`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{unitConfig.label}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Controls - Simple and clear */}
      <div className="flex items-center justify-center gap-2">
        {/* Fast backward */}
        <button
          onClick={() => navigateTime(-1, true)}
          className={`p-2 rounded-lg transition-all group ${
            isDarkMode 
              ? 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          title={`-${currentUnit.fastStep} ${currentUnit.label}`}
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        {/* Step backward */}
        <button
          onClick={() => navigateTime(-1)}
          className={`p-2 rounded-lg transition-all group ${
            isDarkMode 
              ? 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          title={`-${currentUnit.step} ${currentUnit.label}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Current time display */}
        <div className={`px-4 py-2 rounded-lg text-center min-w-[120px] ${
          isDarkMode ? 'bg-gray-700/30 text-gray-200' : 'bg-gray-100/70 text-gray-800'
        }`}>
          <div className="text-sm font-medium">
            {activeUnit === 'hour' && currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            {activeUnit === 'day' && currentTime.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
            {activeUnit === 'month' && currentTime.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
            {activeUnit === 'year' && currentTime.getFullYear()}
          </div>
          <div className="text-xs opacity-70">
            {currentUnit.label}
          </div>
        </div>

        {/* Step forward */}
        <button
          onClick={() => navigateTime(1)}
          className={`p-2 rounded-lg transition-all group ${
            isDarkMode 
              ? 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          title={`+${currentUnit.step} ${currentUnit.label}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {/* Fast forward */}
        <button
          onClick={() => navigateTime(1, true)}
          className={`p-2 rounded-lg transition-all group ${
            isDarkMode 
              ? 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          title={`+${currentUnit.fastStep} ${currentUnit.label}`}
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump - Simple year input */}
      {showQuickJump ? (
        <div className="flex gap-2 mt-3 justify-center">
          <input
            type="number"
            value={quickJumpInput}
            onChange={(e) => setQuickJumpInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickJump()}
            placeholder="Jahr..."
            className={`w-20 px-2 py-1 text-sm rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            autoFocus
          />
          <button
            onClick={handleQuickJump}
            className={`px-3 py-1 text-xs rounded ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            ↵
          </button>
          <button
            onClick={() => {
              setShowQuickJump(false);
              setQuickJumpInput('');
            }}
            className={`px-2 py-1 text-xs rounded ${
              isDarkMode 
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="text-center mt-3">
          <button
            onClick={() => setShowQuickJump(true)}
            className={`text-xs px-3 py-1 rounded transition-all ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Springe zu Jahr...
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedTimeNavigator;
