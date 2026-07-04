import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MLSafetyPanel from '../components/ml/MLSafetyPanel';
import SafeZoneRecommendation from '../components/ml/SafeZoneRecommendation';
import SafetyIndexPanel from '../components/ml/SafetyIndexPanel';
import NearbySafeZones from '../components/ml/NearbySafeZones';
import { locationsAPI, mlAPI } from '../services/api';
import { formatDate, renderStars } from '../utils/helpers';

export default function LocationSafety() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    locationsAPI.getAll().then(({ data }) => setLocations(data)).catch(console.error);
  }, []);

  const analyzeLocation = async (loc) => {
    setSelected(loc);
    setLoading(true);
    setAnalysis(null);
    setError('');
    try {
      const { data } = await mlAPI.analyze(loc.LocationID);
      setAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    const { data } = await locationsAPI.getAll(search.trim());
    if (data.length > 0) analyzeLocation(data[0]);
    else setError(`No Delhi area found matching "${search}"`);
  };

  const filtered = locations.filter(
    (l) =>
      l.Name.toLowerCase().includes(search.toLowerCase()) ||
      (l.Area && l.Area.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="location-safety">
      <div className="page-header">
        <h2>Delhi Safety Analyzer</h2>
        <p>Search a Delhi area → DMRC Metro + OSM POIs + Crime data → AI Safety Score + Safety Index</p>
      </div>

      <div className="search-bar card">
        <input
          type="text"
          placeholder="Try: Hauz Khas, Saket, Connaught Place..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          🤖 Analyze with AI
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="location-safety-layout">
        <div className="locations-list card">
          <h3>Delhi Areas</h3>
          <div className="loc-list-scroll">
            {(search ? filtered : locations).map((loc) => (
              <motion.button
                key={loc.LocationID}
                className={`loc-list-item ${selected?.LocationID === loc.LocationID ? 'active' : ''}`}
                onClick={() => analyzeLocation(loc)}
                whileHover={{ x: 4 }}
              >
                <strong>{loc.Area || loc.Name}</strong>
                <small>{loc.Address}</small>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="safety-details">
          {!selected && !loading && (
            <div className="empty-state card">
              <span>🤖</span>
              <p>Select a Delhi area and press Analyze to get ML safety score + safe zone recommendation</p>
            </div>
          )}

          {loading && (
            <div className="loading-inline card">
              <div className="spinner" />
              <p>Running ML model + geospatial analysis...</p>
            </div>
          )}

          {analysis && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card location-title-card">
                <h3>{analysis.location.Area || analysis.location.Name}</h3>
                <p>{analysis.location.Address}</p>
              </div>

              <SafetyIndexPanel
                safetyIndex={analysis.safetyIndex}
                nearbyRecommendations={analysis.nearbyRecommendations}
              />

              <NearbySafeZones
                nearbyRecommendations={analysis.nearbyRecommendations}
                nearbyPOIs={analysis.nearbyPOIs}
              />

              <MLSafetyPanel
                prediction={analysis.mlPrediction}
                stats={analysis.stats}
                safetipinFeatures={analysis.safetipinFeatures}
                mlFeatures={analysis.mlFeatures}
                pipeline={analysis.pipeline}
              />

              <SafeZoneRecommendation recommendation={analysis.recommendation} />

              <div className="card">
                <h4>Crime Reports ({analysis.crimeReports.length})</h4>
                {analysis.crimeReports.length === 0 ? (
                  <p className="empty-text">No crime reports.</p>
                ) : (
                  <div className="crime-list">
                    {analysis.crimeReports.map((c) => (
                      <div key={c.ReportID} className="crime-item">
                        <div className="crime-item-header">
                          <strong>{c.CrimeType}</strong>
                          <span className="severity-badge">Severity: {c.Severity}/5</span>
                        </div>
                        <p>{c.Description}</p>
                        <small>
                          {c.PoliceStation && `${c.PoliceStation} · `}
                          {formatDate(c.DateTime || `${c.CrimeDate} ${c.CrimeTime}`)} · {c.Source}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h4>Community Reviews ({analysis.reviews.length})</h4>
                {analysis.reviews.length === 0 ? (
                  <p className="empty-text">No reviews yet.</p>
                ) : (
                  <div className="review-list">
                    {analysis.reviews.map((r) => (
                      <div key={r.ReviewID} className="review-item">
                        <div className="review-item-header">
                          <span className="stars">{renderStars(r.Rating)}</span>
                          {r.Gender && <span className="gender-badge">{r.Gender}</span>}
                        </div>
                        <p>{r.ReviewText}</p>
                        <small>{formatDate(r.ReviewDate)}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
