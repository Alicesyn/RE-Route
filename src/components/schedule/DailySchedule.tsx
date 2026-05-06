import React, { useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { Clock, Building2, Wand2, X, Timer, Car, Footprints, Train, ChevronDown } from 'lucide-react';
import { TravelMode, RouteSegment } from '../../types';
import { getCategoryEmoji } from '../../utils/categoryUtils';

const ExpandableDescription: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-0.5">
      <p 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-xs text-surface-500 dark:text-surface-400 cursor-pointer hover:text-surface-700 dark:hover:text-surface-200 transition-colors ${isExpanded ? '' : 'line-clamp-1'}`}
        title={isExpanded ? "Click to collapse" : "Click to show more"}
      >
        {text}
      </p>
    </div>
  );
};

const SegmentPill: React.FC<{
  segment: RouteSegment;
  dayIndex: number;
  segmentIndex: number;
}> = ({ segment, dayIndex, segmentIndex }) => {
  const { updateSegmentTravelMode } = useRouteStore();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSegmentTravelMode(dayIndex, segmentIndex, e.target.value as TravelMode);
  };

  const getModeIcon = () => {
    switch(segment.travelMode) {
      case 'walking': return <Footprints className="w-3.5 h-3.5" />;
      case 'transit': return <Train className="w-3.5 h-3.5" />;
      case 'driving':
      default: return <Car className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="pt-0 pb-3 pl-12 relative group">
      <div className="travel-pill inline-flex items-center gap-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-2 py-1 rounded-full text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer relative overflow-hidden">
        {getModeIcon()}
        <span>{Math.round(segment.time / 60)} min</span>
        <span className="text-surface-300 dark:text-surface-600 mx-0.5">•</span>
        <span>{(segment.distance / 1000).toFixed(1)} km</span>
        
        <select
          value={segment.travelMode || 'driving'}
          onChange={handleModeChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Change travel mode for this segment"
        >
          <option value="driving">Driving</option>
          <option value="transit">Transit</option>
          <option value="walking">Walking</option>
        </select>
        <ChevronDown className="w-3 h-3 text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300 ml-0.5" />
      </div>
    </div>
  );
};

export const DailySchedule: React.FC = () => {
  const { optimizedRoutes, optimizeDay, unassignPlace, dailyBudget } = useRouteStore();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (optimizedRoutes.length === 0) return null;

  const scrollToDay = (dayIndex: number) => {
    const element = document.getElementById(`schedule-day-${dayIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  return (
    <div className="schedule-container">
      <div className="px-6 py-3 border-b border-surface-100 dark:border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 dark:bg-surface-800 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Optimized Schedule</h2>
          <div className="text-sm text-surface-500 dark:text-surface-400 font-medium hidden md:block">
            Total distance: {(optimizedRoutes.reduce((acc, r) => acc + r.totalDistance, 0) / 1000).toFixed(1)} km
          </div>
        </div>
        
        {/* Day Quick Navigation */}
        <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 sm:justify-end">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider whitespace-nowrap">Jump to:</span>
            
            {optimizedRoutes.length > 18 && (
              <input 
                type="number"
                placeholder="Day #"
                min={1}
                max={optimizedRoutes.length}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= optimizedRoutes.length) {
                    scrollToDay(val - 1);
                  }
                }}
                className="w-16 px-2.5 py-1 text-xs font-bold bg-white dark:bg-surface-700 border border-primary-200 dark:border-primary-900 text-primary-700 dark:text-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-surface-400 shadow-sm"
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {optimizedRoutes.map((route, i) => (
              <button
                key={i}
                onClick={() => scrollToDay(route.day)}
                className="flex-none px-3 py-1 text-xs font-bold bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-full hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
              >
                D{route.day + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="px-6 pt-6 pb-8 flex gap-6 overflow-x-auto custom-scrollbar bg-surface-100 dark:bg-surface-900/50 print:flex-col print:overflow-visible print:bg-white print:p-0"
      >
        {optimizedRoutes.map((route, i) => {
          const travelMin = Math.round((route.totalTime || 0) / 60);
          const visitMin = Math.round((route.totalVisitTime || 0) / 60);
          const totalDayMin = travelMin + visitMin;
          const budgetPct = Math.min(100, Math.round((totalDayMin / dailyBudget) * 100));
          const isOverBudget = totalDayMin > dailyBudget;
          
          return (
            <div key={i} id={`schedule-day-${route.day}`} className="schedule-day-card">
              <div className="p-3 border-b border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-primary-700 dark:text-primary-400">Day {route.day + 1}</h3>
                  <div className="flex items-center gap-2">
                    {route.stops.length > 1 && (
                      <button
                        onClick={() => optimizeDay(route.day)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 px-2 py-1 rounded-md transition-all"
                        title={`Optimize Day ${route.day + 1} only`}
                      >
                        <Wand2 className="w-3 h-3" />
                        Optimize
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Time breakdown */}
                <div className="flex items-center gap-3 text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {visitMin > 60 ? `${Math.floor(visitMin / 60)}h ${visitMin % 60}m` : `${visitMin}m`} visit
                  </span>
                  <span className="text-surface-300 dark:text-surface-600">+</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {travelMin}m travel
                  </span>
                </div>
                
                {/* Budget progress bar */}
                {route.stops.length > 0 && (
                  <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverBudget 
                          ? 'bg-red-400' 
                          : budgetPct > 80 
                            ? 'bg-amber-400' 
                            : 'bg-emerald-400'
                      }`}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 flex-1">
                <div className="relative">
                  {/* Vertical line connecting nodes */}
                  <div className="itinerary-node-line"></div>

                  <div className="space-y-0">
                    {/* Start Hotel */}
                    {route.startHotel && (
                      <div className="relative z-10">
                        <div className="flex items-start gap-3">
                          <div className="schedule-node-icon bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-sm font-semibold text-surface-900 dark:text-white">{route.startHotel.name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">Start of day</p>
                          </div>
                        </div>
                        {/* Segment after Start Hotel */}
                        {route.segments && route.segments[0] && (
                          <SegmentPill segment={route.segments[0]} dayIndex={route.day} segmentIndex={0} />
                        )}
                      </div>
                    )}

                    {/* Stops */}
                    {route.stops.map((stop, stopIdx) => {
                      const segmentIdx = route.startHotel ? stopIdx + 1 : stopIdx;
                      return (
                        <div key={stopIdx} className="relative z-10 group/stop">
                          <div className="flex items-start gap-3">
                            <div className="schedule-node-icon bg-surface-900 dark:bg-surface-700 text-white text-xs font-bold">
                              {stopIdx + 1}
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-1.5">
                                    <span>{getCategoryEmoji(stop.category || 'other')}</span>
                                    <span className="truncate">{stop.name}</span>
                                  </p>
                                  <p className="text-[11px] text-surface-400 dark:text-surface-500 font-medium mt-0.5">
                                    ⏱ {stop.estimatedDuration || 60} min visit
                                  </p>
                                </div>
                                <button
                                  onClick={() => unassignPlace(stop.id)}
                                  className="opacity-0 group-hover/stop:opacity-100 p-1 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all shrink-0"
                                  title="Remove from this day"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {stop.description && <ExpandableDescription text={stop.description} />}
                            </div>
                          </div>
                          {/* Segment after this stop */}
                          {route.segments && route.segments[segmentIdx] && (
                            <SegmentPill segment={route.segments[segmentIdx]} dayIndex={route.day} segmentIndex={segmentIdx} />
                          )}
                        </div>
                      );
                    })}

                    {/* End Hotel */}
                    {route.endHotel && (
                      <div className="relative z-10">
                        <div className="flex items-start gap-3">
                          <div className="schedule-node-icon bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-surface-900 dark:text-white">{route.endHotel.name}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">End of day</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
