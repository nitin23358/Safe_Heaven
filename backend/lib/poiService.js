const fs = require('fs');
const path = require('path');
const db = require('../db');
const { isDbConnected } = require('./dbStatus');
const { findNearest, haversineMeters } = require('./geospatialService');

const CACHE_DIR = path.join(__dirname, '..', 'data', 'osm_cache');
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const DEFAULT_POIS = {
  police: [
    { id: 1, name: 'Hauz Khas Police Station', category: 'Police Station', latitude: 28.5500, longitude: 77.2010, address: 'Hauz Khas, South Delhi', contact: '+91-11-2686-7890' },
    { id: 2, name: 'Malviya Nagar Police Station', category: 'Police Station', latitude: 28.5375, longitude: 77.2100, address: 'Malviya Nagar, Delhi', contact: '+91-11-2687-1000' },
    { id: 3, name: 'Saket Police Station', category: 'Police Station', latitude: 28.5250, longitude: 77.2070, address: 'Saket, South Delhi', contact: '+91-11-2656-1234' },
    { id: 4, name: 'Parliament Street Police Station', category: 'Police Station', latitude: 28.6320, longitude: 77.2170, address: 'Parliament Street, New Delhi', contact: '+91-11-2336-2222' },
    { id: 5, name: 'Lajpat Nagar Police Station', category: 'Police Station', latitude: 28.5680, longitude: 77.2435, address: 'Lajpat Nagar, Delhi', contact: '+91-11-2643-4567' },
    { id: 6, name: 'Karol Bagh Police Station', category: 'Police Station', latitude: 28.6525, longitude: 77.1915, address: 'Karol Bagh, Delhi', contact: '+91-11-2354-8901' },
    { id: 7, name: 'Dwarka South Police Station', category: 'Police Station', latitude: 28.5920, longitude: 77.0470, address: 'Dwarka, Delhi', contact: '+91-11-2808-0000' },
    { id: 8, name: 'Rohini Police Station', category: 'Police Station', latitude: 28.7500, longitude: 77.0675, address: 'Rohini, Delhi', contact: '+91-11-2755-3456' },
    { id: 9, name: 'Janakpuri Police Station', category: 'Police Station', latitude: 28.6225, longitude: 77.0885, address: 'Janakpuri, Delhi', contact: '+91-11-2550-7890' },
  ],
  cafes: [
    { id: 101, name: 'Social Hauz Khas', category: 'Cafe', latitude: 28.5490, longitude: 77.1995, address: 'Hauz Khas Village', rating: 4.2 },
    { id: 102, name: 'Blue Tokai Coffee', category: 'Cafe', latitude: 28.5595, longitude: 77.2065, address: 'Green Park, Delhi', rating: 4.5 },
    { id: 103, name: 'Starbucks Green Park', category: 'Cafe', latitude: 28.5602, longitude: 77.2072, address: 'Green Park, Delhi', rating: 4.0 },
    { id: 104, name: 'Cafe Delhi Heights', category: 'Restaurant', latitude: 28.5285, longitude: 77.2060, address: 'Malviya Nagar, Delhi', rating: 4.1 },
    { id: 105, name: 'Big Chill Cafe Saket', category: 'Cafe', latitude: 28.5240, longitude: 77.2060, address: 'Saket, Delhi', rating: 4.3 },
    { id: 106, name: 'Indian Coffee House CP', category: 'Cafe', latitude: 28.6310, longitude: 77.2160, address: 'Connaught Place', rating: 3.9 },
    { id: 107, name: 'Diggin Cafe', category: 'Cafe', latitude: 28.5510, longitude: 77.1985, address: 'Chanakyapuri area', rating: 4.4 },
    { id: 108, name: 'The Big Chill Cakery', category: 'Cafe', latitude: 28.5675, longitude: 77.2430, address: 'Lajpat Nagar', rating: 4.2 },
  ],
  hospitals: [
    { id: 201, name: 'Max Super Speciality Hospital Saket', category: 'Hospital', latitude: 28.5275, longitude: 77.2180, address: 'Press Enclave, Saket', contact: '+91-11-2651-5050' },
    { id: 202, name: 'AIIMS Delhi', category: 'Hospital', latitude: 28.5672, longitude: 77.2100, address: 'Ansari Nagar, Delhi', contact: '+91-11-2658-8500' },
    { id: 203, name: 'Safdarjung Hospital', category: 'Hospital', latitude: 28.5685, longitude: 77.2055, address: 'Safdarjung Enclave', contact: '+91-11-2670-7400' },
    { id: 204, name: 'Fortis Escorts Heart Institute', category: 'Hospital', latitude: 28.5730, longitude: 77.2740, address: 'Okhla, Delhi', contact: '+91-11-4713-5000' },
    { id: 205, name: 'BLK Max Super Speciality Hospital', category: 'Hospital', latitude: 28.6420, longitude: 77.1900, address: 'Pusa Road, Delhi', contact: '+91-11-3040-3040' },
    { id: 206, name: 'Deen Dayal Upadhyay Hospital', category: 'Hospital', latitude: 28.6510, longitude: 77.0750, address: 'Hari Nagar, Delhi', contact: '+91-11-2549-4400' },
    { id: 207, name: 'Manipal Hospital Dwarka', category: 'Hospital', latitude: 28.5980, longitude: 77.0330, address: 'Dwarka Sector 10', contact: '+91-11-4040-4040' },
    { id: 208, name: 'Ganga Ram Hospital', category: 'Hospital', latitude: 28.6385, longitude: 77.1895, address: 'Rajinder Nagar', contact: '+91-11-2575-0000' },
  ],
};

function cacheKey(lat, lng, radius) {
  return `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`;
}

function readCache(key) {
  const file = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) return data.pois;
  } catch {
    return null;
  }
  return null;
}

function writeCache(key, pois) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CACHE_DIR, `${key}.json`),
    JSON.stringify({ timestamp: Date.now(), pois })
  );
}

function mapOsmElement(el) {
  const tags = el.tags || {};
  let category = 'Others';
  if (tags.amenity === 'police') category = 'Police Station';
  else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') category = 'Hospital';
  else if (tags.amenity === 'cafe' || tags.shop === 'coffee') category = 'Cafe';
  else if (tags.amenity === 'restaurant') category = 'Restaurant';
  else if (tags.amenity === 'fast_food') category = 'Fast Food';

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;

  return {
    id: el.id,
    name: tags.name || `${category} (OSM)`,
    category,
    latitude: lat,
    longitude: lon,
    address: [tags['addr:street'], tags['addr:suburb'], 'Delhi'].filter(Boolean).join(', ') || 'Delhi',
    rating: null,
    source: 'OpenStreetMap',
  };
}

async function fetchFromOverpass(lat, lng, radiusM = 1000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="police"](around:${radiusM},${lat},${lng});
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="cafe"](around:${radiusM},${lat},${lng});
      node["amenity"="restaurant"](around:${radiusM},${lat},${lng});
      node["amenity"="fast_food"](around:${radiusM},${lat},${lng});
      node["shop"="coffee"](around:${radiusM},${lat},${lng});
    );
    out center;
  `;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'SafeHavenDelhi/1.0 (education project)',
      },
      body: `data=${encodeURIComponent(query.trim())}`,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    const data = await res.json();
    return (data.elements || []).map(mapOsmElement).filter(Boolean);
  } catch (err) {
    clearTimeout(timeout);
    console.warn('Overpass API unavailable:', err.message);
    return null;
  }
}

async function getPoliceStations() {
  if (isDbConnected()) {
    try {
      const [rows] = await db.promise().query('SELECT * FROM PoliceStation');
      if (rows.length) {
        return rows.map((r) => ({
          id: r.PoliceID,
          name: r.Name,
          category: 'Police Station',
          latitude: parseFloat(r.Latitude),
          longitude: parseFloat(r.Longitude),
          address: r.Address,
          contact: r.Contact,
        }));
      }
    } catch {
      /* fallback */
    }
  }
  return DEFAULT_POIS.police;
}

async function getHospitals() {
  if (isDbConnected()) {
    try {
      const [rows] = await db.promise().query('SELECT * FROM Hospital');
      if (rows.length) {
        return rows.map((r) => ({
          id: r.HospitalID,
          name: r.Name,
          category: 'Hospital',
          latitude: parseFloat(r.Latitude),
          longitude: parseFloat(r.Longitude),
          address: r.Address,
          contact: r.Contact,
        }));
      }
    } catch {
      /* fallback */
    }
  }
  return DEFAULT_POIS.hospitals;
}

async function getCafeRestaurants() {
  if (isDbConnected()) {
    try {
      const [rows] = await db.promise().query('SELECT * FROM CafeRestaurant');
      if (rows.length) {
        return rows.map((r) => ({
          id: r.CafeID,
          name: r.Name,
          category: r.Category,
          latitude: parseFloat(r.Latitude),
          longitude: parseFloat(r.Longitude),
          address: r.Address,
          rating: r.Rating ? parseFloat(r.Rating) : null,
        }));
      }
    } catch {
      /* fallback */
    }
  }
  return DEFAULT_POIS.cafes;
}

async function getNearbyPOIs(lat, lng, radiusM = 1000) {
  const key = cacheKey(lat, lng, radiusM);
  const cached = readCache(key);
  if (cached) return cached;

  const osmPois = await fetchFromOverpass(lat, lng, radiusM);
  if (osmPois?.length) {
    writeCache(key, osmPois);
    return osmPois;
  }

  const all = [
    ...(await getPoliceStations()),
    ...(await getCafeRestaurants()),
    ...(await getHospitals()),
  ];
  return all.filter((p) => haversineMeters(lat, lng, p.latitude, p.longitude) <= radiusM * 3);
}

async function getNearestPOIs(lat, lng) {
  const [policeList, cafeList, hospitalList] = await Promise.all([
    getPoliceStations(),
    getCafeRestaurants(),
    getHospitals(),
  ]);

  const nearbyOsm = await getNearbyPOIs(lat, lng, 1500);
  const osmPolice = nearbyOsm.filter((p) => p.category === 'Police Station');
  const osmCafes = nearbyOsm.filter((p) => ['Cafe', 'Restaurant', 'Fast Food'].includes(p.category));
  const osmHospitals = nearbyOsm.filter((p) => p.category === 'Hospital');

  const police = findNearest([...policeList, ...osmPolice], lat, lng);
  const cafe = findNearest(
    [...cafeList, ...osmCafes],
    lat,
    lng,
    (p) => ({ latitude: p.latitude, longitude: p.longitude })
  );
  const hospital = findNearest([...hospitalList, ...osmHospitals], lat, lng);

  return { police, cafe, hospital, nearbyOsm };
}

module.exports = {
  getNearbyPOIs,
  getNearestPOIs,
  getPoliceStations,
  getCafeRestaurants,
  getHospitals,
  DEFAULT_POIS,
};
