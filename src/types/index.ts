export type PlaceCategory =
  | "museum"
  | "restaurant"
  | "coffee_shop"
  | "park"
  | "landmark"
  | "shopping"
  | "entertainment"
  | "beach"
  | "religious_site"
  | "nightlife"
  | "other";

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  descriptionSource: "user" | "ai" | "mock";
  category: PlaceCategory;
  estimatedDuration: number; // minutes
  dayIndex: number | null; // 0-indexed day
  orderInDay: number | null;
  pinnedToDay: boolean; // true if user manually assigned to a day; optimizer won't move pinned places
  notes?: string;
}

export interface Hotel {
  dayIndex: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export type TravelMode = "walking" | "transit" | "driving";

export interface RouteSegment {
  distance: number;
  time: number;
  travelMode: TravelMode;
}

export interface DayRoute {
  day: number;
  startHotel: Hotel | null;
  endHotel: Hotel | null;
  stops: Place[];
  segments: RouteSegment[];
  totalDistance: number; // in meters
  totalTime: number; // in seconds (travel only)
  totalVisitTime: number; // in seconds (visit durations)
  manualSequence?: Array<string>; // IDs of stops, hotels, and flights in order
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
