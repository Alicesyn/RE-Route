import { Place, Hotel, DayRoute, TravelMode, OptimizationResult } from '../types';
import { getDistance, estimateTime } from '../utils/distance';

// Group unassigned places to days simply by splitting them evenly for now, 
// or by closest hotel if multiple hotels exist.
function clusterPlaces(places: Place[], hotels: Hotel[], days: number): Place[] {
  const unassigned = places.filter(p => p.dayIndex === null);
  if (unassigned.length === 0) return places;
  
  // Very basic k-means or closest hotel assignment
  const updated = [...places];
  
  unassigned.forEach(place => {
    let closestDay = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < days; i++) {
      const hotel = hotels.find(h => h.dayIndex === i);
      if (hotel) {
        const d = getDistance(place.lat, place.lng, hotel.lat, hotel.lng);
        if (d < minDistance) {
          minDistance = d;
          closestDay = i;
        }
      } else {
        // If no hotel assigned to this day, just assign cyclically
        closestDay = Math.floor(Math.random() * days);
      }
    }
    
    const placeIdx = updated.findIndex(p => p.id === place.id);
    if (placeIdx !== -1) {
      updated[placeIdx] = { ...updated[placeIdx], dayIndex: closestDay };
    }
  });
  
  return updated;
}

// 2-Opt Algorithm for a single day's route (Start -> Stops -> End)
function optimizeDayRoute(startHotel: Hotel | null, endHotel: Hotel | null, dayPlaces: Place[]): Place[] {
  if (dayPlaces.length <= 1) return dayPlaces;
  
  // The route is StartHotel -> P1 -> P2 ... -> Pn -> EndHotel
  
  // For simplicity of 2-opt, we treat the sequence of points
  const points = [];
  if (startHotel) points.push(startHotel);
  points.push(...dayPlaces);
  if (endHotel) points.push(endHotel);
  
  let bestDistance = calculateTotalDistance(points);
  let improved = true;
  
  // 2-Opt main loop
  while (improved) {
    improved = false;
    for (let i = 1; i < points.length - 1; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const newPoints = swap2Opt(points, i, j);
        const newDistance = calculateTotalDistance(newPoints);
        
        if (newDistance < bestDistance) {
          // Replace points with newPoints
          for(let k = 0; k < points.length; k++) {
             points[k] = newPoints[k];
          }
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }
  
  // Extract places back from points
  let startIndex = startHotel ? 1 : 0;
  let endIndex = endHotel ? points.length - 1 : points.length;
  const optimizedPlaces = points.slice(startIndex, endIndex) as Place[];
  
  // Assign orderInDay
  return optimizedPlaces.map((p, idx) => ({ ...p, orderInDay: idx }));
}

function swap2Opt(route: any[], i: number, k: number): any[] {
  const newRoute = [
    ...route.slice(0, i),
    ...route.slice(i, k + 1).reverse(),
    ...route.slice(k + 1)
  ];
  return newRoute;
}

function calculateTotalDistance(points: {lat: number, lng: number}[]): number {
  let dist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    dist += getDistance(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
  }
  // DO NOT add return to start. This is a path, not a cycle.
  return dist;
}

export function solveTSP(places: Place[], hotels: Hotel[], days: number, travelMode: TravelMode): OptimizationResult {
  const startTime = performance.now();
  
  // 1. Cluster unassigned places
  const clusteredPlaces = clusterPlaces(places, hotels, days);
  
  let totalTripDistance = 0;
  let totalTripTime = 0;
  const dayRoutes: DayRoute[] = [];
  
  // 2. Optimize each day
  for (let d = 0; d < days; d++) {
    const dayPlaces = clusteredPlaces.filter(p => p.dayIndex === d);
    
    // Determine start and end hotels for this day
    const endHotel = hotels.find(h => h.dayIndex === d) || null;
    const startHotel = d > 0 ? (hotels.find(h => h.dayIndex === d - 1) || null) : endHotel;
    
    const optimizedPlaces = optimizeDayRoute(startHotel, endHotel, dayPlaces);
    
    // Calculate final metrics for the day
    let dayDist = 0;
    
    const points = [];
    if (startHotel) points.push(startHotel);
    points.push(...optimizedPlaces);
    if (endHotel) points.push(endHotel);
    
    const segments: { distance: number, time: number }[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const d = getDistance(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
      dayDist += d;
      segments.push({
        distance: d,
        time: estimateTime(d, travelMode)
      });
    }
    
    const dayTime = estimateTime(dayDist, travelMode);
    
    dayRoutes.push({
      day: d,
      startHotel,
      endHotel,
      stops: optimizedPlaces,
      segments,
      totalDistance: dayDist,
      totalTime: dayTime
    });
    
    totalTripDistance += dayDist;
    totalTripTime += dayTime;
  }
  
  console.log(`Optimization took ${performance.now() - startTime}ms`);
  
  return {
    success: true,
    days: dayRoutes,
    totalDistance: totalTripDistance,
    totalTime: totalTripTime
  };
}
