# Product Requirements Document (PRD)
## RouteWise - Travel Itinerary Optimizer

| Document Version | 1.0 |
| Product Name | RouteWise |
| Status | Active Development / Beta |
| Implementation | 90% Complete (V1) |

---

## 1. Executive Summary

RouteWise is a web-based travel planning application that helps users create optimized multi-day itineraries. Users input places, specify different hotels per day, select travel mode (walking/transit/driving), and the app uses TSP algorithms to minimize travel distance each day.

**Key Differentiators:**
- Hotel-per-day flexibility
- Multi-modal route optimization (walking, transit, driving)
- Zero-cost development (mock mode by default)
- Inline editable descriptions (click to edit, auto-save on blur)
- Clean, print-optimized export interface
- Multi-trip persistence (Snapshots)

---

## 2. Functional Requirements

### FR-01: Place Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Search places via Google Places Autocomplete | P0 |
| FR-02 | Add places to trip list from search | P0 |
| FR-03 | Delete places from trip list | P0 |
| FR-04 | Drag-and-drop reorder places | P1 |
| FR-05 | Import from Wanderlog (one per line) | P1 |
| FR-06 | Import from Notes (natural language) | P1 |
| FR-07 | CSV upload with place names | P2 |

### FR-02: Inline Descriptions
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-08 | Click description → transforms to textarea | P0 |
| FR-09 | Enter/save, Escape/cancel, blur/save | P0 |
| FR-10 | Generate AI description button | P1 |
| FR-11 | Visual feedback on save | P1 |

### FR-03: Hotels
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12 | Input hotel per day | P0 |
| FR-13 | Toggle: "Same hotel for all days" | P0 |
| FR-14 | Google Places Autocomplete for hotels | P0 |
| FR-15 | Set number of days (1-14) | P0 |

### FR-04: Travel Mode
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-16 | Select: Walking, Transit, Driving | P0 |
| FR-17 | Selected mode affects all distance calculations | P0 |

### FR-05: Itinerary Optimization
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-18 | Auto-assign places to days (clustering) | P0 |
| FR-19 | Manual override of day assignments | P1 |
| FR-20 | TSP solver starting/ending at each day's hotel | P0 |
| FR-21 | Nearest neighbor + 2-opt algorithm | P0 |
| FR-22 | Optimization < 2 seconds for 20 places | P1 |

### FR-06: Map Display
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-23 | Markers for all places | P0 |
| FR-24 | Color-coded polylines per day | P0 |
| FR-25 | Click marker → show details | P0 |
| FR-26 | Day number on markers | P1 |

### FR-07: Daily Schedule
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-27 | Day-by-day optimized order | P0 |
| FR-28 | Travel times between stops | P0 |
| FR-29 | Total time per day | P0 |
| FR-30 | Drag places between days | P1 |

### FR-08: Save, Load, Export
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-31 | Save/Load snapshots to localStorage | P0 [Done] |
| FR-32 | Multi-trip management (snapshot system) | P0 [Done] |
| FR-33 | Export as print-optimized PDF | P1 [Done] |
| FR-34 | Export as Place List (TXT) | P1 [Done] |
| FR-35 | Shareable link (JSON export/import) | P2 [Done] |

### FR-09: Mock vs Real Mode
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-35 | Toggle: Mock Mode (ON by default) | P0 |
| FR-36 | Mock: local dataset + Euclidean distance + template descriptions | P0 |
| FR-37 | Real: Google Maps API + OpenAI (user key) | P1 |
| FR-38 | Show estimated API cost | P2 |

---

## 3. Non-Functional Requirements

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-01 | Initial load | < 3 seconds |
| NFR-02 | Optimization speed | < 2 seconds for 20 places |
| NFR-03 | Offline capability | Mock mode works without internet |
| NFR-04 | Browser support | Chrome, Firefox, Safari (last 2 versions) |
| NFR-05 | Responsive | Desktop 1280px+, Tablet 768px+ |
| NFR-06 | Development cost | $0 |
| NFR-07 | Accessibility | Keyboard navigable |

---

## 4. Data Models

```typescript
interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  descriptionSource: 'user' | 'ai' | 'mock';
  dayIndex: number | null;
  orderInDay: number | null;
  notes?: string;
}

interface Itinerary {
  id: string;
  title: string;
  days: number;
  hotels: Hotel[];
  travelMode: 'walking' | 'transit' | 'driving';
  places: Place[];
  optimized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Hotel {
  dayIndex: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface OptimizationResult {
  success: boolean;
  days: DayRoute[];
  totalDistance: number;
  totalTime: number;
}

interface DayRoute {
  day: number;
  hotel: Hotel;
  stops: Place[];
  totalDistance: number;
  totalTime: number;
}

## 5. UI Layout
[Header: Logo | Mode Toggle | Save | Import | Export PDF]

[Left Panel - Trip Builder]     [Right Panel - Map]
├── Place Search                 ├── Map View
├── Place List (inline desc)     ├── Colored routes
├── Hotel inputs (per day)       └── Markers
├── Travel mode selector
└── Days selector

[Bottom Panel - Daily Schedule]
├── Day 1: Hotel → Place 1 → Place 2 → Hotel
└── ...

## 6. Success Metrics
Metric	Target
Time to first optimized itinerary	< 5 minutes
Travel time reduction vs manual	40%
Error-free completion	95%

7. Out of Scope (V1)
Mobile app

User accounts / authentication

Collaborative editing

Flight/hotel booking

Offline maps

Real-time traffic

## 8. Technical Constraints
Constraint	Details
Budget	$0
Deployment	Vercel + optional Render
Storage	localStorage (MVP)
API keys	Google Maps demo key only
Browser	ES2020+

## 9. API Keys (Development)
Service	Key / Notes
Google Maps Demo	AIzaSyC5Zs7UYjPClnw6YjP3vZxP3X5L7vT9kA4
Google Maps Usage	Rate limited, localhost only
OpenAI	User provides own key

## 10. Timeline
Phase	Duration	Deliverables
Phase 1: Core UI + Mock	3-4 days	Search, list, inline edit, map
Phase 2: Hotels + Days	1-2 days	Multi-day hotels, day selector
Phase 3: TSP Optimization	2-3 days	Clustering, 2-opt, schedule
Phase 4: Import + Export	1-2 days	Paste import, PDF
Phase 5: Real Mode + Polish	2 days	Google Maps, mode toggle
Total	10-13 days	V1 complete

## 12. Future Roadmap (Post-V1)

### 🚀 High Impact
- **Real AI Integration**: Swap mock AI with live OpenAI/Anthropic API calls for accurate destination facts.
- **Collaborative Planning**: Real-time multi-user editing using WebSockets or Supabase.
- **Detailed Navigation**: Step-by-step transit directions and real-time traffic integration.

### 🎨 UX & Design
- **Dark Mode Support**: Full system-wide dark theme.
- **Custom Map Styles**: Allow users to choose different map providers (Stadia, Mapbox).
- **Mobile PWA**: Enable "Add to Home Screen" with offline data caching.

### 💰 Travel Tools
- **Budget Tracker**: Track estimated vs actual costs per place and day.
- **Booking Integration**: Direct links to Booking.com, Viator, or Airbnb for confirmed locations.
- **Weather Integration**: Forecast-based activity suggestions.

---

## 13. Risks & Mitigations (Updated)
Risk	Mitigation
TSP too slow for >15 places	Early exit, limit per day (Implemented)
Google Maps rate limit	Mock mode default (Implemented)
Inline edit + drag conflict	Visual indicators and lock-out during drag (Implemented)
Import parsing fails	Graceful degradation, manual input fallback (Implemented)