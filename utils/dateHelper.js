// utils/dateHelper.js
const logger = require('./logger');

/**
 * Checks if a given date is within the last N days
 * @param {string} dateString - ISO 8601 date string (e.g., "2024-06-15T10:30:00Z")
 * @param {number} days - Number of days to look back (default: 180 for 6 months)
 * @returns {boolean} - True if date is within the window, false otherwise
 */
function isWithinLastNDays(dateString, days = 180) {
  try {
    const updatedDate = new Date(dateString);
    const now = new Date();
    
    // Calculate the cutoff date (6 months ago)
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Return true if updatedDate is after cutoffDate
    return updatedDate > cutoffDate;
  } catch (error) {
    logger.error(`Date parsing error for ${dateString}: ${error.message}`);
    return false;
  }
}

/**
 * Formats a date for display in CSV/UI
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} - Formatted date (YYYY-MM-DD HH:mm:ss)
 */
function formatDateForDisplay(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    logger.error(`Date formatting error: ${error.message}`);
    return 'Invalid Date';
  }
}

/**
 * Generates a timestamp for CSV filename
 * @returns {string} - Timestamp in YYYYMMDD_HHmmss format
 */
function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  
  return `${yyyy}${mm}${dd}_${hh}${mins}${ss}`;
}

module.exports = {
  isWithinLastNDays,
  formatDateForDisplay,
  getTimestamp,
};
