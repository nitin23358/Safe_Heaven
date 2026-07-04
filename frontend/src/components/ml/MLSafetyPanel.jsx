import { motion } from 'framer-motion';

function getScoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

export default function MLSafetyPanel({ prediction, stats, safetipinFeatures, mlFeatures, pipeline }) {
  if (!prediction) return null;

  const color = getScoreColor(prediction.safety_score);

  return (
    <motion.div
      className="ml-panel card"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="ml-panel-header">
        <div>
          <span className="ml-badge">🤖 AI Safety Analysis</span>
          <h3>ML Safety Score</h3>
          <p className="ml-model">Model: {prediction.model_used}</p>
        </div>
        <div className="ml-score-ring" style={{ '--score-color': color }}>
          <span className="ml-score-value">{prediction.safety_score}</span>
          <span className="ml-score-max">/100</span>
        </div>
      </div>

      <div className="ml-risk-row">
        <span className="risk-pill" style={{ background: color }}>
          {prediction.risk_level} Risk
        </span>
        <span className="ml-confidence">Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
      </div>

      <div className="ml-stats-grid">
        <div className="ml-stat">
          <strong>{stats?.crimeCount || 0}</strong>
          <span>Crime Reports</span>
        </div>
        <div className="ml-stat">
          <strong>{stats?.nightCrimeCount || 0}</strong>
          <span>Night Crimes</span>
        </div>
        <div className="ml-stat">
          <strong>{stats?.avgRating || '—'}</strong>
          <span>Avg Rating</span>
        </div>
        <div className="ml-stat">
          <strong>{stats?.womenReviewCount || 0}</strong>
          <span>Women Reviews</span>
        </div>
      </div>

      {safetipinFeatures && (
        <div className="safetipin-section">
          <h4>Safetipin Environmental Features</h4>
          <div className="feature-bars">
            {[
              ['Lighting', safetipinFeatures.LightingScore],
              ['Walkability', safetipinFeatures.Walkability],
              ['Visibility', safetipinFeatures.Visibility],
              ['Public Transport', safetipinFeatures.PublicTransport],
              ['People Density', safetipinFeatures.PeopleDensity],
              ['Security Feeling', safetipinFeatures.SecurityFeeling],
            ].map(([label, val]) => (
              <div key={label} className="feature-bar-row">
                <span>{label}</span>
                <div className="feature-bar">
                  <div className="feature-bar-fill" style={{ width: `${val * 10}%` }} />
                </div>
                <span>{val}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prediction.feature_breakdown && (
        <div className="ml-breakdown">
          <h4>Feature Impact</h4>
          <div className="breakdown-grid">
            {Object.entries(prediction.feature_breakdown).map(([key, val]) => (
              <div key={key} className="breakdown-item">
                <span>{key.replace(/_/g, ' ')}</span>
                <strong>{val}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {pipeline && (
        <div className="ml-pipeline">
          <h4>Analysis Pipeline</h4>
          <div className="pipeline-steps">
            {pipeline.map((step, i) => (
              <div key={step} className="pipeline-step">
                {i > 0 && <span className="pipeline-arrow">↓</span>}
                <span className="pipeline-node">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
