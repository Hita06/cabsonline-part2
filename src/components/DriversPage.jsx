/**
 * CabsOnline Part 2 - Driver Query Page (Extension Feature 2)
 * Author: [Student Name]
 * Description: Allows customers and admins to query available drivers,
 *              filter by ride preferences, and view driver profiles with
 *              ratings, vehicle info, and ETA estimates.
 *
 * Functions:
 *   DriversPage()   – main component
 *   fetchDrivers()  – calls queryDrivers() API utility with active filters
 *   DriverCard()    – renders a single driver profile card
 */

import { useState } from 'react';
import { queryDrivers } from '../utils/api';
import { SectionTitle, Card, Btn, Spinner } from './UI';
import { Star, Clock, Car, Phone } from 'lucide-react';

/**
 * DriverCard – displays one driver's information
 * @param {Object} driver  Driver data object from MOCK_DRIVERS
 * @param {Function} onSelect  Callback when "Request Driver" is clicked
 */
function DriverCard({ driver, onSelect, selected }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(driver.rating));
  return (
    <div style={{ ...styles.card, ...(selected ? styles.cardSelected : {}) }}>
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>{driver.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
        <div>
          <div style={styles.driverName}>{driver.name}</div>
          <div style={styles.driverId}>{driver.id}</div>
          <div style={styles.stars}>
            {stars.map((f, i) => <span key={i} style={{ color: f ? '#f5c518' : 'var(--text3)' }}>★</span>)}
            <span style={styles.ratingNum}>{driver.rating}</span>
          </div>
        </div>
        <div style={styles.etaBadge}>
          <Clock size={13} />
          <span>{driver.eta} min</span>
        </div>
      </div>

      <div style={styles.vehicleRow}>
        <Car size={14} style={{ color: 'var(--text3)' }} />
        <span>{driver.vehicle}</span>
        <span style={styles.plate}>{driver.plate}</span>
      </div>

      <div style={styles.prefTags}>
        {driver.accessible  && <span style={styles.tag}>♿ Accessible</span>}
        {driver.quiet       && <span style={styles.tag}>🤫 Quiet</span>}
        {driver.petFriendly && <span style={styles.tag}>🐾 Pet OK</span>}
        {driver.acAvailable && <span style={styles.tag}>❄️ AC</span>}
        {driver.musicGenres.map(g => (
          <span key={g} style={{ ...styles.tag, background: 'rgba(78,205,196,.1)', color: 'var(--accent3)' }}>🎵 {g}</span>
        ))}
      </div>

      <Btn
        variant={selected ? 'primary' : 'secondary'}
        style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
        onClick={() => onSelect(driver)}>
        {selected ? '✓ Selected' : 'Request This Driver'}
      </Btn>
    </div>
  );
}

/**
 * DriversPage – filter and query available drivers
 */
export default function DriversPage() {
  const [filters, setFilters] = useState({
    accessible: false, quiet: false, petFriendly: false, acRequired: false,
  });
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  function toggleFilter(k) {
    setFilters(p => ({ ...p, [k]: !p[k] }));
    setResults(null);
    setSelected(null);
  }

  async function fetchDrivers() {
    setLoading(true);
    setConfirmed(false);
    try {
      const data = await queryDrivers(filters);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  function confirmDriver(d) {
    setSelected(d.id);
    setTimeout(() => setConfirmed(true), 300);
  }

  const FILTER_OPTIONS = [
    { key: 'accessible',  emoji: '♿', label: 'Wheelchair Accessible' },
    { key: 'quiet',       emoji: '🤫', label: 'Quiet / Low Conversation' },
    { key: 'petFriendly', emoji: '🐾', label: 'Pet Friendly' },
    { key: 'acRequired',  emoji: '❄️', label: 'Air Conditioning' },
  ];

  return (
    <div style={styles.page}>
      <SectionTitle sub="Find a driver that matches your accessibility and comfort preferences.">
        Find the Right Driver
      </SectionTitle>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={styles.filterTitle}>Filter by Preferences</h3>
        <div style={styles.filterGrid}>
          {FILTER_OPTIONS.map(({ key, emoji, label }) => (
            <button key={key} type="button"
              onClick={() => toggleFilter(key)}
              style={{ ...styles.filterChip, ...(filters[key] ? styles.filterChipOn : {}) }}>
              <span>{emoji}</span>
              <span>{label}</span>
              {filters[key] && <span style={styles.tick}>✓</span>}
            </button>
          ))}
        </div>
        <Btn variant="primary" style={{ marginTop: 20 }} onClick={fetchDrivers} disabled={loading}>
          {loading ? <><Spinner size={15}/> Searching…</> : '🔍 Search Drivers'}
        </Btn>
      </Card>

      {confirmed && selected && (
        <div style={styles.confirmBanner}>
          ✅ Driver <strong>{results?.find(d => d.id === selected)?.name}</strong> has been requested!
          Your driver will arrive in approximately <strong>{results?.find(d => d.id === selected)?.eta} minutes</strong>.
        </div>
      )}

      {results !== null && !confirmed && (
        <>
          <p style={styles.resultCount}>
            {results.length === 0
              ? 'No drivers match your preferences. Try adjusting the filters.'
              : `${results.length} driver${results.length !== 1 ? 's' : ''} available near you`}
          </p>
          <div style={styles.grid}>
            {results.map(d => (
              <DriverCard key={d.id} driver={d}
                selected={selected === d.id}
                onSelect={confirmDriver} />
            ))}
          </div>
        </>
      )}

      {results === null && !loading && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🚖</div>
          <p>Set your preferences and click Search Drivers to see available cabs near you.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:          { maxWidth: 900, margin: '0 auto', padding: '36px 20px', animation: 'fadeUp .4s ease' },
  filterTitle:   { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 },
  filterGrid:    { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  filterChip:    { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', cursor: 'pointer', fontSize: 14, color: 'var(--text)', transition: 'all .18s', position: 'relative' },
  filterChipOn:  { borderColor: 'var(--accent)', background: 'rgba(245,197,24,.08)' },
  tick:          { marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700 },
  resultCount:   { fontSize: 14, color: 'var(--text2)', marginBottom: 16 },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card:          { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color .2s' },
  cardSelected:  { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' },
  cardHeader:    { display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatar:        { width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', color: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 18, flexShrink: 0 },
  driverName:    { fontWeight: 600, fontSize: 15 },
  driverId:      { fontSize: 12, color: 'var(--text3)', marginTop: 2 },
  stars:         { display: 'flex', alignItems: 'center', gap: 2, marginTop: 4, fontSize: 13 },
  ratingNum:     { fontSize: 12, color: 'var(--text2)', marginLeft: 4 },
  etaBadge:      { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,197,24,.12)', color: 'var(--accent)', padding: '5px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, flexShrink: 0 },
  vehicleRow:    { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' },
  plate:         { marginLeft: 'auto', fontFamily: 'monospace', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: 'var(--text)' },
  prefTags:      { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag:           { fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,.05)', color: 'var(--text2)' },
  confirmBanner: { background: 'rgba(76,175,125,.12)', border: '1px solid rgba(76,175,125,.3)', color: 'var(--success)', borderRadius: 10, padding: '14px 20px', marginBottom: 20, fontSize: 14, animation: 'fadeUp .3s ease' },
  empty:         { textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' },
  emptyIcon:     { fontSize: 48, marginBottom: 16 },
};
