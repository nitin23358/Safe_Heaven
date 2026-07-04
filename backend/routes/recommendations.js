const express = require('express');
const router = express.Router();
const mockData = require('../lib/mockData');
const { isDbConnected } = require('../lib/dbStatus');
const { buildFullRecommendation } = require('../lib/recommendationEngine');
const { getNearbyPOIs } = require('../lib/poiService');

async function resolveLocation(req) {
  const { locationId, latitude, longitude, area } = req.query;

  if (locationId) {
    if (!isDbConnected()) {
      const loc = mockData.getLocationById(locationId);
      return loc ? { location: loc, locationId } : null;
    }
    const db = require('../db');
    const [rows] = await db.promise().query('SELECT * FROM Location WHERE LocationID = ?', [locationId]);
    return rows[0] ? { location: rows[0], locationId } : null;
  }

  if (latitude && longitude) {
    return {
      location: {
        Name: area || 'Custom Location',
        Area: area || 'Delhi',
        Latitude: parseFloat(latitude),
        Longitude: parseFloat(longitude),
      },
    };
  }

  if (area) {
    const locs = mockData.getLocations(area);
    if (locs.length) return { location: locs[0], locationId: locs[0].LocationID };
    if (isDbConnected()) {
      const db = require('../db');
      const [rows] = await db.promise().query(
        'SELECT * FROM Location WHERE Area LIKE ? OR Name LIKE ? LIMIT 1',
        [`%${area}%`, `%${area}%`]
      );
      if (rows[0]) return { location: rows[0], locationId: rows[0].LocationID };
    }
  }

  return null;
}

router.get('/nearby', async (req, res) => {
  try {
    const resolved = await resolveLocation(req);
    if (!resolved) {
      return res.status(404).json({ message: 'Location not found. Provide locationId, area, or lat/lng.' });
    }

    const { location, locationId } = resolved;
    const lat = location.Latitude;
    const lng = location.Longitude;

    let context = {
      crimes: [],
      safetipin: null,
      safeZones: mockData.getAllSafeZones(),
      mlScore: null,
    };

    if (locationId) {
      if (!isDbConnected()) {
        context.crimes = mockData.getCrimeReportsForLocation(locationId);
        context.safetipin = mockData.getSafetipinFeatures(locationId);
      } else {
        const db = require('../db');
        const [crimes] = await db.promise().query('SELECT * FROM CrimeReport WHERE LocationID = ?', [locationId]);
        const [safetipinRows] = await db.promise().query('SELECT * FROM SafetipinFeatures WHERE LocationID = ?', [locationId]);
        const [safeZones] = await db.promise().query(`
          SELECT l.*, loc.Name AS location_name, loc.Address, loc.Latitude, loc.Longitude
          FROM Listing l JOIN Location loc ON l.LocationID = loc.LocationID
          WHERE l.VerificationStatus = TRUE
        `);
        context.crimes = crimes;
        context.safetipin = safetipinRows[0] || null;
        context.safeZones = safeZones;
      }
    }

    const full = await buildFullRecommendation(location, context);

    res.json({
      location: { name: location.Area || location.Name, address: location.Address, latitude: lat, longitude: lng },
      ...full.nearby,
      safetyIndex: full.safetyIndex,
      nearbyPOIs: full.nearbyPOIs,
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ message: 'Recommendation failed', error: err.message });
  }
});

router.get('/pois', async (req, res) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'latitude and longitude required' });
    }
    const pois = await getNearbyPOIs(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
    res.json(pois);
  } catch (err) {
    res.status(500).json({ message: 'POI fetch failed', error: err.message });
  }
});

module.exports = router;
