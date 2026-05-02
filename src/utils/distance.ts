// Calculate haversine distance in meters
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
}

// Estimate time in seconds based on mode and distance
export function estimateTime(distanceMeters: number, mode: 'walking' | 'transit' | 'driving'): number {
  let speedMps = 1.4; // walking avg speed ~ 1.4 m/s (5km/h)
  
  if (mode === 'driving') speedMps = 8; // approx 30 km/h avg in cities
  if (mode === 'transit') speedMps = 5; // approx 18 km/h avg with stops
  
  return distanceMeters / speedMps;
}
