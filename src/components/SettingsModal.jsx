import React, { useState } from 'react';
import { X } from 'lucide-react';

const SettingsModal = ({ isDarkMode, autoSaveInterval, onAutoSaveIntervalChange, onToggleDarkMode, onClose, inputClassName = '', buttonClassName = '' }) => {
  const [interval, setInterval] = useState(Math.round(autoSaveInterval / 1000));

  const handleSubmit = (e) => {
    e.preventDefault();
    const valueMs = Math.max(500, parseInt(interval, 10) * 1000);
    onAutoSaveIntervalChange(valueMs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className={`rounded-2xl shadow-2xl max-w-sm w-full p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Einstellungen</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Auto-Save Intervall (Sekunden)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className={`w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="dark-mode-toggle"
              type="checkbox"
              checked={isDarkMode}
              onChange={onToggleDarkMode}
              className="mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-5 w-5 rounded-xl border border-gray-300"
            />
            <label htmlFor="dark-mode-toggle" className="text-sm">Dunkelmodus aktivieren</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonClassName} focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Abbrechen
            </button>
            <button type="submit" className={`${buttonClassName} bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}>
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
