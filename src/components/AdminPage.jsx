/**
 * CabsOnline Part 2 - Admin Page
 * Author: [Student Name]
 * Description: React-based admin dashboard. Replicates and enhances the
 *              Part 1 admin.html functionality with a polished table UI,
 *              inline assignment confirmation, and real-time status updates.
 *
 * Functions:
 *   AdminPage()       – main admin component
 *   handleSearch()    – validates bsearch and calls admin.php
 *   handleAssign()    – POSTs assignment request to admin.php
 *   BookingsTable()   – renders the results table with Assign buttons
 */

import { useState } from 'react';
import { searchBookings, assignBooking } from '../utils/api';
import { validateBRNFormat } from '../utils/validation';
import { SectionTitle, Card, Btn, Spinner, Badge, Field, Input } from './UI';
import { Search, CheckCircle } from 'lucide-react';

/**
 * BookingsTable – renders search results in the required table format.
 * @param {Array}    bookings      Array of booking objects from admin.php
 * @param {Set}      assigned      Set of already-assigned booking refs
 * @param {Function} onAssign      Callback when Assign button is clicked
 * @param {string}   assigning     Ref currently being assigned (shows spinner)
 */
function BookingsTable({ bookings, assigned, onAssign, assigning }) {
  if (bookings.length === 0) {
    return <p style={tStyle.empty}>No bookings found matching your query.</p>;
  }

  const COLS = ['Booking Ref', 'Customer Name', 'Phone', 'Pickup Suburb', 'Destination', 'Pickup Date & Time', 'Status', 'Assign'];

  return (
    <div style={tStyle.tableWrap}>
      <table style={tStyle.table}>
        <thead>
          <tr>
            {COLS.map(c => <th key={c} style={tStyle.th}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => {
            const ref        = b.booking_ref || b.bref;
            const isAssigned = assigned.has(ref) || b.status?.toLowerCase() === 'assigned';
            const isBusy     = assigning === ref;
            return (
              <tr key={ref || i} style={{ ...tStyle.tr, ...(isAssigned ? tStyle.trAssigned : {}) }}>
                <td style={tStyle.td}><code style={tStyle.ref}>{ref}</code></td>
                <td style={tStyle.td}>{b.cname}</td>
                <td style={tStyle.td}>{b.phone}</td>
                <td style={tStyle.td}>{b.sbname  || '—'}</td>
                <td style={tStyle.td}>{b.dsbname || '—'}</td>
                <td style={tStyle.td}><span style={tStyle.datetime}>{b.date} {b.time}</span></td>
                <td style={tStyle.td}><Badge status={isAssigned ? 'assigned' : (b.status || 'unassigned')} /></td>
                <td style={tStyle.td}>
                  <button
                    name="Assign"
                    disabled={isAssigned || isBusy}
                    onClick={() => onAssign(ref)}
                    style={{ ...tStyle.assignBtn, ...(isAssigned ? tStyle.assignDone : {}) }}>
                    {isBusy ? <Spinner size={13}/> : isAssigned ? <><CheckCircle size={13}/> Assigned</> : 'Assign'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * AdminPage – booking search and assignment dashboard
 */
export default function AdminPage() {
  const [bsearch, setBsearch]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState(null);
  const [error, setError]         = useState('');
  const [assigned, setAssigned]   = useState(new Set());
  const [assigning, setAssigning] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');

  /**
   * handleSearch – validates input and fetches booking records
   */
  async function handleSearch() {
    setError('');
    setConfirmMsg('');
    const q = bsearch.trim();

    if (q && !validateBRNFormat(q)) {
      setError('Invalid format. Reference must match BRNxxxxx (e.g. BRN00001).');
      return;
    }

    setLoading(true);
    try {
      const data = await searchBookings(q);
      setResults(data || []);
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  /**
   * handleAssign – sends assignment request to admin.php for a given ref
   * @param {string} ref  Booking reference number
   */
  async function handleAssign(ref) {
    setAssigning(ref);
    setConfirmMsg('');
    try {
      await assignBooking(ref);
      setAssigned(prev => new Set([...prev, ref]));
      setConfirmMsg(`Congratulations! Booking request ${ref} has been assigned!`);
    } catch (err) {
      setError(`Assignment failed: ${err.message}`);
    } finally {
      setAssigning('');
    }
  }

  return (
    <div style={styles.page}>
      <SectionTitle sub="Search bookings by reference number or view all upcoming rides within 2 hours.">
        Admin Dashboard
      </SectionTitle>

      {/* Search panel */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={styles.cardTitle}>Booking Request Search</h3>
        <div style={styles.searchRow}>
          <Field label="Booking Reference" error={error} style={{ flex: 1 }}>
            <div style={styles.inputWrap}>
              <Search size={15} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input
                name="bsearch"
                style={styles.searchInput}
                placeholder="BRN00001  or leave empty for upcoming rides"
                value={bsearch}
                onChange={e => setBsearch(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
          </Field>
          <input type="button" name="sbutton" value={loading ? 'Searching…' : 'Search Bookings'}
            disabled={loading}
            onClick={handleSearch}
            style={styles.sbutton} />
        </div>
        <p style={styles.hint}>Leave empty to show unassigned bookings with pickup within the next 2 hours.</p>
      </Card>

      {/* Confirmation message */}
      {confirmMsg && (
        <div style={styles.confirmBanner}>
          <CheckCircle size={16} />
          {confirmMsg}
        </div>
      )}

      {/* Results */}
      <div className="content">
        {loading && (
          <div style={styles.loadingWrap}><Spinner /> <span style={{ color: 'var(--text2)', fontSize: 14 }}>Searching bookings…</span></div>
        )}
        {!loading && results !== null && (
          <Card>
            <div style={styles.resultHeader}>
              <h3 style={styles.cardTitle}>
                {bsearch ? `Results for ${bsearch}` : 'Upcoming Unassigned Bookings (next 2 hours)'}
              </h3>
              <span style={styles.resultCount}>{results.length} record{results.length !== 1 ? 's' : ''}</span>
            </div>
            <BookingsTable
              bookings={results}
              assigned={assigned}
              onAssign={handleAssign}
              assigning={assigning} />
          </Card>
        )}
        {!loading && results === null && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗂️</div>
            <p>Search for a booking reference or leave the field empty to see all upcoming rides.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const tStyle = {
  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid var(--border)', transition: 'background .15s' },
  trAssigned:{ opacity: 0.6 },
  td:        { padding: '12px 12px', color: 'var(--text)', verticalAlign: 'middle' },
  ref:       { fontFamily: 'monospace', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4, fontSize: 12 },
  datetime:  { fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' },
  assignBtn: { padding: '6px 14px', borderRadius: 6, border: '1px solid var(--accent)', background: 'rgba(245,197,24,.1)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all .18s' },
  assignDone:{ opacity: 0.5, cursor: 'default', border: '1px solid var(--border)', color: 'var(--text3)', background: 'transparent' },
  empty:     { padding: '30px 0', color: 'var(--text2)', fontSize: 14 },
};

const styles = {
  page:          { maxWidth: 1100, margin: '0 auto', padding: '36px 20px', animation: 'fadeUp .4s ease' },
  cardTitle:     { fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 0 },
  searchRow:     { display: 'flex', gap: 12, alignItems: 'flex-start' },
  inputWrap:     { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' },
  searchInput:   { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, flex: 1, fontFamily: 'Syne', letterSpacing: '0.5px' },
  sbutton:       { padding: '10px 22px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#0a0a0f', fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  hint:          { fontSize: 12, color: 'var(--text3)', marginTop: 10 },
  confirmBanner: { background: 'rgba(76,175,125,.1)', border: '1px solid rgba(76,175,125,.25)', color: 'var(--success)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp .3s ease' },
  loadingWrap:   { display: 'flex', alignItems: 'center', gap: 14, padding: '40px', justifyContent: 'center' },
  resultHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  resultCount:   { fontSize: 13, color: 'var(--text3)' },
  empty:         { textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' },
};
