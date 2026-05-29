/**
 * CabsOnline Part 2 - Root Application Component
 * Author: [Student Name]
 * Description: Root React component. Manages top-level tab state and renders
 *              the active page component. Uses lazy imports for the Leaflet
 *              map to avoid SSR issues.
 *
 * Functions:
 *   App()  – root component that renders Navbar and the active page
 */

import { useState, Suspense, lazy } from 'react';
import Navbar      from './components/Navbar';
import BookingPage from './components/BookingPage';
import DriversPage from './components/DriversPage';
import MonitorPage from './components/MonitorPage';
import PaymentPage from './components/PaymentPage';
import AdminPage   from './components/AdminPage';
import { Spinner } from './components/UI';

// Lazy-load MapPage so Leaflet CSS only loads when the Map tab is opened
const MapPage = lazy(() => import('./components/MapPage'));

/**
 * App – top-level component; owns the active tab state
 */
export default function App() {
  const [tab, setTab] = useState('booking');

  const pages = {
    booking: <BookingPage />,
    map: (
      <Suspense fallback={<div style={styles.loading}><Spinner size={32}/></div>}>
        <MapPage />
      </Suspense>
    ),
    drivers: <DriversPage />,
    monitor: <MonitorPage />,
    payment: <PaymentPage />,
    admin:   <AdminPage />,
  };

  return (
    <div style={styles.app}>
      <Navbar activeTab={tab} onTabChange={setTab} />
      <main style={styles.main}>
        {pages[tab] ?? <BookingPage />}
      </main>
      <footer style={styles.footer}>
        <span>CabsOnline v2 · Part 2 — Web Development Assignment S1 2026</span>
        <span style={{ color: 'var(--text3)' }}>Built with React + Vite · OpenStreetMap · PHP backend</span>
      </footer>
    </div>
  );
}

const styles = {
  app:     { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  main:    { flex: 1 },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 },
  footer:  {
    borderTop: '1px solid var(--border)', padding: '18px 28px',
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
    fontSize: 12, color: 'var(--text2)',
  },
};
