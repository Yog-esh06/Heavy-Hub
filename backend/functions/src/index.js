const { onUserCreate } = require("./auth/onUserCreate");
const { createBooking } = require("./bookings/createBooking");
const { cancelBooking } = require("./bookings/cancelBooking");
const { onBookingCreate } = require("./bookings/onBookingCreate");
const { assignDriver } = require("./drivers/assignDriver");
const { onDriverApply } = require("./drivers/onDriverApply");
const { createListing } = require("./listings/createListing");
const { deleteListing } = require("./listings/deleteListing");

// Auth triggers
exports.onUserCreate = onUserCreate;

// Booking functions
exports.createBooking = createBooking;
exports.cancelBooking = cancelBooking;
exports.onBookingCreate = onBookingCreate;

// Driver functions
exports.assignDriver = assignDriver;
exports.onDriverApply = onDriverApply;

// Listing functions
exports.createListing = createListing;
exports.deleteListing = deleteListing;