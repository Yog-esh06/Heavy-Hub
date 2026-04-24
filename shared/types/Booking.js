/**
 * @typedef {Object} Booking
 * @property {string} id - Unique booking identifier
 * @property {string} vehicleId - Reference to booked vehicle
 * @property {string} vehicleName - Name of vehicle (denormalized)
 * @property {string} vehicleImage - Primary image URL (denormalized)
 * @property {string} renterId - Firebase UID of renter
 * @property {string} renterName - Name of renter (denormalized)
 * @property {string} renterPhone - Phone of renter (denormalized)
 * @property {string} ownerId - Firebase UID of vehicle owner
 * @property {string | null} driverId - Firebase UID of assigned driver (if any)
 * @property {boolean} driverRequested - Whether driver was requested
 * @property {string} startDate - Start date in "YYYY-MM-DD" format
 * @property {string} endDate - End date in "YYYY-MM-DD" format
 * @property {string} startTime - Start time in "HH:MM" format (24hr)
 * @property {string} endTime - End time in "HH:MM" format (24hr)
 * @property {{lat: number, lng: number, address: string}} pickupLocation - Pickup location
 * @property {number} totalDays - Total number of days (inclusive)
 * @property {number} pricePerDay - Daily rental rate at booking time
 * @property {number} driverFee - Driver fee (0 if not requested)
 * @property {number} totalAmount - Total amount to pay
 * @property {"pending" | "confirmed" | "active" | "completed" | "cancelled"} status - Booking status
 * @property {string | null} cancellationReason - Reason for cancellation
 * @property {number | null} refundAmount - Refund amount if cancelled
 * @property {"pending" | "paid" | "refunded"} paymentStatus - Payment status
 * @property {string} notes - Additional booking notes
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PaymentStatus = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
};

export const CancellationReasons = [
  "Schedule conflict",
  "Found alternative",
  "Budget constraints",
  "Trip cancelled",
  "Equipment not suitable",
  "Other",
];

export const RefundPolicy = {
  MORE_THAN_48H: 0.9, // 90% refund
  BETWEEN_24H_48H: 0.5, // 50% refund
  LESS_THAN_24H: 0, // No refund
};