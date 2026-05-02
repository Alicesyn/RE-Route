import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { MOCK_PLACES } from '../../services/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export const PlaceSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { addPlace, appMode } = useRouteStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  };

  const results = appMode !== 'real'
    ? MOCK_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : []; // In real mode, this would call Google Places API

  const handleAdd = (place: typeof MOCK_PLACES[0]) => {
    addPlace({
      ...place,
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    setQuery('');
    setIsOpen(false);
  };

  if (appMode === 'dropdown-mock') {
    return (
      <div className="relative mb-6">
        <select
          onChange={(e) => {
            const place = MOCK_PLACES[parseInt(e.target.value)];
            if (place) handleAdd(place);
            e.target.value = '';
          }}
          className="w-full bg-white border border-surface-200 text-surface-900 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none shadow-sm font-medium"
          defaultValue=""
        >
          <option value="" disabled>Select a place to add...</option>
          {MOCK_PLACES.map((p, i) => (
            <option key={i} value={i}>{p.name}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Plus className="w-5 h-5 text-surface-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search for a place to add..."
          className="input-base rounded-xl py-3 pl-12 pr-4"
        />
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-surface-100 overflow-hidden z-20"
          >
            {results.map((place) => (
              <button
                key={place.id}
                onClick={() => handleAdd(place)}
                className="w-full text-left px-4 py-3 hover:bg-surface-50 flex items-center justify-between group transition-colors border-b border-surface-50 last:border-0"
              >
                <div>
                  <h4 className="font-medium text-surface-900">{place.name}</h4>
                  <p className="text-sm text-surface-500 truncate">{place.address}</p>
                </div>
                <div className="bg-primary-50 text-primary-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
