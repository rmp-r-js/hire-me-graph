// utils/delayHelper.js

/**
 * Process ko diye gaye milliseconds ke liye rokta hai (sleep)
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * .env se MIN_DELAY aur MAX_DELAY ke beech ka ek random time (ms) nikaalta hai
 * Agar .env set nahi hai toh default 5 se 15 second lega
 * @returns {number} Random delay in milliseconds
 */
const getRandomDelay = () => {
  const min = parseInt(process.env.MIN_DELAY || '5000', 10);
  const max = parseInt(process.env.MAX_DELAY || '15000', 10);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Milliseconds ko readable string (seconds/minutes) me convert karta hai console ke liye
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted string (e.g., "8.5 seconds")
 */
const formatDelay = (ms) => {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds} seconds`;
};

module.exports = {
  sleep,
  getRandomDelay,
  formatDelay,
};
