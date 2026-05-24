import React, { useEffect, useState } from "react";
import { Settings, Timer, X, Maximize2, Minimize2 } from "lucide-react";
import { useRouteStore } from "../../store/useRouteStore";
import { ALL_CATEGORIES } from "../../utils/categoryConstants";
import { getCategoryEmoji, getCategoryLabel } from "../../utils/categoryUtils";
import { PlaceCategory, CategoryConfig } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CategorySettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { categoryDurations, setCategoryDuration, categoryConfigs, setCategoryConfig, applyCategoryDurationsToPlaces } = useRouteStore();
  
  // Local state for inputs to allow empty strings while typing
  const [localDurations, setLocalDurations] = useState<Record<string, string>>({});
  const [localMin, setLocalMin] = useState<Record<string, string>>({});
  const [localMax, setLocalMax] = useState<Record<string, string>>({});

  // Sync with store on open
  useEffect(() => {
    if (isOpen) {
      setLocalDurations({});
      setLocalMin({});
      setLocalMax({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDurationChange = (category: PlaceCategory, value: string) => {
    setLocalDurations((prev) => ({ ...prev, [category]: value }));
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 5) {
      setCategoryDuration(category, duration);
    }
  };

  const handleMinChange = (category: PlaceCategory, value: string) => {
    setLocalMin((prev) => ({ ...prev, [category]: value }));
    if (value === "") {
      setCategoryConfig(category, { minPerDay: null });
    } else {
      const min = parseInt(value, 10);
      if (!isNaN(min) && min >= 0) {
        setCategoryConfig(category, { minPerDay: min });
      }
    }
  };

  const handleMaxChange = (category: PlaceCategory, value: string) => {
    setLocalMax((prev) => ({ ...prev, [category]: value }));
    if (value === "") {
      setCategoryConfig(category, { maxPerDay: null });
    } else {
      const max = parseInt(value, 10);
      if (!isNaN(max) && max >= 0) {
        setCategoryConfig(category, { maxPerDay: max });
      }
    }
  };

  const handleBlurDuration = (category: PlaceCategory) => {
    const val = localDurations[category];
    if (val !== undefined) {
      const duration = parseInt(val, 10);
      if (isNaN(duration) || duration < 5) {
        setLocalDurations((prev) => {
          const newVals = { ...prev };
          delete newVals[category];
          return newVals;
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/50">
          <div>
            <h2 className="text-xl font-black text-surface-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-500" />
              Category Settings
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              Configure default visit durations and daily limits for the smart routing algorithm.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow no-scrollbar">
          
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-surface-200 dark:border-surface-700 text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-surface-800 z-10 pt-6 px-6">
            <div className="col-span-4">Category</div>
            <div className="col-span-3 text-center flex items-center justify-center gap-1"><Timer className="w-3 h-3"/> Default Duration</div>
            <div className="col-span-2 text-center flex items-center justify-center gap-1"><Minimize2 className="w-3 h-3"/> Min/Day</div>
            <div className="col-span-3 text-center flex items-center justify-center gap-1"><Maximize2 className="w-3 h-3"/> Max/Day</div>
          </div>

          <div className="mt-2 space-y-1 px-6 pb-6">
            {ALL_CATEGORIES.map((category) => {
              const config = categoryConfigs[category] || {};
              return (
                <div 
                  key={category} 
                  className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-xl transition-colors group"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
                      {getCategoryEmoji(category)}
                    </div>
                    <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                      {getCategoryLabel(category)}
                    </span>
                  </div>
                  
                  {/* Duration Input */}
                  <div className="col-span-3 flex justify-center">
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={localDurations[category] ?? categoryDurations?.[category] ?? 60}
                        onChange={(e) => handleDurationChange(category, e.target.value)}
                        onBlur={() => handleBlurDuration(category)}
                        className="w-20 px-3 py-1.5 text-sm font-bold text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-surface-400 pointer-events-none">m</span>
                    </div>
                  </div>

                  {/* Min Per Day Input */}
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="number"
                      min="0"
                      placeholder="-"
                      value={localMin[category] ?? (config.minPerDay !== null && config.minPerDay !== undefined ? config.minPerDay : "")}
                      onChange={(e) => handleMinChange(category, e.target.value)}
                      className="w-16 px-2 py-1.5 text-sm font-bold text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-surface-900 dark:text-white placeholder:text-surface-300 dark:placeholder:text-surface-600"
                    />
                  </div>

                  {/* Max Per Day Input */}
                  <div className="col-span-3 flex justify-center items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="-"
                      value={localMax[category] ?? (config.maxPerDay !== null && config.maxPerDay !== undefined ? config.maxPerDay : "")}
                      onChange={(e) => handleMaxChange(category, e.target.value)}
                      className="w-16 px-2 py-1.5 text-sm font-bold text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-surface-900 dark:text-white placeholder:text-surface-300 dark:placeholder:text-surface-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 flex justify-between items-center">
          <button
            onClick={() => {
              applyCategoryDurationsToPlaces();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
          >
            Apply to Current PTVs
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
