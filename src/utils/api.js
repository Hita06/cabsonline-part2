/**
 * CabsOnline Part 2 - API Utility
 * Author: [Student Name]
 * Description: Centralised fetch helpers for communicating with the
 *              Part 1 PHP backend on webdev.aut.ac.nz.
 *              All endpoints mirror those created in Part 1.
 */

// ---------------------------------------------------------------------------
// Base URL – change this to your webdev account path before submission
// ---------------------------------------------------------------------------
export const API_BASE = 'https://webdev.aut.ac.nz/~ftx0223/assign';

/**
 * submitBooking – POST a new taxi booking to booking.php
 * @param {Object} formData  Fields matching Part 1 booking form
 * @returns {Promise<Object>} Server response (booking reference, etc.)
 */
export async function submitBooking(formData) {
  const body = new URLSearchParams(formData);
  const res = await fetch(`${API_BASE}/booking.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

/**
 * searchBookings – GET booking records from admin.php
 * @param {string} bsearch  Reference number or empty string for next-2h list
 * @returns {Promise<Array>} Array of booking objects
 */
export async function searchBookings(bsearch = '') {
  const params = new URLSearchParams({ bsearch });
  const res = await fetch(`${API_BASE}/admin.php?${params}`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

/**
 * assignBooking – POST taxi assignment to admin.php
 * @param {string} bookingRef  e.g. "BRN00001"
 * @returns {Promise<Object>} Confirmation message from server
 */
export async function assignBooking(bookingRef) {
  const body = new URLSearchParams({ action: 'assign', bref: bookingRef });
  const res = await fetch(`${API_BASE}/admin.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Mock driver data – simulates a driver-query microservice
// In a real deployment this would call a separate drivers.php endpoint
// ---------------------------------------------------------------------------
export const MOCK_DRIVERS = [
  { id: 'DRV001', name: 'Aroha Ngata',    rating: 4.9, vehicle: 'Toyota Prius',   plate: 'ABC123', lat: -36.848, lng: 174.763, eta: 4,  accessible: true,  quiet: true,  petFriendly: false, acAvailable: true,  musicGenres: ['jazz','classical'] },
  { id: 'DRV002', name: 'James Tūhoe',   rating: 4.7, vehicle: 'Honda Fit',      plate: 'DEF456', lat: -36.855, lng: 174.770, eta: 7,  accessible: false, quiet: false, petFriendly: true,  acAvailable: true,  musicGenres: ['pop','hip-hop'] },
  { id: 'DRV003', name: 'Mei Lin Zhang', rating: 4.8, vehicle: 'Hyundai Ioniq',  plate: 'GHI789', lat: -36.861, lng: 174.758, eta: 6,  accessible: true,  quiet: true,  petFriendly: false, acAvailable: true,  musicGenres: ['classical'] },
  { id: 'DRV004', name: 'Sam Patel',     rating: 4.6, vehicle: 'Toyota Camry',   plate: 'JKL012', lat: -36.840, lng: 174.780, eta: 9,  accessible: false, quiet: false, petFriendly: true,  acAvailable: false, musicGenres: ['rock','pop'] },
  { id: 'DRV005', name: 'Lena Kovač',    rating: 5.0, vehicle: 'Tesla Model 3',  plate: 'MNO345', lat: -36.870, lng: 174.750, eta: 11, accessible: true,  quiet: true,  petFriendly: false, acAvailable: true,  musicGenres: ['ambient','jazz'] },
];

/**
 * queryDrivers – returns mock nearby drivers filtered by optional preferences
 * @param {Object} prefs  Ride preference flags
 * @returns {Promise<Array>}
 */
export async function queryDrivers(prefs = {}) {
  await new Promise(r => setTimeout(r, 700)); // simulate network
  return MOCK_DRIVERS.filter(d => {
    if (prefs.accessible && !d.accessible) return false;
    if (prefs.quiet && !d.quiet) return false;
    if (prefs.petFriendly && !d.petFriendly) return false;
    if (prefs.acRequired && !d.acAvailable) return false;
    return true;
  });
}
