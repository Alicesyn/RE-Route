import React, { useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { Clock, Building2 } from 'lucide-react';

const ExpandableDescription: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-0.5">
      <p 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-xs text-surface-500 cursor-pointer hover:text-surface-700 transition-colors ${isExpanded ? '' : 'line-clamp-1'}`}
        title={isExpanded ? "Click to collapse" : "Click to show more"}
      >
        {text}
      </p>
    </div>
  );
};

export const DailySchedule: React.FC = () => {
  const { optimizedRoutes } = useRouteStore();

  if (optimizedRoutes.length === 0) return null;

  return (
    <div className="schedule-container">
      <div className="px-6 py-3 border-b border-surface-100 flex items-center justify-between bg-surface-50 shrink-0">
        <h2 className="text-lg font-bold text-surface-900">Optimized Schedule</h2>
        <div className="text-sm text-surface-500 font-medium">
          Total distance: {(optimizedRoutes.reduce((acc, r) => acc + r.totalDistance, 0) / 1000).toFixed(1)} km
        </div>
      </div>

      <div className="p-6 flex gap-6 overflow-x-auto custom-scrollbar bg-surface-100 print:flex-col print:overflow-visible print:bg-white print:p-0">
        {optimizedRoutes.map((route, i) => (
          <div key={i} className="schedule-day-card">
            <div className="p-3 border-b border-surface-100 bg-surface-50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-primary-700">Day {route.day + 1}</h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-surface-500 bg-surface-100 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" />
                {Math.round(route.totalTime / 60)} min travel
              </div>
            </div>

            <div className="p-4 flex-1">
              <div className="relative">
                {/* Vertical line connecting nodes */}
                <div className="itinerary-node-line"></div>

                <div className="space-y-0">
                  {/* Start Hotel */}
                  {route.startHotel && (
                    <div className="relative z-10">
                      <div className="flex items-start gap-3 bg-white">
                        <div className="schedule-node-icon bg-primary-100 text-primary-600">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pb-1">
                          <p className="text-sm font-semibold text-surface-900">{route.startHotel.name}</p>
                          <p className="text-xs text-surface-500">Start of day</p>
                        </div>
                      </div>
                      {/* Segment after Start Hotel */}
                      {route.segments && route.segments[0] && (
                        <div className="pt-0 pb-3 pl-12 relative">
                          <div className="travel-pill">
                            <Clock className="w-3.5 h-3.5 text-surface-400" />
                            {Math.round(route.segments[0].time / 60)} min
                            <span className="text-surface-300 mx-0.5">•</span>
                            {(route.segments[0].distance / 1000).toFixed(1)} km
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stops */}
                  {route.stops.map((stop, stopIdx) => {
                    const segmentIdx = route.startHotel ? stopIdx + 1 : stopIdx;
                    return (
                      <div key={stopIdx} className="relative z-10">
                        <div className="flex items-start gap-3 bg-white">
                          <div className="schedule-node-icon bg-surface-900 text-white text-xs font-bold">
                            {stopIdx + 1}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-sm font-semibold text-surface-900">{stop.name}</p>
                            {stop.description && <ExpandableDescription text={stop.description} />}
                          </div>
                        </div>
                        {/* Segment after this stop */}
                        {route.segments && route.segments[segmentIdx] && (
                          <div className="pt-0 pb-3 pl-12 relative">
                            <div className="travel-pill">
                              <Clock className="w-3.5 h-3.5 text-surface-400" />
                              {Math.round(route.segments[segmentIdx].time / 60)} min
                              <span className="text-surface-300 mx-0.5">•</span>
                              {(route.segments[segmentIdx].distance / 1000).toFixed(1)} km
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* End Hotel */}
                  {route.endHotel && (
                    <div className="relative z-10">
                      <div className="flex items-start gap-3 bg-white">
                        <div className="schedule-node-icon bg-primary-100 text-primary-600">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-surface-900">{route.endHotel.name}</p>
                          <p className="text-xs text-surface-500">End of day</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
