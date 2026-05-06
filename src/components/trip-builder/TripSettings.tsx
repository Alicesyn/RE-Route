import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Car, Train, Footprints, Building2, PlaneTakeoff, PlaneLanding, Plus, Minus } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { TravelMode } from '../../types';
import { MOCK_HOTELS } from '../../services/mockData';
import { HotelSearchInput } from './HotelSearchInput';
import { format, addDays, parseISO } from 'date-fns';

export const TripSettings: React.FC = () => {
  const { 
    days, setDays, 
    startDate, setStartDate,
    endDate, setEndDate,
    dateMode, setDateMode,
    dayStartTime, dayEndTime, setDayTimes,
    showFlights, setShowFlights,
    arrivalFlight, setArrivalFlight,
    departureFlight, setDepartureFlight,
    travelMode, setTravelMode, 
    hotels, setHotelForDay, applyHotelToAllDays, 
    appMode 
  } = useRouteStore();

  const [daysInput, setDaysInput] = useState(days.toString());
  const [sameHotel, setSameHotel] = useState(true);

  // Sync internal input state with store days
  useEffect(() => {
    setDaysInput(days.toString());
  }, [days]);

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDaysInput(e.target.value);
  };

  const handleDaysBlur = () => {
    const val = parseInt(daysInput);
    if (!isNaN(val) && val >= 1 && val <= 999) {
      setDays(val);
    } else {
      setDaysInput(days.toString());
    }
  };

  const handleHotelChange = (dayIndex: number, hotelData: any) => {
    let hotel;

    if (appMode !== 'real') {
      const mockHotel = typeof hotelData === 'string' ? MOCK_HOTELS[parseInt(hotelData)] : hotelData;
      if (mockHotel) {
        hotel = { ...mockHotel, dayIndex };
      }
    } else {
      hotel = {
        name: hotelData.name,
        address: hotelData.address,
        lat: hotelData.lat,
        lng: hotelData.lng,
        dayIndex
      };
    }

    if (hotel) {
      if (sameHotel) {
        applyHotelToAllDays(hotel);
      } else {
        setHotelForDay(dayIndex, hotel);
      }
    }
  };

  const currentHotel = hotels.find(h => h.dayIndex === 0);
  const currentHotelName = currentHotel ? currentHotel.name : '';
  const currentHotelMockIndex = currentHotel 
    ? MOCK_HOTELS.findIndex(h => h.name === currentHotel.name)
    : '';

  const displayEndDate = format(parseISO(endDate), 'MMM d, yyyy');

  return (
    <div className="space-y-6 transition-colors">
      
      {/* Travel Mode */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-3">Global Travel Mode</h3>
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

      {/* Date Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider">Dates & Duration</h3>
          <div className="flex bg-surface-100 dark:bg-surface-900/50 p-0.5 rounded-md">
            <button 
              onClick={() => setDateMode('duration')}
              className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-all ${dateMode === 'duration' ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
            >
              Duration
            </button>
            <button 
              onClick={() => setDateMode('fixed')}
              className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-all ${dateMode === 'fixed' ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
            >
              Exact Dates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {dateMode === 'duration' ? (
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Trip Duration</label>
              <div 
                className="flex items-center justify-between text-sm text-surface-900 dark:text-white bg-white dark:bg-surface-800 px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all cursor-pointer group"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.focus();
                }}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min={1} 
                    max={999} 
                    value={daysInput}
                    onChange={handleDaysChange}
                    onBlur={handleDaysBlur}
                    className="w-12 bg-transparent font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-surface-500 font-bold uppercase text-[10px] tracking-widest border-l border-surface-100 dark:border-surface-700 pl-3">Total Days</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDays(Math.max(1, days - 1)); setDaysInput(String(Math.max(1, days - 1))); }}
                    className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDays(days + 1); setDaysInput(String(days + 1)); }}
                    className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg pl-10 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input 
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg pl-10 p-2.5 outline-none"
                  />
                </div>
                <p className="mt-2 text-[10px] font-bold text-surface-400 uppercase text-right">
                  Total: <span className="text-primary-600">{days} days</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-surface-100 dark:border-surface-700" />

      {/* Daily Routine */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider">Daily Routine</h3>
          <p className="text-[10px] text-surface-400 font-medium italic">Local time</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="time"
              value={dayStartTime}
              onChange={(e) => setDayTimes(e.target.value, dayEndTime)}
              className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg pl-10 p-2.5 outline-none"
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="time"
              value={dayEndTime}
              onChange={(e) => setDayTimes(dayStartTime, e.target.value)}
              className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm rounded-lg pl-10 p-2.5 outline-none"
            />
          </div>
        </div>
      </div>

      <hr className="border-surface-100 dark:border-surface-700" />

      {/* Flight & Arrival */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider">Flight & Travel</h3>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={showFlights}
              onChange={(e) => setShowFlights(e.target.checked)}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-[10px] font-bold text-surface-500 uppercase">Enable flight tracking</span>
          </label>
        </div>

        {showFlights && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                <PlaneLanding className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Arrival (Day 1)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="time"
                  value={arrivalFlight?.time || ''}
                  onChange={(e) => setArrivalFlight({ time: e.target.value, buffer: arrivalFlight?.buffer || 120 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-xs rounded-lg p-2 outline-none"
                />
                <input 
                  type="number"
                  placeholder="Buffer (mins)"
                  value={arrivalFlight?.buffer || ''}
                  onChange={(e) => setArrivalFlight({ time: arrivalFlight?.time || '12:00', buffer: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-xs rounded-lg p-2 outline-none"
                />
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                <PlaneTakeoff className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Departure (Day {days})</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="time"
                  value={departureFlight?.time || ''}
                  onChange={(e) => setDepartureFlight({ time: e.target.value, buffer: departureFlight?.buffer || 120 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-xs rounded-lg p-2 outline-none"
                />
                <input 
                  type="number"
                  placeholder="Buffer (mins)"
                  value={departureFlight?.buffer || ''}
                  onChange={(e) => setDepartureFlight({ time: departureFlight?.time || '12:00', buffer: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-xs rounded-lg p-2 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-surface-100 dark:border-surface-700" />

      {/* Lodging */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider">Stay & Lodging</h3>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={sameHotel}
              onChange={(e) => setSameHotel(e.target.checked)}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-[10px] font-bold text-surface-500 uppercase">Same hotel every day</span>
          </label>
        </div>

        <div className="space-y-4">
          {sameHotel ? (
            <div className="relative flex items-center">
              {appMode === 'dropdown-mock' ? (
                <>
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
                  <select
                    value={currentHotelMockIndex}
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
                  onSelect={(hotel) => handleHotelChange(0, hotel)} 
                  placeholder="Search for base hotel..." 
                  currentValue={currentHotelName}
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: days }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-surface-400 w-10 shrink-0 uppercase">Day {i + 1}</span>
                  <div className="flex-1">
                    <HotelSearchInput 
                      onSelect={(h) => handleHotelChange(i, h)} 
                      placeholder={`Hotel for Day ${i + 1}`} 
                      currentValue={hotels.find(h => h.dayIndex === i)?.name || ''}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
