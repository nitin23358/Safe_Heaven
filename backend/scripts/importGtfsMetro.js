/**
 * Parses DMRC GTFS feeds and generates metro_stations.json + SQL seed.
 * Run: node backend/scripts/importGtfsMetro.js
 */
const fs = require('fs');
const path = require('path');

const GTFS_DIR = path.join(__dirname, '..', '..', '..', '..', 'DMRC_GTFS');
const OUT_JSON = path.join(__dirname, '..', 'data', 'metro_stations.json');
const OUT_SQL = path.join(__dirname, '..', '..', 'db-mysql', 'metro_stations_data.sql');

const LINE_COLORS = {
  YELLOW: 'Yellow',
  BLUE: 'Blue',
  RED: 'Red',
  GREEN: 'Green',
  VIOLET: 'Violet',
  PINK: 'Pink',
  MAGENTA: 'Magenta',
  ORANGE: 'Orange',
  AQUA: 'Aqua',
  GRAY: 'Gray',
  RAPID: 'Rapid Metro',
};

function parseCsv(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() || '';
    });
    return row;
  });
}

function extractLineName(routeLongName) {
  const upper = routeLongName.toUpperCase();
  for (const [key, label] of Object.entries(LINE_COLORS)) {
    if (upper.startsWith(key) || upper.includes(`${key}_`) || upper.includes(`${key}/`)) {
      return label;
    }
  }
  const match = routeLongName.match(/^([A-Z]+)/);
  if (match && LINE_COLORS[match[1]]) return LINE_COLORS[match[1]];
  return routeLongName.split('_')[0] || 'Unknown';
}

function main() {
  const stops = parseCsv(fs.readFileSync(path.join(GTFS_DIR, 'stops.txt'), 'utf8'));
  const routes = parseCsv(fs.readFileSync(path.join(GTFS_DIR, 'routes.txt'), 'utf8'));
  const trips = parseCsv(fs.readFileSync(path.join(GTFS_DIR, 'trips.txt'), 'utf8'));
  const stopTimes = parseCsv(fs.readFileSync(path.join(GTFS_DIR, 'stop_times.txt'), 'utf8'));

  const routeToLine = {};
  routes.forEach((r) => {
    routeToLine[r.route_id] = extractLineName(r.route_long_name || r.route_short_name || '');
  });

  const tripToRoute = {};
  trips.forEach((t) => {
    tripToRoute[t.trip_id] = t.route_id;
  });

  const stopLines = {};
  stopTimes.forEach((st) => {
    const routeId = tripToRoute[st.trip_id];
    if (!routeId) return;
    const line = routeToLine[routeId];
    if (!line || line === 'Unknown') return;
    const sid = st.stop_id;
    if (!stopLines[sid]) stopLines[sid] = new Set();
    stopLines[sid].add(line);
  });

  const stations = stops
    .filter((s) => s.stop_lat && s.stop_lon && !s.stop_name.includes('(Rapid Metro)'))
    .map((s) => {
      const lines = stopLines[s.stop_id]
        ? [...stopLines[s.stop_id]].sort().join(' + ')
        : 'Unknown';
      const cleanName = s.stop_name.replace(/\s*\(.*\)$/, '').trim();
      return {
        station_id: parseInt(s.stop_id, 10),
        station_name: cleanName,
        line: lines,
        latitude: parseFloat(s.stop_lat),
        longitude: parseFloat(s.stop_lon),
        address: `${cleanName}, Delhi Metro, Delhi`,
      };
    })
    .sort((a, b) => a.station_id - b.station_id);

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(stations, null, 2));

  const sqlLines = [
    '-- DMRC GTFS Metro Stations (auto-generated)',
    'USE project;',
    '',
    'CREATE TABLE IF NOT EXISTS MetroStation (',
    '    StationID INT PRIMARY KEY,',
    '    StationName VARCHAR(150) NOT NULL,',
    '    Line VARCHAR(100) NOT NULL,',
    '    Latitude DECIMAL(9,6) NOT NULL,',
    '    Longitude DECIMAL(9,6) NOT NULL,',
    '    Address TEXT',
    ');',
    '',
    'TRUNCATE TABLE MetroStation;',
    '',
  ];

  stations.forEach((s) => {
    const addr = s.address.replace(/'/g, "''");
    const name = s.station_name.replace(/'/g, "''");
    const line = s.line.replace(/'/g, "''");
    sqlLines.push(
      `INSERT INTO MetroStation (StationID, StationName, Line, Latitude, Longitude, Address) VALUES (${s.station_id}, '${name}', '${line}', ${s.latitude}, ${s.longitude}, '${addr}');`
    );
  });

  fs.writeFileSync(OUT_SQL, sqlLines.join('\n'));
  console.log(`Imported ${stations.length} metro stations`);
  console.log(`JSON: ${OUT_JSON}`);
  console.log(`SQL:  ${OUT_SQL}`);
}

main();
