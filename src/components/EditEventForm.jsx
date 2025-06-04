// EditEventForm.jsx - Modal form for editing events
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import { EventValidator } from '../utils/eventUtils';

const EditEventForm = ({ event, isDarkMode, currentGameTime, onSave, onCancel, inputClassName = '', buttonClassName = '' }) => {
  const [editData, setEditData] = useState({
    name: event.name || '',
    entry_date: event.entry_date || '',
    entry_time: event.entry_time || '',
    description: event.description || '',
    location: event.location || '',
    tags: event.tags || [],
    hasEndDateTime: event.hasEndDateTime || (event.end_date && event.end_time),
    end_date: event.end_date || '',
    end_time: event.end_time || '',
    id: event.id,
    created_at: event.created_at,
    updated_at: event.updated_at
  });
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const addTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData({
        ...editData,
        tags: [...editData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use EventValidator for validation
    const { isValid, errors } = EventValidator.validateEvent(editData);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }
    // Validate end date/time if range is enabled
    if (editData.hasEndDateTime && (!editData.end_date || !editData.end_time)) {
      setValidationErrors(['Enddatum und Endzeit sind erforderlich, wenn ein Zeitraum angegeben ist.']);
      return;
    }
    // Validate that end date/time is after start date/time
    if (editData.hasEndDateTime) {
      const startDateTime = new Date(`${editData.entry_date}T${editData.entry_time}`);
      const endDateTime = new Date(`${editData.end_date}T${editData.end_time}`);
      if (endDateTime <= startDateTime) {
        setValidationErrors(['Endzeitpunkt muss nach dem Startzeitpunkt liegen.']);
        return;
      }
    }
    setValidationErrors([]);
    onSave(editData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Event bearbeiten</h3>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg px-3 py-2 mb-2 text-sm">
              <ul className="list-disc pl-5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Event-Name</label>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className={`w-full border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName} ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'}`}
              placeholder="Kurzer, prägnanter Name für das Event"
              required
            />
          </div>

          <DateTimePicker
            date={editData.entry_date}
            time={editData.entry_time}
            endDate={editData.end_date}
            endTime={editData.end_time}
            hasEndDateTime={editData.hasEndDateTime}
            currentGameTime={currentGameTime}
            onDateChange={(date) => setEditData({...editData, entry_date: date})}
            onTimeChange={(time) => setEditData({...editData, entry_time: time})}
            onEndDateChange={(date) => setEditData({...editData, end_date: date})}
            onEndTimeChange={(time) => setEditData({...editData, end_time: time})}
            onToggleRange={(hasRange) => setEditData({...editData, hasEndDateTime: hasRange})}
            isDarkMode={isDarkMode}
            label="Event-Zeit"
            required={true}
            inputClassName="px-4 py-2 rounded-xl text-base"
            buttonClassName="px-4 py-2 rounded-xl text-base"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              className={`w-full border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName} ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'}`}
              rows="3"
              placeholder="Detaillierte Beschreibung des Events"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ort</label>
            <input
              type="text"
              value={editData.location || ''}
              onChange={(e) => setEditData({...editData, location: e.target.value})}
              className={`w-full border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName} ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'}`}
              placeholder="Wo findet das Event statt?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {editData.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                    isDarkMode 
                      ? 'bg-blue-800/50 text-blue-300 border border-blue-600'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName} ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'}`}
                placeholder="Neuen Tag hinzufügen..."
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim()}
                className={`${buttonClassName} ${newTag.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={`${buttonClassName} ${isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className={`${buttonClassName} bg-blue-600 text-white hover:bg-blue-700`}
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;