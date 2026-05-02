const createVehiclePlaceholder = (name, type, accent) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#f3f4f6" />
      <rect x="70" y="70" width="1060" height="660" rx="36" fill="${accent}" opacity="0.12" />
      <rect x="120" y="540" width="960" height="90" rx="24" fill="${accent}" opacity="0.18" />
      <circle cx="340" cy="610" r="72" fill="#1f2937" />
      <circle cx="860" cy="610" r="72" fill="#1f2937" />
      <circle cx="340" cy="610" r="32" fill="#9ca3af" />
      <circle cx="860" cy="610" r="32" fill="#9ca3af" />
      <rect x="250" y="380" width="520" height="120" rx="28" fill="${accent}" opacity="0.88" />
      <rect x="720" y="330" width="140" height="170" rx="20" fill="${accent}" opacity="0.7" />
      <rect x="760" y="250" width="28" height="130" rx="12" fill="#374151" />
      <text x="120" y="185" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#111827">${name}</text>
      <text x="120" y="255" font-family="Arial, sans-serif" font-size="30" fill="#374151">${type}</text>
      <text x="120" y="690" font-family="Arial, sans-serif" font-size="28" fill="#4b5563">HeavyHub demo listing</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const demoVehicles = [
  {
    id: "demo-excavator-1",
    ownerId: "demo-owner-1",
    ownerName: "Singh Earthmovers",
    ownerPhone: "9876543210",
    name: "JCB 3DX Super",
    type: "jcb",
    brand: "JCB",
    model: "3DX",
    year: 2022,
    description: "Well-maintained backhoe loader for construction and roadwork.",
    listingType: "rent",
    pricePerDay: 6500,
    salePrice: null,
    driverAvailable: true,
    driverFeePerDay: 1200,
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: "New Delhi, Delhi",
      state: "Delhi",
      district: "New Delhi"
    },
    images: [createVehiclePlaceholder("JCB 3DX Super", "JCB Loader", "#f59e0b")],
    bookedDates: [],
    status: "active",
    rating: 4.6,
    reviewCount: 18
  },
  {
    id: "demo-crane-1",
    ownerId: "demo-owner-2",
    ownerName: "Mohan Infra",
    ownerPhone: "9811122233",
    name: "Hydra 14 Crane",
    type: "crane",
    brand: "ACE",
    model: "Hydra 14",
    year: 2021,
    description: "Reliable mobile crane available for city and industrial jobs.",
    listingType: "rent",
    pricePerDay: 9000,
    salePrice: null,
    driverAvailable: true,
    driverFeePerDay: 1800,
    location: {
      lat: 28.4595,
      lng: 77.0266,
      address: "Gurugram, Haryana",
      state: "Haryana",
      district: "Gurugram"
    },
    images: [createVehiclePlaceholder("Hydra 14 Crane", "Mobile Crane", "#2563eb")],
    bookedDates: [],
    status: "active",
    rating: 4.8,
    reviewCount: 11
  },
  {
    id: "demo-loader-1",
    ownerId: "demo-owner-3",
    ownerName: "Patel Machinery",
    ownerPhone: "9825012345",
    name: "Wheel Loader ZX200",
    type: "loader",
    brand: "Hitachi",
    model: "ZX200",
    year: 2020,
    description: "Powerful loader for quarry, sand, and site-clearing work.",
    listingType: "both",
    pricePerDay: 7200,
    salePrice: 2450000,
    driverAvailable: false,
    driverFeePerDay: 0,
    location: {
      lat: 23.0225,
      lng: 72.5714,
      address: "Ahmedabad, Gujarat",
      state: "Gujarat",
      district: "Ahmedabad"
    },
    images: [createVehiclePlaceholder("Wheel Loader ZX200", "Wheel Loader", "#7c3aed")],
    bookedDates: [],
    status: "active",
    rating: 4.5,
    reviewCount: 9
  },
  {
    id: "demo-bulldozer-1",
    ownerId: "demo-owner-4",
    ownerName: "Kumar Projects",
    ownerPhone: "9900011122",
    name: "Bulldozer D85",
    type: "bulldozer",
    brand: "Komatsu",
    model: "D85",
    year: 2019,
    description: "Heavy-duty bulldozer for mining and land development jobs.",
    listingType: "sale",
    pricePerDay: null,
    salePrice: 3800000,
    driverAvailable: false,
    driverFeePerDay: 0,
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: "Bengaluru, Karnataka",
      state: "Karnataka",
      district: "Bengaluru Urban"
    },
    images: [createVehiclePlaceholder("Bulldozer D85", "Bulldozer", "#dc2626")],
    bookedDates: [],
    status: "active",
    rating: 4.2,
    reviewCount: 6
  },
  {
    id: "demo-tractor-1",
    ownerId: "demo-owner-5",
    ownerName: "Punjab Agro Rentals",
    ownerPhone: "9876001122",
    name: "Mahindra 475 DI Tractor",
    type: "tractor",
    brand: "Mahindra",
    model: "475 DI",
    year: 2021,
    description: "Popular field tractor for tilling, hauling, and everyday farm work.",
    listingType: "rent",
    pricePerDay: 2800,
    salePrice: null,
    driverAvailable: true,
    driverFeePerDay: 700,
    location: {
      lat: 30.7333,
      lng: 76.7794,
      address: "Chandigarh, Punjab",
      state: "Punjab",
      district: "Chandigarh"
    },
    images: [createVehiclePlaceholder("Mahindra 475 DI Tractor", "Tractor", "#16a34a")],
    bookedDates: [],
    status: "active",
    rating: 4.7,
    reviewCount: 14
  },
  {
    id: "demo-harvester-1",
    ownerId: "demo-owner-6",
    ownerName: "Kisan Harvest Services",
    ownerPhone: "9845007788",
    name: "Combine Harvester TC56",
    type: "harvester",
    brand: "New Holland",
    model: "TC56",
    year: 2020,
    description: "Combine harvester suited for wheat and paddy harvesting during peak season.",
    listingType: "rent",
    pricePerDay: 9500,
    salePrice: null,
    driverAvailable: true,
    driverFeePerDay: 1500,
    location: {
      lat: 11.0168,
      lng: 76.9558,
      address: "Coimbatore, Tamil Nadu",
      state: "Tamil Nadu",
      district: "Coimbatore"
    },
    images: [createVehiclePlaceholder("Combine Harvester TC56", "Harvester", "#0f766e")],
    bookedDates: [],
    status: "active",
    rating: 4.4,
    reviewCount: 7
  }
];
