import { Place, Hotel, PlaceCategory } from "../types";
import { searchPlaces } from "./mapsService";
import { autoCategorize } from "../utils/categoryUtils";
import { getDistance } from "../utils/distance";
import { suggestSights } from "./aiService";

// Curated top sights for Kyoto
const KYOTO_SIGHTS = [
  {
    id: "rec_kyoto_fushimi",
    name: "Fushimi Inari Taisha",
    address: "68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto",
    lat: 34.9671,
    lng: 135.7727,
    category: "religious_site" as PlaceCategory,
    estimatedDuration: 120,
    description: "Famous for thousands of vermilion torii gates, winding mountain trails, and sacred fox statues.",
    types: ["tourist_attraction", "place_of_worship"],
    photoUrl: "https://loremflickr.com/800/600/kyoto,temple",
  },
  {
    id: "rec_kyoto_kinkaku",
    name: "Kinkaku-ji (Golden Pavilion)",
    address: "1 Kinkakujicho, Kita Ward, Kyoto",
    lat: 35.0394,
    lng: 135.7292,
    category: "landmark" as PlaceCategory,
    estimatedDuration: 60,
    description: "Breathtaking Zen temple covered in brilliant gold leaf, reflecting beautifully across a mirror pond.",
    types: ["tourist_attraction", "temple"],
    photoUrl: "https://loremflickr.com/800/600/kyoto,pavilion",
  },
  {
    id: "rec_kyoto_gion",
    name: "Gion District",
    address: "Gionmachi Minamigawa, Higashiyama Ward, Kyoto",
    lat: 35.0037,
    lng: 135.7782,
    category: "landmark" as PlaceCategory,
    estimatedDuration: 90,
    description: "Kyoto's historic geisha district filled with traditional wooden machiya merchant houses and teahouses.",
    types: ["tourist_attraction", "neighborhood"],
    photoUrl: "https://loremflickr.com/800/600/kyoto,geisha",
  },
  {
    id: "rec_kyoto_arashiyama",
    name: "Arashiyama Bamboo Grove",
    address: "Arashiyama, Ukyo Ward, Kyoto",
    lat: 35.0156,
    lng: 135.6715,
    category: "park" as PlaceCategory,
    estimatedDuration: 75,
    description: "A serene and towering bamboo forest with sunlight filtering through stalks and pleasant walking paths.",
    types: ["tourist_attraction", "natural_feature"],
    photoUrl: "https://loremflickr.com/800/600/kyoto,bamboo",
  },
  {
    id: "rec_kyoto_kiyomizu",
    name: "Kiyomizu-dera Temple",
    address: "1-294 Kiyomizu, Higashiyama Ward, Kyoto",
    lat: 34.9949,
    lng: 135.7850,
    category: "religious_site" as PlaceCategory,
    estimatedDuration: 90,
    description: "Historic temple famed for its massive wooden stage offering panoramic views of Kyoto without using any nails.",
    types: ["tourist_attraction", "place_of_worship"],
    photoUrl: "https://loremflickr.com/800/600/kyoto,pagoda",
  },
  {
    id: "rec_kyoto_nishiki",
    name: "Nishiki Market",
    address: "Nakagyo Ward, Kyoto",
    lat: 35.0050,
    lng: 135.7649,
    category: "shopping" as PlaceCategory,
    estimatedDuration: 90,
    description: "A vibrant five-block narrow shopping street packed with over a hundred lively food stalls and shops.",
    types: ["tourist_attraction", "shopping_mall"],
    photoUrl: "https://loremflickr.com/800/600/kyoto,market",
  },
];

// Curated top sights for Tokyo
const TOKYO_SIGHTS = [
  {
    id: "rec_tokyo_shibuya",
    name: "Shibuya Crossing",
    address: "Shibuya, Tokyo",
    lat: 35.6595,
    lng: 139.7005,
    category: "landmark" as PlaceCategory,
    estimatedDuration: 45,
    description: "The world's busiest pedestrian scramble crossing, surrounded by massive neon screens and towering skyscrapers.",
    types: ["tourist_attraction", "street"],
    photoUrl: "https://loremflickr.com/800/600/tokyo,shibuya",
  },
  {
    id: "rec_tokyo_sensoji",
    name: "Senso-ji Temple",
    address: "2-3-1 Asakusa, Taito City, Tokyo",
    lat: 35.7148,
    lng: 139.7967,
    category: "religious_site" as PlaceCategory,
    estimatedDuration: 90,
    description: "Tokyo's oldest and most iconic Buddhist temple, reached via the historic Nakamise shopping street.",
    types: ["tourist_attraction", "place_of_worship"],
    photoUrl: "https://loremflickr.com/800/600/tokyo,sensoji",
  },
  {
    id: "rec_tokyo_skytree",
    name: "Tokyo Skytree",
    address: "1-1-2 Oshiage, Sumida City, Tokyo",
    lat: 35.7101,
    lng: 139.8107,
    category: "landmark" as PlaceCategory,
    estimatedDuration: 120,
    description: "Futuristic broadcasting tower and observation deck offering breathtaking views extending all the way to Mt. Fuji.",
    types: ["tourist_attraction", "observation_deck"],
    photoUrl: "https://loremflickr.com/800/600/tokyo,skytree",
  },
  {
    id: "rec_tokyo_meiji",
    name: "Meiji Jingu Shrine",
    address: "1-1 Yoyogikamizonocho, Shibuya City, Tokyo",
    lat: 35.6764,
    lng: 139.6993,
    category: "religious_site" as PlaceCategory,
    estimatedDuration: 75,
    description: "A tranquil Shinto shrine dedicated to Emperor Meiji, nestled deep inside a dense forest in the heart of Tokyo.",
    types: ["tourist_attraction", "place_of_worship"],
    photoUrl: "https://loremflickr.com/800/600/tokyo,meiji",
  },
  {
    id: "rec_tokyo_shinjuku",
    name: "Shinjuku Gyoen National Garden",
    address: "11 Naitomachi, Shinjuku City, Tokyo",
    lat: 35.6852,
    lng: 139.7101,
    category: "park" as PlaceCategory,
    estimatedDuration: 90,
    description: "A sprawling city park combining English, French, and traditional Japanese garden designs with peaceful ponds.",
    types: ["tourist_attraction", "park"],
    photoUrl: "https://loremflickr.com/800/600/tokyo,garden",
  },
  {
    id: "rec_tokyo_akihabara",
    name: "Akihabara Electric Town",
    address: "Sotokanda, Chiyoda City, Tokyo",
    lat: 35.6997,
    lng: 139.7715,
    category: "shopping" as PlaceCategory,
    estimatedDuration: 120,
    description: "The global epicenter of anime, gaming, manga culture, and massive multi-story electronics stores.",
    types: ["tourist_attraction", "neighborhood"],
    photoUrl: "https://loremflickr.com/800/600/tokyo,akihabara",
  },
];

// Generates fallback mock sights for other areas
const getGenericSights = (lat: number, lng: number) => [
  {
    id: "rec_gen_sight1",
    name: "Historic Old Town",
    address: "Central Historic Quarter",
    lat: lat + 0.005,
    lng: lng + 0.008,
    category: "landmark" as PlaceCategory,
    estimatedDuration: 90,
    description: "Quaint historic district with cobblestone alleys, unique local boutiques, and local architecture.",
    types: ["tourist_attraction"],
    photoUrl: "https://loremflickr.com/800/600/historic,architecture",
  },
  {
    id: "rec_gen_sight2",
    name: "Central Botanic Gardens",
    address: "Greenway Parkway",
    lat: lat - 0.008,
    lng: lng + 0.005,
    category: "park" as PlaceCategory,
    estimatedDuration: 75,
    description: "Scenic botanic gardens featuring thousands of plant species, tranquil lakes, and pleasant walking paths.",
    types: ["tourist_attraction", "park"],
    photoUrl: "https://loremflickr.com/800/600/park,nature",
  },
  {
    id: "rec_gen_sight3",
    name: "City Scenic Overlook",
    address: "Observation Hill",
    lat: lat + 0.008,
    lng: lng - 0.005,
    category: "landmark" as PlaceCategory,
    estimatedDuration: 45,
    description: "A beautiful hillside observation point offering stunning panoramic views of the city skyline.",
    types: ["tourist_attraction", "viewpoint"],
    photoUrl: "https://loremflickr.com/800/600/city,skyline",
  },
];

/**
 * Calculates the center point of hotels & places in the itinerary
 */
function getItineraryCenter(places: Place[], hotels: Hotel[]): { lat: number; lng: number } {
  const points = [...hotels];
  places.forEach((p) => points.push(p as any));

  if (points.length === 0) {
    // Default to Tokyo if itinerary is completely empty
    return { lat: 35.6895, lng: 139.6917 };
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  lats.sort((a, b) => a - b);
  lngs.sort((a, b) => a - b);

  const medianLat = lats[Math.floor(lats.length / 2)];
  const medianLng = lngs[Math.floor(lngs.length / 2)];

  return { lat: medianLat, lng: medianLng };
}

/**
 * Main function to fetch suggested places dynamically based on trip center coordinates
 */
export async function getSuggestedPlaces(
  places: Place[],
  hotels: Hotel[],
  appMode: "real" | "mock" | "dropdown-mock",
  rejectedNames: string[] = []
): Promise<Place[]> {
  const center = getItineraryCenter(places, hotels);

  // Existing place names/coordinates to filter duplicates
  const existingNames = new Set(places.map((p) => p.name.toLowerCase()));
  const existingCoords = places.map((p) => ({ lat: p.lat, lng: p.lng }));

  const isDuplicate = (name: string, lat: number, lng: number) => {
    if (existingNames.has(name.toLowerCase())) return true;
    for (const coord of existingCoords) {
      const dist = getDistance(lat, lng, coord.lat, coord.lng);
      if (dist < 100) return true; // Closer than 100 meters is basically duplicate
    }
    return false;
  };

  let candidateSights: any[] = [];

  if (appMode === "real") {
    try {
      // 1. Get freshly generated suggestions from Gemini AI
      const aiSuggestions = await suggestSights(center.lat, center.lng, [...Array.from(existingNames), ...rejectedNames]);

      // 2. Map over AI suggestions and fetch authentic photoUrls & exact coords from Google Maps
      const enrichedSuggestions = await Promise.all(
        aiSuggestions.map(async (suggestion, idx) => {
          try {
            // Search Google Maps using the exact name and AI's estimated coordinates as bias
            const mapsResult = await searchPlaces(suggestion.name, { lat: suggestion.lat, lng: suggestion.lng });
            
            if (mapsResult && mapsResult.length > 0) {
              const bestMatch = mapsResult[0];
              return {
                id: `rec_ai_${idx}_${Date.now()}`,
                name: bestMatch.name, // Use Google's official name
                address: bestMatch.address,
                lat: bestMatch.lat, // Use Google's exact GPS
                lng: bestMatch.lng,
                category: suggestion.category, // Keep AI's smart categorization
                estimatedDuration: suggestion.estimatedDuration,
                description: suggestion.description, // Keep AI's punchy description
                types: bestMatch.types,
                photoUrl: bestMatch.photoUrl, // Inject the authentic Google Maps photo URL!
              };
            }
          } catch (e) {
            console.warn(`Failed to fetch Google Maps data for ${suggestion.name}`, e);
          }
          
          // Fallback if Google Maps fails to find this specific AI suggestion
          return {
            id: `rec_ai_${idx}_${Date.now()}`,
            name: suggestion.name,
            address: "Location in the area",
            lat: suggestion.lat,
            lng: suggestion.lng,
            category: suggestion.category,
            estimatedDuration: suggestion.estimatedDuration,
            description: suggestion.description,
            types: [],
            photoUrl: undefined,
          };
        })
      );

      candidateSights = enrichedSuggestions;
    } catch (err) {
      console.warn("Failed to fetch suggestions from Gemini API, falling back to local dataset:", err);
    }
  }

  // Fallback to local high-quality mock data if API fails or we are in mock mode
  if (candidateSights.length === 0) {
    const isKyoto = Math.abs(center.lat - 35.01) < 0.3 && Math.abs(center.lng - 135.76) < 0.3;
    const isTokyo = Math.abs(center.lat - 35.68) < 0.4 && Math.abs(center.lng - 139.76) < 0.4;

    if (isKyoto) {
      candidateSights = KYOTO_SIGHTS;
    } else if (isTokyo) {
      candidateSights = TOKYO_SIGHTS;
    } else {
      candidateSights = getGenericSights(center.lat, center.lng);
    }
  }

  // Filter out duplicates and limit to top 6
  return candidateSights
    .filter((s) => !isDuplicate(s.name, s.lat, s.lng))
    .slice(0, 6)
    .map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      category: s.category,
      estimatedDuration: s.estimatedDuration,
      description: s.description,
      descriptionSource: "ai" as const, // Treat suggestions as pre-described so we don't trigger bulk AI on them immediately
      dayIndex: null,
      orderInDay: null,
      pinnedToDay: false,
      photoUrl: s.photoUrl,
    }));
}
