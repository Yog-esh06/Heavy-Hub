/**
 * Calculate total days between two dates (inclusive)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {number} Number of days
 */
export const calculateTotalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

/**
 * Calculate total booking price
 * @param {number} pricePerDay - Daily rental rate
 * @param {number} totalDays - Total days to rent
 * @param {number} driverFeePerDay - Daily driver fee (optional)
 * @param {boolean} driverRequested - Whether driver is requested
 * @returns {object} Breakdown of charges
 */
export const calculateTotalPrice = (
  pricePerDay,
  totalDays,
  driverFeePerDay = 0,
  driverRequested = false
) => {
  const vehicleCharge = pricePerDay * totalDays;
  const driverCharge = driverRequested ? driverFeePerDay * totalDays : 0;
  const totalAmount = vehicleCharge + driverCharge;

  return {
    vehicleCharge,
    driverCharge,
    totalAmount,
    totalDays,
    breakdown: {
      vehicle: {
        label: "Equipment Rental",
        rate: pricePerDay,
        quantity: totalDays,
        amount: vehicleCharge,
      },
      driver: driverRequested
        ? {
            label: "Driver Service",
            rate: driverFeePerDay,
            quantity: totalDays,
            amount: driverCharge,
          }
        : null,
    },
  };
};

/**
 * Calculate refund amount based on cancellation policy
 * @param {number} bookingAmount - Original booking amount
 * @param {string} startDate - Booking start date
 * @returns {object} Refund details
 */
export const calculateRefund = (bookingAmount, startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const hoursUntilStart = (start - now) / (1000 * 60 * 60);

  let refundPercentage = 0;
  let policy = "";

  if (hoursUntilStart > 48) {
    refundPercentage = 90;
    policy = "More than 48 hours: 90% refund";
  } else if (hoursUntilStart > 24) {
    refundPercentage = 50;
    policy = "24-48 hours: 50% refund";
  } else {
    refundPercentage = 0;
    policy = "Less than 24 hours: No refund";
  }

  const refundAmount = (bookingAmount * refundPercentage) / 100;

  return {
    refundAmount: Math.round(refundAmount),
    refundPercentage,
    policy,
    hoursUntilStart: Math.round(hoursUntilStart),
  };
};

/**
 * Format currency as Indian Rupees
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format price range for display
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return "Price on request";
  if (minPrice === maxPrice) return formatCurrency(minPrice);
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};