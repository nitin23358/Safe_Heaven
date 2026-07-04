import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeatureCard from '../components/ui/FeatureCard';
import SafetyScore from '../components/ui/SafetyScore';
import { locationsAPI } from '../services/api';
import { renderStars } from '../utils/helpers';

export default function Dashboard() {
  const [topLocations, setTopLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    locationsAPI
      .getTopRated()
      .then(({ data }) => setTopLocations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const features = [
    {
      icon: '🗺️',
      title: 'Plan Safe Route',
      description: 'Select start & destination, get path risk analysis',
      path: '/route-planner',
      color: '#6366f1',
    },
    {
      icon: '📍',
      title: 'Location Safety',
      description: 'Check safety scores for any location',
      path: '/location-safety',
      color: '#ff6b6b',
    },
    {
      icon: '🚨',
      title: 'Crime Reports',
      description: 'Browse recent crime reports',
      path: '/crime-reports',
      color: '#ef4444',
    },
    {
      icon: '📝',
      title: 'Community Reviews',
      description: 'Read and submit safety reviews',
      path: '/reviews',
      color: '#f59e0b',
    },
    {
      icon: '🏪',
      title: 'Safe Zones',
      description: 'Find verified women-friendly places',
      path: '/safe-zones',
      color: '#22c55e',
    },
  ];

  return (
    <div className="dashboard">
      <motion.section
        className="welcome-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2>Welcome to SafeHaven Delhi</h2>
          <p>AI-powered safety scores using Delhi Police data, Safetipin features & community reviews.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/route-planner')}>
          Plan a Route →
        </button>
      </motion.section>

      <section className="features-grid">
        {features.map((f, i) => (
          <motion.div
            key={f.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <FeatureCard
              icon={f.icon}
              title={f.title}
              description={f.description}
              color={f.color}
              onClick={() => navigate(f.path)}
            />
          </motion.div>
        ))}
      </section>

      <section className="top-rated-section">
        <h2>Top Rated Safe Locations</h2>
        {loading ? (
          <div className="loading-inline"><div className="spinner small" /></div>
        ) : (
          <div className="top-rated-grid">
            {topLocations.map((loc) => (
              <motion.div
                key={loc.LocationID}
                className="location-card"
                whileHover={{ y: -4 }}
                onClick={() => navigate('/location-safety')}
              >
                <h3>{loc.Name}</h3>
                <div className="rating-row">
                  <span className="stars">{renderStars(loc.AvgRating)}</span>
                  <span className="rating-val">{loc.AvgRating}/5</span>
                </div>
                <p>{loc.Address}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="quick-stats">
        <div className="stat-card">
          <span className="stat-icon">🛡️</span>
          <div>
            <strong>Route Analysis</strong>
            <p>Segment-by-segment risk scoring along your path</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🌙</span>
          <div>
            <strong>Night Safety</strong>
            <p>Crime patterns help you plan safer evening travel</p>
          </div>
        </div>
        <SafetyScore score={8.2} label="Platform Trust Score" size="sm" />
      </section>
    </div>
  );
}
