const express = require('express');
const router = express.Router();
const { getAllStations, getNearestMetro, searchStations } = require('../lib/metroService');

router.get('/stations', async (req, res) => {
  try {
    const { search } = req.query;
    if (search) {
      const results = await searchStations(search);
      return res.json(results);
    }
    const stations = await getAllStations();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch metro stations', error: err.message });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'latitude and longitude required' });
    }
    const metro = await getNearestMetro(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) * 1000 : 5000
    );
    if (!metro) return res.json({ message: 'No metro station found nearby', nearest: null });
    res.json({ nearest: metro });
  } catch (err) {
    res.status(500).json({ message: 'Metro lookup failed', error: err.message });
  }
});

module.exports = router;
