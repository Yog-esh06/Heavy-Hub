async function sendNotification({
  type,
  recipientId,
  title,
  message,
  bookingId,
  vehicleName,
  renterName,
}) {
  const payload = {
    type: type || "generic",
    recipientId: recipientId || null,
    title: title || "HeavyHub notification",
    message:
      message ||
      [
        vehicleName ? `Vehicle: ${vehicleName}` : null,
        renterName ? `Renter: ${renterName}` : null,
        bookingId ? `Booking: ${bookingId}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
    bookingId: bookingId || null,
    createdAt: new Date().toISOString(),
  };

  console.log("sendNotification placeholder:", payload);

  return {
    success: true,
    delivered: false,
    payload,
  };
}

module.exports = { sendNotification };
