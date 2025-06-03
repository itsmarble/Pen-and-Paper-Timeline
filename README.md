# 🎲 D&D/RPG Campaign Timeline

A beautiful, modern timeline management application designed specifically for Dungeons & Dragons and tabletop RPG campaigns. Track your story events, manage time ranges, and navigate through your campaign's history with style.

![Timeline Application](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-6.3-green) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-cyan)

## ✨ Features

### 🎯 Enhanced Navigation
- **Time Unit Navigation**: Jump by years, months, days, or hours
- **Labeled Buttons**: Clear "Jahr", "Monat", "Tag", "Std" labels instead of just chevrons
- **Responsive Design**: Adapts to different screen sizes
- **Current Time Display**: Always shows the current campaign time

### 📅 Beautiful Date/Time Picker
- **Custom Dropdowns**: Scrollable date and time selection
- **Time Ranges**: Support for events spanning multiple hours or days
- **15-Minute Intervals**: Precise time selection
- **Visual Indicators**: Blue for start times, green for end times
- **"Heute" Badges**: Quick identification of current date

### ⏰ Time Range Support
- **Multi-Hour Events**: Perfect for long tavern meetings or negotiations
- **Multi-Day Events**: Track journeys, festivals, or extended story arcs
- **Duration Display**: Shows "2d 5h" or "3h 45m" format
- **Range Validation**: Ensures end time is after start time
- **Visual Differentiation**: Dashed borders for range events

### 🎨 Modern UI
- **Dark/Light Mode**: Toggle between themes
- **Status Indicators**: Current (green), Future (blue), Past (gray)
- **Smooth Animations**: Tasteful transitions and pulse effects
- **Custom Scrollbars**: Beautiful scrolling experience
- **Gradient Backgrounds**: Stunning visual appeal

### 📊 Campaign Statistics
- **Current Events**: Shows what's happening now
- **Future Events**: Upcoming story beats
- **Past Events**: Campaign history
- **Real-time Updates**: Statistics update as time progresses

### 🔍 Search & Organization
- **Text Search**: Find events by description, location, or tags
- **Tag System**: Organize with tags like "quest", "npc", "combat"
- **Tag Filtering**: Multi-select filtering
- **Combined Search**: Use text and tag filters together

### 💾 Data Management
- **Auto-Save**: Events saved to browser storage
- **Export/Import**: JSON backup and restore
- **Event Management**: Add, edit, delete events
- **Validation**: Ensures data integrity

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd pen-paper-timeline

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Usage for RPG Campaigns

### Creating Events
1. Click the "Event" button (or press `Ctrl+N`)
2. Set date and time using the beautiful picker
3. Toggle "Zeitraum" for time ranges (battles, journeys, etc.)
4. Add description, location, and tags
5. Save your event

### Navigation
- Use time unit buttons to jump through campaign time
- Click the time display to edit current campaign time
- Use keyboard shortcuts for quick actions

### Organization
- Tag events with categories: `quest`, `npc`, `combat`, `social`, `travel`
- Use search to find specific events quickly
- Filter by tags to focus on specific story elements

### Examples
- **Point Event**: "Arrived in Bergheim" - 14:30
- **Short Event**: "Tavern meeting" - 18:00 to 22:30 (4h 30m)
- **Long Event**: "Journey to Steinbrücke" - 3 days, 5 hours, 30 minutes
- **Combat**: "Arena tournament" - 8:00 to 20:00 (12 hours)

## ⌨️ Keyboard Shortcuts

- `Ctrl+N` - Create new event
- `Ctrl+S` - Export timeline data
- `Ctrl+D` - Toggle dark/light mode
- `Escape` - Close modals and forms

## 🛠️ Technical Stack

- **React 19**: Modern React with latest features
- **Vite 6.3**: Lightning-fast development
- **TailwindCSS 4.1**: Utility-first styling
- **Lucide React**: Beautiful icon library
- **Local Storage**: Browser-based persistence

## 📱 Responsive Design

Works perfectly on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen orientations

## 🎨 Theming

The application supports both light and dark themes with:
- Automatic theme persistence
- Smooth transitions
- Consistent color schemes
- Custom scrollbar styling

## 🔧 Development

```bash
# Development with hot reload
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
src/
├── components/
│   ├── Timeline.jsx          # Main timeline component
│   ├── EventCard.jsx         # Individual event display
│   ├── EditEventForm.jsx     # Event editing modal
│   └── DateTimePicker.jsx    # Custom date/time picker
├── data/
│   └── events.json          # Sample events data
└── styles/
    └── index.css            # Global styles and scrollbars
```

## 🎯 Perfect For

- **D&D Campaigns**: Track story events and sessions
- **RPG Game Masters**: Organize campaign timelines
- **Story Writers**: Manage narrative chronology
- **Event Planning**: Any time-based event management
- **History Tracking**: Personal or fictional timelines

## 📝 License

This project is open source and available under the MIT License.

---

*Made with ❤️ for RPG enthusiasts and game masters who want to track their campaigns with style and precision.*
