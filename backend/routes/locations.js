const express = require('express');
const router = express.Router();
const db = require('../db');
const { isDbConnected } = require('../lib/dbStatus');
const mockData = require('../lib/mockData');

router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(mockData.getLocations(req.query.search));
    }

    let query = 'SELECT * FROM Location';
    const params = [];

    if (req.query.search) {
      query += ' WHERE Name LIKE ?';
      params.push(`%${req.query.search}%`);
    }

    const [locations] = await db.promise().query(query, params);
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.json(mockData.getLocations(req.query.search));
  }
});

router.get('/top-rated', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(mockData.getTopRatedLocations());
    }

    const query = `
      SELECT L.*, AVG(R.Rating) AS AvgRating
      FROM Location L
      JOIN Review R ON L.LocationID = R.LocationID
      GROUP BY L.LocationID
      ORDER BY AvgRating DESC
      LIMIT 5
    `;

    const [locations] = await db.promise().query(query);
    locations.forEach((location) => {
      location.AvgRating = parseFloat(location.AvgRating).toFixed(1);
    });

    res.json(locations);
  } catch (error) {
    console.error(error);
    res.json(mockData.getTopRatedLocations());
  }
});

router.get('/:id/safety', async (req, res) => {
  try {
    const locationId = req.params.id;

    if (!isDbConnected()) {
      const location = mockData.getLocationById(locationId);
      if (!location) return res.status(404).json({ message: 'Location not found' });
      const safety = mockData.calcSafetyScore(locationId);
      return res.json({ location, ...safety });
    }

    const [locations] = await db.promise().query(
      'SELECT * FROM Location WHERE LocationID = ?',
      [locationId]
    );

    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
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
    const reviewScore = reviews.reduce((acc, review) => acc + review.Rating, 0) / reviews.length || 0;
    const safetyScore = Math.max(0, 10 - crimePenalty + (reviewScore - 3));

    const [avgRatingResult] = await db.promise().query(
      'SELECT AVG(Rating) AS AvgRating FROM Review WHERE LocationID = ?',
      [locationId]
    );

    const avgRating = parseFloat(avgRatingResult[0].AvgRating) || 0;

    res.json({
      location: locations[0],
      crimeReports,
      reviews,
      safetyScore: Math.min(10, Math.max(0, safetyScore)),
      avgRating: avgRating.toFixed(1),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const location = mockData.getLocationById(req.params.id);
      if (!location) return res.status(404).json({ message: 'Location not found' });
      return res.json(location);
    }

    const [locations] = await db.promise().query(
      'SELECT * FROM Location WHERE LocationID = ?',
      [req.params.id]
    );

    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(locations[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    if (!isDbConnected()) {
      return res.status(201).json({
        id: mockData.locations.length + 1,
        name,
        address: address || 'Unknown Address',
        latitude: latitude || 0,
        longitude: longitude || 0,
      });
    }

    const safeAddress = address || 'Unknown Address';
    const safeLatitude = latitude || 0;
    const safeLongitude = longitude || 0;

    const [result] = await db.promise().query(
      'INSERT INTO Location (Name, Address, Latitude, Longitude) VALUES (?, ?, ?, ?)',
      [name, safeAddress, safeLatitude, safeLongitude]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      address,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
