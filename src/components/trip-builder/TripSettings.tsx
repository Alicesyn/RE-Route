import React, { useState } from 'react';
import { Building2, Calendar, Car, Footprints, Train } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { MOCK_HOTELS } from '../../services/mockData';
import { TravelMode } from '../../types';
import { HotelSearchInput } from './HotelSearchInput';

export const TripSettings: React.FC = () => {
  const { 
    days, setDays, 
    travelMode, setTravelMode,
    hotels, setHotelForDay, applyHotelToAllDays,
    appMode
  } = useRouteStore();

  const [sameHotel, setSameHotel] = useState(true);

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

  const currentHotelForDay0 = hotels.find(h => h.dayIndex === 0) 
    ? MOCK_HOTELS.findIndex(h => h.name === hotels.find(h => h.dayIndex === 0)?.name)
    : '';

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm space-y-6">
      
      {/* Travel Mode */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">Travel Mode</h3>
        <div className="flex bg-surface-100 p-1 rounded-lg">
          {(['walking', 'transit', 'driving'] as TravelMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium capitalize transition-all ${
                travelMode === mode 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {mode === 'walking' && <Footprints className="w-4 h-4" />}
              {mode === 'transit' && <Train className="w-4 h-4" />}
              {mode === 'driving' && <Car className="w-4 h-4" />}
              {mode}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-surface-100" />

      {/* Itinerary Settings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">Schedule & Stays</h3>
          <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 px-2 py-1 rounded-md border border-surface-200">
            <Calendar className="w-4 h-4" />
            <input 
              type="number" 
              min={1} 
              max={14} 
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(14, parseInt(e.target.value) || 1)))}
              className="w-12 bg-transparent text-center font-medium focus:outline-none"
            />
            <span>Days</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
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
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <select
                    value={currentHotelForDay0}
                    onChange={(e) => handleHotelChange(0, e.target.value)}
                    className="w-full bg-surface-50 border border-surface-200 text-surface-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2.5 appearance-none"
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
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: days }).map((_, i) => {
                const dayHotelIndex = hotels.find(h => h.dayIndex === i)
                  ? MOCK_HOTELS.findIndex(h => h.name === hotels.find(h => h.dayIndex === i)?.name)
                  : '';
                  
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-surface-500 w-12 shrink-0">Day {i + 1}</span>
                    <div className="relative flex-1">
                      {appMode === 'dropdown-mock' ? (
                        <>
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <select
                            value={dayHotelIndex}
                            onChange={(e) => handleHotelChange(i, e.target.value)}
                            className="w-full bg-surface-50 border border-surface-200 text-surface-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2 appearance-none"
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
