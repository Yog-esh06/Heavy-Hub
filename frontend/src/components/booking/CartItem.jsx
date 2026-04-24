import React from "react";
import { useCart } from "../../store/CartContext";
import { useNotification } from "../../store/NotificationContext";
import Button from "../ui/Button";
import { formatCurrency, calculateTotalPrice } from "../../utils/pricing";

const CartItem = ({ cartItem }) => {
  const { removeFromCart } = useCart();
  const { showError } = useNotification();

  const handleRemove = async () => {
    try {
      await removeFromCart(cartItem.id);
    } catch (error) {
      showError("Failed to remove item");
    }
  };

  const pricing = calculateTotalPrice(
    cartItem.pricePerDay,
    cartItem.totalDays,
    cartItem.driverFeePerDay,
    cartItem.driverRequested
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
      {/* Image */}
      <div className="flex-shrink-0 w-24 h-24">
        <img
          src={cartItem.vehicleImage || "https://via.placeholder.com/100"}
          alt={cartItem.vehicleName}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <h3 className="font-bold text-gray-900">{cartItem.vehicleName}</h3>

        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Dates:</strong> {cartItem.startDate} to {cartItem.endDate}
          </p>
          <p>
            <strong>Days:</strong> {cartItem.totalDays}
          </p>
          {cartItem.driverRequested && (
            <p className="text-green-600 font-semibold">✓ Driver Included</p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-2">
          <span className="text-xs text-gray-600">
            {formatCurrency(cartItem.pricePerDay)}/day
          </span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(cartItem.totalAmount)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col items-end justify-between">
        <Button
          variant="danger"
          size="sm"
          onClick={handleRemove}
          className="text-xs"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default CartItem;