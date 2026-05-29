/**
 * CabsOnline Part 2 - Shared UI Components
 * Author: [Student Name]
 * Description: Reusable primitive components (Field, Btn, Badge, Spinner, Card)
 *              used across all pages.
 */

/**
 * Field – labelled input wrapper with optional error message
 */
export function Field({ label, error, children, hint }) {
  return (
    <div style={fStyles.wrap}>
      {label && <label style={fStyles.label}>{label}{hint && <span style={fStyles.hint}>{hint}</span>}</label>}
      {children}
      {error && <p style={fStyles.error}>{error}</p>}
    </div>
  );
}

/**
 * Input – styled text / date / time input
 */
export function Input({ style, ...props }) {
  return <input style={{ ...fStyles.input, ...style }} {...props} />;
}

/**
 * Btn – primary/secondary/ghost button
 */
export function Btn({ variant = 'primary', children, style, ...props }) {
  const v = {
    primary:   { background: 'var(--accent)',  color: '#0a0a0f', border: 'none' },
    secondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)' },
    danger:    { background: 'var(--error)',    color: '#fff',    border: 'none' },
    ghost:     { background: 'transparent',    color: 'var(--text2)', border: '1px solid var(--border)' },
  }[variant] || {};
  return (
    <button style={{ ...fStyles.btn, ...v, ...style }} {...props}>
      {children}
    </button>
  );
}

/**
 * Badge – coloured status pill
 */
export function Badge({ status }) {
  const colors = {
    unassigned: { bg: 'rgba(245,197,24,.15)', color: 'var(--accent)' },
    assigned:   { bg: 'rgba(76,175,125,.15)', color: 'var(--success)' },
    completed:  { bg: 'rgba(78,205,196,.15)', color: 'var(--accent3)' },
  };
  const c = colors[status?.toLowerCase()] || colors.unassigned;
  return (
    <span style={{ ...fStyles.badge, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

/**
 * Spinner – loading indicator
 */
export function Spinner({ size = 22 }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid var(--border2)`,
      borderTop: `2px solid var(--accent)`, borderRadius: '50%',
      animation: 'spin .7s linear infinite', display: 'inline-block',
    }} />
  );
}

/**
 * Card – surface container with subtle border
 */
export function Card({ children, style }) {
  return <div style={{ ...fStyles.card, ...style }}>{children}</div>;
}

/**
 * SectionTitle – page-level heading
 */
export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={fStyles.title}>{children}</h2>
      {sub && <p style={fStyles.sub}>{sub}</p>}
    </div>
  );
}

const fStyles = {
  wrap:  { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: '.5px', textTransform: 'uppercase' },
  hint:  { fontWeight: 400, textTransform: 'none', color: 'var(--text3)', marginLeft: 6 },
  error: { fontSize: 12, color: 'var(--error)', marginTop: 2 },
  input: {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%',
    transition: 'border-color .18s',
  },
  btn: {
    padding: '10px 22px', borderRadius: 'var(--radius-sm)', fontSize: 14,
    fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
    transition: 'opacity .15s, transform .12s',
    display: 'inline-flex', alignItems: 'center', gap: 7,
  },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, letterSpacing: '.3px',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 24,
  },
  title: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text)', letterSpacing: '-0.5px' },
  sub:   { fontSize: 14, color: 'var(--text2)', marginTop: 6 },
};
