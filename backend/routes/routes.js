const express = require('express');
const router = express.Router();
const db = require('../db');
const { isDbConnected } = require('../lib/dbStatus');
const mockData = require('../lib/mockData');
const { recommendSafeZone } = require('../lib/recommendationEngine');

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function interpolatePoints(start, end, segments = 8) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push({
      latitude: start.Latitude + (end.Latitude - start.Latitude) * t,
      longitude: start.Longitude + (end.Longitude - start.Longitude) * t,
      segmentIndex: i,
    });
  }
  return points;
}

function getRiskLevel(score) {
  if (score >= 7) return { level: 'low', label: 'Low Risk', color: '#22c55e' };
  if (score >= 4) return { level: 'medium', label: 'Moderate Risk', color: '#f59e0b' };
  return { level: 'high', label: 'High Risk', color: '#ef4444' };
}

async function getLocationSafetyScore(locationId) {
  if (!isDbConnected()) {
    const safety = mockData.calcSafetyScore(locationId);
    return {
      safetyScore: safety.safetyScore,
      crimeCount: safety.crimeReports.length,
      reviewCount: safety.reviews.length,
      crimeReports: safety.crimeReports,
    };
  }

  const [crimeReports] = await db.promise().query(
    'SELECT * FROM CrimeReport WHERE LocationID = ?',
    [locationId]
  );
  const [reviews] = await db.promise().query(
    'SELECT * FROM Review WHERE LocationID = ?',
    [locationId]
  );

  const crimePenalty = Math.min(5, crimeReports.length * 0.5);
  const reviewScore =
    reviews.reduce((acc, review) => acc + review.Rating, 0) / reviews.length || 0;
  const safetyScore = Math.max(0, 10 - crimePenalty + (reviewScore - 3));

  return {
    safetyScore: Math.min(10, Math.max(0, safetyScore)),
    crimeCount: crimeReports.length,
    reviewCount: reviews.length,
    crimeReports,
  };
}

async function findNearestLocation(lat, lng) {
  if (!isDbConnected()) {
    let nearest = null;
    let minDist = Infinity;
    mockData.locations.forEach((loc) => {
      const dist = haversineDistance(lat, lng, loc.Latitude, loc.Longitude);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    });
    return nearest;
  }

  const [locations] = await db.promise().query(
    `SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(Latitude)) *
      cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)))) AS distance
     FROM Location
     ORDER BY distance
     LIMIT 1`,
    [lat, lng, lat]
  );
  return locations[0] || null;
}

router.post('/analyze', async (req, res) => {
  try {
    const { startLocationId, endLocationId } = req.body;

    if (!startLocationId || !endLocationId) {
      return res.status(400).json({ message: 'Start and destination locations are required' });
    }

    let start;
    let end;

    if (!isDbConnected()) {
      start = mockData.getLocationById(startLocationId);
      end = mockData.getLocationById(endLocationId);
    } else {
      const [locations] = await db.promise().query(
        'SELECT * FROM Location WHERE LocationID IN (?, ?)',
        [startLocationId, endLocationId]
      );

      if (locations.length < 2) {
        return res.status(404).json({ message: 'One or both locations not found' });
      }

      start = locations.find((l) => l.LocationID === Number(startLocationId));
      end = locations.find((l) => l.LocationID === Number(endLocationId));
    }

    if (!start || !end) {
      return res.status(404).json({ message: 'One or both locations not found' });
    }

    const pathPoints = interpolatePoints(start, end);
    const segmentAnalysis = [];

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const midLat = (pathPoints[i].latitude + pathPoints[i + 1].latitude) / 2;
      const midLng = (pathPoints[i].longitude + pathPoints[i + 1].longitude) / 2;
      const nearest = await findNearestLocation(midLat, midLng);

      let segmentScore = 5;
      let crimes = [];
      let nearestName = 'Unknown area';

      if (nearest) {
        const safety = await getLocationSafetyScore(nearest.LocationID);
        segmentScore = safety.safetyScore;
        crimes = safety.crimeReports.slice(0, 3);
        nearestName = nearest.Name;
      }

      const risk = getRiskLevel(segmentScore);
      segmentAnalysis.push({
        segmentIndex: i,
        from: { lat: pathPoints[i].latitude, lng: pathPoints[i].longitude },
        to: { lat: pathPoints[i + 1].latitude, lng: pathPoints[i + 1].longitude },
        nearestLocation: nearestName,
        safetyScore: segmentScore,
        riskLevel: risk.level,
        riskLabel: risk.label,
        riskColor: risk.color,
        recentCrimes: crimes,
      });
    }

    const avgScore =
      segmentAnalysis.reduce((sum, s) => sum + s.safetyScore, 0) / segmentAnalysis.length;
    const overallRisk = getRiskLevel(avgScore);
    const totalDistance = haversineDistance(
      start.Latitude,
      start.Longitude,
      end.Latitude,
      end.Longitude
    );

    const [startSafety] = await Promise.all([
      getLocationSafetyScore(start.LocationID),
    ]);
    const endSafety = await getLocationSafetyScore(end.LocationID);

    let nearbySafeZones = [];
    let allSafeZones = [];

    if (!isDbConnected()) {
      allSafeZones = mockData.getAllSafeZones();
      nearbySafeZones = allSafeZones.slice(0, 6);
    } else {
      const [zones] = await db.promise().query(
        `SELECT l.*, loc.Name AS location_name, loc.Address, loc.Latitude, loc.Longitude,
          (6371 * acos(cos(radians(?)) * cos(radians(loc.Latitude)) *
          cos(radians(loc.Longitude) - radians(?)) + sin(radians(?)) * sin(radians(loc.Latitude)))) AS distance
         FROM Listing l
         JOIN Location loc ON l.LocationID = loc.LocationID
         WHERE l.VerificationStatus = TRUE
         HAVING distance < 50
         ORDER BY distance
         LIMIT 10`,
        [
          (start.Latitude + end.Latitude) / 2,
          (start.Longitude + end.Longitude) / 2,
          (start.Latitude + end.Latitude) / 2,
        ]
      );
      allSafeZones = zones;
      nearbySafeZones = zones.slice(0, 6);
    }

    const recommendation = recommendSafeZone(
      start.Latitude,
      start.Longitude,
      allSafeZones.length ? allSafeZones : mockData.getAllSafeZones()
    );

    const highRiskSegments = segmentAnalysis.filter((s) => s.riskLevel === 'high');
    const recommendations = [];

    if (highRiskSegments.length > 0) {
      recommendations.push(
        'Avoid traveling alone through high-risk segments, especially after dark.'
      );
    }
    if (recommendation?.recommended) {
      recommendations.push(
        `Head to ${recommendation.recommended.name} (${recommendation.recommended.category}) — ${recommendation.recommended.distanceLabel}, ~${recommendation.recommended.estimatedRouteLabel} walk.`
      );
    }
    if (avgScore < 5) {
      recommendations.push('Share your live location with a trusted contact before departing.');
    } else {
      recommendations.push('Route appears relatively safe. Stay aware of your surroundings.');
    }

    res.json({
      start: { ...start, safety: startSafety },
      end: { ...end, safety: endSafety },
      path: pathPoints.map((p) => ({ lat: p.latitude, lng: p.longitude })),
      segments: segmentAnalysis,
      summary: {
        totalDistanceKm: totalDistance.toFixed(2),
        overallSafetyScore: avgScore.toFixed(1),
        overallRiskLevel: overallRisk.level,
        overallRiskLabel: overallRisk.label,
        overallRiskColor: overallRisk.color,
        highRiskSegmentCount: highRiskSegments.length,
        totalSegments: segmentAnalysis.length,
      },
      nearbySafeZones,
      recommendation,
      recommendations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
