import { motion } from 'framer-motion';

const CATEGORY_ICONS = {
  'Police Station': '🚔',
  'Café': '☕',
  Metro: '🚇',
  Hostel: '🏨',
};

export default function SafeZoneRecommendation({ recommendation }) {
  if (!recommendation?.recommended) return null;

  const { recommended, alternatives } = recommendation;

  return (
    <motion.div
      className="recommendation-card card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="rec-header">
        <span className="rec-badge">🛡️ Recommended Safe Zone</span>
        <h3>{recommended.name}</h3>
        <p className="rec-category">
          {CATEGORY_ICONS[recommended.category] || '📍'} {recommended.category}
        </p>
      </div>

      <div className="rec-metrics">
        <div className="rec-metric highlight">
          <span className="rec-metric-icon">📍</span>
          <div>
            <strong>{recommended.distanceLabel}</strong>
            <small>Distance from your location</small>
          </div>
        </div>
        <div className="rec-metric highlight">
          <span className="rec-metric-icon">🚶</span>
          <div>
            <strong>Estimated Safe Route: {recommended.estimatedRouteLabel}</strong>
            <small>Walking time to safe zone</small>
          </div>
        </div>
      </div>

      {recommended.address && (
        <p className="rec-address">{recommended.address}</p>
      )}

      {alternatives?.length > 0 && (
        <div className="rec-alternatives">
          <h4>Nearby Safe Zones by Category</h4>
          <div className="alt-grid">
            {alternatives.map((alt) => (
              <div key={`${alt.category}-${alt.name}`} className="alt-item">
                <span>{CATEGORY_ICONS[alt.category] || '📍'}</span>
                <div>
                  <strong>{alt.name}</strong>
                  <small>{alt.category} · {alt.distanceLabel}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
