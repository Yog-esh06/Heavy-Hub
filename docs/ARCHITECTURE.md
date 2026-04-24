
```markdown
# docs/ARCHITECTURE.md

## HeavyHub Architecture Overview

### System Diagram (ASCII)
┌─────────────────────────────────────────────────────────────┐
│ Client Browser │
│ React SPA (Vite + Tailwind) │
└─────────────┬───────────────────────┬───────────────────────┘
│ │
│ (Firebase SDK) │ (REST / Maps API)
▼ ▼
┌──────────────┐ ┌─────────────┐
│ Firebase │ │ Google Maps │
│ Services │ │ API Key │
└──────┬───────┘ └─────────────┘
│
┌────────┼────────┬──────────────┐
▼ ▼ ▼ ▼
┌──────┐ ┌──────┐ ┌────────┐ ┌────────────┐
│ Auth │ │Firestore│ Storage │ │ Cloud │
│(Google)│ (NoSQL) │ (Images)│ │ Functions │
└──────┘ └──────┘ └────────┘ └─────┬──────┘
│
▼
┌──────────┐
│ Stripe │
│ (future) │
└──────────┘

### Data Flow: Read vs Write

**Reads (client direct to Firestore):**
- Vehicle browsing, filtering, sorting
- Fetching user profiles, bookings, cart
- Uses custom React hooks (useVehicles, useBookings, useCart)

**Writes (via Cloud Functions for critical operations):**
- Creating a booking (validates availability, calculates total)
- Cancelling a booking (handles refund logic)
- Deleting a listing (checks for active bookings)
- Creating a listing (with image upload, geocoding)
- Driver application approval (triggers email)

**Why?**
- Firestore rules prevent direct write to "pending" bookings without payment
- Cloud Functions centralize business logic and allow complex transactions

### Authentication Flow
User clicks "Sign in with Google"

Firebase Auth returns user credential

App checks Firestore: users/{uid} exists?

If NO: create user doc with empty roles[]

Show role selection screen

User picks role(s) → update users/{uid}/roles

Redirect to dashboard where DashboardRouter reads user.roles

RoleRoute components restrict admin pages

### Role System

| Role     | Dashboard View                          | Permissions                                |
|----------|------------------------------------------|--------------------------------------------|
| renter   | RenterDashboard                          | Browse, create bookings, reviews, cart     |
| owner    | OwnerDashboard                           | CRUD listings, accept/reject bookings      |
| driver   | DriverDashboard + JobDetail              | Accept job invites, mark completed         |
| admin    | AdminDashboard + ManageUsers/Listings    | Verify listings, manage users, delete any  |

Users can have multiple roles (e.g., both renter and owner).  
The DashboardRouter shows a role switcher dropdown if roles.length > 1.

### Driver Assignment Algorithm (Simplified)

When a booking is created with `driverRequested = true`:

1. Query `drivers` where:
   - `applicationStatus == "approved"`
   - `isAvailable == true`
   - `vehicleTypes` array contains booking.vehicle.type
   - Distance between driver.currentLocation and booking.pickupLocation < 50km

2. Sort by:
   - Nearest first (uses geohashing or simple Haversine)
   - Highest rating
   - Least recent job (fair load balancing)

3. Assign first driver → update booking.driverId

4. Send push notification (via FCM) to driver

*Note: In MVP, assignment can be manual (owner chooses) or automatic via cron job.*

### Security Rules Highlights (firestore.rules excerpt)

```javascript
match /vehicles/{doc} {
  allow read: if true;
  allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
  allow update: if request.auth != null && 
    (resource.data.ownerId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']));
}

match /bookings/{doc} {
  allow read: if request.auth != null && 
    (resource.data.renterId == request.auth.uid ||
     resource.data.ownerId == request.auth.uid ||
     resource.data.driverId == request.auth.uid);
  allow create: if request.auth != null && !exists(/databases/$(database)/documents/bookings/$(doc));
}
