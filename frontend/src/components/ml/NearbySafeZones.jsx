import { motion } from 'framer-motion';

const CATEGORY_ICONS = {
  'Police Station': '🚔',
  'Café': '☕',
  Cafe: '☕',
  Restaurant: '🍽️',
  'Fast Food': '🍔',
  Metro: '🚇',
  Hospital: '🏥',
  Hostel: '🏨',
};

export default function NearbySafeZones({ nearbyRecommendations, nearbyPOIs }) {
  const items = [
    nearbyRecommendations?.nearestPolice && {
      ...nearbyRecommendations.nearestPolice,
      icon: '🚔',
      type: 'Police Station',
    },
    nearbyRecommendations?.nearestMetro && {
      ...nearbyRecommendations.nearestMetro,
      icon: '🚇',
      type: 'Metro Station',
    },
    nearbyRecommendations?.nearestCafe && {
      ...nearbyRecommendations.nearestCafe,
      icon: '☕',
      type: nearbyRecommendations.nearestCafe.category || 'Café',
    },
    nearbyRecommendations?.nearestHospital && {
      ...nearbyRecommendations.nearestHospital,
      icon: '🏥',
      type: 'Hospital',
    },
  ].filter(Boolean);

  const extraPois = (nearbyPOIs || [])
    .filter((p) => !items.some((i) => i.name === p.name))
    .slice(0, 6);

  if (!items.length && !extraPois.length) return null;

  return (
    <motion.div
      className="nearby-zones-card card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h3>Nearby Safe Zones</h3>
      <p className="nearby-zones-sub">Dynamically fetched · Distance + walking time</p>

      <div className="nearby-zones-grid">
        {items.map((zone) => (
          <div key={`${zone.type}-${zone.name}`} className="nearby-zone-item">
            <span className="nearby-zone-icon">{zone.icon}</span>
            <div>
              <strong>{zone.name}</strong>
              <small>{zone.type}</small>
              <div className="nearby-zone-metrics">
                <span>📍 {zone.distance}</span>
                {zone.walkTime && <span>🚶 {zone.walkTime}</span>}
                {zone.line && <span>🛤️ {zone.line}</span>}
              </div>
            </div>
          </div>
        ))}

        {extraPois.map((poi) => (
          <div key={`poi-${poi.id}-${poi.name}`} className="nearby-zone-item osm">
            <span className="nearby-zone-icon">
              {CATEGORY_ICONS[poi.category] || '📍'}
            </span>
            <div>
              <strong>{poi.name}</strong>
              <small>{poi.category}{poi.source ? ` · ${poi.source}` : ''}</small>
              {poi.address && <div className="nearby-zone-metrics"><span>{poi.address}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
