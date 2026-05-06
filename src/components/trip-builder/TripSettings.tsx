import React, { useState } from 'react';
import { Building2, Calendar, Car, Footprints, Train, Clock } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { MOCK_HOTELS } from '../../services/mockData';
import { TravelMode } from '../../types';
import { HotelSearchInput } from './HotelSearchInput';

export const TripSettings: React.FC = () => {
  const { 
    days, setDays, 
    travelMode, setTravelMode,
    dailyBudget, setDailyBudget,
    hotels, setHotelForDay, applyHotelToAllDays,
    appMode
  } = useRouteStore();

  const [sameHotel, setSameHotel] = useState(true);
  const [daysInput, setDaysInput] = useState(days.toString());

  // Synchronize local input with store days if store changes externally
  React.useEffect(() => {
    if (parseInt(daysInput) !== days) {
      setDaysInput(days.toString());
    }
  }, [days]);

  // Helper to handle mock hotel assignment
  const handleHotelChange = (dayIndex: number, hotelId: string) => {
    if (appMode === 'real') return; // In real mode, use Google Places
    
    // Using index as ID for mock hotels
    const mockHotel = MOCK_HOTELS[parseInt(hotelId)];
    if (mockHotel) {
      const hotel = { ...mockHotel, dayIndex };
      if (sameHotel) {
        applyHotelToAllDays(hotel);
      } else {
        setHotelForDay(dayIndex, hotel);
      }
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDaysInput(val);
    
    const num = parseInt(val);
    if (!isNaN(num)) {
      // Constrain and update store, but keep raw value in input
      const constrained = Math.max(1, Math.min(999, num));
      if (constrained !== days) {
        setDays(constrained);
      }
    }
  };

  const handleDaysBlur = () => {
    // On blur, ensure input matches store exactly (handles empty case)
    setDaysInput(days.toString());
  };

  const currentHotelForDay0 = hotels.find(h => h.dayIndex === 0) 
    ? MOCK_HOTELS.findIndex(h => h.name === hotels.find(h => h.dayIndex === 0)?.name)
    : '';

  const budgetHours = Math.floor(dailyBudget / 60);
  const budgetMins = dailyBudget % 60;

  return (
    <div className="space-y-6 transition-colors">
      
      {/* Travel Mode */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-3">Travel Mode</h3>
        <div className="flex flex-wrap bg-surface-100 dark:bg-surface-900/50 p-1 rounded-lg gap-1">
          {(['walking', 'transit', 'driving'] as TravelMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              className={`flex-1 min-w-[80px] flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 rounded-md text-xs sm:text-sm font-medium capitalize transition-all ${
                travelMode === mode 
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              {mode === 'walking' && <Footprints className="w-4 h-4 shrink-0" />}
              {mode === 'transit' && <Train className="w-4 h-4 shrink-0" />}
              {mode === 'driving' && <Car className="w-4 h-4 shrink-0" />}
              <span className="truncate">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-surface-100 dark:border-surface-700" />

      {/* Itinerary Settings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider">Schedule & Stays</h3>
          <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 bg-surface-50 dark:bg-surface-900 px-2 py-1 rounded-md border border-surface-200 dark:border-surface-700">
            <Calendar className="w-4 h-4" />
            <input 
              type="number" 
              min={1} 
              max={999} 
              value={daysInput}
              onChange={handleDaysChange}
              onBlur={handleDaysBlur}
              className="w-12 bg-transparent text-center font-medium focus:outline-none"
            />
            <span>Days</span>
          </div>
        </div>

        {/* Daily Time Budget */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-sm text-surface-700 dark:text-surface-300 font-medium">
              <Clock className="w-4 h-4 text-surface-400 dark:text-surface-500" />
              Daily Time Budget
            </label>
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md">
              {budgetHours}h{budgetMins > 0 ? ` ${budgetMins}m` : ''}
            </span>
          </div>
          <input
            type="range"
            min={360}
            max={960}
            step={30}
            value={dailyBudget}
            onChange={(e) => setDailyBudget(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>6h</span>
            <span>9h</span>
            <span>12h</span>
            <span>16h</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={sameHotel}
              onChange={(e) => setSameHotel(e.target.checked)}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            Same hotel for all days
          </label>

          {sameHotel ? (
            <div className="relative flex items-center">
              {appMode === 'dropdown-mock' ? (
                <>
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                  <select
                    value={currentHotelForDay0}
                    onChange={(e) => handleHotelChange(0, e.target.value)}
                    className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2.5 appearance-none"
                  >
                    <option value="" disabled>Select base hotel...</option>
                    {MOCK_HOTELS.map((h, i) => (
                      <option key={i} value={i}>{h.name}</option>
                    ))}
                  </select>
                </>
              ) : (
                <HotelSearchInput 
                  onSelect={(id) => handleHotelChange(0, id)} 
                  placeholder="Search for base hotel..." 
                  currentValue={currentHotelForDay0 !== '' ? MOCK_HOTELS[currentHotelForDay0 as number].name : ''}
                />
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {Array.from({ length: days }).map((_, i) => {
                const dayHotelIndex = hotels.find(h => h.dayIndex === i)
                  ? MOCK_HOTELS.findIndex(h => h.name === hotels.find(h => h.dayIndex === i)?.name)
                  : '';
                  
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 w-12 shrink-0">Day {i + 1}</span>
                    <div className="relative flex-1">
                      {appMode === 'dropdown-mock' ? (
                        <>
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                          <select
                            value={dayHotelIndex}
                            onChange={(e) => handleHotelChange(i, e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2 appearance-none"
                          >
                            <option value="" disabled>Select hotel...</option>
                            {MOCK_HOTELS.map((h, idx) => (
                              <option key={idx} value={idx}>{h.name}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <HotelSearchInput 
                          onSelect={(id) => handleHotelChange(i, id)} 
                          placeholder="Search for hotel..." 
                          currentValue={dayHotelIndex !== '' ? MOCK_HOTELS[dayHotelIndex as number].name : ''}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
