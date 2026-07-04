const CATEGORY_PRIORITY = {
  'Police Station': 4,
  Metro: 3,
  'Café': 2,
  Hostel: 1,
  'Public Restroom': 1,
  Others: 0,
};

const { haversineMeters, estimateWalkMinutes } = require('./geospatialService');

function scoreZone(zone, userLat, userLng) {
  const distance = haversineMeters(userLat, userLng, zone.Latitude, zone.Longitude);
  const categoryScore = CATEGORY_PRIORITY[zone.Category] || 0;
  const distanceScore = Math.max(0, 1000 - distance) / 1000;
  const totalScore = categoryScore * 0.6 + distanceScore * 0.4;
  return { ...zone, distanceMeters: Math.round(distance), score: totalScore };
}

function recommendSafeZone(userLat, userLng, safeZones, maxDistanceM = 3000) {
  const nearby = safeZones
    .map((z) => scoreZone(z, userLat, userLng))
    .filter((z) => z.distanceMeters <= maxDistanceM)
    .sort((a, b) => b.score - a.score);

  if (nearby.length === 0) return null;

  const best = nearby[0];
  const walkMinutes = estimateWalkMinutes(best.distanceMeters);

  const byCategory = {};
  nearby.forEach((z) => {
    if (!byCategory[z.Category] || z.distanceMeters < byCategory[z.Category].distanceMeters) {
      byCategory[z.Category] = z;
    }
  });

  return {
    recommended: {
      name: best.Name,
      category: best.Category,
      distanceMeters: best.distanceMeters,
      distanceLabel:
        best.distanceMeters >= 1000
          ? `${(best.distanceMeters / 1000).toFixed(1)} km away`
          : `${best.distanceMeters} meters away`,
      estimatedWalkMinutes: walkMinutes,
      estimatedRouteLabel: `${walkMinutes} minute${walkMinutes > 1 ? 's' : ''}`,
      address: best.Address || best.location_name,
      contact: best.ContactInfo,
      latitude: best.Latitude,
      longitude: best.Longitude,
    },
    alternatives: Object.values(byCategory).slice(0, 4).map((z) => ({
      name: z.Name,
      category: z.Category,
      distanceMeters: z.distanceMeters,
      distanceLabel:
        z.distanceMeters >= 1000
          ? `${(z.distanceMeters / 1000).toFixed(1)} km`
          : `${z.distanceMeters} m`,
    })),
    allNearby: nearby.slice(0, 6),
  };
}

function buildMLFeatures(location, crimes, reviews, safetipin) {
  const crimeCount = crimes.length;
  const avgSeverity =
    crimeCount > 0
      ? crimes.reduce((s, c) => s + (c.Severity || 3), 0) / crimeCount
      : 1;

  const nightCrimes = crimes.filter((c) => {
    const time = c.CrimeTime || (c.DateTime ? c.DateTime.split(' ')[1] : '12:00:00');
    const hour = parseInt(time.split(':')[0], 10);
    return hour >= 20 || hour <= 4;
  });
  const nightCrimeRatio = crimeCount > 0 ? nightCrimes.length / crimeCount : 0.1;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.Rating, 0) / reviews.length
      : 3;

  const womenReviews = reviews.filter(
    (r) => r.Gender === 'Female' || r.Gender === 'female'
  );
  const womenReviewRatio =
    reviews.length > 0 ? womenReviews.length / reviews.length : 0.5;

  const st = safetipin || {};

  return {
    crime_count: crimeCount,
    avg_severity: Math.round(avgSeverity * 10) / 10,
    night_crime_ratio: Math.round(nightCrimeRatio * 100) / 100,
    avg_rating: Math.round(avgRating * 10) / 10,
    women_review_ratio: Math.round(womenReviewRatio * 100) / 100,
    lighting_score: st.LightingScore || st.lighting_score || 5,
    walkability: st.Walkability || st.walkability || 5,
    visibility: st.Visibility || st.visibility || 5,
    public_transport: st.PublicTransport || st.public_transport || 5,
    people_density: st.PeopleDensity || st.people_density || 5,
    security_feeling: st.SecurityFeeling || st.security_feeling || 5,
  };
}

function buildNearbyRecommendations(lat, lng, { metro, police, cafe, hospital }) {
  const toEntry = (item, label) => {
    if (!item) return null;
    const name = item.name || item.station_name || item.Name;
    return {
      name,
      distance: item.distance,
      distanceMeters: item.distanceMeters,
      walkTime: item.walkTime,
      line: item.line,
      category: item.category,
      address: item.address || item.Address,
      rating: item.rating,
    };
  };

  return {
    nearestMetro: toEntry(metro, 'metro'),
    nearestPolice: toEntry(police, 'police'),
    nearestCafe: toEntry(cafe, 'cafe'),
    nearestHospital: toEntry(hospital, 'hospital'),
    summary: {
      nearestMetro: metro ? `${metro.name || metro.station_name} · ${metro.distance}` : null,
      nearestPolice: police ? `${police.name} · ${police.distance}` : null,
      nearestCafe: cafe ? `${cafe.name} · ${cafe.distance}` : null,
      nearestHospital: hospital ? `${hospital.name} · ${hospital.distance}` : null,
    },
  };
}

async function buildFullRecommendation(location, context) {
  const { getNearestMetro } = require('./metroService');
  const { getNearestPOIs } = require('./poiService');
  const {
    crowdDensityLabel,
    computeCrimeScore,
    computeOverallSafety,
  } = require('./geospatialService');

  const lat = location.Latitude ?? location.latitude;
  const lng = location.Longitude ?? location.longitude;

  const [metro, pois] = await Promise.all([
    getNearestMetro(lat, lng),
    getNearestPOIs(lat, lng),
  ]);

  const nearby = buildNearbyRecommendations(lat, lng, {
    metro,
    police: pois.police,
    cafe: pois.cafe,
    hospital: pois.hospital,
  });

  const safetipin = context.safetipin || {};
  const crimes = context.crimes || [];
  const mlScore = context.mlScore;

  const crimeScore = computeCrimeScore(crimes, mlScore);
  const lightingScore = safetipin.LightingScore ?? safetipin.lighting_score ?? 7;
  const peopleDensity = safetipin.PeopleDensity ?? safetipin.people_density ?? 6;

  const safetyIndex = {
    area: location.Area || location.Name,
    crimeScore,
    lightingScore: Math.round(lightingScore * 10),
    crowdDensity: crowdDensityLabel(peopleDensity),
    nearestMetro: metro ? { name: metro.name, distance: metro.distance, walkTime: metro.walkTime, line: metro.line } : null,
    nearestPolice: pois.police ? { name: pois.police.name, distance: pois.police.distance, walkTime: pois.police.walkTime } : null,
    nearestHospital: pois.hospital ? { name: pois.hospital.name, distance: pois.hospital.distance, walkTime: pois.hospital.walkTime } : null,
    nearestCafe: pois.cafe ? { name: pois.cafe.name, distance: pois.cafe.distance, category: pois.cafe.category, rating: pois.cafe.rating } : null,
    overallSafety: computeOverallSafety({
      crimeScore,
      lightingScore,
      mlScore,
      nearestDistances: {
        metro: metro?.distanceMeters,
        police: pois.police?.distanceMeters,
      },
    }),
  };

  const legacyZones = (context.safeZones || []).map((z) => ({
    ...z,
    Latitude: z.Latitude ?? z.latitude,
    Longitude: z.Longitude ?? z.longitude,
  }));
  const legacyRecommendation = recommendSafeZone(lat, lng, legacyZones);

  return {
    nearby,
    safetyIndex,
    nearbyPOIs: pois.nearbyOsm?.slice(0, 12) || [],
    recommendation: legacyRecommendation,
  };
}

module.exports = {
  recommendSafeZone,
  buildMLFeatures,
  buildNearbyRecommendations,
  buildFullRecommendation,
  haversineMeters,
  estimateWalkMinutes,
};
