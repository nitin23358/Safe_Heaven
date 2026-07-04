import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/route-planner', icon: '🗺️', label: 'Route Planner' },
  { to: '/location-safety', icon: '📍', label: 'Location Safety' },
  { to: '/crime-reports', icon: '🚨', label: 'Crime Reports' },
  { to: '/reviews', icon: '📝', label: 'Reviews' },
  { to: '/safe-zones', icon: '🏪', label: 'Safe Zones' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text">SafeHaven</span>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="profile">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="profile-info">
            <span className="profile-name">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
            <span className="profile-email">{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
