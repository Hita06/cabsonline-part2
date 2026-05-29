/**
 * CabsOnline Part 2 - Payment Page (Extension Feature 4)
 * Author: [Student Name]
 * Description: Simulated payment processing interface. Customers can enter
 *              a booking reference, view the estimated fare, and pay via
 *              credit card or digital wallet. All processing is client-side
 *              simulation (no real transactions are made).
 *
 * Functions:
 *   PaymentPage()    – main payment component
 *   CardForm()       – credit/debit card input panel
 *   processPayment() – simulates server-side payment confirmation
 *   formatCard()     – adds spaces every 4 digits to card number
 */

import { useState } from 'react';
import { SectionTitle, Card, Btn, Spinner, Field, Input, Badge } from './UI';
import { Lock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { searchBookings } from '../utils/api';
import { validateBRNFormat } from '../utils/validation';

const FARE_PER_KM = 2.8;
const BASE_FARE   = 3.5;

/** formatCard – inserts a space every 4 digits */
function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

/** formatExpiry – adds slash after MM */
function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  return clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean;
}

/**
 * CardForm – credit/debit card input fields
 */
function CardForm({ card, setCard, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Card Number" error={errors.cardNumber}>
        <div style={pStyles.cardInputWrap}>
          <CreditCard size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          <input
            style={pStyles.cardInput}
            placeholder="1234 5678 9012 3456"
            value={card.number}
            maxLength={19}
            onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))} />
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Expiry (MM/YY)" error={errors.expiry}>
          <input
            style={pStyles.smallInput}
            placeholder="12/27"
            value={card.expiry}
            maxLength={5}
            onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} />
        </Field>
        <Field label="CVV" error={errors.cvv}>
          <input
            style={pStyles.smallInput}
            placeholder="123"
            value={card.cvv}
            maxLength={4}
            type="password"
            onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))} />
        </Field>
      </div>
      <Field label="Cardholder Name" error={errors.name}>
        <input
          style={pStyles.smallInput}
          placeholder="John Smith"
          value={card.name}
          onChange={e => setCard(p => ({ ...p, name: e.target.value }))} />
      </Field>
    </div>
  );
}

/**
 * PaymentPage – payment method selection and processing
 */
export default function PaymentPage() {
  const [bref, setBref]           = useState('');
  const [brefError, setBrefError] = useState('');
  const [booking, setBooking]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [method, setMethod]       = useState('card');  // 'card' | 'apple' | 'google'
  const [card, setCard]           = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [paying, setPaying]       = useState(false);
  const [paid, setPaid]           = useState(false);
  const [tip, setTip]             = useState(10);      // percentage
  const [serverErr, setServerErr] = useState('');

  // Estimated fare (uses a fixed 5km default if no distance info available)
  const BASE = BASE_FARE + 5 * FARE_PER_KM;
  const tipAmt  = booking ? (BASE * tip / 100).toFixed(2) : '0.00';
  const totalAmt = booking ? (BASE * (1 + tip / 100)).toFixed(2) : '0.00';

  /** lookupBRef – fetch booking details to confirm before payment */
  async function lookupBRef() {
    setBrefError('');
    setServerErr('');
    if (!bref.trim())            { setBrefError('Enter a booking reference.'); return; }
    if (!validateBRNFormat(bref)){ setBrefError('Use format BRN00001.'); return; }

    setLoading(true);
    try {
      const results = await searchBookings(bref.trim());
      if (!results || results.length === 0) {
        setBrefError(`No booking found for ${bref}.`);
      } else {
        setBooking(results[0]);
      }
    } catch (err) {
      setServerErr(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  /** validateCard – client-side card field validation */
  function validateCard() {
    const errs = {};
    const num = card.number.replace(/\s/g,'');
    if (num.length < 16)          errs.cardNumber = 'Card number must be 16 digits.';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = 'Use MM/YY format.';
    if (card.cvv.length < 3)      errs.cvv  = 'CVV must be 3–4 digits.';
    if (!card.name.trim())        errs.name = 'Cardholder name required.';
    return errs;
  }

  /**
   * processPayment – simulates payment processing (no real transaction)
   */
  async function processPayment() {
    if (method === 'card') {
      const errs = validateCard();
      if (Object.keys(errs).length) { setCardErrors(errs); return; }
    }
    setPaying(true);
    await new Promise(r => setTimeout(r, 2200)); // simulate processing
    setPaying(false);
    setPaid(true);
  }

  if (paid) {
    return (
      <div style={pStyles.page}>
        <div style={pStyles.successWrap}>
          <CheckCircle size={56} color="var(--success)" />
          <h2 style={pStyles.successTitle}>Payment Successful!</h2>
          <Card style={{ width: '100%', textAlign: 'left' }}>
            <div style={pStyles.receiptRow}><span>Booking</span><strong>{bref}</strong></div>
            <div style={pStyles.receiptRow}><span>Base Fare</span><span>NZD {BASE.toFixed(2)}</span></div>
            <div style={pStyles.receiptRow}><span>Tip ({tip}%)</span><span>NZD {tipAmt}</span></div>
            <div style={{ ...pStyles.receiptRow, ...pStyles.totalRow }}><span>Total Paid</span><strong>NZD {totalAmt}</strong></div>
          </Card>
          <p style={pStyles.receipt}>A receipt has been sent to your registered email. (simulated)</p>
          <Btn variant="secondary" onClick={() => { setPaid(false); setBooking(null); setBref(''); setCard({ number:'',expiry:'',cvv:'',name:'' }); }}>
            Make Another Payment
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={pStyles.page}>
      <SectionTitle sub="Enter your booking reference and complete your payment securely.">
        Payment
      </SectionTitle>

      {/* Step 1 – look up booking */}
      {!booking ? (
        <Card>
          <h3 style={pStyles.cardTitle}>Step 1 — Find Your Booking</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Field label="Booking Reference" error={brefError} style={{ flex: 1 }}>
              <Input value={bref} onChange={e => setBref(e.target.value.toUpperCase())} placeholder="BRN00001"
                onKeyDown={e => e.key === 'Enter' && lookupBRef()} />
            </Field>
            <Btn variant="primary" onClick={lookupBRef} disabled={loading} style={{ alignSelf: 'flex-end' }}>
              {loading ? <Spinner size={15}/> : 'Find'}
            </Btn>
          </div>
          {serverErr && <p style={pStyles.errMsg}>{serverErr}</p>}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp .35s ease' }}>
          {/* Booking summary */}
          <Card>
            <h3 style={pStyles.cardTitle}>Booking Summary</h3>
            <div style={pStyles.summaryGrid}>
              <div style={pStyles.summaryItem}><div style={pStyles.sVal}>{bref}</div><div style={pStyles.sKey}>Reference</div></div>
              <div style={pStyles.summaryItem}><div style={pStyles.sVal}>{booking.cname}</div><div style={pStyles.sKey}>Customer</div></div>
              <div style={pStyles.summaryItem}><div style={pStyles.sVal}><Badge status={booking.status}/></div><div style={pStyles.sKey}>Status</div></div>
              <div style={pStyles.summaryItem}><div style={{ ...pStyles.sVal, color: 'var(--accent)' }}>NZD {BASE.toFixed(2)}</div><div style={pStyles.sKey}>Est. Fare</div></div>
            </div>
          </Card>

          {/* Tip selector */}
          <Card>
            <h3 style={pStyles.cardTitle}>Add a Tip</h3>
            <div style={pStyles.tipRow}>
              {[0, 5, 10, 15, 20].map(t => (
                <button key={t} type="button"
                  style={{ ...pStyles.tipChip, ...(tip === t ? pStyles.tipChipOn : {}) }}
                  onClick={() => setTip(t)}>
                  {t}%
                </button>
              ))}
            </div>
            <p style={pStyles.tipNote}>Tip: NZD {tipAmt} · Total: <strong style={{ color: 'var(--accent)' }}>NZD {totalAmt}</strong></p>
          </Card>

          {/* Payment method */}
          <Card>
            <h3 style={pStyles.cardTitle}>Payment Method</h3>
            <div style={pStyles.methodRow}>
              {[
                { id: 'card',   label: '💳 Credit / Debit' },
                { id: 'apple',  label: '🍎 Apple Pay' },
                { id: 'google', label: '🔵 Google Pay' },
              ].map(m => (
                <button key={m.id} type="button"
                  style={{ ...pStyles.methodChip, ...(method === m.id ? pStyles.methodChipOn : {}) }}
                  onClick={() => setMethod(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>

            {method === 'card' && (
              <div style={{ marginTop: 20 }}>
                <CardForm card={card} setCard={setCard} errors={cardErrors} />
              </div>
            )}
            {(method === 'apple' || method === 'google') && (
              <div style={pStyles.walletNote}>
                <CheckCircle size={18} color="var(--success)" />
                {method === 'apple' ? 'Apple Pay' : 'Google Pay'} ready. Click Pay to authenticate.
              </div>
            )}
          </Card>

          {/* Security notice */}
          <div style={pStyles.secRow}>
            <Lock size={13} />
            <span>All payments are simulated. No real data is transmitted.</span>
          </div>

          <Btn variant="primary" style={{ justifyContent: 'center', padding: '15px' }} onClick={processPayment} disabled={paying}>
            {paying ? <><Spinner size={16}/> Processing…</> : `🔒 Pay NZD ${totalAmt}`}
          </Btn>
        </div>
      )}
    </div>
  );
}

const pStyles = {
  page:        { maxWidth: 600, margin: '0 auto', padding: '36px 20px', animation: 'fadeUp .4s ease' },
  cardTitle:   { fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 18 },
  errMsg:      { fontSize: 12, color: 'var(--error)', marginTop: 8 },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  summaryItem: { background: 'var(--bg3)', borderRadius: 10, padding: '14px', textAlign: 'center' },
  sVal:        { fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 4 },
  sKey:        { fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' },
  tipRow:      { display: 'flex', gap: 10 },
  tipChip:     { flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .18s' },
  tipChipOn:   { borderColor: 'var(--accent)', background: 'rgba(245,197,24,.1)', color: 'var(--accent)' },
  tipNote:     { fontSize: 13, color: 'var(--text2)', marginTop: 14 },
  methodRow:   { display: 'flex', gap: 10 },
  methodChip:  { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .18s', textAlign: 'center' },
  methodChipOn:{ borderColor: 'var(--accent)', background: 'rgba(245,197,24,.08)' },
  walletNote:  { display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '14px', background: 'rgba(76,175,125,.08)', borderRadius: 8, fontSize: 13, color: 'var(--success)' },
  secRow:      { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text3)', justifyContent: 'center' },
  cardInputWrap:{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' },
  cardInput:   { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, flex: 1, fontFamily: 'monospace', letterSpacing: '1.5px' },
  smallInput:  { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%', fontFamily: 'monospace' },
  successWrap: { maxWidth: 480, margin: '60px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: 'fadeUp .4s ease' },
  successTitle:{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 },
  receiptRow:  { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 },
  totalRow:    { borderBottom: 'none', fontSize: 16, marginTop: 4 },
  receipt:     { fontSize: 13, color: 'var(--text2)' },
};
