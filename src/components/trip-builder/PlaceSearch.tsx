import React, { useState } from 'react';
import { Search, Plus, CalendarDays } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { MOCK_PLACES } from '../../services/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryEmoji, getCategoryLabel, autoCategorize, getDefaultDuration } from '../../utils/categoryUtils';

export const PlaceSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { addPlace, appMode, days, sidebarWidth } = useRouteStore();
  const isSidebarExpanded = sidebarWidth >= 450;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  };

  const results = appMode !== 'real'
    ? MOCK_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleAdd = (place: typeof MOCK_PLACES[0]) => {
    // Auto-categorize if no category set (for real mode places)
    const category = place.category || autoCategorize(place.name, place.description);
    const estimatedDuration = place.estimatedDuration || getDefaultDuration(category);
    
    addPlace(
      {
        ...place,
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category,
        estimatedDuration,
      },
      selectedDay !== null ? selectedDay : undefined
    );
    setQuery('');
    setIsOpen(false);
  };

  const daySelector = (
    <div className="flex items-center gap-1.5 shrink-0">
      <CalendarDays className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
      <select
        value={selectedDay !== null ? selectedDay : ''}
        onChange={(e) => setSelectedDay(e.target.value === '' ? null : parseInt(e.target.value))}
        className="text-xs font-medium bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
        title="Assign to day"
      >
        <option value="">{isSidebarExpanded ? 'Unassigned' : '-'}</option>
        {Array.from({ length: days }).map((_, i) => (
          <option key={i} value={i}>{isSidebarExpanded ? 'Day' : 'D'}{i + 1}</option>
        ))}
      </select>
    </div>
  );

  if (appMode === 'dropdown-mock') {
    return (
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              onChange={(e) => {
                const place = MOCK_PLACES[parseInt(e.target.value)];
                if (place) handleAdd(place);
                e.target.value = '';
              }}
              className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm font-medium"
              defaultValue=""
            >
              <option value="" disabled>Select a place to add...</option>
              {MOCK_PLACES.map((p, i) => (
                <option key={i} value={i}>{getCategoryEmoji(p.category)} {p.name} ({p.estimatedDuration} min)</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Plus className="w-5 h-5 text-surface-400" />
            </div>
          </div>
          {daySelector}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search for a place to add..."
            className="input-base rounded-xl py-3 pl-12 pr-4"
          />
        </div>
        {daySelector}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-100 dark:border-surface-700 overflow-hidden z-20"
          >
            {results.map((place) => (
              <button
                key={place.id}
                onClick={() => handleAdd(place)}
                className="w-full text-left px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center justify-between group transition-colors border-b border-surface-50 dark:border-surface-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" title={getCategoryLabel(place.category)}>{getCategoryEmoji(place.category)}</span>
                  <div>
                    <h4 className="font-medium text-surface-900 dark:text-white">{place.name}</h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {getCategoryLabel(place.category)} · {place.estimatedDuration} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDay !== null && (
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      Day {selectedDay + 1}
                    </span>
                  )}
                  <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
