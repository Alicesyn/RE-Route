import { Header } from './components/layout/Header';
import { PlaceSearch } from './components/trip-builder/PlaceSearch';
import { PlaceList } from './components/trip-builder/PlaceList';
import { TripSettings } from './components/trip-builder/TripSettings';
import { MapView } from './components/map/MapView';
import { DailySchedule } from './components/schedule/DailySchedule';
import { useRouteStore } from './store/useRouteStore';
import { solveTSP } from './services/tspSolver';
import { Wand2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function App() {
  const { places, hotels, days, travelMode, setOptimizedRoutes, clearAll, appMode, updatePlacesBulk } = useRouteStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptimize = () => {
    if (places.length === 0) return;
    const result = solveTSP(places, hotels, days, travelMode);
    if (result.success) {
      setOptimizedRoutes(result.days);
    }
  };

  const handleGenerateDescriptions = async () => {
    setIsGenerating(true);

    // Find places that need descriptions
    const placesToUpdate = places.filter(p => !p.description || p.description.trim() === '');

    if (placesToUpdate.length === 0) {
      setIsGenerating(false);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updates = placesToUpdate.map(p => {
      let desc = '';
      if (appMode === 'real') {
        desc = `[AI Generated] ${p.name} is a renowned destination located at ${p.address}. It offers a unique experience tailored for travelers.`;
      } else {
        desc = `[Mock AI] This is an auto-generated description for ${p.name}. It's a fantastic place to visit!`;
      }
      return {
        id: p.id,
        updates: { description: desc, descriptionSource: 'ai' as const }
      };
    });

    updatePlacesBulk(updates);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
      <Header />

      <main className="panel-main">
        {/* Left Panel: Trip Builder */}
        <div className="panel-left">
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar print:overflow-visible print:p-0">
            <TripSettings />

            <div className="mt-8 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-surface-900">Places to Visit</h2>
                <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {places.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {places.some(p => !p.description || p.description.trim() === '') && (
                  <button
                    onClick={handleGenerateDescriptions}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-wait"
                    title="Auto-generate missing descriptions"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse' : ''}`} />
                    {isGenerating ? 'Writing...' : 'AI Describe'}
                  </button>
                )}
                {places.length > 0 && (
                  <button
                    onClick={() => {
                      console.log('Button clicked, calling clearAll...');
                      clearAll();
                    }}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition-all px-1"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <PlaceSearch />
            <div className="relative">
              <PlaceList isExpanded={isExpanded} />

              {places.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-800 bg-surface-100 hover:bg-surface-200 py-2 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-4 h-4" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show All {places.length} Places</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Optimize Button Footer */}
          <div className="p-4 bg-white border-t border-surface-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleOptimize}
              disabled={places.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 group"
            >
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Optimize Route
            </button>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 bg-surface-200 relative z-0 print:hidden">
          <MapView />
        </div>
      </main>

      {/* Bottom Panel */}
      <DailySchedule />
    </div>
  );
}

export default App;
