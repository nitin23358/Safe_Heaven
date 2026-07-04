import { motion } from 'framer-motion';

export default function SafetyScore({ score, label = 'Safety Score', size = 'md' }) {
  const pct = Math.min(100, Math.max(0, score * 10));
  const color = score >= 7 ? '#22c55e' : score >= 4 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`safety-score safety-score--${size}`}>
      <div className="safety-score-header">
        <span className="safety-score-label">{label}</span>
        <span className="safety-score-value" style={{ color }}>
          {Number(score).toFixed(1)}/10
        </span>
      </div>
      <div className="score-bar">
        <motion.div
          className="score-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
