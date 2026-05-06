import React, { useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { Clock, Building2, Wand2, X, Timer, Car, Footprints, Train, ChevronDown, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { TravelMode, RouteSegment } from '../../types';
import { getCategoryEmoji } from '../../utils/categoryUtils';
import { format, addDays, parseISO } from 'date-fns';

const formatTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = Math.floor(totalMinutes % 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

const formatTimeString = (timeStr: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  return formatTime(h * 60 + m);
};

const BufferPill: React.FC<{ minutes: number }> = ({ minutes }) => {
  return (
    <div className="pt-0 pb-3 pl-12 relative group">
      <div className="travel-pill inline-flex items-center gap-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-2 py-1 rounded-full text-[10px] font-bold text-surface-400 uppercase tracking-tight">
        <Clock className="w-3 h-3" />
        <span>{minutes} min buffer</span>
      </div>
    </div>
  );
};

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
    switch (segment.travelMode) {
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
  const {
    optimizedRoutes, optimizeDay, unassignPlace,
    startDate, dateMode, dayStartTime, dayEndTime,
    showFlights, arrivalFlight, departureFlight
  } = useRouteStore();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (optimizedRoutes.length === 0) return null;

  // Calculate day total in minutes
  const [startH, startM] = dayStartTime.split(':').map(Number);
  const [endH, endM] = dayEndTime.split(':').map(Number);
  let baseDayMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  if (baseDayMinutes < 0) baseDayMinutes += 24 * 60; // Handle overnight

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
                  if (!isNaN(val)) scrollToDay(val - 1);
                }}
                className="w-20 bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-md px-2 py-0.5 text-xs font-bold text-primary-600 outline-none focus:ring-1 focus:ring-primary-500 text-center"
              />
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {optimizedRoutes.map((route, i) => {
              const btnDate = addDays(parseISO(startDate), i);
              return (
                <button
                  key={i}
                  onClick={() => scrollToDay(i)}
                  className={`px-3 py-1.5 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 font-bold text-surface-600 dark:text-surface-300 hover:border-primary-500 hover:text-primary-600 transition-all whitespace-nowrap flex flex-col items-center justify-center min-w-[60px] ${dateMode === 'fixed' ? 'text-[10px]' : 'text-xs'}`}
                >
                  {dateMode === 'fixed' ? (
                    <>
                      <span className="opacity-50">D{i + 1}</span>
                      <span>{format(btnDate, 'MMM d')}</span>
                    </>
                  ) : (
                    <span>Day {i + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="p-6 overflow-x-auto overflow-y-hidden custom-scrollbar flex gap-6 snap-x snap-mandatory"
      >
        {optimizedRoutes.map((route, i) => {
          const currentDate = addDays(parseISO(startDate), i);
          const isFirstDay = i === 0;
          const isLastDay = i === optimizedRoutes.length - 1;

          // Calculate base day start time in minutes
          const [startH, startM] = dayStartTime.split(':').map(Number);
          let currentTime = startH * 60 + startM;

          // Calculate available time for this day
          let dayAvailableMinutes = baseDayMinutes;
          if (showFlights) {
            if (isFirstDay && arrivalFlight) {
              const [arrH, arrM] = arrivalFlight.time.split(':').map(Number);
              const arrivalTotal = arrH * 60 + arrM + arrivalFlight.buffer;
              const dayStartTotal = startH * 60 + startM;
              const effectiveStart = Math.max(dayStartTotal, arrivalTotal);
              currentTime = effectiveStart; // Day starts after flight + buffer
              
              let available = (endH * 60 + endM) - effectiveStart;
              if (available < 0) available += 24 * 60;
              dayAvailableMinutes = available;
            }
            if (isLastDay && departureFlight) {
              const [depH, depM] = departureFlight.time.split(':').map(Number);
              const depTotal = depH * 60 + depM - departureFlight.buffer;
              const dayEndTotal = endH * 60 + endM;
              const effectiveEnd = Math.min(dayEndTotal, depTotal);
              
              let available = effectiveEnd - (startH * 60 + startM);
              if (available < 0) available += 24 * 60;
              dayAvailableMinutes = available;
            }
          }

          const visitMin = route.stops.reduce((acc, s) => acc + (s.estimatedDuration || 0), 0);
          const travelMin = Math.round(route.totalTime / 60);
          const totalDayMin = visitMin + travelMin;
          const remainingTime = Math.max(0, dayAvailableMinutes - totalDayMin);
          const isOverBudget = totalDayMin > dayAvailableMinutes;
          const budgetPct = Math.min(100, Math.round((totalDayMin / dayAvailableMinutes) * 100));

          return (
            <div
              key={i}
              id={`schedule-day-${i}`}
              className="flex-shrink-0 w-80 md:w-96 snap-start"
            >
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 shadow-xl overflow-hidden flex flex-col h-full max-h-[600px]">
                <div className="p-4 border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white leading-tight">Day {i + 1}</h3>
                      {dateMode === 'fixed' && (
                        <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                          {format(currentDate, 'MMM d (EEE)')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {route.stops.length > 1 && (
                        <button
                          onClick={() => optimizeDay(i)}
                          className="p-1.5 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
                          title="Optimize this day"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-surface-500 uppercase tracking-tight">
                      <span className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-700/50 px-2 py-0.5 rounded-full">
                        <Timer className="w-3 h-3 text-primary-500" />
                        <span className="text-surface-400">Visit:</span>
                        <span className="text-surface-600 dark:text-surface-300">
                          {visitMin > 60 ? `${Math.floor(visitMin / 60)}h ${visitMin % 60}m` : `${visitMin}m`}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-700/50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-primary-500" />
                        <span className="text-surface-400">Travel:</span>
                        <span className="text-surface-600 dark:text-surface-300">
                          {travelMin > 60 ? `${Math.floor(travelMin / 60)}h ${travelMin % 60}m` : `${travelMin}m`}
                        </span>
                      </span>
                    </div>
                    <div className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isOverBudget ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isOverBudget ? 'OVER BUDGET' : (
                        remainingTime >= 60
                          ? `${Math.floor(remainingTime / 60)}h ${remainingTime % 60}m left`
                          : `${remainingTime}m left`
                      )}
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-1 mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 space-y-0 relative">
                  {showFlights && isFirstDay && arrivalFlight && (
                    <div className="relative">
                      {/* Line connector - only below */}
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-surface-100 dark:bg-surface-700/50" />

                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                          <PlaneLanding className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 pb-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-surface-900 dark:text-white">
                              {arrivalFlight.location ? arrivalFlight.location.name : 'Flight Arrival'}
                            </h4>
                            <span className="text-[10px] font-bold font-mono text-surface-400">{formatTimeString(arrivalFlight.time)}</span>
                          </div>
                          <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">
                            {arrivalFlight.location ? 'Airport/Station Arrival' : 'At Destination'}
                          </p>
                        </div>
                      </div>
                      <BufferPill minutes={arrivalFlight.buffer} />

                      {/* Travel segment to hotel if location is set */}
                      {arrivalFlight.location && route.segments.length > 0 && (
                        <div className="mt-[-4px]">
                          {(() => {
                            const seg = route.segments[0];
                            const travelTime = Math.round(seg.time / 60);
                            const element = <SegmentPill
                              segment={seg}
                              dayIndex={i}
                              segmentIndex={0}
                            />;
                            currentTime += travelTime;
                            return element;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {route.startHotel && (
                    <div className="relative">
                      {/* Line connector - only below */}
                      {(route.stops.length > 0 || route.endHotel) && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-surface-100 dark:bg-surface-700/50" />
                      )}

                      <div className="flex items-start gap-4 relative z-10 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{route.startHotel.name}</p>
                            <span className="text-[10px] font-bold font-mono text-surface-400">{formatTime(currentTime)}</span>
                          </div>
                          <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">Start from Hotel</p>
                        </div>
                      </div>
                      {route.segments && route.segments[0] && (
                        <div className="mt-[-4px]">
                          {(() => {
                            const travelTime = Math.round(route.segments[0].time / 60);
                            const element = <SegmentPill segment={route.segments[0]} dayIndex={i} segmentIndex={0} />;
                            currentTime += travelTime;
                            return element;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {route.stops.map((stop, stopIdx) => {
                    // Calculate the index for the segment leading TO this stop
                    // Segment 0: Arrival -> Hotel (if both exist)
                    // Segment 1: Hotel -> Stop 1 (if hotel exists) OR Arrival -> Stop 1 (if only arrival exists)
                    let leadingSegIdx = stopIdx;
                    if (isFirstDay && showFlights && arrivalFlight?.location) leadingSegIdx += 1;
                    if (route.startHotel) leadingSegIdx += 1;

                    const stopArrivalTime = currentTime;
                    currentTime += (stop.estimatedDuration || 0);

                    const isLastStop = stopIdx === route.stops.length - 1;
                    const hasMore = !isLastStop || route.endHotel || (isLastDay && showFlights && departureFlight);

                    return (
                      <div key={stop.id} className="relative group">
                        {/* Line connector - Top segment (from above) and Bottom segment (downwards) */}
                        <div className="absolute left-5 top-0 h-0 w-0.5 bg-surface-100 dark:bg-surface-700/50" />
                        {hasMore && (
                          <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-surface-100 dark:bg-surface-700/50" />
                        )}

                        <div className="flex gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-surface-800 border-2 border-surface-100 dark:border-surface-700 flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary-500 transition-colors">
                            <span className="text-sm">
                              {getCategoryEmoji(stop.category)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5 pb-4">
                            <div className="flex items-center justify-between gap-2 relative">
                              <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-primary-600 transition-colors pr-8">
                                {stop.name}
                              </h4>
                              <span className="text-[10px] font-bold font-mono text-surface-400 shrink-0">
                                {formatTime(stopArrivalTime)}
                              </span>

                              <button
                                onClick={() => unassignPlace(stop.id)}
                                className="absolute top-1/2 -translate-y-1/2 right-[-10px] opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 shadow-lg rounded-lg transition-all z-20"
                                title="Remove from day"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {stop.description && (
                              <div className="mt-1">
                                <ExpandableDescription text={stop.description} />
                              </div>
                            )}
                          </div>
                        </div>

                        {leadingSegIdx < route.segments.length && (
                          <div className="mt-[-4px]">
                            {(() => {
                              const travelTime = Math.round(route.segments[leadingSegIdx].time / 60);
                              const element = <SegmentPill
                                segment={route.segments[leadingSegIdx]}
                                dayIndex={i}
                                segmentIndex={leadingSegIdx}
                              />;
                              currentTime += travelTime;
                              return element;
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {route.endHotel && (
                    <div className="relative">
                      {/* Line connector - only above */}
                      <div className="absolute left-5 top-0 h-0 w-0.5 bg-surface-100 dark:bg-surface-700/50" />
                      {isLastDay && showFlights && departureFlight && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-surface-100 dark:bg-surface-700/50" />
                      )}

                      <div className="flex items-start gap-4 relative z-10 mt-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{route.endHotel.name}</p>
                            <span className="text-[10px] font-bold font-mono text-surface-400">{formatTime(currentTime)}</span>
                          </div>
                          <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">Return to Hotel</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showFlights && isLastDay && departureFlight && (
                    <div className="relative mt-2">
                      <div className="absolute left-5 top-0 bottom-10 w-0.5 bg-surface-100 dark:bg-surface-700/50" />

                      {/* Travel segment from hotel if location is set */}
                      {departureFlight.location && route.segments.length > 0 && (
                        <div className="mt-[-4px]">
                          {(() => {
                            const segIdx = route.segments.length - 1;
                            const seg = route.segments[segIdx];
                            const travelTime = Math.round(seg.time / 60);
                            const element = <SegmentPill
                              segment={seg}
                              dayIndex={i}
                              segmentIndex={segIdx}
                            />;
                            // Time is already updated by previous segments and hotels
                            return element;
                          })()}
                        </div>
                      )}

                      <BufferPill minutes={departureFlight.buffer} />
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                          <PlaneTakeoff className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-surface-900 dark:text-white">
                              {departureFlight.location ? departureFlight.location.name : 'Flight Departure'}
                            </h4>
                            <span className="text-[10px] font-bold font-mono text-surface-400">{formatTimeString(departureFlight.time)}</span>
                          </div>
                          <p className="text-[10px] text-surface-500 uppercase font-bold tracking-tight">
                            {departureFlight.location ? 'Airport/Station Departure' : 'Heading Home'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
