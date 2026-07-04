import { useTheme } from '../../context/ThemeContext';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 className="page-title">Stay Safe, Stay Informed</h1>
      </div>
      <div className="top-bar-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
