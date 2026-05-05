import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { MOCK_HOTELS } from '../../services/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface HotelSearchInputProps {
  onSelect: (hotelId: string) => void;
  placeholder?: string;
  currentValue?: string;
}

export const HotelSearchInput: React.FC<HotelSearchInputProps> = ({ onSelect, placeholder = "Search for a hotel...", currentValue }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  };

  // Mock results
  const results = MOCK_HOTELS.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (index: number) => {
    setQuery('');
    setIsOpen(false);
    setIsEditing(false);
    onSelect(index.toString());
  };

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    if (!query && currentValue) {
      setQuery(currentValue);
    }
    if (query) setIsOpen(true);
    updateDropdownPosition();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsEditing(false);
      setIsOpen(false);
      setQuery('');
    }, 200);
  };

  // Update dropdown position on scroll or resize
  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    const scrollContainer = inputRef.current?.closest('.overflow-y-auto');
    const handleReposition = () => updateDropdownPosition();
    scrollContainer?.addEventListener('scroll', handleReposition);
    window.addEventListener('resize', handleReposition);
    return () => {
      scrollContainer?.removeEventListener('scroll', handleReposition);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen]);

  const displayValue = isEditing ? query : (currentValue || '');

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
        <input 
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-white border border-surface-200 rounded-lg py-2 pl-9 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            style={dropdownStyle}
            className="bg-white rounded-lg shadow-lg border border-surface-100 overflow-hidden max-h-60 overflow-y-auto"
          >
            {results.map((hotel) => {
              const originalIndex = MOCK_HOTELS.findIndex(h => h.name === hotel.name);
              return (
                <button
                  key={originalIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(originalIndex)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-50 flex flex-col group transition-colors border-b border-surface-50 last:border-0"
                >
                  <span className="font-medium text-surface-900 text-sm">{hotel.name}</span>
                  <span className="text-xs text-surface-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {hotel.address}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
