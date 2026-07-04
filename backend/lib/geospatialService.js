const R = 6371000;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateWalkMinutes(distanceMeters) {
  const walkSpeedMPerMin = 80;
  return Math.max(1, Math.ceil(distanceMeters / walkSpeedMPerMin));
}

function formatDistance(meters) {
  const m = Math.round(meters);
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function findNearest(items, lat, lng, getCoords = (item) => item) {
  if (!items?.length) return null;

  let best = null;
  let bestDist = Infinity;

  items.forEach((item) => {
    const coords = getCoords(item);
    const lat2 = coords.latitude ?? coords.Latitude ?? coords.lat;
    const lng2 = coords.longitude ?? coords.Longitude ?? coords.lng ?? coords.lon;
    if (lat2 == null || lng2 == null) return;

    const dist = haversineMeters(lat, lng, lat2, lng2);
    if (dist < bestDist) {
      bestDist = dist;
      best = { item, distanceMeters: Math.round(dist) };
    }
  });

  if (!best) return null;

  const walkMinutes = estimateWalkMinutes(best.distanceMeters);
  return {
    ...best.item,
    distanceMeters: best.distanceMeters,
    distance: formatDistance(best.distanceMeters),
    walkMinutes,
    walkTime: `${walkMinutes} min walk`,
  };
}

function findNearestByCategory(items, lat, lng, categoryField = 'category', categories = []) {
  const result = {};
  categories.forEach((cat) => {
    const filtered = items.filter(
      (i) => (i[categoryField] || i.Category || '').toLowerCase() === cat.toLowerCase()
    );
    const nearest = findNearest(filtered, lat, lng);
    if (nearest) {
      result[cat] = nearest;
    }
  });
  return result;
}

function crowdDensityLabel(score) {
  if (score >= 8) return 'High';
  if (score >= 6) return 'Medium';
  if (score >= 4) return 'Low';
  return 'Very Low';
}

function computeCrimeScore(crimes, mlScore) {
  if (mlScore != null) {
    return Math.round(Math.max(0, Math.min(100, mlScore)));
  }
  const count = crimes?.length || 0;
  const avgSeverity =
    count > 0 ? crimes.reduce((s, c) => s + (c.Severity || 3), 0) / count : 1;
  const raw = 100 - count * 8 - avgSeverity * 6;
  return Math.round(Math.max(20, Math.min(95, raw)));
}

function computeOverallSafety({ crimeScore, lightingScore, mlScore, nearestDistances }) {
  const lighting = lightingScore != null ? lightingScore * 10 : 70;
  const crime = crimeScore ?? 70;
  const ml = mlScore ?? 75;

  let proximityBonus = 0;
  const metroDist = nearestDistances?.metro;
  const policeDist = nearestDistances?.police;
  if (metroDist != null && metroDist < 500) proximityBonus += 3;
  if (policeDist != null && policeDist < 500) proximityBonus += 4;
  if (metroDist != null && metroDist < 200) proximityBonus += 2;

  const overall = Math.round(
    Math.min(100, Math.max(0, crime * 0.35 + lighting * 0.25 + ml * 0.35 + proximityBonus))
  );
  return overall;
}

module.exports = {
  formatDistance,
  findNearest,
  findNearestByCategory,
  crowdDensityLabel,
  computeCrimeScore,
  computeOverallSafety,
  haversineMeters,
  estimateWalkMinutes,
};
