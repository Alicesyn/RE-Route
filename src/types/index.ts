export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  descriptionSource: 'user' | 'ai' | 'mock';
  dayIndex: number | null; // 0-indexed day
  orderInDay: number | null;
  notes?: string;
}

export interface Hotel {
  dayIndex: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export type TravelMode = 'walking' | 'transit' | 'driving';

export interface RouteSegment {
  distance: number;
  time: number;
}

export interface DayRoute {
  day: number;
  startHotel: Hotel | null;
  endHotel: Hotel | null;
  stops: Place[];
  segments: RouteSegment[];
  totalDistance: number; // in meters
  totalTime: number; // in seconds
}

export interface OptimizationResult {
  success: boolean;
  days: DayRoute[];
  totalDistance: number;
  totalTime: number;
}

export interface ItinerarySnapshot {
  id: string;
  title: string;
  days: number;
  travelMode: TravelMode;
  places: Place[];
  hotels: Hotel[];
  optimizedRoutes: DayRoute[];
  savedAt: number;
}
