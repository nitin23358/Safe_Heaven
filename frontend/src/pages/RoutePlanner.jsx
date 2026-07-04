import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker, { findLocationMatch } from '../components/ui/LocationPicker';
import RouteMap from '../components/map/RouteMap';
import SafetyScore from '../components/ui/SafetyScore';
import SafeZoneRecommendation from '../components/ml/SafeZoneRecommendation';
import { locationsAPI, routesAPI } from '../services/api';

export default function RoutePlanner() {
  const [locations, setLocations] = useState([]);
  const [startId, setStartId] = useState(null);
  const [endId, setEndId] = useState(null);
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendOk, setBackendOk] = useState(true);

  useEffect(() => {
    locationsAPI
      .getAll()
      .then(({ data }) => {
        setLocations(data);
        setBackendOk(true);
      })
      .catch(() => {
        setBackendOk(false);
        setError('Backend not connected. Start the backend server on port 5000.');
      });
  }, []);

  const resolveId = (id, query) => {
    if (id) return id;
    const match = findLocationMatch(query, locations);
    return match?.LocationID || null;
  };

  const handleAnalyze = async () => {
    const resolvedStart = resolveId(startId, startQuery);
    const resolvedEnd = resolveId(endId, endQuery);

    if (!resolvedStart || !resolvedEnd) {
      setError('Please select or type a valid Delhi area (e.g. Saket, Hauz Khas). Pick from the dropdown if unsure.');
      return;
    }
    if (resolvedStart === resolvedEnd) {
      setError('Start and destination must be different.');
      return;
    }

    setStartId(resolvedStart);
    setEndId(resolvedEnd);
    setError('');
    setLoading(true);
    setAnalysis(null);

    try {
      const { data } = await routesAPI.analyze(resolvedStart, resolvedEnd);
      setAnalysis(data);
      setBackendOk(true);
    } catch (err) {
      if (!err.response) {
        setBackendOk(false);
        setError('Cannot reach backend. Run: cd backend && npm start');
      } else {
        setError(err.response?.data?.message || 'Failed to analyze route.');
      }
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => {
    setStartId(endId);
    setEndId(startId);
    setStartQuery(endQuery);
    setEndQuery(startQuery);
    setAnalysis(null);
  };

  return (
    <div className="route-planner">
      <div className="page-header">
        <h2>Route Planner</h2>
        <p>Select your start point and destination to analyze path safety</p>
      </div>

      {!backendOk && (
        <div className="error-banner">
          ⚠️ Backend offline — open a terminal and run: <code>cd backend → npm start</code>
        </div>
      )}

      <div className="route-planner-layout">
        <div className="route-controls card">
          <div className="route-pickers">
            <LocationPicker
              label="Start Location"
              value={startId}
              onChange={setStartId}
              onQueryChange={setStartQuery}
              locations={locations}
              placeholder="e.g. Saket, Hauz Khas..."
            />

            <button className="swap-btn" onClick={swapLocations} title="Swap locations">
              ⇅
            </button>

            <LocationPicker
              label="Destination"
              value={endId}
              onChange={setEndId}
              onQueryChange={setEndQuery}
              locations={locations}
              placeholder="e.g. Connaught Place, Dwarka..."
            />
          </div>

          {error && backendOk && <div className="error-banner">{error}</div>}

          <motion.button
            className="btn btn-primary btn-full"
            onClick={handleAnalyze}
            disabled={loading || locations.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Analyzing Route...' : 'Analyze Path Risk'}
          </motion.button>

          <div className="risk-legend">
            <span className="legend-item"><i style={{ background: '#22c55e' }} /> Low Risk</span>
            <span className="legend-item"><i style={{ background: '#f59e0b' }} /> Moderate</span>
            <span className="legend-item"><i style={{ background: '#ef4444' }} /> High Risk</span>
          </div>
        </div>

        <AnimatePresence>
          {analysis && (
            <motion.div
              className="route-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="card route-summary-card">
                <div className="route-summary-header">
                  <div>
                    <h3>
                      {analysis.start.Area || analysis.start.Name} → {analysis.end.Area || analysis.end.Name}
                    </h3>
                    <p>{analysis.summary.totalDistanceKm} km total distance</p>
                  </div>
                  <div
                    className="risk-badge"
                    style={{ background: analysis.summary.overallRiskColor }}
                  >
                    {analysis.summary.overallRiskLabel}
                  </div>
                </div>

                {analysis.mlPrediction && (
                  <div className="route-ml-score">
                    <span>🤖 AI Route Safety Score</span>
                    <strong style={{ color: analysis.summary.overallRiskColor }}>
                      {analysis.mlPrediction.safety_score}/100
                    </strong>
                  </div>
                )}

                <SafetyScore
                  score={parseFloat(analysis.summary.overallSafetyScore)}
                  label="Overall Route Safety"
                />

                <div className="route-endpoints">
                  <div className="endpoint">
                    <span className="endpoint-label start">A</span>
                    <div>
                      <strong>{analysis.start.Area || analysis.start.Name}</strong>
                      <SafetyScore score={analysis.start.safety.safetyScore} size="sm" />
                    </div>
                  </div>
                  <div className="endpoint">
                    <span className="endpoint-label end">B</span>
                    <div>
                      <strong>{analysis.end.Area || analysis.end.Name}</strong>
                      <SafetyScore score={analysis.end.safety.safetyScore} size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {analysis.recommendation && (
                <SafeZoneRecommendation recommendation={analysis.recommendation} />
              )}

              <div className="card map-card">
                <RouteMap
                  path={analysis.path}
                  segments={analysis.segments}
                  start={analysis.start}
                  end={analysis.end}
                  safeZones={analysis.nearbySafeZones}
                />
              </div>

              <div className="card segments-card">
                <h3>Segment Analysis ({analysis.segments.length} segments)</h3>
                <div className="segments-list">
                  {analysis.segments.map((seg) => (
                    <div key={seg.segmentIndex} className="segment-item">
                      <div className="segment-risk-dot" style={{ background: seg.riskColor }} />
                      <div className="segment-info">
                        <strong>Segment {seg.segmentIndex + 1}</strong>
                        <span>Near {seg.nearestLocation}</span>
                        <span className="segment-score">Score: {seg.safetyScore.toFixed(1)}/10</span>
                      </div>
                      <span className="segment-risk-label" style={{ color: seg.riskColor }}>
                        {seg.riskLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.recommendations?.length > 0 && (
                <div className="card recommendations-card">
                  <h3>🛡️ Safety Recommendations</h3>
                  <ul>
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.nearbySafeZones?.length > 0 && (
                <div className="card safe-zones-card">
                  <h3>Nearby Safe Zones Along Route</h3>
                  <div className="mini-zones-grid">
                    {analysis.nearbySafeZones.map((zone) => (
                      <div key={zone.ListingID} className="mini-zone">
                        <span className="zone-cat">{zone.Category}</span>
                        <strong>{zone.Name}</strong>
                        <small>{zone.location_name || zone.Address}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
