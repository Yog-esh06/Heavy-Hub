/**
 * @typedef {Object} Driver
 * @property {string} uid - Firebase UID (same as user's uid)
 * @property {string} userId - Reference to user document
 * @property {string} name - Full name
 * @property {string} phone - Contact phone number
 * @property {string} licenseNumber - Driving license number
 * @property {string} licenseExpiry - License expiry date in "YYYY-MM-DD" format
 * @property {number} experienceYears - Years of driving experience
 * @property {string[]} vehicleTypesExperienced - Types of vehicles driver can operate
 * @property {{lat: number, lng: number, address: string}} location - Current location
 * @property {boolean} isAvailable - Whether driver is currently available for jobs
 * @property {string | null} currentJobId - Current booking/job ID if assigned
 * @property {number} rating - Average rating (1-5)
 * @property {number} reviewCount - Total number of reviews
 * @property {number} totalJobsCompleted - Total completed jobs
 * @property {number} feePerDay - Driver's daily fee
 * @property {boolean} isVerified - Admin verification status
 * @property {{license: string, aadhar: string, photo: string}} documents - Document URLs from Firebase Storage
 * @property {"pending" | "approved" | "rejected"} applicationStatus - Application status
 * @property {Date} createdAt - Application creation timestamp
 */

export const DriverApplicationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const AvailableVehicleTypes = [
  "tractor",
  "harvester",
  "jcb",
  "excavator",
  "bulldozer",
  "crane",
];