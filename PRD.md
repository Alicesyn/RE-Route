# Product Requirements Document (PRD)

## RE:Route - Travel Itinerary Optimizer

| Document Version | 1.1 |
| Product Name | RE:Route |
| Status | Finalized / V1 Production |
| Implementation | 100% Complete |

---

## 1. Executive Summary

RE:Route is a premium, web-based travel planning application that helps users create optimized multi-day itineraries. Users input places, specify hotels per day, select travel modes, and manage flight/transit arrivals. The app uses advanced TSP algorithms to minimize travel distance while maintaining a sleek, high-end aesthetic.

**Key Features:**

- **Smart Route Optimization**: Minimizes travel time using TSP (Nearest Neighbor + 2-Opt).
- **Flight & Transit Integration**: Tracks arrival/departure airports or stations with customizable buffer times.
- **Door-to-Door Routing**: Calculates segments from airport to hotel, and hotel to departure.
- **Premium Dark Mode**: High-end aesthetic with vibrant glow, curated HSL colors, and glassmorphism.
- **Continuous Timeline**: Unbroken vertical path connecting all daily activities visually.
- **Dynamic Budget Bar**: Real-time tracking of available minutes vs. travel/visit time.
- **Multi-modal Support**: Walking, transit, and driving modes.
- **Zero-cost Mock Mode**: Full functionality without API costs by default.

---

## 2. Functional Requirements

### FR-01: Place & Trip Management

| ID    | Requirement                                  | Priority | Status |
| ----- | -------------------------------------------- | -------- | ------ |
| FR-01 | Search places via Google Places Autocomplete | P0       | Done   |
| FR-02 | Add places to trip list from search          | P0       | Done   |
| FR-03 | Delete places from trip list                 | P0       | Done   |
| FR-04 | Drag-and-drop reorder places                 | P1       | Done   |
| FR-05 | Import from Wanderlog/Notes (one per line)   | P1       | Done   |

### FR-02: Flight & Transit Integration

| ID    | Requirement                                      | Priority | Status |
| ----- | ------------------------------------------------ | -------- | ------ |
| FR-06 | Arrival Flight/Train: Optional location + Time   | P0       | Done   |
| FR-07 | Departure Flight/Train: Optional location + Time | P0       | Done   |
| FR-08 | Buffer Time (Min): Buffer for baggage/wait times | P0       | Done   |
| FR-09 | Auto-routing: Flight → Hotel and Hotel → Flight  | P0       | Done   |

### FR-03: Hotels & Duration

| ID    | Requirement                           | Priority | Status |
| ----- | ------------------------------------- | -------- | ------ |
| FR-10 | Input hotel per day with Autocomplete | P0       | Done   |
| FR-11 | Toggle: "Same hotel for all days"     | P0       | Done   |
| FR-12 | Dynamic Day Selector (1-30 days)      | P0       | Done   |

### FR-04: Itinerary Optimization

| ID    | Requirement                                   | Priority | Status |
| ----- | --------------------------------------------- | -------- | ------ |
| FR-13 | TSP solver starting/ending at hotels/airports | P0       | Done   |
| FR-14 | Cluster places by proximity to day's hotel    | P0       | Done   |
| FR-15 | Real-time travel time/distance calculations   | P0       | Done   |

### FR-05: Premium Visuals & UX

| ID    | Requirement                             | Priority | Status |
| ----- | --------------------------------------- | -------- | ------ |
| FR-16 | Premium Dark Mode (Glow, Glassmorphism) | P0       | Done   |
| FR-17 | Continuous Timeline Path (No gaps)      | P1       | Done   |
| FR-18 | Dynamic Budget Bar (Real-time tracking) | P0       | Done   |
| FR-19 | AM/PM Time Formatting (Standard 12h)    | P0       | Done   |

---

## 3. Data Models

```typescript
interface TripSettings {
  startDate: string;
  duration: number;
  travelMode: TravelMode;
  showFlights: boolean;
  arrivalFlight: FlightInfo;
  departureFlight: FlightInfo;
}

interface FlightInfo {
  location: Hotel | null; // Reuse Hotel interface for simple name/lat/lng
  time: string;
  buffer: number;
}

interface DayRoute {
  day: number;
  points: Array<Place | Hotel>; // Ordered points including arrival/departure
  segments: RouteSegment[];
  totalDistance: number;
  totalTime: number;
}
```

---

## 4. UI Layout (Final)

[Header: Logo | Day Quick-Nav | Dark Mode Toggle | Snapshots | Export]

[Main Content - Split View]
├── Left: Trip Builder
│ ├── Flight/Transit Section (Toggleable)
│ ├── Hotel Setup (Scrollable Days)
│ └── Place List (with Buffer/Visit Durations)
└── Right: Map View
├── Real-time Route Polylines
└── Optimized Markers

[Footer: Optimized Schedule Horizontal Scroll]
└── Daily Cards: Timeline Circle Icons → Travel Pills → Buffer Pills → Continuous Line

---

## 5. Non-Functional Requirements

| ID     | Requirement        | Metric                       | Status |
| ------ | ------------------ | ---------------------------- | ------ |
| NFR-01 | Optimization speed | < 2s for 20 places           | Pass   |
| NFR-02 | Visual Quality     | "Premium/High-End" Aesthetic | Pass   |
| NFR-03 | Responsive         | Fluid from 768px up          | Pass   |
| NFR-04 | Persistence        | LocalStorage Snapshots       | Pass   |

---

## 6. Future Roadmap

- **Collaborative Planning**: Multi-user real-time sync.
- **Detailed Navigation**: Live turn-by-turn directions.
- **Social Sharing**: Interactive public itinerary links.
- **Mobile Native**: Dedicated iOS/Android wrapper.

---

## 7. Technical Constraints (Updated)

- **Storage**: LocalStorage Snapshots (Robust JSON system).
- **Aesthetics**: Vanilla CSS with custom design tokens for Premium feel.
- **Optimization**: Client-side Nearest Neighbor + 2-Opt refinement.
  ort parsing fails | Graceful degradation, manual input fallback (Implemented) |
