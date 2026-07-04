const express = require('express');
const router = express.Router();
const db = require('../db');
const { isDbConnected } = require('../lib/dbStatus');
const mockData = require('../lib/mockData');
const { predictSafety } = require('../lib/mlService');
const { recommendSafeZone, buildMLFeatures, buildFullRecommendation } = require('../lib/recommendationEngine');

async function fetchLocationData(locationId) {
  if (!isDbConnected()) {
    const location = mockData.getLocationById(locationId);
    if (!location) return null;
    return {
      location,
      crimes: mockData.getCrimeReportsForLocation(locationId),
      reviews: mockData.getReviewsForLocation(locationId),
      safetipin: mockData.getSafetipinFeatures(locationId),
      safeZones: mockData.getAllSafeZones(),
    };
  }

  const [locations] = await db.promise().query(
    'SELECT * FROM Location WHERE LocationID = ?',
    [locationId]
  );
  if (locations.length === 0) return null;

  const [crimes] = await db.promise().query(
    'SELECT *, CONCAT(CrimeDate, " ", CrimeTime) AS DateTime FROM CrimeReport WHERE LocationID = ?',
    [locationId]
  );

  const [reviews] = await db.promise().query(
    'SELECT * FROM Review WHERE LocationID = ?',
    [locationId]
  );

  const [safetipinRows] = await db.promise().query(
    'SELECT * FROM SafetipinFeatures WHERE LocationID = ?',
    [locationId]
  );

  const [safeZones] = await db.promise().query(`
    SELECT l.*, loc.Name AS location_name, loc.Address, loc.Latitude, loc.Longitude
    FROM Listing l
    JOIN Location loc ON l.LocationID = loc.LocationID
    WHERE l.VerificationStatus = TRUE
  `);

  return {
    location: locations[0],
    crimes,
    reviews,
    safetipin: safetipinRows[0] || null,
    safeZones,
  };
}

router.post('/analyze', async (req, res) => {
  try {
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ message: 'locationId is required' });
    }

    const data = await fetchLocationData(locationId);
    if (!data) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const { location, crimes, reviews, safetipin, safeZones } = data;
    const mlFeatures = buildMLFeatures(location, crimes, reviews, safetipin);
    const prediction = await predictSafety(mlFeatures);
    const geoAnalysis = await buildFullRecommendation(location, {
      crimes,
      safetipin,
      safeZones,
      mlScore: prediction.safety_score,
    });
    const recommendation = geoAnalysis.recommendation;

    const womenReviews = reviews.filter((r) => r.Gender === 'Female');
    const nightCrimes = crimes.filter((c) => {
      const time = c.CrimeTime || '12:00:00';
      const hour = parseInt(time.split(':')[0], 10);
      return hour >= 20 || hour <= 4;
    });

    res.json({
      location,
      mlPrediction: prediction,
      safetipinFeatures: safetipin,
      mlFeatures,
      crimeReports: crimes,
      reviews,
      stats: {
        crimeCount: crimes.length,
        nightCrimeCount: nightCrimes.length,
        avgSeverity:
          crimes.length > 0
            ? (crimes.reduce((s, c) => s + (c.Severity || 3), 0) / crimes.length).toFixed(1)
            : '0',
        avgRating:
          reviews.length > 0
            ? (reviews.reduce((s, r) => s + r.Rating, 0) / reviews.length).toFixed(1)
            : '0',
        womenReviewCount: womenReviews.length,
      },
      recommendation,
      nearbyRecommendations: geoAnalysis.nearby,
      safetyIndex: geoAnalysis.safetyIndex,
      nearbyPOIs: geoAnalysis.nearbyPOIs,
      pipeline: [
        'Delhi Police / NCRB Crime Data',
        'DMRC GTFS Real Metro Network (251 stations)',
        'OpenStreetMap Cafés & POIs (Overpass API)',
        'Safetipin Environmental Features',
        'Community Reviews (Women)',
        'Random Forest ML Model',
        'Haversine Geospatial Recommendation',
      ],
    });
  } catch (error) {
    console.error('ML analyze error:', error);
    res.status(500).json({ message: 'Analysis failed', error: error.message });
  }
});

router.get('/model-info', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const metaPath = path.join(__dirname, '..', '..', 'ml', 'model_meta.json');

  if (fs.existsSync(metaPath)) {
    return res.json(JSON.parse(fs.readFileSync(metaPath, 'utf8')));
  }

  res.json({
    model_type: 'RandomForestRegressor',
    status: 'Run python ml/train_model.py to train',
  });
});

module.exports = router;
