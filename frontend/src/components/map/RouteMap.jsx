import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const startIcon = new L.DivIcon({
  className: 'custom-marker start-marker',
  html: '<div class="marker-pin start">A</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = new L.DivIcon({
  className: 'custom-marker end-marker',
  html: '<div class="marker-pin end">B</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function RouteMap({ path, segments, start, end, safeZones = [] }) {
  if (!path || path.length === 0) return null;

  const center = [
    (start.Latitude + end.Latitude) / 2,
    (start.Longitude + end.Longitude) / 2,
  ];

  return (
    <div className="route-map">
      <MapContainer center={center} zoom={3} className="leaflet-map" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[start.Latitude, start.Longitude]} icon={startIcon}>
          <Popup>
            <strong>Start: {start.Name}</strong>
            <br />
            {start.Address}
          </Popup>
        </Marker>

        <Marker position={[end.Latitude, end.Longitude]} icon={endIcon}>
          <Popup>
            <strong>Destination: {end.Name}</strong>
            <br />
            {end.Address}
          </Popup>
        </Marker>

        {segments?.map((seg, i) => (
          <Polyline
            key={i}
            positions={[
              [seg.from.lat, seg.from.lng],
              [seg.to.lat, seg.to.lng],
            ]}
            pathOptions={{ color: seg.riskColor, weight: 6, opacity: 0.85 }}
          />
        ))}

        {safeZones.map((zone) => (
          <CircleMarker
            key={zone.ListingID}
            center={[zone.Latitude, zone.Longitude]}
            radius={8}
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.7 }}
          >
            <Popup>
              <strong>{zone.Name}</strong> ({zone.Category})
              <br />
              {zone.location_name}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
