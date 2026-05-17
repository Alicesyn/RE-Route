import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Square,
  CheckSquare,
} from "lucide-react";
import { searchPlaces, MapsPlace } from "../../services/mapsService";
import { MOCK_PLACES } from "../../services/mockData";
import { useRouteStore } from "../../store/useRouteStore";
import { motion, AnimatePresence } from "framer-motion";
import { autoCategorize, getDefaultDuration } from "../../utils/categoryUtils";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportResult {
  query: string;
  match: MapsPlace | null;
  selected: boolean;
  error?: string;
  isDuplicate?: boolean;
}

type ModalState = "input" | "searching" | "review" | "success";

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [text, setText] = useState("");
  const [modalState, setModalState] = useState<ModalState>("input");
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    currentName: "",
  });
  const { addPlace, appMode, places, addMissingPlace } = useRouteStore();

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Delay slightly to avoid flickering during exit animation
      const timer = setTimeout(() => {
        setModalState("input");
        setText("");
        setResults([]);
        setProgress({ current: 0, total: 0, currentName: "" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearchAll = async () => {
    // Unique lines only to prevent searching same thing twice
    const lines = Array.from(
      new Set(
        text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
      ),
    );

    if (lines.length === 0) return;

    setModalState("searching");
    setProgress({ current: 0, total: lines.length, currentName: "" });

    const searchResults: ImportResult[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      setProgress((prev) => ({ ...prev, current: i + 1, currentName: line }));

      // 1. Check if the exact name is already in the trip (Token saving skip)
      const existingPlace = places.find(
        (p) => p.name.toLowerCase() === line.toLowerCase(),
      );

      if (existingPlace) {
        searchResults.push({
          query: line,
          match: {
            id: existingPlace.id,
            name: existingPlace.name,
            address: existingPlace.address,
            lat: existingPlace.lat,
            lng: existingPlace.lng,
            types: [],
          },
          selected: false,
          isDuplicate: true,
        });
        continue; // Skip API call
      }

      try {
        let mapsResults: MapsPlace[] = [];

        if (appMode === "real") {
          mapsResults = await searchPlaces(line);
        } else {
          // Mock search logic
          mapsResults = MOCK_PLACES.filter((p) =>
            p.name.toLowerCase().includes(line.toLowerCase()),
          ).map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            lat: p.lat,
            lng: p.lng,
            types: [],
          }));
        }

        if (mapsResults.length > 0) {
          const match = mapsResults[0];
          // 2. Double check if the found address is already in the trip
          const isDuplicate = places.some(
            (p) =>
              p.name.toLowerCase() === match.name.toLowerCase() &&
              p.address.toLowerCase() === match.address.toLowerCase(),
          );

          searchResults.push({
            query: line,
            match,
            selected: !isDuplicate,
            isDuplicate,
          });
        } else {
          searchResults.push({
            query: line,
            match: null,
            selected: false,
            error: "No results found",
          });
        }
      } catch (err) {
        searchResults.push({
          query: line,
          match: null,
          selected: false,
          error: "Search error",
        });
      }

      // Small delay to be nice to API (only if real)
      if (appMode === "real") {
        await new Promise((resolve) => setTimeout(resolve, 150));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    setResults(searchResults);
    setModalState("review");
  };

  const handleFinalize = () => {
    const selectedResults = results.filter((r) => r.selected && r.match);
    const failedResults = results.filter((r) => !r.match);

    // Save failed ones to store
    failedResults.forEach((res) => {
      addMissingPlace(res.query);
    });

    selectedResults.forEach((res) => {
      const bestMatch = res.match!;
      const category = autoCategorize(bestMatch.name, "");
      const estimatedDuration = getDefaultDuration(category);

      addPlace({
        ...bestMatch,
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category,
        estimatedDuration,
        description: "",
        descriptionSource: appMode === "real" ? "user" : "mock",
      });
    });

    setModalState("success");
  };

  const toggleSelect = (index: number) => {
    setResults((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const toggleAll = () => {
    const allSelected = results.every((r) => !r.match || r.selected);
    setResults((prev) =>
      prev.map((r) => (r.match ? { ...r, selected: !allSelected } : r)),
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-surface-100 dark:border-surface-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  {modalState === "input" && "Import from List"}
                  {modalState === "searching" && "Searching Locations..."}
                  {modalState === "review" && "Review & Confirm"}
                  {modalState === "success" && "Import Successful"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {modalState === "input" && (
                <div className="space-y-4">
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    Paste a list of places (one per line). We'll find the best
                    matching locations on Google Maps for you.
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g.&#10;Eiffel Tower&#10;Louvre Museum&#10;Notre-Dame Cathedral"
                    className="w-full h-64 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 px-4 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSearchAll}
                      disabled={!text.trim()}
                      className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all"
                    >
                      Search All Places
                    </button>
                  </div>
                </div>
              )}

              {modalState === "searching" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Processing {progress.current} of {progress.total}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 truncate max-w-xs mx-auto">
                    Searching for:{" "}
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      "{progress.currentName}"
                    </span>
                  </p>
                  <div className="w-full max-w-sm bg-surface-100 dark:bg-surface-700 rounded-full h-2.5 mt-8 overflow-hidden">
                    <motion.div
                      className="bg-primary-600 h-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {modalState === "review" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-50 dark:border-surface-700">
                    <p className="text-sm font-medium text-surface-500">
                      Found {results.filter((r) => r.match).length} matches
                    </p>
                    <button
                      onClick={toggleAll}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                    >
                      {results.every((r) => !r.match || r.selected)
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {results.map((res, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-4 p-3 rounded-xl border transition-all ${
                          res.match
                            ? res.selected
                              ? "bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800"
                              : "bg-white dark:bg-surface-800 border-surface-100 dark:border-surface-700 opacity-60"
                            : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                        }`}
                      >
                        <button
                          disabled={!res.match}
                          onClick={() => toggleSelect(i)}
                          className={`mt-1 shrink-0 ${res.match ? "text-primary-600" : "text-surface-300 dark:text-surface-600"}`}
                        >
                          {res.selected ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-surface-400 uppercase tracking-tighter shrink-0">
                              Input:
                            </span>
                            <span className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                              "{res.query}"
                            </span>
                          </div>

                          {res.match ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-primary-700 dark:text-primary-400 truncate">
                                    {res.match.name}
                                  </p>
                                  {res.isDuplicate && (
                                    <span className="shrink-0 text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                      ALREADY ADDED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">
                                  {res.match.address}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">
                                {res.error}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-surface-800">
                    <button
                      onClick={() => setModalState("input")}
                      className="flex-1 py-3 px-4 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={handleFinalize}
                      disabled={results.every((r) => !r.selected)}
                      className="flex-2 py-3 px-8 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all"
                    >
                      Add {results.filter((r) => r.selected).length} Selected
                      Places
                    </button>
                  </div>
                </div>
              )}

              {modalState === "success" && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                    Import Complete!
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
                    Successfully added{" "}
                    <span className="font-bold text-emerald-600">
                      {results.filter((r) => r.selected).length}
                    </span>{" "}
                    places.
                  </p>

                  {results.some((r) => !r.match) && (
                    <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-6 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          Failed to find (
                          {results.filter((r) => !r.match).length}):
                        </span>
                        <button
                          onClick={() => {
                            const failed = results
                              .filter((r) => !r.match)
                              .map((r) => r.query)
                              .join("\n");
                            navigator.clipboard.writeText(failed);
                          }}
                          className="text-[10px] font-bold bg-white dark:bg-surface-800 text-red-600 border border-red-200 dark:border-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Copy Failed Names
                        </button>
                      </div>
                      <ul className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {results
                          .filter((r) => !r.match)
                          .map((res, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full shrink-0" />
                              {res.query}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 font-bold hover:opacity-90 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
