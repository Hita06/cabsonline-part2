/**
 * CabsOnline Part 2 - Ride Monitor Page (Extension Feature 3)
 * Author: [Student Name]
 * Description: Allows customers to track their booking status in real time
 *              by querying admin.php with their booking reference number.
 *              Simulates live driver progress with a visual timeline.
 *
 * Functions:
 *   MonitorPage()       – main component
 *   lookupBooking()     – fetches booking status from admin.php
 *   StatusTimeline()    – renders the 4-step ride progress bar
 *   simulateProgress()  – increments mock driver ETA over time
 */

import { useState, useEffect, useRef } from 'react';
import { searchBookings } from '../utils/api';
import { validateBRNFormat } from '../utils/validation';
import { SectionTitle, Card, Btn, Spinner, Badge, Field, Input } from './UI';
import { MapPin, Clock, CheckCircle, Car } from 'lucide-react';

const STEPS = [
  { id: 0, label: 'Booking Received',  Icon: CheckCircle },
  { id: 1, label: 'Driver Assigned',   Icon: Car },
  { id: 2, label: 'Driver En Route',   Icon: MapPin },
  { id: 3, label: 'Ride Complete',     Icon: CheckCircle },
];

/**
 * StatusTimeline – visual step indicator for the current ride stage
 * @param {number} currentStep  0–3 ride stage index
 */
function StatusTimeline({ currentStep }) {
  return (
    <div style={tStyles.wrap}>
      {STEPS.map(({ id, label, Icon }, idx) => {
        const done    = id < currentStep;
        const active  = id === currentStep;
        return (
          <div key={id} style={tStyles.step}>
            <div style={{ ...tStyles.circle, ...(done ? tStyles.done : active ? tStyles.active : {}) }}>
              <Icon size={16} />
            </div>
            <span style={{ ...tStyles.label, ...(active ? tStyles.labelActive : {}) }}>{label}</span>
            {idx < STEPS.length - 1 && (
              <div style={{ ...tStyles.line, ...(done ? tStyles.lineDone : {}) }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * MonitorPage – customer booking status tracker
 */
export default function MonitorPage() {
  const [ref, setRef]         = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(0);
  const [eta, setEta]         = useState(null);
  const intervalRef           = useRef(null);

  /** Clean up timer on unmount */
  useEffect(() => () => clearInterval(intervalRef.current), []);

  /**
   * simulateProgress – ticks down ETA and advances the step counter
   * @param {number} startEta  Initial ETA in minutes
   */
  function simulateProgress(startEta) {
    setEta(startEta);
    setStep(1);
    let remaining = startEta;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setEta(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setStep(3);
        setEta(0);
      } else if (remaining <= Math.floor(startEta / 2)) {
        setStep(2);
      }
    }, 3000); // update every 3s (sped up for demo)
  }

  /**
   * lookupBooking – validates BRN and fetches from admin.php
   */
  async function lookupBooking() {
    setError('');
    clearInterval(intervalRef.current);
    if (!ref.trim()) { setError('Please enter a booking reference number.'); return; }
    if (!validateBRNFormat(ref)) { setError('Invalid format. Use BRNxxxxx (e.g. BRN00001).'); return; }

    setLoading(true);
    try {
      const results = await searchBookings(ref.trim());
      if (!results || results.length === 0) {
        setError(`No booking found for ${ref.trim()}.`);
        setBooking(null);
      } else {
        const b = results[0];
        setBooking(b);
        setStep(b.status === 'assigned' ? 1 : 0);
        if (b.status === 'assigned') simulateProgress(8);
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <SectionTitle sub="Enter your booking reference to track your ride status in real time.">
        My Rides
      </SectionTitle>

      <Card style={{ marginBottom: 24 }}>
        <div style={styles.searchRow}>
          <Field label="Booking Reference" error={error} style={{ flex: 1 }}>
            <Input
              value={ref} onChange={e => setRef(e.target.value.toUpperCase())}
              placeholder="BRN00001"
              onKeyDown={e => e.key === 'Enter' && lookupBooking()} />
          </Field>
          <Btn variant="primary" onClick={lookupBooking} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? <Spinner size={15}/> : '🔍 Track'}
          </Btn>
        </div>
        <p style={styles.hint}>Tip: use a reference like BRN00001 from your booking confirmation.</p>
      </Card>

      {booking && (
        <div style={{ animation: 'fadeUp .35s ease' }}>
          {/* Status timeline */}
          <Card style={{ marginBottom: 20 }}>
            <h3 style={styles.cardTitle}>Ride Status</h3>
            <StatusTimeline currentStep={step} />
            {eta !== null && eta > 0 && (
              <div style={styles.etaBox}>
                <Clock size={16} />
                <span>Driver arrives in approximately <strong>{eta} min</strong></span>
              </div>
            )}
            {step === 3 && (
              <div style={styles.completedBox}>✅ Your ride is complete. Thank you for using CabsOnline!</div>
            )}
          </Card>

          {/* Booking details */}
          <Card>
            <h3 style={styles.cardTitle}>Booking Details</h3>
            <div style={styles.detailGrid}>
              {[
                ['Reference',        booking.booking_ref || booking.bref || ref],
                ['Customer',         booking.cname],
                ['Phone',            booking.phone],
                ['Pickup Suburb',    booking.sbname   || '—'],
                ['Destination',      booking.dsbname  || '—'],
                ['Pickup Date/Time', `${booking.date} ${booking.time}`],
              ].map(([k, v]) => (
                <div key={k} style={styles.detailRow}>
                  <span style={styles.detailKey}>{k}</span>
                  <span style={styles.detailVal}>{v}</span>
                </div>
              ))}
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Status</span>
                <Badge status={booking.status || 'unassigned'} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {!booking && !loading && !error && (
        <div style={styles.empty}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <p>Enter your booking reference number above to see your ride status.</p>
        </div>
      )}
    </div>
  );
}

const tStyles = {
  wrap:       { display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 8, padding: '12px 0' },
  step:       { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
  circle:     { width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', transition: 'all .4s', zIndex: 1 },
  done:       { background: 'rgba(76,175,125,.15)', borderColor: 'var(--success)', color: 'var(--success)' },
  active:     { background: 'rgba(245,197,24,.15)', borderColor: 'var(--accent)', color: 'var(--accent)', boxShadow: '0 0 0 4px rgba(245,197,24,.1)' },
  label:      { fontSize: 11, color: 'var(--text3)', marginTop: 8, textAlign: 'center', maxWidth: 80 },
  labelActive:{ color: 'var(--accent)', fontWeight: 600 },
  line:       { position: 'absolute', top: 18, left: '50%', width: '100%', height: 2, background: 'var(--border)', zIndex: 0 },
  lineDone:   { background: 'var(--success)' },
};

const styles = {
  page:        { maxWidth: 720, margin: '0 auto', padding: '36px 20px', animation: 'fadeUp .4s ease' },
  searchRow:   { display: 'flex', gap: 12, alignItems: 'flex-start' },
  hint:        { fontSize: 12, color: 'var(--text3)', marginTop: 10 },
  cardTitle:   { fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 },
  etaBox:      { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,197,24,.08)', border: '1px solid rgba(245,197,24,.2)', borderRadius: 8, padding: '10px 16px', fontSize: 14, color: 'var(--accent)', marginTop: 20 },
  completedBox:{ background: 'rgba(76,175,125,.1)', border: '1px solid rgba(76,175,125,.25)', color: 'var(--success)', borderRadius: 8, padding: '12px 16px', fontSize: 14, marginTop: 16 },
  detailGrid:  { display: 'flex', flexDirection: 'column', gap: 12 },
  detailRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' },
  detailKey:   { fontSize: 13, color: 'var(--text2)', fontWeight: 500 },
  detailVal:   { fontSize: 14, color: 'var(--text)', fontWeight: 500 },
  empty:       { textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' },
};
