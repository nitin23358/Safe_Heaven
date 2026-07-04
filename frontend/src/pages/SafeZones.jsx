import { useEffect, useState } from 'react';
import { safeZonesAPI } from '../services/api';

const CATEGORIES = ['', 'Café', 'Hostel', 'Police Station', 'Public Restroom', 'Others'];

export default function SafeZones() {
  const [zones, setZones] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const loadZones = async (cat = '') => {
    setLoading(true);
    try {
      const { data } = cat
        ? await safeZonesAPI.getByCategory(cat)
        : await safeZonesAPI.getAll();
      setZones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  return (
    <div className="safe-zones-page">
      <div className="page-header">
        <h2>Verified Safe Zones</h2>
        <p>Women-friendly cafés, hostels, police stations, and more</p>
      </div>

      <div className="filters-bar card">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            loadZones(e.target.value);
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={() => { setCategory(''); loadZones(); }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-inline"><div className="spinner" /></div>
      ) : zones.length === 0 ? (
        <div className="empty-state card"><p>No safe zones found.</p></div>
      ) : (
        <div className="zones-grid">
          {zones.map((zone) => (
            <div key={zone.ListingID} className="zone-card card">
              <div className="zone-header">
                <h3>{zone.Name}</h3>
                <span className="category-badge">{zone.Category}</span>
              </div>
              <p><strong>Location:</strong> {zone.location_name}</p>
              <p><strong>Address:</strong> {zone.Address}</p>
              {zone.ContactInfo && <p><strong>Contact:</strong> {zone.ContactInfo}</p>}
              <div className={`verification-badge ${zone.VerificationStatus ? 'verified' : 'unverified'}`}>
                {zone.VerificationStatus ? '✓ Verified' : 'Unverified'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
