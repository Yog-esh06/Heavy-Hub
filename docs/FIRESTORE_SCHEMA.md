
```markdown
# docs/FIRESTORE_SCHEMA.md

## Firestore Collections & Documents

### 1. users
Stores all platform users (created upon first Google sign-in).

| Field           | Type          | Description                                    |
|-----------------|---------------|------------------------------------------------|
| uid (doc id)    | string        | Firebase Auth UID                             |
| email           | string        | User email (unique)                           |
| displayName     | string        | From Google profile                           |
| photoURL        | string        | Profile picture URL                           |
| roles           | array<string> | ["renter","owner","driver","admin"]           |
| createdAt       | timestamp     | Account creation time                         |
| lastLoginAt     | timestamp     | Last sign-in                                  |
| phone           | string        | (optional) User phone number                  |

### 2. vehicles
Equipment listings (for rent and/or sale).

| Field             | Type          | Description                                      |
|-------------------|---------------|--------------------------------------------------|
| id (auto)         | string        | Document ID                                     |
| ownerId           | string        | Reference to users.uid                          |
| ownerName         | string        | Denormalized for performance                    |
| name              | string        | Equipment name (e.g., "JCB 3DX")                |
| type              | string        | excavator, bulldozer, crane, loader, etc.       |
| brand             | string        | Manufacturer                                    |
| model             | string        | Model number                                    |
| year              | number        | Manufacturing year                              |
| description       | string        | Long text description                           |
| listingType       | string        | "rent", "sale", "both"                          |
| pricePerDay       | number        | For rent, in INR                                |
| pricePerHour      | number        | Optional hourly rate                            |
| salePrice         | number        | For sale, one-time price                        |
| driverAvailable   | boolean       | Can driver be requested?                        |
| driverFeePerDay   | number        | Additional fee if driver requested              |
| location          | GeoPoint + address object | Pickup location (lat, lng, address)  |
| images            | array<string> | URLs from Firebase Storage                      |
| bookedDates       | array<object> | {start: timestamp, end: timestamp}              |
| status            | string        | "active", "inactive", "deleted"                 |
| isVerified        | boolean       | Admin verified badge                            |
| rating            | number        | Average rating (0-5)                            |
| reviewCount       | number        | Number of reviews                               |
| horsePower        | number        | Engine power (optional)                         |
| weight            | number        | Weight in kg                                    |
| fuelType          | string        | diesel, petrol, electric                        |
| capacity          | string        | Load capacity (tons / liters)                   |
| createdAt         | timestamp     | Listing creation time                           |
| updatedAt         | timestamp     | Last edit                                       |

### 3. bookings
Rental/sale transactions.

| Field           | Type          | Description                                      |
|-----------------|---------------|--------------------------------------------------|
| id (auto)       | string        |                                                  |
| vehicleId       | string        | Ref → vehicles                                  |
| vehicleName     | string        | Denormalized                                    |
| renterId        | string        | Ref → users (customer)                          |
| ownerId         | string        | Ref → users (equipment owner)                   |
| driverId        | string        | Ref → drivers (if assigned)                     |
| driverRequested | boolean       |                                                  |
| startDate       | timestamp     | Start of rental                                 |
| endDate         | timestamp     | End of rental                                   |
| startTime       | string        | "09:00" format                                  |
| pickupLocation  | GeoPoint + address |                                            |
| totalDays       | number        |                                                |
| pricePerDay     | number        | Rate at booking time                            |
| driverFeePerDay | number        | If driver requested                             |
| totalAmount     | number        | Total cost (days * (price+driverFee))           |
| driverEarnings  | number        | For driver payout calculation                   |
| status          | string        | pending, confirmed, active, completed, cancelled |
| cancellationReason | string     | If cancelled                                    |
| refundAmount    | number        | Partial refund amount                           |
| createdAt       | timestamp     | Booking creation                                |
| completedAt     | timestamp     | When status became completed                    |
| renterName      | string        | Denormalized                                    |
| renterPhone     | string        | Denormalized                                    |

### 4. cart
Cart items per user (subcollection under users).

**Path:** /users/{uid}/cart/{itemId}

| Field           | Type          | Description                                      |
|-----------------|---------------|--------------------------------------------------|
| vehicleId       | string        | Ref → vehicles                                  |
| name            | string        | Denormalized                                    |
| images          | array<string> | First image URL                                 |
| startDate       | timestamp     | Selected start                                  |
| endDate         | timestamp     | Selected end                                    |
| totalDays       | number        | Calculated                                      |
| pricePerDay     | number        |                                                  |
| driverRequired  | boolean       | User toggles driver                             |
| driverFeePerDay | number        |                                                  |
| subtotal        | number        | (pricePerDay * totalDays) + driver fees         |
| addedAt         | timestamp     |                                                  |

### 5. drivers
Driver profiles (approved drivers only).

| Field             | Type          | Description                                      |
|-------------------|---------------|--------------------------------------------------|
| id (auto)         | string        |                                                  |
| userId            | string        | Ref → users.uid                                 |
| email             | string        | From user                                       |
| fullName          | string        |                                                  |
| phone             | string        |                                                  |
| licenseNumber     | string        |                                                  |
| licenseExpiry     | timestamp     |                                                  |
| yearsOfExperience | number        |                                                  |
| vehicleTypes      | array<string> | ["excavator","bulldozer",...]                   |
| feePerDay         | number        | Driver's daily rate                             |
| currentLocation   | GeoPoint      | Last known location                             |
| documents         | object        | {licensePhoto, aadharPhoto, profilePhoto} URLs |
| applicationStatus | string        | pending, approved, rejected                     |
| rejectionReason   | string        | If rejected                                     |
| isAvailable       | boolean       | Toggle for accepting jobs                       |
| rating            | number        | Average from reviews                            |
| totalJobs         | number        | Completed jobs count                            |
| createdAt         | timestamp     |                                                  |

### 6. reviews
Ratings and feedback for vehicles and drivers.

| Field        | Type      | Description                           |
|--------------|-----------|---------------------------------------|
| id (auto)    | string    |                                       |
| bookingId    | string    | Ref → bookings                        |
| vehicleId    | string    | Ref → vehicles                        |
| driverId     | string    | Ref → drivers (optional)              |
| renterId     | string    | Ref → users                           |
| ownerId      | string    | Ref → users                           |
| rating       | number    | 1-5                                   |
| comment      | string    | Text feedback                         |
| createdAt    | timestamp |                                       |

### 7. interests (subcollection under vehicles or users)
When renter marks "interested" in a sale vehicle.

| Field        | Type      | Description                           |
|--------------|-----------|---------------------------------------|
| renterId     | string    | Ref → users                           |
| renterEmail  | string    |                                       |
| createdAt    | timestamp |                                       |
| status       | string    | pending, contacted                    |

---

## Indexes Required

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "renterId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "vehicles",
      "fields": [
        { "fieldPath": "listingType", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}