import React from "react";
import { AlertCircle, X, Search, Trash2 } from "lucide-react";
import { useRouteStore } from "../../store/useRouteStore";
import { motion, AnimatePresence } from "framer-motion";

export const MissingPlacesList: React.FC = () => {
  const { missingPlaces, removeMissingPlace, clearMissingPlaces } =
    useRouteStore();

  if (missingPlaces.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl overflow-hidden mt-4"
    >
      <div className="p-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Unresolved Locations ({missingPlaces.length})
          </h3>
        </div>
        <button
          onClick={clearMissingPlaces}
          className="text-[10px] font-bold text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {missingPlaces.map((name, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-surface-800 rounded-lg border border-red-50 dark:border-red-900/20 group shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-surface-900 dark:text-white truncate font-medium">
                  "{name}"
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => removeMissingPlace(name)}
                  className="p-1 text-surface-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 bg-red-50/80 dark:bg-red-900/20 text-center">
        <p className="text-[10px] text-red-600 dark:text-red-400">
          These names didn't return any results from Google Maps. Try checking
          the spelling or adding a city name.
        </p>
      </div>
    </motion.div>
  );
};
