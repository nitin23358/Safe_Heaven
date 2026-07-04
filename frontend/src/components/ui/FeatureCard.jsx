import { motion } from 'framer-motion';

export default function FeatureCard({ icon, title, description, onClick, color }) {
  return (
    <motion.button
      className="feature-card"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{ '--accent': color }}
    >
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </motion.button>
  );
}
