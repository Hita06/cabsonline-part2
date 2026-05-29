/**
 * CabsOnline Part 2 - Navbar Component
 * Author: [Student Name]
 * Description: Top navigation bar with tab switching between all app sections.
 */

import { Car, Map, Users, CreditCard, Settings2, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'booking',  label: 'Book a Ride',    Icon: Car },
  { id: 'map',      label: 'Live Map',        Icon: Map },
  { id: 'drivers',  label: 'Find a Driver',   Icon: Users },
  { id: 'monitor',  label: 'My Rides',        Icon: ShieldCheck },
  { id: 'payment',  label: 'Payment',         Icon: CreditCard },
  { id: 'admin',    label: 'Admin',           Icon: Settings2 },
];

/**
 * Navbar – renders the top navigation tabs
 * @param {string}   activeTab   Currently active tab ID
 * @param {Function} onTabChange Callback when user switches tabs
 */
export default function Navbar({ activeTab, onTabChange }) {
  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🚖</span>
        <span style={styles.brandName}>CabsOnline</span>
        <span style={styles.brandBadge}>v2</span>
      </div>
      <nav style={styles.nav}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              ...styles.tab,
              ...(activeTab === id ? styles.tabActive : {}),
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,10,15,0.92)',
    backdropFilter: 'blur(18px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', height: 62,
    gap: 24,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  brandIcon: { fontSize: 22 },
  brandName: {
    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20,
    color: 'var(--accent)', letterSpacing: '-0.5px',
  },
  brandBadge: {
    fontSize: 10, fontWeight: 700, background: 'var(--accent2)',
    color: '#fff', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px',
  },
  nav: { display: 'flex', gap: 4, overflowX: 'auto' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, border: 'none',
    background: 'transparent', color: 'var(--text2)',
    fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
    transition: 'all .18s',
  },
  tabActive: {
    background: 'var(--surface)', color: 'var(--accent)',
    boxShadow: '0 0 0 1px var(--border2)',
  },
};
