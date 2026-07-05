// utils/dateCalculator.js

/**
 * Diye gaye date string (YYYY-MM-DD) me ek random working hour (10 AM - 8 PM) add karta hai
 * Taaki GitHub par commits real human developer jaise lagein!
 * @param {string} dateString - Format: "YYYY-MM-DD" (e.g., "2026-01-05")
 * @returns {string} ISO-8601 UTC Date string (e.g., "2026-01-05T14:23:45Z")
 */
const addRandomWorkHours = (dateString) => {
  // 10 AM (10) se 8 PM (20) ke beech random ghanta
  const hours = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
  // 0 se 59 ke beech random minute aur second
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);

  // Pad with leading zeros (e.g., 9 -> "09")
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${dateString}T${hh}:${mm}:${ss}Z`;
};

/**
 * Check karta hai ki di gayi string valid date hai ya nahi
 * @param {string} dateString 
 * @returns {boolean}
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Aaj se N din purani date ka string (YYYY-MM-DD) return karta hai (Dynamic graphs ke liye)
 * @param {number} daysAgo - Kitne din purana
 * @returns {string} Format: "YYYY-MM-DD"
 */
const getPastDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

module.exports = {
  addRandomWorkHours,
  isValidDate,
  getPastDateString,
};
