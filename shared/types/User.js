/**
 * @typedef {Object} User
 * @property {string} uid - Firebase Authentication UID
 * @property {string} email - User email address
 * @property {string} displayName - Display name
 * @property {string} photoURL - Profile photo URL from Firebase Storage
 * @property {string} phone - Phone number
 * @property {"renter" | "owner" | "driver" | "admin"} role - Primary role (deprecated: use roles array)
 * @property {string[]} roles - Array of roles user has (can be multiple)
 * @property {string} activeRole - Currently active role in dashboard
 * @property {{lat: number, lng: number, address: string}} location - User's default location
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last profile update timestamp
 */

export const UserRoles = {
  RENTER: "renter",
  OWNER: "owner",
  DRIVER: "driver",
  ADMIN: "admin",
};

export const RoleDescriptions = {
  renter: "I want to rent equipment",
  owner: "I want to list equipment",
  driver: "I want to be a driver",
  admin: "Administrator",
};