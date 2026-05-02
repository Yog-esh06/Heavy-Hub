import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NearbyVehicles from "../../components/maps/NearbyVehicles";
import VehicleCard from "../../components/vehicle/VehicleCard";
import VehicleFilters from "../../components/vehicle/VehicleFilters";
import { useVehicles } from "../../hooks/useVehicles";

const BrowseRent = () => {
  const navigate = useNavigate();
  const baseFilters = {
    listingType: "rent",
    type: "",
    minPrice: undefined,
    maxPrice: undefined,
    location: null,
    radius: 50,
    driverAvailable: false,
  };
  const [filters, setFilters] = useState(baseFilters);
  const [sortBy, setSortBy] = useState("price_asc");
  const [viewMode, setViewMode] = useState("grid");

  const { vehicles, loading, error } = useVehicles(filters);

  const sortedVehicles = [...vehicles].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return (a.pricePerDay || 0) - (b.pricePerDay || 0);
      case "price_desc":
        return (b.pricePerDay || 0) - (a.pricePerDay || 0);
      case "rating_desc":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading rentals...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error loading vehicles: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-1/4">
          <VehicleFilters
            onApplyFilters={(newFilters) => setFilters({ ...baseFilters, ...newFilters })}
          />
        </aside>

        <main className="lg:w-3/4">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-gray-600">{sortedVehicles.length} results found</div>
            <div className="flex gap-4">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                    viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`rounded-r-md border border-l-0 border-gray-300 px-4 py-2 text-sm font-medium ${
                    viewMode === "map" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Map
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest rated</option>
              </select>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onAddToCart={() => navigate("/login", { state: { from: `/vehicle/${vehicle.id}` } })}
                />
              ))}
            </div>
          ) : (
            <NearbyVehicles vehicles={sortedVehicles} center={filters.location || { lat: 28.6139, lng: 77.209 }} />
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseRent;
