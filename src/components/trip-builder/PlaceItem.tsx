import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, MapPin, Pin, Clock } from 'lucide-react';
import { Place, PlaceCategory } from '../../types';
import { useRouteStore } from '../../store/useRouteStore';
import { getCategoryEmoji, getCategoryLabel, getDefaultDuration, ALL_CATEGORIES } from '../../utils/categoryUtils';

interface PlaceItemProps {
  place: Place;
}

export const PlaceItem: React.FC<PlaceItemProps> = ({ place }) => {
  const { updatePlace, removePlace, assignPlaceToDay, unassignPlace, days, sidebarWidth } = useRouteStore();
  const isSidebarExpanded = sidebarWidth >= 450;
  const [isEditing, setIsEditing] = useState(false);
  const [desc, setDesc] = useState(place.description || '');
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationVal, setDurationVal] = useState((place.estimatedDuration ?? 60).toString());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditingDuration && durationRef.current) {
      durationRef.current.focus();
      durationRef.current.select();
    }
  }, [isEditingDuration]);

  const handleSave = () => {
    setIsEditing(false);
    if (desc !== place.description) {
      updatePlace(place.id, { description: desc, descriptionSource: 'user' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setDesc(place.description || '');
    }
  };

  const handleDurationSave = () => {
    setIsEditingDuration(false);
    const parsed = parseInt(durationVal);
    if (!isNaN(parsed) && parsed > 0 && parsed !== place.estimatedDuration) {
      updatePlace(place.id, { estimatedDuration: parsed });
    } else {
      setDurationVal((place.estimatedDuration ?? 60).toString());
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '') {
      unassignPlace(place.id);
    } else {
      assignPlaceToDay(place.id, parseInt(val));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value as PlaceCategory;
    updatePlace(place.id, { 
      category: newCat, 
      estimatedDuration: getDefaultDuration(newCat) 
    });
    setDurationVal(getDefaultDuration(newCat).toString());
  };

  // Day badge colors
  const dayColors = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-cyan-50 text-cyan-700 border-cyan-200',
    'bg-orange-50 text-orange-700 border-orange-200',
  ];

  const getBadgeColor = (dayIndex: number | null) => {
    if (dayIndex === null) return 'bg-surface-100 text-surface-500 border-surface-200';
    return dayColors[dayIndex % dayColors.length];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group card-place ${isDragging ? 'opacity-50 border-primary-500 shadow-md scale-[1.02]' : ''}`}
    >
      <div className="flex items-start p-4 gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-surface-400 hover:text-surface-600 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                <span className="truncate">{place.name}</span>
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{place.address}</p>
              
              {/* Category & Duration row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Category selector */}
                <select
                  value={place.category}
                  onChange={handleCategoryChange}
                  className="text-xs font-medium bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
                  title="Change category"
                >
                  {ALL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{getCategoryEmoji(cat)} {getCategoryLabel(cat)}</option>
                  ))}
                </select>

                {/* Duration badge (click to edit) */}
                {isEditingDuration ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-surface-400 dark:text-surface-500" />
                    <input
                      ref={durationRef}
                      type="number"
                      min="5"
                      max="480"
                      value={durationVal}
                      onChange={(e) => setDurationVal(e.target.value)}
                      onBlur={handleDurationSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDurationSave();
                        if (e.key === 'Escape') { setIsEditingDuration(false); setDurationVal((place.estimatedDuration ?? 60).toString()); }
                      }}
                      className="w-14 text-xs font-medium bg-white dark:bg-surface-800 border border-primary-300 dark:border-primary-700 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-500 text-center text-surface-900 dark:text-white"
                    />
                    <span className="text-xs text-surface-500">min</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingDuration(true)}
                    className="flex items-center gap-1 text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md px-1.5 py-0.5 hover:border-surface-300 dark:hover:border-surface-600 transition-colors"
                    title="Click to edit duration"
                  >
                    <Clock className="w-3 h-3" />
                    {place.estimatedDuration ?? 60} min
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Day assignment dropdown */}
              <div className="relative">
                <select
                  value={place.dayIndex !== null ? place.dayIndex : ''}
                  onChange={handleDayChange}
                  className={`text-xs font-bold border rounded-md pl-1.5 pr-4 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer text-center tracking-wide ${place.dayIndex === null ? 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700' : getBadgeColor(place.dayIndex)}`}
                  title="Assign to day"
                >
                  <option value="">{isSidebarExpanded ? 'Unassigned' : '-'}</option>
                  {Array.from({ length: days }).map((_, i) => (
                    <option key={i} value={i}>{isSidebarExpanded ? 'Day' : 'D'}{i + 1}</option>
                  ))}
                </select>
                {place.pinnedToDay && (
                  <Pin className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-current opacity-60 pointer-events-none" />
                )}
              </div>

              <button
                onClick={() => removePlace(place.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                aria-label="Remove place"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inline Editable Description */}
          <div className="mt-1">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full text-sm text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 border border-primary-200 dark:border-primary-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none overflow-hidden"
                rows={1}
              />
            ) : (
              <p
                onClick={() => !isDragging && setIsEditing(true)}
                className="text-sm text-surface-600 dark:text-surface-300 cursor-text hover:bg-surface-50 dark:hover:bg-surface-700 p-2 -mx-2 rounded-lg transition-colors border border-transparent hover:border-surface-200 dark:hover:border-surface-600 line-clamp-2"
                title="Click to edit"
              >
                {place.description || <span className="text-surface-400 dark:text-surface-500 italic">Click to add description...</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
