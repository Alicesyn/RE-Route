import React from "react";
import { useRouteStore } from "../../store/useRouteStore";
import { X, Calendar, MapPin, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadTripModal: React.FC<LoadTripModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { savedTrips, loadTrip, deleteTrip } = useRouteStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] transition-colors"
        >
          <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                My Saved Trips
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Select a trip to load its full itinerary
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-surface-50 dark:bg-surface-900/50 transition-colors">
            {savedTrips.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white dark:bg-surface-800 rounded-xl border border-dashed border-surface-200 dark:border-surface-700">
                <p className="text-surface-500 dark:text-surface-400 font-medium">
                  You haven't saved any trips yet.
                </p>
                <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                  Click "Save" in the header to save your current itinerary.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedTrips
                  .slice()
                  .reverse()
                  .map((trip) => (
                    <div key={trip.id} className="relative group">
                      <button
                        onClick={() => {
                          loadTrip(trip.id);
                          onClose();
                        }}
                        className="w-full text-left bg-white dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 transition-all flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-lg pr-8">
                            {trip.title}
                          </h3>
                          <span className="text-xs font-medium text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-md">
                            {new Date(trip.savedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-medium text-surface-500 dark:text-surface-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {trip.days} Days
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {trip.places.length} Places
                          </div>
                          {trip.optimizedRoutes.length > 0 && (
                            <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">
                              <Clock className="w-3 h-3" />
                              Optimized
                            </div>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrip(trip.id);
                        }}
                        className="absolute right-3 bottom-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete saved trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
