import { Header } from "./components/layout/Header";
import { PlaceSearch } from "./components/trip-builder/PlaceSearch";
import { PlaceList } from "./components/trip-builder/PlaceList";
import { TripSettings } from "./components/trip-builder/TripSettings";
import { MapView } from "./components/map/MapView";
import { DailySchedule } from "./components/schedule/DailySchedule";
import { useRouteStore } from "./store/useRouteStore";
import { solveTSP } from "./services/tspSolver";
import { Wand2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { summarizePlace } from "./services/aiService";

function App() {
  const {
    places,
    hotels,
    days,
    travelMode,
    dailyBudget,
    optimizedRoutes,
    setOptimizedRoutes,
    clearAll,
    appMode,
    updatePlacesBulk,
    theme,
    showFlights,
    arrivalFlight,
    departureFlight,
  } = useRouteStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleOptimize = () => {
    if (places.length === 0) return;
    const result = solveTSP(
      places,
      hotels,
      days,
      travelMode,
      dailyBudget,
      showFlights ? arrivalFlight?.location : null,
      showFlights ? departureFlight?.location : null,
    );
    if (result.success) {
      setOptimizedRoutes(result.days);

      // Update places with their optimizer-assigned days and order
      const placeUpdates: {
        id: string;
        updates: Partial<(typeof places)[0]>;
      }[] = [];
      result.days.forEach((dayRoute) => {
        dayRoute.stops.forEach((stop, idx) => {
          const originalPlace = places.find((p) => p.id === stop.id);
          // Only update dayIndex for non-pinned places or if orderInDay changed
          if (originalPlace) {
            placeUpdates.push({
              id: stop.id,
              updates: {
                dayIndex: dayRoute.day,
                orderInDay: idx,
                // Preserve pinnedToDay: if user pinned it, keep it pinned
                pinnedToDay: originalPlace.pinnedToDay,
              },
            });
          }
        });
      });
      if (placeUpdates.length > 0) {
        updatePlacesBulk(placeUpdates);
      }
    }
  };

  const handleGenerateDescriptions = async () => {
    setIsGenerating(true);

    // Find places that need real AI descriptions
    const placesToUpdate = places.filter((p) => p.descriptionSource !== "ai");

    if (placesToUpdate.length === 0) {
      setIsGenerating(false);
      return;
    }

    try {
      const updates: { id: string; updates: any }[] = [];

      // Process sequentially to be nice to API rate limits
      for (const p of placesToUpdate) {
        try {
          let aiData;

          if (appMode === "real") {
            aiData = await summarizePlace(
              p.name,
              p.address,
              (p as any).types || [],
            );
          } else {
            // Simulated AI summary for Mock Mode
            aiData = {
              description: `[MOCK AI] This is a simulated high-quality description of ${p.name}. It focuses on the legendary reputation and the vibrant, unique atmosphere of the location.`,
              category: p.category,
              estimatedDuration: p.estimatedDuration,
            };
          }

          updates.push({
            id: p.id,
            updates: {
              description: aiData.description,
              category: aiData.category,
              estimatedDuration: aiData.estimatedDuration,
              descriptionSource: "ai" as const,
            },
          });
        } catch (err) {
          console.error(`Failed to summarize ${p.name}:`, err);
        }
      }

      if (updates.length > 0) {
        updatePlacesBulk(updates);
      }
    } catch (err) {
      console.error("AI Batch Processing Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col font-sans transition-colors overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full custom-scrollbar">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
          {/* Top Row: Trip Settings & Map */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
              <div className="p-5 flex-1">
                <TripSettings />
              </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col min-h-[400px] rounded-xl overflow-hidden shadow-sm border border-surface-200 dark:border-surface-700 relative">
              <div className="absolute inset-0">
                <MapView />
              </div>
            </div>
          </div>

          {/* Middle Row: Places to Visit */}
          <div className="bg-white dark:bg-surface-800 rounded-xl p-4 sm:p-6 shadow-sm border border-surface-200 dark:border-surface-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  Places to Visit
                </h2>
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  {places.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {places.some(
                  (p) => !p.description || p.description.trim() === "",
                ) && (
                  <button
                    onClick={handleGenerateDescriptions}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-wait"
                    title="Auto-generate missing descriptions"
                  >
                    <Sparkles
                      className={`w-4 h-4 ${isGenerating ? "animate-pulse" : ""}`}
                    />
                    {isGenerating ? "Writing..." : "AI Describe"}
                  </button>
                )}
                {places.length > 0 && (
                  <button
                    onClick={() => clearAll()}
                    className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <PlaceSearch />

            <div className="mt-4">
              <PlaceList isExpanded={isExpanded} />

              {places.length > 6 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200 bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 py-2.5 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Collapse Grid
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Expand Grid to Show
                      All {places.length} Places
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={places.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 group py-4 text-lg rounded-xl"
          >
            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Optimize Route
          </button>

          {/* Bottom Row: Daily Schedule */}
          {optimizedRoutes.length > 0 && (
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
              <DailySchedule />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
