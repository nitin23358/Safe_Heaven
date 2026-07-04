import { useState, useEffect, useRef } from 'react';

function findLocationMatch(query, locations) {
  if (!query?.trim()) return null;
  const term = query.trim().toLowerCase();

  return (
    locations.find(
      (loc) =>
        loc.Name.toLowerCase() === term ||
        loc.Area?.toLowerCase() === term ||
        loc.Name.toLowerCase().includes(term) ||
        loc.Area?.toLowerCase().includes(term)
    ) || null
  );
}

export default function LocationPicker({ label, value, onChange, locations, placeholder, onQueryChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = locations.find((l) => l.LocationID === value);

  useEffect(() => {
    if (selected) setQuery(selected.Area || selected.Name);
  }, [selected]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        resolveFromQuery(query);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, locations]);

  const resolveFromQuery = (text) => {
    const match = findLocationMatch(text, locations);
    if (match) {
      onChange(match.LocationID);
      setQuery(match.Area || match.Name);
    }
  };

  const filtered = locations.filter(
    (loc) =>
      loc.Name.toLowerCase().includes(query.toLowerCase()) ||
      loc.Area?.toLowerCase().includes(query.toLowerCase()) ||
      loc.Address?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (loc) => {
    onChange(loc.LocationID);
    setQuery(loc.Area || loc.Name);
    onQueryChange?.(loc.Area || loc.Name);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onQueryChange?.(text);
    setOpen(true);
    if (!text) {
      onChange(null);
      return;
    }
    const exact = findLocationMatch(text, locations);
    if (exact && (text.toLowerCase() === exact.Area?.toLowerCase() || text.toLowerCase() === exact.Name.toLowerCase())) {
      onChange(exact.LocationID);
    } else if (value) {
      onChange(null);
    }
  };

  return (
    <div className="location-picker" ref={ref}>
      <label className="picker-label">{label}</label>
      <div className="picker-input-wrap">
        <span className="picker-pin">📍</span>
        <input
          type="text"
          className="picker-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filtered.length > 0) {
              handleSelect(filtered[0]);
            }
          }}
        />
        {value && <span className="picker-check">✓</span>}
      </div>
      {open && filtered.length > 0 && (
        <ul className="picker-dropdown">
          {filtered.slice(0, 8).map((loc) => (
            <li key={loc.LocationID} onClick={() => handleSelect(loc)}>
              <strong>{loc.Area || loc.Name}</strong>
              <small>{loc.Name} · {loc.Address}</small>
            </li>
          ))}
        </ul>
      )}
      {open && query && filtered.length === 0 && (
        <div className="picker-empty">No matching Delhi area found</div>
      )}
    </div>
  );
}

export { findLocationMatch };
