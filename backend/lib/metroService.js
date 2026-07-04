const fs = require('fs');
const path = require('path');
const db = require('../db');
const { isDbConnected } = require('./dbStatus');
const { findNearest } = require('./geospatialService');

let cachedStations = null;

function loadFromJson() {
  if (cachedStations) return cachedStations;
  const jsonPath = path.join(__dirname, '..', 'data', 'metro_stations.json');
  if (!fs.existsSync(jsonPath)) {
    cachedStations = [];
    return cachedStations;
  }
  cachedStations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  return cachedStations;
}

async function getAllStations() {
  if (isDbConnected()) {
    try {
      const [rows] = await db.promise().query('SELECT * FROM MetroStation ORDER BY StationName');
      if (rows.length > 0) {
        return rows.map((r) => ({
          station_id: r.StationID,
          station_name: r.StationName,
          line: r.Line,
          latitude: parseFloat(r.Latitude),
          longitude: parseFloat(r.Longitude),
          address: r.Address,
        }));
      }
    } catch {
      /* fall through to JSON */
    }
  }
  return loadFromJson();
}

async function getNearestMetro(lat, lng, maxDistanceM = 5000) {
  const stations = await getAllStations();
  const nearest = findNearest(
    stations,
    lat,
    lng,
    (s) => ({ latitude: s.latitude, longitude: s.longitude })
  );
  if (!nearest || nearest.distanceMeters > maxDistanceM) return null;
  return {
    station_id: nearest.station_id,
    name: nearest.station_name,
    line: nearest.line,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
    address: nearest.address,
    distanceMeters: nearest.distanceMeters,
    distance: nearest.distance,
    walkMinutes: nearest.walkMinutes,
    walkTime: nearest.walkTime,
  };
}

async function searchStations(query) {
  const term = query.toLowerCase();
  const stations = await getAllStations();
  return stations.filter((s) => s.station_name.toLowerCase().includes(term)).slice(0, 20);
}

module.exports = {
  getAllStations,
  getNearestMetro,
  searchStations,
  loadFromJson,
};
