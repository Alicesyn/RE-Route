import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Place, Hotel, TravelMode, DayRoute, ItinerarySnapshot } from '../types';
import { solveSingleDay } from '../services/tspSolver';
import { estimateTime } from '../utils/distance';

interface ModeData {
  places: Place[];
  hotels: Hotel[];
  missingPlaces: string[];
  optimizedRoutes: DayRoute[];
}

interface RouteState {
  // Itinerary core
  title: string;
  days: number;
  travelMode: TravelMode;
  dailyBudget: number; // minutes (user-configurable)
  places: Place[];
  hotels: Hotel[];
  missingPlaces: string[];
  appMode: 'real' | 'mock' | 'dropdown-mock';
  theme: 'light' | 'dark';
  optimizedRoutes: DayRoute[];
  savedTrips: ItinerarySnapshot[];
  
  // Per-mode persistence
  mockData: ModeData;
  realData: ModeData;

  // Actions
  setTitle: (title: string) => void;
  setDays: (days: number) => void;
  setTravelMode: (mode: TravelMode) => void;
  setDailyBudget: (minutes: number) => void;
  setAppMode: (mode: 'real' | 'mock' | 'dropdown-mock') => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Places
  addPlace: (place: Omit<Place, 'dayIndex' | 'orderInDay' | 'pinnedToDay'>, targetDayIndex?: number) => void;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  updatePlacesBulk: (updates: { id: string, updates: Partial<Place> }[]) => void;
  removePlace: (id: string) => void;
  reorderPlaces: (places: Place[]) => void;
  clearAll: () => void;

  // Missing Places
  addMissingPlace: (name: string) => void;
  removeMissingPlace: (name: string) => void;
  clearMissingPlaces: () => void;

  // Day assignment
  assignPlaceToDay: (placeId: string, dayIndex: number) => void;
  unassignPlace: (placeId: string) => void;

  // Hotels
  setHotelForDay: (dayIndex: number, hotel: Hotel) => void;
  applyHotelToAllDays: (hotel: Hotel) => void;

  // Results
  setOptimizedRoutes: (routes: DayRoute[]) => void;
  updateSegmentTravelMode: (dayIndex: number, segmentIndex: number, mode: TravelMode) => void;

  // Per-day optimization
  optimizeDay: (dayIndex: number) => void;

  // Trips
  saveTrip: () => void;
  loadTrip: (id: string) => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      title: 'My RE:Route Trip',
      days: 3,
      travelMode: 'driving',
      dailyBudget: 720, // 12 hours default
      places: [],
      hotels: [],
      missingPlaces: [],
      appMode: 'mock',
      theme: 'light',
      optimizedRoutes: [],
      savedTrips: [],
      mockData: { places: [], hotels: [], missingPlaces: [], optimizedRoutes: [] },
      realData: { places: [], hotels: [], missingPlaces: [], optimizedRoutes: [] },

      setTitle: (title) => set({ title }),
      setDays: (days) => set((state) => {
        // Adjust hotels array if days shrink
        const newHotels = state.hotels.filter(h => h.dayIndex < days);
        // If a hotel exists for day 0, propagate it to any new days that don't have one
        const baseHotel = state.hotels.find(h => h.dayIndex === 0);
        if (baseHotel) {
          for (let i = 0; i < days; i++) {
            if (!newHotels.find(h => h.dayIndex === i)) {
              newHotels.push({ ...baseHotel, dayIndex: i });
            }
          }
        }
        // Reset dayIndex on places that exceed the new days limit
        const newPlaces = state.places.map(p =>
          p.dayIndex !== null && p.dayIndex >= days ? { ...p, dayIndex: null, orderInDay: null, pinnedToDay: false } : p
        );
        return { days, hotels: newHotels, places: newPlaces };
      }),
      setTravelMode: (travelMode) => set({ travelMode }),
      setDailyBudget: (dailyBudget) => set({ dailyBudget }),
      setAppMode: (newMode) => set((state) => {
        const oldMode = state.appMode;
        if (oldMode === newMode) return state;

        // 1. Save current state into the storage for the old mode
        const currentItinerary: ModeData = {
          places: state.places,
          hotels: state.hotels,
          missingPlaces: state.missingPlaces,
          optimizedRoutes: state.optimizedRoutes
        };

        const isOldModeReal = oldMode === 'real';
        const updatedMockData = isOldModeReal ? state.mockData : currentItinerary;
        const updatedRealData = isOldModeReal ? currentItinerary : state.realData;

        // 2. Load state from the storage for the new mode
        const isNewModeReal = newMode === 'real';
        const targetData = isNewModeReal ? updatedRealData : updatedMockData;

        return {
          appMode: newMode,
          mockData: updatedMockData,
          realData: updatedRealData,
          ...targetData
        };
      }),
      setTheme: (theme) => set({ theme }),

      addPlace: (place, targetDayIndex) => set((state) => {
        const newPlace: Place = {
          ...place,
          dayIndex: targetDayIndex !== undefined ? targetDayIndex : null,
          orderInDay: targetDayIndex !== undefined
            ? state.places.filter(p => p.dayIndex === targetDayIndex).length
            : null,
          pinnedToDay: targetDayIndex !== undefined,
        };
        return { places: [...state.places, newPlace] };
      }),

      updatePlace: (id, updates) => set((state) => ({
        places: state.places.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      updatePlacesBulk: (updates) => set((state) => ({
        places: state.places.map(p => {
          const update = updates.find(u => u.id === p.id);
          return update ? { ...p, ...update.updates } : p;
        })
      })),

      removePlace: (id) => set((state) => ({
        places: state.places.filter(p => p.id !== id)
      })),

      reorderPlaces: (places) => set({ places }),

      clearAll: () => {
        console.log('Zustand clearAll executed');
        set({ places: [], hotels: [], missingPlaces: [], optimizedRoutes: [] });
      },

      addMissingPlace: (name) => set((state) => ({
        missingPlaces: state.missingPlaces.includes(name) 
          ? state.missingPlaces 
          : [...state.missingPlaces, name]
      })),
      removeMissingPlace: (name) => set((state) => ({
        missingPlaces: state.missingPlaces.filter(n => n !== name)
      })),
      clearMissingPlaces: () => set({ missingPlaces: [] }),

      // Day assignment actions
      assignPlaceToDay: (placeId, dayIndex) => set((state) => ({
        places: state.places.map(p =>
          p.id === placeId
            ? { ...p, dayIndex, orderInDay: state.places.filter(pl => pl.dayIndex === dayIndex).length, pinnedToDay: true }
            : p
        )
      })),

      unassignPlace: (placeId) => set((state) => ({
        places: state.places.map(p =>
          p.id === placeId
            ? { ...p, dayIndex: null, orderInDay: null, pinnedToDay: false }
            : p
        )
      })),

      setHotelForDay: (dayIndex, hotel) => set((state) => {
        const existing = state.hotels.filter(h => h.dayIndex !== dayIndex);
        return { hotels: [...existing, hotel] };
      }),

      applyHotelToAllDays: (hotel) => set((state) => {
        const hotels = Array.from({ length: state.days }).map((_, i) => ({
          ...hotel,
          dayIndex: i
        }));
        return { hotels };
      }),

      setOptimizedRoutes: (optimizedRoutes) => set({ optimizedRoutes }),
      
      updateSegmentTravelMode: (dayIndex, segmentIndex, mode) => set((state) => {
        const newRoutes = [...state.optimizedRoutes];
        const routeIdx = newRoutes.findIndex(r => r.day === dayIndex);
        if (routeIdx >= 0) {
          const route = { ...newRoutes[routeIdx] };
          const segments = [...route.segments];
          if (segments[segmentIndex]) {
            const seg = { ...segments[segmentIndex] };
            seg.travelMode = mode;
            seg.time = estimateTime(seg.distance, mode);
            segments[segmentIndex] = seg;
            
            // Recalculate total time
            route.segments = segments;
            route.totalTime = segments.reduce((sum, s) => sum + s.time, 0);
            newRoutes[routeIdx] = route;
          }
        }
        return { optimizedRoutes: newRoutes };
      }),

      // Per-day optimization
      optimizeDay: (dayIndex) => {
        const state = get();
        const dayPlaces = state.places.filter(p => p.dayIndex === dayIndex);
        if (dayPlaces.length === 0) return;

        const result = solveSingleDay(dayPlaces, state.hotels, dayIndex, state.travelMode);

        // Update only this day in optimizedRoutes
        set((state) => {
          const newRoutes = [...state.optimizedRoutes];
          const existingIdx = newRoutes.findIndex(r => r.day === dayIndex);
          if (existingIdx >= 0) {
            newRoutes[existingIdx] = result;
          } else {
            newRoutes.push(result);
            newRoutes.sort((a, b) => a.day - b.day);
          }

          // Also update place order in the places array based on optimization result
          const updatedPlaces = state.places.map(p => {
            if (p.dayIndex !== dayIndex) return p;
            const stopIdx = result.stops.findIndex(s => s.id === p.id);
            return stopIdx >= 0 ? { ...p, orderInDay: stopIdx } : p;
          });

          return { optimizedRoutes: newRoutes, places: updatedPlaces };
        });
      },

      saveTrip: () => set((state) => {
        const snapshot: ItinerarySnapshot = {
          id: `trip_${Date.now()}`,
          title: state.title,
          days: state.days,
          travelMode: state.travelMode,
          places: state.places,
          hotels: state.hotels,
          optimizedRoutes: state.optimizedRoutes,
          savedAt: Date.now()
        };
        // Update existing trip if title matches exactly (simple heuristic), otherwise create new
        const existingIndex = state.savedTrips.findIndex(t => t.title === state.title);
        if (existingIndex >= 0) {
          const newTrips = [...state.savedTrips];
          newTrips[existingIndex] = { ...snapshot, id: state.savedTrips[existingIndex].id }; // keep old ID
          return { savedTrips: newTrips };
        }
        return { savedTrips: [...state.savedTrips, snapshot] };
      }),

      loadTrip: (id) => set((state) => {
        const trip = state.savedTrips.find(t => t.id === id);
        if (!trip) return state;
        return {
          title: trip.title,
          days: trip.days,
          travelMode: trip.travelMode,
          places: trip.places,
          hotels: trip.hotels,
          optimizedRoutes: trip.optimizedRoutes
        };
      }),
    }),
    {
      name: 'reroute-storage',
    }
  )
);
