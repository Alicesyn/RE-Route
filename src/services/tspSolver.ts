import { Place, Hotel, DayRoute, TravelMode, OptimizationResult } from '../types';
import { getDistance, estimateTime } from '../utils/distance';

const DEFAULT_DAILY_BUDGET_MIN = 720; // 12 hours

// Time-budget-aware clustering
// Distributes places across days so no single day exceeds the budget
// Respects pinnedToDay: pinned places stay on their assigned day
function clusterPlaces(
  places: Place[], 
  hotels: Hotel[], 
  days: number, 
  travelMode: TravelMode,
  dailyBudgetMin: number = DEFAULT_DAILY_BUDGET_MIN
): Place[] {
  const pinned = places.filter(p => p.dayIndex !== null && p.pinnedToDay);
  const unassigned = places.filter(p => p.dayIndex === null || (p.dayIndex !== null && !p.pinnedToDay));
  
  if (unassigned.length === 0) return places;
  
  // Calculate already-committed time per day from pinned places
  const dayTimeUsed: number[] = Array(days).fill(0);
  for (const p of pinned) {
    if (p.dayIndex !== null) {
      dayTimeUsed[p.dayIndex] += p.estimatedDuration;
    }
  }
  
  // Add estimated travel time for pinned places (rough: avg travel between pinned stops + to/from hotel)
  for (let d = 0; d < days; d++) {
    const dayPinned = pinned.filter(p => p.dayIndex === d);
    const hotel = hotels.find(h => h.dayIndex === d);
    if (dayPinned.length > 0 && hotel) {
      // Rough: add avg travel from hotel to first place and back
      const avgDist = dayPinned.reduce((sum, p) => sum + getDistance(hotel.lat, hotel.lng, p.lat, p.lng), 0) / dayPinned.length;
      dayTimeUsed[d] += (estimateTime(avgDist * 2, travelMode)) / 60; // convert seconds to minutes
    }
  }
  
  // Reset non-pinned places
  const toAssign = unassigned.map(p => ({ ...p, dayIndex: null as number | null, orderInDay: null as number | null }));
  
  // Sort by longest duration first (greedy: schedule big items first for better packing)
  toAssign.sort((a, b) => b.estimatedDuration - a.estimatedDuration);
  
  // Greedy assignment: put each place on the day with the most remaining budget
  for (const place of toAssign) {
    let bestDay = 0;
    let maxRemaining = -Infinity;
    
    for (let d = 0; d < days; d++) {
      // Estimate travel time to this place from the day's hotel
      const hotel = hotels.find(h => h.dayIndex === d);
      let travelMin = 0;
      if (hotel) {
        const dist = getDistance(place.lat, place.lng, hotel.lat, hotel.lng);
        travelMin = estimateTime(dist, travelMode) / 60; // seconds to minutes
      }
      
      const totalIfAdded = dayTimeUsed[d] + place.estimatedDuration + travelMin;
      const remaining = dailyBudgetMin - totalIfAdded;
      
      if (remaining > maxRemaining) {
        maxRemaining = remaining;
        bestDay = d;
      }
    }
    
    place.dayIndex = bestDay;
    
    // Update time used
    const hotel = hotels.find(h => h.dayIndex === bestDay);
    let travelMin = 0;
    if (hotel) {
      const dist = getDistance(place.lat, place.lng, hotel.lat, hotel.lng);
      travelMin = estimateTime(dist, travelMode) / 60;
    }
    dayTimeUsed[bestDay] += place.estimatedDuration + travelMin;
  }
  
  return [...pinned, ...toAssign];
}

// 2-Opt Algorithm for a single day's route (Start -> Stops -> End)
function optimizeDayRoute(startHotel: Hotel | null, endHotel: Hotel | null, dayPlaces: Place[]): Place[] {
  if (dayPlaces.length <= 1) return dayPlaces;
  
  const points: (Hotel | Place)[] = [];
  if (startHotel) points.push(startHotel);
  points.push(...dayPlaces);
  if (endHotel) points.push(endHotel);
  
  // Define the range of indices that are swappable (only the places, not hotels)
  const swapStart = startHotel ? 1 : 0;
  const swapEnd = endHotel ? points.length - 2 : points.length - 1;
  
  let bestDistance = calculateTotalDistance(points);
  let improved = true;
  
  // 2-Opt main loop — only swap within the place indices, never touch hotel anchors
  while (improved) {
    improved = false;
    for (let i = swapStart; i <= swapEnd; i++) {
      for (let j = i + 1; j <= swapEnd; j++) {
        const newPoints = swap2Opt(points, i, j);
        const newDistance = calculateTotalDistance(newPoints);
        
        if (newDistance < bestDistance) {
          for(let k = 0; k < points.length; k++) {
             points[k] = newPoints[k];
          }
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }
  
  // Extract places back from points (hotels are at fixed positions)
  const placeStart = startHotel ? 1 : 0;
  const placeEnd = endHotel ? points.length - 1 : points.length;
  const optimizedPlaces = points.slice(placeStart, placeEnd) as Place[];
  
  return optimizedPlaces.map((p, idx) => ({ ...p, orderInDay: idx }));
}

function swap2Opt(route: any[], i: number, k: number): any[] {
  return [
    ...route.slice(0, i),
    ...route.slice(i, k + 1).reverse(),
    ...route.slice(k + 1)
  ];
}

function calculateTotalDistance(points: {lat: number, lng: number}[]): number {
  let dist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    dist += getDistance(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
  }
  return dist;
}

function buildDayRoute(dayPlaces: Place[], hotels: Hotel[], dayIndex: number, travelMode: TravelMode): DayRoute {
  const endHotel = hotels.find(h => h.dayIndex === dayIndex) || null;
  const startHotel = dayIndex > 0 ? (hotels.find(h => h.dayIndex === dayIndex - 1) || null) : endHotel;
  
  const optimizedPlaces = optimizeDayRoute(startHotel, endHotel, dayPlaces);
  
  let dayDist = 0;
  
  const points = [];
  if (startHotel) points.push(startHotel);
  points.push(...optimizedPlaces);
  if (endHotel) points.push(endHotel);
  
  const segments: { distance: number, time: number }[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const segDist = getDistance(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
    dayDist += segDist;
    segments.push({
      distance: segDist,
      time: estimateTime(segDist, travelMode)
    });
  }
  
  const dayTravelTime = estimateTime(dayDist, travelMode);
  const dayVisitTime = optimizedPlaces.reduce((sum, p) => sum + p.estimatedDuration * 60, 0); // minutes to seconds
  
  return {
    day: dayIndex,
    startHotel,
    endHotel,
    stops: optimizedPlaces,
    segments,
    totalDistance: dayDist,
    totalTime: dayTravelTime,
    totalVisitTime: dayVisitTime
  };
}

// Optimize a single day's route
export function solveSingleDay(dayPlaces: Place[], hotels: Hotel[], dayIndex: number, travelMode: TravelMode): DayRoute {
  return buildDayRoute(dayPlaces, hotels, dayIndex, travelMode);
}

export function solveTSP(
  places: Place[], 
  hotels: Hotel[], 
  days: number, 
  travelMode: TravelMode,
  dailyBudgetMin: number = DEFAULT_DAILY_BUDGET_MIN
): OptimizationResult {
  const startTime = performance.now();
  
  // 1. Cluster unassigned places (time-budget-aware, respects pinnedToDay)
  const clusteredPlaces = clusterPlaces(places, hotels, days, travelMode, dailyBudgetMin);
  
  let totalTripDistance = 0;
  let totalTripTime = 0;
  const dayRoutes: DayRoute[] = [];
  
  // 2. Optimize each day
  for (let d = 0; d < days; d++) {
    const dayPlaces = clusteredPlaces.filter(p => p.dayIndex === d);
    const route = buildDayRoute(dayPlaces, hotels, d, travelMode);
    dayRoutes.push(route);
    totalTripDistance += route.totalDistance;
    totalTripTime += route.totalTime;
  }
  
  console.log(`Optimization took ${performance.now() - startTime}ms`);
  
  return {
    success: true,
    days: dayRoutes,
    totalDistance: totalTripDistance,
    totalTime: totalTripTime
  };
}
