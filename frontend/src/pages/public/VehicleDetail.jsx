import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import DriverToggle from "../../components/booking/DriverToggle";
import MapView from "../../components/maps/MapView";
import StarRating from "../../components/ui/StarRating";
import AvailabilityCalendar from "../../components/vehicle/AvailabilityCalendar";
import PricingCard from "../../components/vehicle/PricingCard";
import VehicleGallery from "../../components/vehicle/VehicleGallery";
import VehicleSpecs from "../../components/vehicle/VehicleSpecs";
import { getVehicleById, searchVehicles } from "../../services/vehicles.service";

const VehicleDetail = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [relatedVehicles, setRelatedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverRequired, setDriverRequired] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [activeTab, setActiveTab] = useState("rent");

  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      const data = await getVehicleById(vehicleId);
      setVehicle(data);
      const related = await searchVehicles(data?.type || "");
      setRelatedVehicles(related.filter((item) => item.id !== vehicleId).slice(0, 3));
      setLoading(false);
    };

    loadVehicle();
  }, [vehicleId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading vehicle...</div>;
  }

  if (!vehicle) {
    return <div className="container mx-auto px-4 py-8">Vehicle not found.</div>;
  }

  const hasBothListings = vehicle.listingType === "both";
  const isRent = activeTab === "rent" && (hasBothListings || vehicle.listingType === "rent");
  const isSale = activeTab === "sale" && (hasBothListings || vehicle.listingType === "sale");

  const requireAuth = () => {
    if (!user) {
      navigate("/login", { state: { from: `/vehicle/${vehicle.id}` } });
      return true;
    }
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {hasBothListings ? (
        <div className="mb-6 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("rent")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "rent" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => setActiveTab("sale")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "sale" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
          >
            Buy
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-2/3">
          <VehicleGallery images={vehicle.images || []} />
          <div className="mt-6">
            <h1 className="text-2xl font-bold">{vehicle.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={Math.round(vehicle.rating || 0)} readOnly />
              <span className="text-sm text-gray-600">({vehicle.reviewCount || 0} reviews)</span>
            </div>
            <div className="mt-6">
              <VehicleSpecs vehicle={vehicle} />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-xl font-semibold">Location</h2>
            <MapView location={vehicle.location} className="min-h-[220px]" markerTitle={vehicle.name} />
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-8 space-y-4">
            <PricingCard
              price={isRent ? vehicle.pricePerDay : vehicle.salePrice}
              priceType={isRent ? "per day" : "one-time"}
              driverFee={isRent && driverRequired ? vehicle.driverFeePerDay : null}
            />

            {isRent ? (
              <>
                <AvailabilityCalendar
                  bookedDates={vehicle.bookedDates || []}
                  onSelectDates={(start, end) => setSelectedDates({ start, end })}
                />
                <DriverToggle
                  enabled={driverRequired}
                  onChange={setDriverRequired}
                  driverFee={vehicle.driverFeePerDay}
                />
                <button
                  onClick={() => {
                    if (!requireAuth()) navigate("/dashboard/renter/cart");
                  }}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {selectedDates.start && selectedDates.end ? "Continue to booking" : "Sign in to book"}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (!requireAuth()) alert(`Contact owner: ${vehicle.ownerPhone || "Phone will be shared after login"}`);
                }}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
              >
                Contact seller
              </button>
            )}
          </div>
        </div>
      </div>

      {relatedVehicles.length > 0 ? (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Related vehicles</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedVehicles.map((item) => (
              <div key={item.id} className="rounded-lg bg-white p-4 shadow">
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="h-40 w-full rounded object-cover"
                />
                <h3 className="mt-3 font-semibold">{item.name}</h3>
                <button
                  onClick={() => navigate(`/vehicle/${item.id}`)}
                  className="mt-3 text-sm font-medium text-blue-600"
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VehicleDetail;
