# HeavyHub API

## Overview
HeavyHub uses Firebase as its primary backend. Most reads happen directly from Firestore in the frontend, while critical writes run through Firebase Cloud Functions so validation and transactional business logic stay server-side.

## Cloud Functions

### `createListing`
- Type: Callable function
- Purpose: Create a vehicle listing after server-side validation.
- Input:

```json
{
  "name": "JCB 3DX",
  "type": "excavator",
  "listingType": "rent",
  "pricePerDay": 5000,
  "ownerId": "uid_123",
  "location": {
    "lat": 28.6139,
    "lng": 77.209,
    "address": "New Delhi"
  },
  "images": ["https://..."]
}
```

- Returns:

```json
{
  "success": true,
  "listingId": "vehicle_abc123"
}
```

### `deleteListing`
- Type: Callable function
- Purpose: Delete or soft-delete a listing after checking for active bookings.
- Input:

```json
{
  "vehicleId": "vehicle_abc123"
}
```

### `createBooking`
- Type: Callable function
- Purpose: Create a booking, validate dates, calculate totals, and optionally trigger driver assignment.
- Input:

```json
{
  "vehicleId": "vehicle_abc123",
  "renterId": "uid_renter",
  "ownerId": "uid_owner",
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "startTime": "09:00",
  "pickupLocation": {
    "lat": 28.6139,
    "lng": 77.209,
    "address": "New Delhi"
  },
  "totalDays": 3,
  "pricePerDay": 5000,
  "driverRequested": true,
  "driverFeePerDay": 1200
}
```

### `cancelBooking`
- Type: Callable function
- Purpose: Cancel a booking and apply refund logic.
- Input:

```json
{
  "bookingId": "booking_xyz789",
  "cancellationReason": "Schedule conflict"
}
```

### `assignDriver`
- Type: Callable function
- Purpose: Find the nearest eligible driver for a booking or pickup point.
- Input:

```json
{
  "pickupLocation": {
    "lat": 28.6139,
    "lng": 77.209
  },
  "vehicleType": "excavator",
  "startDate": "2026-05-01"
}
```

## Firestore Collections
- `users`: user profile and roles
- `vehicles`: rental and sale listings
- `bookings`: booking records and status transitions
- `drivers`: driver applications and availability
- `cart/{uid}/items`: renter cart items
- `interests`: lead capture for sale listings

## Frontend Service Layer
- [`frontend/src/services/bookings.service.js`](C:/Users/Yogesh/Desktop/Projects/Heavy%20Hub/frontend/src/services/bookings.service.js)
- [`frontend/src/services/listings.service.js`](C:/Users/Yogesh/Desktop/Projects/Heavy%20Hub/frontend/src/services/listings.service.js)
- [`frontend/src/services/drivers.service.js`](C:/Users/Yogesh/Desktop/Projects/Heavy%20Hub/frontend/src/services/drivers.service.js)
- [`frontend/src/services/users.service.js`](C:/Users/Yogesh/Desktop/Projects/Heavy%20Hub/frontend/src/services/users.service.js)

## Notes
- Auth is handled with Firebase Authentication.
- Firestore is the source of truth for reads.
- Callable Cloud Functions should be used for business-critical writes.
- Notification delivery is scaffolded but still placeholder-level in the current codebase.
