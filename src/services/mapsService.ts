const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Persistent cache for search queries
const CACHE_KEY = "reroute_search_cache";
const searchCache: Record<string, any[]> = JSON.parse(
  localStorage.getItem(CACHE_KEY) || "{}",
);

const saveToCache = (query: string, results: any[]) => {
  searchCache[query] = results;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(searchCache));
  } catch (e) {
    // If local storage is full, we just don't persist this one
    console.warn("Search cache persistence failed:", e);
  }
};

export interface MapsPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  types: string[];
  openingHours?: string[];
}

export const searchPlaces = async (query: string): Promise<MapsPlace[]> => {
  if (!query) return [];
  if (searchCache[query]) return searchCache[query];

  if (!API_KEY) {
    throw new Error("Google Maps API Key is missing");
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.regularOpeningHours",
        },
        body: JSON.stringify({ textQuery: query }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch places from Google");
    }

    const data = await response.json();
    const results: MapsPlace[] = (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.displayName.text,
      address: p.formattedAddress,
      lat: p.location.latitude,
      lng: p.location.longitude,
      types: p.types || [],
      openingHours: p.regularOpeningHours?.weekdayDescriptions || [],
    }));

    saveToCache(query, results);
    return results;
  } catch (error) {
    console.error("Maps Search Error:", error);
    throw error;
  }
};
