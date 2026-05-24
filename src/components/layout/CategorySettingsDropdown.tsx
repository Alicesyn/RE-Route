import React from "react";
import { Settings, Timer } from "lucide-react";
import { useRouteStore } from "../../store/useRouteStore";
import { ALL_CATEGORIES } from "../../utils/categoryConstants";
import { getCategoryEmoji, getCategoryLabel } from "../../utils/categoryUtils";
import { PlaceCategory } from "../../types";

export const CategorySettingsDropdown: React.FC = () => {
  const { categoryDurations, setCategoryDuration } = useRouteStore();
  const [localValues, setLocalValues] = React.useState<Record<string, string>>({});

  const handleDurationChange = (category: PlaceCategory, value: string) => {
    setLocalValues((prev) => ({ ...prev, [category]: value }));
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 5) {
      setCategoryDuration(category, duration);
    }
  };

  const handleBlur = (category: PlaceCategory) => {
    const val = localValues[category];
    if (val !== undefined) {
      const duration = parseInt(val, 10);
      if (isNaN(duration) || duration < 5) {
        // Revert local value on blur if invalid
        setLocalValues((prev) => {
          const newVals = { ...prev };
          delete newVals[category];
          return newVals;
        });
      }
    }
  };

  return (
    <div className="relative group z-50">
      <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 border-surface-200 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700">
        <Settings className="w-4 h-4 text-surface-400 dark:text-surface-500" />
        <span>Categories</span>
      </button>

      <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden pointer-events-none group-hover:pointer-events-auto">
        <div className="p-4 border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
          <h4 className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary-500" />
            Default Durations
          </h4>
          <p className="text-xs text-surface-500 mt-1 leading-relaxed">
            Set the default duration (in minutes) for each category when adding new places.
          </p>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
          {ALL_CATEGORIES.map((category) => (
            <div 
              key={category} 
              className="flex items-center justify-between p-2 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{getCategoryEmoji(category)}</span>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {getCategoryLabel(category)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={localValues[category] ?? categoryDurations?.[category] ?? 60}
                  onChange={(e) => handleDurationChange(category, e.target.value)}
                  onBlur={() => handleBlur(category)}
                  className="w-16 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-surface-900 dark:text-white"
                />
                <span className="text-[10px] font-bold text-surface-400 uppercase">min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
