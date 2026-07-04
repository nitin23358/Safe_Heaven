const express = require('express');
const router = express.Router();
const db = require('../db');
const { isDbConnected } = require('../lib/dbStatus');
const mockData = require('../lib/mockData');

router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      let reports = mockData.crimeReports.map((cr) => {
        const loc = mockData.getLocationById(cr.LocationID);
        return { ...cr, location_name: loc?.Name || 'Unknown' };
      });
      if (req.query.search) {
        const term = req.query.search.toLowerCase();
        reports = reports.filter(
          (r) =>
            r.CrimeType.toLowerCase().includes(term) ||
            (r.location_name && r.location_name.toLowerCase().includes(term))
        );
      }
      return res.json(reports);
    }

    let query = `
      SELECT cr.*, l.Name AS location_name
      FROM CrimeReport cr
      JOIN Location l ON cr.LocationID = l.LocationID
    `;
    const params = [];

    if (req.query.search) {
      query += ` WHERE cr.CrimeType LIKE ? OR l.Name LIKE ?`;
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    const [reports] = await db.promise().query(query, params);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.json(mockData.crimeReports);
  }
});

// Get crime reports for a specific location ID
router.get('/location/:locationId', async (req, res) => {
  try {
    const [reports] = await db.promise().query(
      'SELECT * FROM CrimeReport WHERE LocationID = ?',
      [req.params.locationId]
    );
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new crime report
router.post('/', async (req, res) => {
  try {
    const { locationId, crimeType, description, source } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO CrimeReport (LocationID, CrimeType, Description, Source) VALUES (?, ?, ?, ?)',
      [locationId, crimeType, description, source]
    );

    res.status(201).json({
      id: result.insertId,
      locationId,
      crimeType,
      description,
      source
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get crime statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalReports] = await db.promise().query(
      'SELECT COUNT(*) as total FROM CrimeReport'
    );

    const [crimeTypes] = await db.promise().query(
      'SELECT CrimeType, COUNT(*) as count FROM CrimeReport GROUP BY CrimeType'
    );

    const [timeDistribution] = await db.promise().query(
      'SELECT HOUR(DateTime) as hour, COUNT(*) as count FROM CrimeReport GROUP BY HOUR(DateTime)'
    );

    res.json({
      totalReports: totalReports[0].total,
      crimeTypes,
      timeDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
