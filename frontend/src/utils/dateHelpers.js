/**
 * Format date to YYYY-MM-DD format
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatDateISO = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Format date for display (e.g., "Jan 15, 2025")
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatDateDisplay = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date and time for display (e.g., "Jan 15, 2025 10:30 AM")
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get array of dates between start and end (inclusive)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string[]} Array of dates in YYYY-MM-DD format
 */
export const getDateRangeArray = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDateISO(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Check if date range overlaps with array of booked dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string[]} bookedDates - Array of booked dates
 * @returns {boolean} True if overlap found
 */
export const hasDateConflict = (startDate, endDate, bookedDates = []) => {
  const requestedDates = getDateRangeArray(startDate, endDate);
  return requestedDates.some((date) => bookedDates.includes(date));
};

/**
 * Get minimum date (today)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getMinDate = () => {
  return formatDateISO(new Date());
};

/**
 * Get maximum date (90 days from today)
 * @returns {string} Date 90 days from today in YYYY-MM-DD format
 */
export const getMaxDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 90);
  return formatDateISO(date);
};

/**
 * Get human-readable time difference from now
 * @param {Date|string} date - Date object or string
 * @returns {string} Time difference string (e.g., "in 2 days")
 */
export const getTimeFromNow = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d - now;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return diffMins > 0 ? `in ${diffMins} minutes` : "just now";
  }
  if (diffHours < 24) {
    return `in ${diffHours} hours`;
  }
  if (diffDays < 365) {
    return `in ${diffDays} days`;
  }
  return formatDateDisplay(date);
};

/**
 * Check if date is today
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  return formatDateISO(new Date()) === date;
};

/**
 * Check if date is in the past
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};