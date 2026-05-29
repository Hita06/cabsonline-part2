/**
 * CabsOnline Part 2 - Validation Utilities
 * Author: [Student Name]
 * Description: Client-side validation helpers used across booking and admin forms.
 */

/**
 * validateBookingForm – validates all required booking fields
 * @param {Object} fields  Form field values
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateBookingForm(fields) {
  const errors = {};

  if (!fields.cname?.trim()) errors.cname = 'Customer name is required.';

  if (!fields.phone?.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\d{10,12}$/.test(fields.phone.trim())) {
    errors.phone = 'Phone must be 10–12 digits.';
  }

  if (!fields.snumber?.trim()) errors.snumber = 'Street number is required.';
  if (!fields.stname?.trim())  errors.stname  = 'Street name is required.';

  if (!fields.date?.trim()) {
    errors.date = 'Pick-up date is required.';
  }

  if (!fields.time?.trim()) {
    errors.time = 'Pick-up time is required.';
  }

  // Date/time must not be in the past
  if (fields.date && fields.time) {
    const [day, month, year] = fields.date.split('/');
    const inputDt = new Date(`${year}-${month}-${day}T${fields.time}`);
    if (!isNaN(inputDt) && inputDt < new Date()) {
      errors.datetime = 'Pick-up date and time must not be earlier than now.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * validateBRNFormat – checks reference number format BRN followed by 5 digits
 * @param {string} ref
 * @returns {boolean}
 */
export function validateBRNFormat(ref) {
  return /^BRN\d{5}$/.test(ref.trim());
}

/**
 * formatDateDDMMYYYY – converts a Date object to DD/MM/YYYY string
 * @param {Date} date
 * @returns {string}
 */
export function formatDateDDMMYYYY(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/**
 * formatTime24 – returns HH:MM from a Date object
 * @param {Date} date
 * @returns {string}
 */
export function formatTime24(date) {
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}
