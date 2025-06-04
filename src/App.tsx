import React from 'react';
import Timeline from './components/Timeline';

function App() {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Timeline />
    </div>
  );
}

export default App;
