# Product Requirements Document (PRD)

## RE:ROUTE - Travel Itinerary Optimizer

| Field            | Value                     |
| ---------------- | ------------------------- |
| Document Version | 2.0                       |
| Product Name     | RE:ROUTE                  |
| Status           | Finalized / V2 Production |
| Implementation   | 100% Complete             |
| Last Updated     | May 2026                  |

---

## 1. Executive Summary

RE:ROUTE is a premium, web-based travel planning application that helps users create optimized multi-day itineraries. Users input places, specify hotels per day, select travel modes, and manage flight/transit arrivals and departures. The app uses advanced TSP algorithms to minimize travel distance while maintaining a sleek, high-end aesthetic with full dark mode support.

**Key Features:**

- **Smart Route Optimization**: Minimizes travel time using TSP (Nearest Neighbor + 2-Opt) with time-budget-aware clustering.
- **Flight & Transit Integration**: Tracks arrival/departure airports or stations with customizable buffer times and auto-routing.
- **Custom Date Picker**: Bespoke React date picker with auto-switch from Start → End date, replacing unreliable native browser pickers.
- **AI-Powered Descriptions**: Gemini 1.5 Flash integration for auto-generating place descriptions, categories, and visit durations.
- **Batch Import with Validation**: Import places from a list with Google Maps search, duplicate detection, and missing-place tracking.
- **Per-Segment Travel Mode**: Override global travel mode on individual route segments (driving/transit/walking).
- **Drag-and-Drop Reordering**: Reorder stops within a day using DnD Kit with manual sequence persistence.
- **Premium Dark Mode**: Full dark/light theme toggle with curated HSL design tokens and glassmorphism effects.
- **Continuous Timeline**: Unbroken vertical path connecting all daily activities visually with travel pills.
- **Dynamic Budget Bar**: Real-time tracking of available minutes vs. travel/visit time per day.
- **Multi-Modal Support**: Walking, transit, and driving modes with automatic time estimation.
- **Zero-Cost Mock Mode**: Full functionality without API costs using hardcoded NYC data.
- **Per-Day Optimization**: Re-optimize individual days without affecting the rest of the trip.
- **Trip Persistence**: Save/load multiple trip snapshots via LocalStorage with per-mode data isolation.

---

## 2. Functional Requirements

### FR-01: Place & Trip Management

| ID    | Requirement                                          | Priority | Status |
| ----- | ---------------------------------------------------- | -------- | ------ |
| FR-01 | Search places via Google Places Autocomplete         | P0       | Done   |
| FR-02 | Add places to trip list from search results          | P0       | Done   |
| FR-03 | Remove places from trip (with day re-optimization)   | P0       | Done   |
| FR-04 | Drag-and-drop reorder stops within a day             | P1       | Done   |
| FR-05 | Batch import from list with Maps search & review     | P1       | Done   |
| FR-06 | Auto-categorize places (11 categories with keywords) | P1       | Done   |
| FR-07 | Category-specific default visit durations            | P1       | Done   |
| FR-08 | Editable visit duration per place                    | P1       | Done   |
| FR-09 | Expandable/collapsible place grid (6+ places)        | P2       | Done   |
| FR-10 | Clear All places                                     | P1       | Done   |
| FR-11 | Missing Places tracking from failed imports          | P2       | Done   |

### FR-02: Flight & Transit Integration

| ID    | Requirement                                             | Priority | Status |
| ----- | ------------------------------------------------------- | -------- | ------ |
| FR-12 | Toggle flight/transit visibility                        | P0       | Done   |
| FR-13 | Arrival Flight/Train: Location search + time + buffer   | P0       | Done   |
| FR-14 | Departure Flight/Train: Location search + time + buffer | P0       | Done   |
| FR-15 | Auto-routing: Flight → Hotel and Hotel → Flight         | P0       | Done   |
| FR-16 | Buffer time (minutes) for baggage/transit/wait          | P0       | Done   |
| FR-17 | Arrival/departure appear in daily timeline              | P1       | Done   |

### FR-03: Hotels & Duration

| ID    | Requirement                                   | Priority | Status |
| ----- | --------------------------------------------- | -------- | ------ |
| FR-18 | Hotel search per day (Google Places or mock)  | P0       | Done   |
| FR-19 | "Same hotel for all days" toggle              | P0       | Done   |
| FR-20 | Dynamic day count (1–30 days, +/- controls)   | P0       | Done   |
| FR-21 | Dual date mode: Exact Dates or Duration-based | P0       | Done   |
| FR-22 | Custom Date Picker with auto-switch flow      | P1       | Done   |
| FR-23 | Configurable daily start/end times            | P1       | Done   |
| FR-24 | Configurable daily time budget (minutes)      | P1       | Done   |

### FR-04: Itinerary Optimization

| ID    | Requirement                                                  | Priority | Status |
| ----- | ------------------------------------------------------------ | -------- | ------ |
| FR-25 | TSP solver starting/ending at hotels/airports                | P0       | Done   |
| FR-26 | Time-budget-aware proximity clustering across days           | P0       | Done   |
| FR-27 | Haversine distance calculations + speed-based time estimates | P0       | Done   |
| FR-28 | Per-day re-optimization ("Optimize Day" button)              | P1       | Done   |
| FR-29 | Per-segment travel mode override (driving/transit/walking)   | P1       | Done   |
| FR-30 | Manual sequence persistence via drag-and-drop                | P1       | Done   |
| FR-31 | Place pinning — pinned places stay on their assigned day     | P2       | Done   |
| FR-32 | Unassign place from day (back to unassigned pool)            | P1       | Done   |

### FR-05: AI Integration

| ID    | Requirement                                             | Priority | Status |
| ----- | ------------------------------------------------------- | -------- | ------ |
| FR-33 | AI-generated place descriptions (Gemini 1.5 Flash)      | P1       | Done   |
| FR-34 | AI-inferred category and visit duration                 | P1       | Done   |
| FR-35 | Batch "AI Describe" for all places missing descriptions | P1       | Done   |

### FR-06: Premium Visuals & UX

| ID    | Requirement                                         | Priority | Status |
| ----- | --------------------------------------------------- | -------- | ------ |
| FR-36 | Dark/Light theme toggle (persisted)                 | P0       | Done   |
| FR-37 | Premium dark mode (glow, glassmorphism, HSL tokens) | P0       | Done   |
| FR-38 | Continuous vertical timeline path (no gaps)         | P1       | Done   |
| FR-39 | Dynamic budget bar with over-budget warning         | P0       | Done   |
| FR-40 | AM/PM time formatting (12-hour display)             | P0       | Done   |
| FR-41 | Emoji-based category indicators                     | P2       | Done   |
| FR-42 | Animated calendar dropdown (Framer Motion)          | P2       | Done   |
| FR-43 | Day quick-nav buttons with date labels              | P2       | Done   |

### FR-07: Data Management

| ID    | Requirement                                  | Priority | Status |
| ----- | -------------------------------------------- | -------- | ------ |
| FR-44 | Save trips to LocalStorage (named snapshots) | P0       | Done   |
| FR-45 | Load saved trips from snapshot list          | P0       | Done   |
| FR-46 | Per-mode data isolation (mock vs. real data) | P1       | Done   |
| FR-47 | Export places list as TXT file               | P2       | Done   |
| FR-48 | Export schedule as PDF (print)               | P2       | Done   |

### FR-08: App Modes

| ID    | Requirement                                        | Priority | Status |
| ----- | -------------------------------------------------- | -------- | ------ |
| FR-49 | Real Mode: Live Google Places + Maps APIs          | P0       | Done   |
| FR-50 | Mock Mode: Hardcoded NYC data (no API cost)        | P0       | Done   |
| FR-51 | Dropdown Mock Mode: Local search, mock coordinates | P1       | Done   |
| FR-52 | Mode switcher in header with visual indicator      | P0       | Done   |

---

## 3. Data Models

```typescript
type PlaceCategory =
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

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  descriptionSource: "user" | "ai" | "mock";
  category: PlaceCategory;
  estimatedDuration: number; // minutes
  dayIndex: number | null;
  orderInDay: number | null;
  pinnedToDay: boolean;
  notes?: string;
  openingHours?: string[];
}

interface Hotel {
  dayIndex: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

type TravelMode = "walking" | "transit" | "driving";

interface RouteSegment {
  distance: number; // meters
  time: number; // seconds
  travelMode: TravelMode;
}

interface DayRoute {
  day: number;
  startHotel: Hotel | null;
  endHotel: Hotel | null;
  stops: Place[];
  segments: RouteSegment[];
  totalDistance: number;
  totalTime: number;
  totalVisitTime: number;
  manualSequence?: string[];
}

interface ItinerarySnapshot {
  id: string;
  title: string;
  days: number;
  travelMode: TravelMode;
  places: Place[];
  hotels: Hotel[];
  optimizedRoutes: DayRoute[];
  savedAt: number;
}
```

---

## 4. UI Layout

```
[Header]
├── Logo & Trip Title
├── Mode Switcher (Real / Mock / Dropdown Mock)
├── Theme Toggle (Dark / Light)
├── Save | Load | Import | Export PDF
└── Export TXT (hover dropdown)

[Top Row — Split View]
├── Left (1/3): Trip Settings Panel
│   ├── Global Travel Mode Selector
│   ├── Dates & Duration (Toggle: Exact Dates / Duration)
│   │   ├── Custom DatePicker (Start → auto-switch → End)
│   │   └── Duration controls (+/- days)
│   ├── Daily Routine (Start Time, End Time, Budget)
│   ├── Hotel Setup
│   │   ├── Per-day hotel search
│   │   └── "Same Hotel" toggle
│   └── Flights & Travel (Toggleable)
│       ├── Arrival: Location search + Time + Buffer
│       └── Departure: Location search + Time + Buffer
└── Right (2/3): Interactive Map
    ├── Place markers with popups
    └── Route polylines (per-day)

[Middle Row: Places to Visit]
├── Place search bar (Google Places / Mock)
├── Import List button → Full-featured Import Modal
│   ├── Paste list → batch search → review & select
│   ├── Duplicate detection
│   └── Failed imports → Missing Places list
├── AI Describe button (batch Gemini)
├── Clear All
├── Place cards grid (category emoji, duration, description)
└── Expand/Collapse toggle (6+ places)

[Optimize Route Button — Full Width]

[Bottom Row: Daily Schedule]
├── Day quick-nav buttons with dates
├── Per-day cards
│   ├── Visit/Travel time summary
│   ├── Budget bar (green/red)
│   ├── Optimize Day / Re-optimize buttons
│   ├── Continuous vertical timeline
│   │   ├── Arrival Flight (if first day)
│   │   ├── Start Hotel
│   │   ├── Stops (draggable, with arrival time)
│   │   ├── Travel segment pills (clickable mode override)
│   │   ├── End Hotel
│   │   └── Departure Flight (if last day)
│   └── Drag-and-drop reordering (DnD Kit)
└── Missing Places section (if any)
```

---

## 5. Technical Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Framework      | React 18 + TypeScript                          |
| Build Tool     | Vite                                           |
| State          | Zustand (with LocalStorage persistence)        |
| Styling        | Tailwind CSS + custom HSL design tokens        |
| Animation      | Framer Motion                                  |
| Drag & Drop    | DnD Kit (@dnd-kit/core + @dnd-kit/sortable)    |
| Date Utilities | date-fns                                       |
| Icons          | Lucide React                                   |
| Maps           | Google Maps JavaScript API + Places API        |
| AI             | Google Gemini 1.5 Flash API                    |
| Calendar       | Custom DatePicker component (React + date-fns) |

---

## 6. Non-Functional Requirements

| ID     | Requirement        | Metric                        | Status |
| ------ | ------------------ | ----------------------------- | ------ |
| NFR-01 | Optimization speed | < 2s for 20 places            | Pass   |
| NFR-02 | Visual Quality     | "Premium/High-End" Aesthetic  | Pass   |
| NFR-03 | Responsive         | Fluid from 768px up           | Pass   |
| NFR-04 | Persistence        | LocalStorage snapshots        | Pass   |
| NFR-05 | Dark Mode          | Full theme coverage, no flash | Pass   |
| NFR-06 | Mode Isolation     | Mock/Real data don't cross    | Pass   |

---

## 7. Algorithm Details

### TSP Solver Pipeline

1. **Clustering**: Time-budget-aware assignment of unassigned places to days based on proximity to each day's hotel, respecting pinned places and daily minute budgets.
2. **Per-Day Optimization**: Nearest Neighbor heuristic starting from the day's start hotel (or arrival location), followed by 2-Opt refinement to reduce total distance.
3. **Segment Generation**: Haversine distance between consecutive points with speed-based time estimates per travel mode:
   - Driving: 40 km/h
   - Transit: 25 km/h
   - Walking: 5 km/h
4. **Coordinate Fallback**: Two-pass system ensures every point has valid coordinates — invalid `(0,0)` locations are replaced with the nearest valid neighbor.

---

## 8. Future Roadmap

- **Collaborative Planning**: Multi-user real-time sync.
- **Detailed Navigation**: Live turn-by-turn directions via Google Directions API.
- **Social Sharing**: Interactive public itinerary links.
- **Mobile Native**: Dedicated iOS/Android wrapper.
- **Opening Hours Constraints**: Respect business hours when scheduling stops.
- **Accessibility**: Full keyboard navigation and ARIA attributes for the custom DatePicker and DnD components.
