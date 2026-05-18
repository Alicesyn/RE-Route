import { PlaceCategory } from "../types";

// Default visit duration per category (in minutes)
export const CATEGORY_DEFAULTS: Record<
  PlaceCategory,
  { label: string; duration: number; emoji: string }
> = {
  museum: { label: "Museum", duration: 120, emoji: "🏛️" },
  restaurant: { label: "Restaurant", duration: 90, emoji: "🍽️" },
  coffee_shop: { label: "Coffee Shop", duration: 30, emoji: "☕" },
  park: { label: "Park", duration: 75, emoji: "🌳" },
  landmark: { label: "Landmark", duration: 45, emoji: "📸" },
  shopping: { label: "Shopping", duration: 60, emoji: "🛍️" },
  entertainment: { label: "Entertainment", duration: 120, emoji: "🎭" },
  beach: { label: "Beach", duration: 150, emoji: "🏖️" },
  religious_site: { label: "Religious Site", duration: 30, emoji: "⛪" },
  nightlife: { label: "Nightlife", duration: 120, emoji: "🍷" },
  other: { label: "Other", duration: 60, emoji: "📍" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_DEFAULTS) as PlaceCategory[];

export function getCategoryLabel(cat: PlaceCategory): string {
  return CATEGORY_DEFAULTS[cat].label;
}

export function getCategoryEmoji(cat: PlaceCategory): string {
  return CATEGORY_DEFAULTS[cat].emoji;
}

export function getDefaultDuration(cat: PlaceCategory): number {
  return CATEGORY_DEFAULTS[cat].duration;
}

// Keyword-based auto-categorizer
// Scans name and description to infer the most likely category
const KEYWORD_MAP: { category: PlaceCategory; keywords: string[] }[] = [
  {
    category: "museum",
    keywords: [
      "museum",
      "gallery",
      "exhibit",
      "art collection",
      "heritage center",
      "art_gallery",
    ],
  },
  {
    category: "restaurant",
    keywords: [
      "restaurant",
      "bistro",
      "grill",
      "diner",
      "eatery",
      "steakhouse",
      "pizzeria",
      "sushi",
      "taco",
      "ramen",
      "food hall",
      "food",
      "meal_takeaway",
      "meal_delivery",
    ],
  },
  {
    category: "coffee_shop",
    keywords: [
      "coffee",
      "café",
      "cafe",
      "espresso",
      "tea house",
      "bakery",
      "patisserie",
    ],
  },
  {
    category: "park",
    keywords: [
      "park",
      "garden",
      "botanical",
      "greenway",
      "trail",
      "nature reserve",
      "high line",
      "highline",
      "natural_feature",
      "campground",
    ],
  },
  {
    category: "beach",
    keywords: ["beach", "shore", "coast", "waterfront", "boardwalk", "pier"],
  },
  {
    category: "religious_site",
    keywords: [
      "church",
      "cathedral",
      "temple",
      "mosque",
      "synagogue",
      "basilica",
      "chapel",
      "shrine",
      "place_of_worship",
      "hindu_temple",
    ],
  },
  {
    category: "shopping",
    keywords: [
      "mall",
      "shopping",
      "market",
      "bazaar",
      "outlet",
      "boutique",
      "store",
      "soho",
      "shopping_mall",
      "clothing_store",
      "shoe_store",
      "electronics_store",
      "book_store",
      "supermarket",
    ],
  },
  {
    category: "entertainment",
    keywords: [
      "theater",
      "theatre",
      "cinema",
      "concert",
      "arena",
      "stadium",
      "zoo",
      "aquarium",
      "amusement",
      "theme park",
      "amusement_park",
      "movie_theater",
      "bowling_alley",
    ],
  },
  {
    category: "nightlife",
    keywords: [
      "bar",
      "club",
      "pub",
      "lounge",
      "nightclub",
      "speakeasy",
      "rooftop bar",
      "night_club",
    ],
  },
  {
    category: "landmark",
    keywords: [
      "statue",
      "monument",
      "tower",
      "bridge",
      "building",
      "square",
      "plaza",
      "memorial",
      "observation",
      "viewpoint",
      "skyline",
      "skyscraper",
      "iconic",
      "historic",
      "tourist_attraction",
    ],
  },
];

export function autoCategorize(
  name: string,
  description: string = "",
  types: string[] = []
): PlaceCategory {
  const text = `${name} ${description} ${types.join(" ")}`.toLowerCase();

  // Check each category's keywords
  for (const { category, keywords } of KEYWORD_MAP) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return "other";
}
