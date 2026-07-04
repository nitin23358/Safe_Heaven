import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import LocationSafety from './pages/LocationSafety';
import CrimeReports from './pages/CrimeReports';
import Reviews from './pages/Reviews';
import SafeZones from './pages/SafeZones';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/location-safety" element={<LocationSafety />} />
        <Route path="/crime-reports" element={<CrimeReports />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/safe-zones" element={<SafeZones />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
