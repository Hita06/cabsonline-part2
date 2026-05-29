/**
 * CabsOnline Part 2 - Booking Page
 * Author: [Student Name]
 * Description: Enhanced booking form. Collects all Part 1 fields plus ride
 *              preferences (quiet, pet-friendly, AC, accessible) and submits
 *              to the Part 1 booking.php backend via fetch.
 *
 * Functions:
 *   BookingPage()     – main component
 *   handleSubmit()    – validates form and POSTs to booking.php
 *   nowDate()         – returns current date in dd/mm/yyyy
 *   nowTime()         – returns current time in HH:MM
 */

import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Field, Input, Btn, Card, SectionTitle, Spinner } from './UI';
import { validateBookingForm, formatDateDDMMYYYY, formatTime24 } from '../utils/validation';
import { submitBooking } from '../utils/api';

function nowDate() {
  return formatDateDDMMYYYY(new Date());
}
function nowTime() {
  return formatTime24(new Date());
}

/**
 * BookingPage – full taxi booking form with ride preferences
 */
export default function BookingPage() {
  const [fields, setFields] = useState({
    cname: '', phone: '', unumber: '', snumber: '', stname: '',
    sbname: '', dsbname: '', date: nowDate(), time: nowTime(),
  });
  const [prefs, setPrefs] = useState({
    quiet: false, petFriendly: false, acRequired: false,
    accessible: false, musicGenre: 'none',
  });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);   // confirmation object
  const [serverErr, setServerErr] = useState('');

  /** Update a form field value */
  function set(key, val) {
    setFields(p => ({ ...p, [key]: val }));
    setErrors(p => { const n = { ...p }; delete n[key]; delete n.datetime; return n; });
  }

  /** Toggle a boolean preference */
  function togglePref(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  }

  /** Submit booking to Part 1 PHP backend */
  async function handleSubmit(e) {
    e.preventDefault();
    setServerErr('');
    const { valid, errors: errs } = validateBookingForm(fields);
    if (!valid) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Merge ride preferences into POST body as JSON string
      const payload = { ...fields, ridePrefs: JSON.stringify(prefs) };
      const data = await submitBooking(payload);
      setResult(data);
    } catch (err) {
      setServerErr(`Could not reach server: ${err.message}. Check your API_BASE in api.js.`);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <CheckCircle size={48} color="var(--success)" />
          <h2 style={styles.successTitle}>Booking Confirmed!</h2>
          <div id="reference" style={styles.refBlock}>
            <p>Thank you for your booking!</p>
            <p>Booking reference number: <strong>{result.bookingRef}</strong></p>
            <p>Pickup time: <strong>{result.time}</strong></p>
            <p>Pickup date: <strong>{result.date}</strong></p>
          </div>
          {prefs.quiet && <p style={styles.prefNote}>🤫 Quiet driver requested</p>}
          {prefs.petFriendly && <p style={styles.prefNote}>🐾 Pet-friendly driver requested</p>}
          {prefs.accessible && <p style={styles.prefNote}>♿ Accessible vehicle requested</p>}
          {prefs.acRequired && <p style={styles.prefNote}>❄️ Air conditioning requested</p>}
          <Btn variant="secondary" style={{ marginTop: 24 }}
               onClick={() => { setResult(null); setFields({ cname:'',phone:'',unumber:'',snumber:'',stname:'',sbname:'',dsbname:'',date:nowDate(),time:nowTime() }); }}>
            Book Another Ride
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <SectionTitle sub="Fill in your pickup details. All fields marked * are required.">
        Book a Taxi
      </SectionTitle>

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {/* ── Personal Info ───────────────────────────── */}
        <Card>
          <h3 style={styles.cardTitle}>Personal Details</h3>
          <div style={styles.grid2}>
            <Field label="Customer Name *" error={errors.cname}>
              <Input name="cname" value={fields.cname} onChange={e => set('cname', e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Phone Number *" error={errors.phone} hint="10–12 digits">
              <Input name="phone" value={fields.phone} onChange={e => set('phone', e.target.value)} placeholder="0211234567" />
            </Field>
          </div>
        </Card>

        {/* ── Pickup Address ───────────────────────────── */}
        <Card>
          <h3 style={styles.cardTitle}>Pickup Address</h3>
          <div style={styles.grid3}>
            <Field label="Unit Number" error={errors.unumber}>
              <Input name="unumber" value={fields.unumber} onChange={e => set('unumber', e.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Street Number *" error={errors.snumber}>
              <Input name="snumber" value={fields.snumber} onChange={e => set('snumber', e.target.value)} placeholder="123" />
            </Field>
            <Field label="Street Name *" error={errors.stname}>
              <Input name="stname" value={fields.stname} onChange={e => set('stname', e.target.value)} placeholder="Queen St" />
            </Field>
          </div>
          <div style={{ ...styles.grid2, marginTop: 16 }}>
            <Field label="Suburb" error={errors.sbname}>
              <Input name="sbname" value={fields.sbname} onChange={e => set('sbname', e.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Destination Suburb" error={errors.dsbname}>
              <Input name="dsbname" value={fields.dsbname} onChange={e => set('dsbname', e.target.value)} placeholder="Optional" />
            </Field>
          </div>
        </Card>

        {/* ── Date & Time ───────────────────────────── */}
        <Card>
          <h3 style={styles.cardTitle}>Pickup Time</h3>
          {errors.datetime && (
            <div style={styles.errBanner}><AlertCircle size={15}/> {errors.datetime}</div>
          )}
          <div style={styles.grid2}>
            <Field label="Pick-Up Date *" error={errors.date}>
              <Input name="date" type="text" value={fields.date} onChange={e => set('date', e.target.value)} placeholder="DD/MM/YYYY" />
            </Field>
            <Field label="Pick-Up Time *" error={errors.time}>
              <Input name="time" type="time" value={fields.time} onChange={e => set('time', e.target.value)} />
            </Field>
          </div>
        </Card>

        {/* ── Ride Preferences (Part 2 Extension) ───── */}
        <Card>
          <h3 style={styles.cardTitle}>Ride Preferences <span style={styles.newTag}>NEW</span></h3>
          <p style={styles.cardSub}>Customise your ride experience</p>
          <div style={styles.prefGrid}>
            {[
              { key: 'quiet',       emoji: '🤫', label: 'Quiet Driver',          desc: 'Minimal conversation' },
              { key: 'petFriendly', emoji: '🐾', label: 'Pet Friendly',          desc: 'Bring your furry friend' },
              { key: 'acRequired',  emoji: '❄️', label: 'Air Conditioning',      desc: 'Keep it cool' },
              { key: 'accessible',  emoji: '♿', label: 'Accessible Vehicle',    desc: 'Wheelchair accessible' },
            ].map(({ key, emoji, label, desc }) => (
              <button type="button" key={key}
                onClick={() => togglePref(key)}
                style={{ ...styles.prefChip, ...(prefs[key] ? styles.prefChipOn : {}) }}>
                <span style={styles.prefEmoji}>{emoji}</span>
                <span>
                  <div style={styles.prefLabel}>{label}</div>
                  <div style={styles.prefDesc}>{desc}</div>
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <Field label="Music Preference">
              <select
                value={prefs.musicGenre}
                onChange={e => setPrefs(p => ({ ...p, musicGenre: e.target.value }))}
                style={styles.select}>
                {['none','jazz','classical','pop','hip-hop','rock','ambient','no music'].map(g => (
                  <option key={g} value={g}>{g === 'none' ? 'No preference' : g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {serverErr && (
          <div style={styles.errBanner}><AlertCircle size={15}/> {serverErr}</div>
        )}

        <Btn type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
          {loading ? <><Spinner size={16} /> Submitting…</> : '🚖 Confirm Booking'}
        </Btn>
      </form>
    </div>
  );
}

const styles = {
  page:         { maxWidth: 720, margin: '0 auto', padding: '36px 20px', animation: 'fadeUp .4s ease' },
  form:         { display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle:    { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  cardSub:      { fontSize: 13, color: 'var(--text2)', marginTop: -10, marginBottom: 16 },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3:        { display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16 },
  errBanner:    { background: 'rgba(255,85,102,.1)', border: '1px solid rgba(255,85,102,.3)', color: 'var(--error)', borderRadius: 8, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  successBox:   { maxWidth: 520, margin: '60px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'fadeUp .4s ease' },
  successTitle: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28 },
  refBlock:     { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 28px', textAlign: 'left', lineHeight: 2, width: '100%' },
  prefNote:     { fontSize: 13, color: 'var(--text2)' },
  prefGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  prefChip:     { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', cursor: 'pointer', textAlign: 'left', transition: 'all .18s' },
  prefChipOn:   { borderColor: 'var(--accent)', background: 'rgba(245,197,24,.08)', boxShadow: '0 0 0 1px var(--accent)' },
  prefEmoji:    { fontSize: 24, flexShrink: 0 },
  prefLabel:    { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  prefDesc:     { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
  newTag:       { fontSize: 10, background: 'var(--accent2)', color: '#fff', padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '.3px' },
  select:       { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' },
};
