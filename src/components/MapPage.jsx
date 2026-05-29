/**
 * CabsOnline Part 2 - Map Page (Extension Feature 1)
 * Author: [Student Name]
 * Description: Interactive map using Leaflet (OpenStreetMap tiles) that lets
 *              users click to set pickup and destination points, see nearby
 *              mock drivers, and get an estimated route distance.
 *
 * Functions:
 *   MapPage()         – main map component
 *   haversine()       – calculates distance between two lat/lng points in km
 *   ClickHandler()    – Leaflet inner component that handles map click events
 */

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SectionTitle, Card, Btn, Badge } from './UI';
import { MOCK_DRIVERS } from '../utils/api';

// Fix default Leaflet marker icons (Vite asset pipeline issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
});
const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
});
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
});

const AUCKLAND_CENTER = [-36.8509, 174.7645];

/**
 * haversine – great-circle distance in km between two [lat,lng] points
 */
function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
}

/**
 * ClickHandler – internal Leaflet component capturing map click coordinates.
 * @param {string}   mode    'pickup' | 'destination'
 * @param {Function} onPick  Callback with [lat, lng]
 */
function ClickHandler({ mode, onPick }) {
  useMapEvents({ click: e => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

/**
 * MapPage – interactive pickup/destination selector with live driver markers
 */
export default function MapPage() {
  const [mode, setMode]           = useState('pickup');   // 'pickup' | 'destination'
  const [pickup, setPickup]       = useState(null);
  const [destination, setDest]    = useState(null);
  const [showDrivers, setShowDrv] = useState(true);

  const distance = pickup && destination ? haversine(pickup, destination) : null;
  const estFare  = distance ? (3.5 + Number(distance) * 2.8).toFixed(2) : null;
  const estTime  = distance ? Math.ceil(Number(distance) / 0.5) : null;   // rough minutes

  function handleMapClick(coords) {
    if (mode === 'pickup')      setPickup(coords);
    else                        setDest(coords);
  }

  return (
    <div style={styles.page}>
      <SectionTitle sub="Click on the map to set your pickup and destination points.">
        Live Map
      </SectionTitle>

      {/* Controls */}
      <Card style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Btn variant={mode === 'pickup' ? 'primary' : 'secondary'} onClick={() => setMode('pickup')}>
          📍 Set Pickup
        </Btn>
        <Btn variant={mode === 'destination' ? 'primary' : 'secondary'} onClick={() => setMode('destination')}>
          🏁 Set Destination
        </Btn>
        <Btn variant={showDrivers ? 'secondary' : 'ghost'} onClick={() => setShowDrv(p => !p)}>
          🚖 {showDrivers ? 'Hide' : 'Show'} Drivers
        </Btn>
        {(pickup || destination) && (
          <Btn variant="ghost" onClick={() => { setPickup(null); setDest(null); }}>
            ✕ Clear
          </Btn>
        )}
        <span style={styles.modeHint}>
          Currently placing: <strong style={{ color: 'var(--accent)' }}>{mode}</strong>
        </span>
      </Card>

      {/* Map */}
      <div style={styles.mapWrap}>
        <MapContainer center={AUCKLAND_CENTER} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 14 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <ClickHandler mode={mode} onPick={handleMapClick} />

          {pickup && (
            <Marker position={pickup} icon={pickupIcon}>
              <Popup><strong>Pickup Point</strong><br/>{pickup[0].toFixed(5)}, {pickup[1].toFixed(5)}</Popup>
            </Marker>
          )}
          {destination && (
            <Marker position={destination} icon={destIcon}>
              <Popup><strong>Destination</strong><br/>{destination[0].toFixed(5)}, {destination[1].toFixed(5)}</Popup>
            </Marker>
          )}

          {pickup && destination && (
            <Polyline positions={[pickup, destination]}
              pathOptions={{ color: '#f5c518', weight: 3, dashArray: '8,6' }} />
          )}

          {showDrivers && MOCK_DRIVERS.map(d => (
            <Marker key={d.id} position={[d.lat, d.lng]} icon={driverIcon}>
              <Popup>
                <strong>{d.name}</strong><br/>
                {d.vehicle} · {d.plate}<br/>
                ETA: {d.eta} min · ⭐ {d.rating}<br/>
                {d.accessible && '♿ '}{d.quiet && '🤫 '}{d.petFriendly && '🐾 '}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Route summary */}
      {distance && (
        <Card style={{ marginTop: 20, animation: 'fadeUp .3s ease' }}>
          <h3 style={styles.summaryTitle}>Route Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryVal}>{distance} km</div>
              <div style={styles.summaryLabel}>Distance</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryVal}>~{estTime} min</div>
              <div style={styles.summaryLabel}>Estimated Time</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryVal}>${estFare}</div>
              <div style={styles.summaryLabel}>Est. Fare (NZD)</div>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div style={styles.legend}>
        <span>📍 Pickup</span>
        <span>🏁 Destination</span>
        <span>🟢 Nearby Drivers</span>
      </div>
    </div>
  );
}

const styles = {
  page:        { maxWidth: 900, margin: '0 auto', padding: '36px 20px', animation: 'fadeUp .4s ease' },
  mapWrap:     { height: 460, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' },
  modeHint:    { fontSize: 13, color: 'var(--text2)', marginLeft: 'auto' },
  summaryTitle:{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  summaryItem: { textAlign: 'center', padding: '16px', background: 'var(--bg3)', borderRadius: 10 },
  summaryVal:  { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--accent)' },
  summaryLabel:{ fontSize: 12, color: 'var(--text2)', marginTop: 4 },
  legend:      { display: 'flex', gap: 24, marginTop: 16, fontSize: 13, color: 'var(--text2)', justifyContent: 'center' },
};
