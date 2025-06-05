import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SettingsModal = ({ isDarkMode, autoSaveInterval, onAutoSaveIntervalChange, onToggleDarkMode, onClose }) => {
  const [interval, setInterval] = useState(Math.round(autoSaveInterval / 1000));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in when mounted
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valueMs = Math.max(500, parseInt(interval, 10) * 1000);
    onAutoSaveIntervalChange(valueMs);
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Einstellungen</h3>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="dark-mode-toggle"
              type="checkbox"
              checked={isDarkMode}
              onChange={onToggleDarkMode}
              className="mr-2"
            />
            <label htmlFor="dark-mode-toggle" className="text-sm">Dunkelmodus aktivieren</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Abbrechen
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
