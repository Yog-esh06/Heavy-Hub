import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../store/CartContext";
import { useNotification } from "../../store/NotificationContext";
import { formatCurrency } from "../../utils/pricing";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import StarRating from "../ui/StarRating";

const VehicleCard = ({ vehicle, onAddToCart }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();

  const handleAddToCart = async () => {
    if (!user) {
      onAddToCart?.();
      return;
    }

    try {
      await addToCart({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleImage: vehicle.images?.[0] || "",
        pricePerDay: vehicle.pricePerDay || 0,
        driverRequested: false,
        driverFeePerDay: vehicle.driverFeePerDay || 0,
        startDate: "",
        endDate: "",
        startTime: "",
        totalDays: 1,
        totalAmount: vehicle.pricePerDay || 0,
      });
      showSuccess(`${vehicle.name} added to cart`);
      onAddToCart?.();
    } catch {
      showError("Failed to add vehicle to cart");
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={vehicle.images?.[0] || "https://via.placeholder.com/300x200"}
          alt={vehicle.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute right-3 top-3 flex gap-2">
          <Badge variant="primary">{String(vehicle.type || "").toUpperCase()}</Badge>
          <Badge variant="secondary">{vehicle.listingType}</Badge>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{vehicle.name}</h3>
          <p className="text-sm text-gray-600">
            {vehicle.location?.district}, {vehicle.location?.state}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={Math.round(vehicle.rating || 0)} readOnly size="sm" />
          <span className="text-xs text-gray-600">({vehicle.reviewCount || 0} reviews)</span>
        </div>

        <div className="border-t pt-3">
          {vehicle.listingType === "rent" || vehicle.listingType === "both" ? (
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(vehicle.pricePerDay || 0)}/day
            </p>
          ) : null}
          {vehicle.listingType === "sale" || vehicle.listingType === "both" ? (
            <p className="text-lg font-bold text-green-600">{formatCurrency(vehicle.salePrice || 0)}</p>
          ) : null}
        </div>

        <div className="flex gap-2 pt-2">
          <Link to={`/vehicle/${vehicle.id}`} className="flex-1">
            <Button variant="secondary" fullWidth size="sm">
              View Details
            </Button>
          </Link>
          {(vehicle.listingType === "rent" || vehicle.listingType === "both") && (
            <Button variant="primary" size="sm" onClick={handleAddToCart} className="flex-1">
              {user ? "Add to Cart" : "Book"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
