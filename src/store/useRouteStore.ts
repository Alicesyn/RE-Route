import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Place, Hotel, TravelMode, DayRoute, ItinerarySnapshot } from '../types';

interface RouteState {
  // Itinerary core
  title: string;
  days: number;
  travelMode: TravelMode;
  places: Place[];
  hotels: Hotel[];
  appMode: 'real' | 'mock' | 'dropdown-mock';
  optimizedRoutes: DayRoute[];
  savedTrips: ItinerarySnapshot[];
  
  // Actions
  setTitle: (title: string) => void;
  setDays: (days: number) => void;
  setTravelMode: (mode: TravelMode) => void;
  setAppMode: (mode: 'real' | 'mock' | 'dropdown-mock') => void;
  
  // Places
  addPlace: (place: Omit<Place, 'dayIndex' | 'orderInDay'>) => void;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  updatePlacesBulk: (updates: {id: string, updates: Partial<Place>}[]) => void;
  removePlace: (id: string) => void;
  reorderPlaces: (places: Place[]) => void;
  clearAll: () => void;
  
  // Hotels
  setHotelForDay: (dayIndex: number, hotel: Hotel) => void;
  applyHotelToAllDays: (hotel: Hotel) => void;
  
  // Results
  setOptimizedRoutes: (routes: DayRoute[]) => void;
  
  // Trips
  saveTrip: () => void;
  loadTrip: (id: string) => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      title: 'My Re:Route Trip',
      days: 3,
      travelMode: 'driving',
      places: [],
      hotels: [],
      appMode: 'mock',
      optimizedRoutes: [],
      savedTrips: [],

      setTitle: (title) => set({ title }),
      setDays: (days) => set((state) => {
        // Adjust hotels array if days shrink
        const newHotels = state.hotels.filter(h => h.dayIndex < days);
        // Reset dayIndex on places that exceed the new days limit
        const newPlaces = state.places.map(p => 
          p.dayIndex !== null && p.dayIndex >= days ? { ...p, dayIndex: null, orderInDay: null } : p
        );
        return { days, hotels: newHotels, places: newPlaces };
      }),
      setTravelMode: (travelMode) => set({ travelMode }),
      setAppMode: (appMode) => set({ appMode }),
      
      addPlace: (place) => set((state) => ({
        places: [...state.places, { ...place, dayIndex: null, orderInDay: null }]
      })),
      
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
        set({ places: [], optimizedRoutes: [] });
      },
      
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
