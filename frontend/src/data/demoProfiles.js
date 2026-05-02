import { demoVehicles } from "./demoVehicles";

const today = new Date();

const isoDate = (offsetDays) => {
  const value = new Date(today);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().split("T")[0];
};

const isoDateTime = (offsetDays) => {
  const value = new Date(today);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString();
};

const cloneVehicle = (vehicle) => ({
  ...vehicle,
  location: vehicle.location ? { ...vehicle.location } : null,
  images: [...(vehicle.images || [])],
  bookedDates: [...(vehicle.bookedDates || [])],
});

export const demoUsers = [
  {
    id: "demo-renter-profile",
    uid: "demo-renter-profile",
    email: "renter@heavyhub.demo",
    displayName: "Arjun Reddy",
    role: "renter",
    activeRole: "renter",
    roles: ["renter"],
    phone: "9876543201",
    photoURL: "",
    createdAt: isoDateTime(-120),
  },
  {
    id: "demo-owner-profile",
    uid: "demo-owner-profile",
    email: "owner@heavyhub.demo",
    displayName: "Meera Equip Rentals",
    role: "owner",
    activeRole: "owner",
    roles: ["owner"],
    phone: "9876543202",
    photoURL: "",
    createdAt: isoDateTime(-160),
  },
  {
    id: "demo-driver-profile",
    uid: "demo-driver-profile",
    email: "driver@heavyhub.demo",
    displayName: "Ravi Kumar",
    role: "driver",
    activeRole: "driver",
    roles: ["driver"],
    phone: "9876543203",
    photoURL: "",
    createdAt: isoDateTime(-200),
  },
  {
    id: "demo-admin-profile",
    uid: "demo-admin-profile",
    email: "admin@heavyhub.demo",
    displayName: "HeavyHub Admin",
    role: "admin",
    activeRole: "admin",
    roles: ["admin"],
    phone: "9876543204",
    photoURL: "",
    createdAt: isoDateTime(-260),
  },
];

export const createDemoOwnerListings = (ownerId) =>
  demoVehicles.slice(0, 3).map((vehicle, index) => ({
    ...cloneVehicle(vehicle),
    id: `demo-owner-listing-${index + 1}`,
    ownerId,
    ownerName: "Your Equipment Fleet",
    listingType: index === 2 ? "both" : "rent",
  }));

export const createDemoDriverProfile = (userId) => ({
  id: "demo-driver-record",
  userId,
  fullName: "Ravi Kumar",
  name: "Ravi Kumar",
  phone: "9876543203",
  applicationStatus: "approved",
  isAvailable: true,
  rating: 4.8,
  reviewCount: 24,
  totalJobsCompleted: 43,
  feePerDay: 1200,
  vehicleTypes: ["tractor", "jcb", "harvester"],
  location: {
    lat: 13.0827,
    lng: 80.2707,
    address: "Kancheepuram, Tamil Nadu",
  },
  currentLocation: {
    lat: 13.0827,
    lng: 80.2707,
    address: "Kancheepuram, Tamil Nadu",
  },
});

const createBooking = (booking) => ({
  notes: "",
  paymentStatus: "paid",
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
  completedAt: booking.status === "completed" ? booking.updatedAt : null,
  vehicle: booking.vehicle,
  driver: booking.driver,
  pickupLocation: booking.pickupLocation,
  ...booking,
});

export const createDemoBookings = (userId, perspective = "renter") => {
  const ownerVehicles = createDemoOwnerListings(perspective === "owner" ? userId : "demo-owner-profile");
  const renterId = perspective === "renter" ? userId : "demo-renter-profile";
  const ownerId = perspective === "owner" ? userId : "demo-owner-profile";
  const driverId = perspective === "driver" ? userId : "demo-driver-profile";

  const vehicleA = cloneVehicle(ownerVehicles[0] || demoVehicles[0]);
  const vehicleB = cloneVehicle(ownerVehicles[1] || demoVehicles[1]);
  const vehicleC = cloneVehicle(ownerVehicles[2] || demoVehicles[2]);

  return [
    createBooking({
      id: `demo-booking-${perspective}-upcoming`,
      vehicleId: vehicleA.id,
      vehicleName: vehicleA.name,
      vehicleImage: vehicleA.images?.[0] || "",
      renterId,
      renterName: "Arjun Reddy",
      renterPhone: "9876543201",
      ownerId,
      driverId,
      driverRequested: true,
      startDate: isoDate(4),
      endDate: isoDate(6),
      startTime: "08:00",
      endTime: "18:00",
      pickupLat: vehicleA.location?.lat,
      pickupLng: vehicleA.location?.lng,
      pickupAddress: vehicleA.location?.address,
      pickupLocation: vehicleA.location,
      totalDays: 3,
      pricePerDay: vehicleA.pricePerDay || 0,
      driverFee: 2400,
      driverFeePerDay: 800,
      totalAmount: (vehicleA.pricePerDay || 0) * 3 + 2400,
      status: "confirmed",
      createdAt: isoDateTime(-2),
      updatedAt: isoDateTime(-1),
      vehicle: vehicleA,
      driver: {
        id: "demo-driver-record",
        name: "Ravi Kumar",
        phone: "9876543203",
        photoURL: "",
      },
    }),
    createBooking({
      id: `demo-booking-${perspective}-active`,
      vehicleId: vehicleB.id,
      vehicleName: vehicleB.name,
      vehicleImage: vehicleB.images?.[0] || "",
      renterId,
      renterName: "Arjun Reddy",
      renterPhone: "9876543201",
      ownerId,
      driverId,
      driverRequested: false,
      startDate: isoDate(-1),
      endDate: isoDate(1),
      startTime: "09:00",
      endTime: "17:00",
      pickupLat: vehicleB.location?.lat,
      pickupLng: vehicleB.location?.lng,
      pickupAddress: vehicleB.location?.address,
      pickupLocation: vehicleB.location,
      totalDays: 3,
      pricePerDay: vehicleB.pricePerDay || 0,
      driverFee: 0,
      driverFeePerDay: 0,
      totalAmount: (vehicleB.pricePerDay || 0) * 3,
      status: "active",
      createdAt: isoDateTime(-6),
      updatedAt: isoDateTime(-1),
      vehicle: vehicleB,
      driver: null,
    }),
    createBooking({
      id: `demo-booking-${perspective}-completed-1`,
      vehicleId: vehicleC.id,
      vehicleName: vehicleC.name,
      vehicleImage: vehicleC.images?.[0] || "",
      renterId,
      renterName: "Arjun Reddy",
      renterPhone: "9876543201",
      ownerId,
      driverId,
      driverRequested: true,
      startDate: isoDate(-18),
      endDate: isoDate(-16),
      startTime: "07:30",
      endTime: "16:30",
      pickupLat: vehicleC.location?.lat,
      pickupLng: vehicleC.location?.lng,
      pickupAddress: vehicleC.location?.address,
      pickupLocation: vehicleC.location,
      totalDays: 3,
      pricePerDay: vehicleC.pricePerDay || 0,
      driverFee: 3000,
      driverFeePerDay: 1000,
      totalAmount: (vehicleC.pricePerDay || 0) * 3 + 3000,
      status: "completed",
      createdAt: isoDateTime(-24),
      updatedAt: isoDateTime(-15),
      vehicle: vehicleC,
      driver: {
        id: "demo-driver-record",
        name: "Ravi Kumar",
        phone: "9876543203",
        photoURL: "",
      },
    }),
    createBooking({
      id: `demo-booking-${perspective}-completed-2`,
      vehicleId: vehicleA.id,
      vehicleName: vehicleA.name,
      vehicleImage: vehicleA.images?.[0] || "",
      renterId,
      renterName: "Arjun Reddy",
      renterPhone: "9876543201",
      ownerId,
      driverId,
      driverRequested: false,
      startDate: isoDate(-42),
      endDate: isoDate(-40),
      startTime: "08:30",
      endTime: "18:00",
      pickupLat: vehicleA.location?.lat,
      pickupLng: vehicleA.location?.lng,
      pickupAddress: vehicleA.location?.address,
      pickupLocation: vehicleA.location,
      totalDays: 3,
      pricePerDay: vehicleA.pricePerDay || 0,
      driverFee: 0,
      driverFeePerDay: 0,
      totalAmount: (vehicleA.pricePerDay || 0) * 3,
      status: "completed",
      createdAt: isoDateTime(-50),
      updatedAt: isoDateTime(-39),
      vehicle: vehicleA,
      driver: null,
    }),
    createBooking({
      id: `demo-booking-${perspective}-cancelled`,
      vehicleId: vehicleB.id,
      vehicleName: vehicleB.name,
      vehicleImage: vehicleB.images?.[0] || "",
      renterId,
      renterName: "Arjun Reddy",
      renterPhone: "9876543201",
      ownerId,
      driverId: null,
      driverRequested: false,
      startDate: isoDate(-9),
      endDate: isoDate(-7),
      startTime: "10:00",
      endTime: "16:00",
      pickupLat: vehicleB.location?.lat,
      pickupLng: vehicleB.location?.lng,
      pickupAddress: vehicleB.location?.address,
      pickupLocation: vehicleB.location,
      totalDays: 3,
      pricePerDay: vehicleB.pricePerDay || 0,
      driverFee: 0,
      driverFeePerDay: 0,
      totalAmount: (vehicleB.pricePerDay || 0) * 3,
      status: "cancelled",
      cancellationReason: "Schedule changed",
      refundAmount: Math.round((vehicleB.pricePerDay || 0) * 2.7),
      createdAt: isoDateTime(-12),
      updatedAt: isoDateTime(-10),
      vehicle: vehicleB,
      driver: null,
    }),
  ];
};

