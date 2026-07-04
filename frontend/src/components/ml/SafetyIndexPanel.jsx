import { motion } from 'framer-motion';

function ScoreRing({ value, max = 100, label, color }) {
  return (
    <div className="safety-index-metric">
      <div className="safety-index-ring" style={{ '--ring-color': color }}>
        <strong>{value}</strong>
        {max !== 100 && <small>/{max}</small>}
      </div>
      <span>{label}</span>
    </div>
  );
}

function ProximityCard({ icon, title, item }) {
  if (!item) return null;
  return (
    <div className="proximity-card">
      <span className="proximity-icon">{icon}</span>
      <div>
        <strong>{item.name}</strong>
        <small>
          {item.line && `${item.line} · `}
          {item.distance}
          {item.walkTime && ` · ${item.walkTime}`}
          {item.category && ` · ${item.category}`}
          {item.rating && ` · ★ ${item.rating}`}
        </small>
      </div>
    </div>
  );
}

export default function SafetyIndexPanel({ safetyIndex, nearbyRecommendations }) {
  if (!safetyIndex) return null;

  const overallColor =
    safetyIndex.overallSafety >= 75 ? '#22c55e' : safetyIndex.overallSafety >= 55 ? '#f59e0b' : '#ef4444';

  const nearby = nearbyRecommendations || {
    nearestMetro: safetyIndex.nearestMetro,
    nearestPolice: safetyIndex.nearestPolice,
    nearestCafe: safetyIndex.nearestCafe,
    nearestHospital: safetyIndex.nearestHospital,
  };

  return (
    <motion.div
      className="safety-index-panel card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="safety-index-header">
        <div>
          <span className="rec-badge">📊 Safety Index</span>
          <h3>{safetyIndex.area}</h3>
          <p className="safety-index-sub">Real metro data + geospatial POI analysis</p>
        </div>
        <div className="overall-safety-badge" style={{ background: overallColor }}>
          <strong>{safetyIndex.overallSafety}</strong>
          <span>/100 Overall</span>
        </div>
      </div>

      <div className="safety-index-grid">
        <ScoreRing value={safetyIndex.crimeScore} label="Crime Score" color="#6366f1" />
        <ScoreRing value={safetyIndex.lightingScore} label="Lighting Score" color="#f59e0b" />
        <div className="safety-index-metric">
          <div className="safety-index-ring crowd" style={{ '--ring-color': '#8b5cf6' }}>
            <strong>{safetyIndex.crowdDensity}</strong>
          </div>
          <span>Crowd Density</span>
        </div>
      </div>

      <div className="proximity-section">
        <h4>Nearby Safe Zones (Haversine distance)</h4>
        <div className="proximity-grid">
          <ProximityCard icon="🚇" title="Metro" item={nearby.nearestMetro} />
          <ProximityCard icon="🚔" title="Police" item={nearby.nearestPolice} />
          <ProximityCard icon="☕" title="Café" item={nearby.nearestCafe} />
          <ProximityCard icon="🏥" title="Hospital" item={nearby.nearestHospital} />
        </div>
      </div>
    </motion.div>
  );
}
