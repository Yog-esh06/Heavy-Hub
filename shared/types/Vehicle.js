/**
 * @typedef {Object} Vehicle
 * @property {string} id
 * @property {string} ownerId
 * @property {string} name
 * @property {string} type
 * @property {string} brand
 * @property {string} model
 * @property {number} year
 * @property {"rent" | "sale" | "both"} listingType
 * @property {number} pricePerDay
 * @property {number} salePrice
 * @property {boolean} driverAvailable
 * @property {number} driverFeePerDay
 * @property {{lat: number, lng: number, address: string}} location
 * @property {string[]} images
 * @property {string[]} bookedDates
 * @property {"draft" | "active" | "inactive" | "deleted" | "sold"} status
 * @property {number} rating
 * @property {number} reviewCount
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export const VehicleTypes = {
  TRACTOR: "tractor",
  HARVESTER: "harvester",
  JCB: "jcb",
  EXCAVATOR: "excavator",
  BULLDOZER: "bulldozer",
  CRANE: "crane",
  LOADER: "loader",
  BACKHOE: "backhoe",
  DUMP_TRUCK: "dump_truck",
  FORKLIFT: "forklift",
  GRADER: "grader",
  ROLLER: "roller",
};

export const ListingTypes = {
  RENT: "rent",
  SALE: "sale",
  BOTH: "both",
};

export const VehicleStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
  DELETED: "deleted",
  SOLD: "sold",
};

export const FuelTypes = {
  DIESEL: "diesel",
  PETROL: "petrol",
  ELECTRIC: "electric",
  HYBRID: "hybrid",
};
