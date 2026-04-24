import React from "react";
import { formatCurrency } from "../../utils/pricing";
import Button from "../ui/Button";

const CartSummary = ({ items = [], onCheckout, loading = false }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + tax;

  const vehicleTotal = items.reduce(
    (sum, item) => sum + (item.pricePerDay * item.totalDays || 0),
    0
  );
  const driverTotal = items.reduce(
    (sum, item) =>
      sum +
      (item.driverRequested ? item.driverFeePerDay * item.totalDays : 0),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 sticky top-20">
      <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>

      <div className="space-y-3 pb-4 border-b">
        {/* Subtotal breakdown */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Equipment Rental</span>
          <span className="font-semibold">{formatCurrency(vehicleTotal)}</span>
        </div>

        {driverTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Driver Services</span>
            <span className="font-semibold">{formatCurrency(driverTotal)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Subtotal</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Tax (5%)</span>
          <span className="font-semibold">{formatCurrency(tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-green-600">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Checkout button */}
      <Button
        onClick={onCheckout}
        variant="primary"
        fullWidth
        loading={loading}
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </Button>

      {/* Info */}
      <div className="bg-green-50 rounded-lg p-3 text-xs text-green-800 space-y-1">
        <p>
          <strong>✓ Transparent Pricing:</strong> No hidden charges
        </p>
        <p>
          <strong>✓ Flexible Cancellation:</strong> 48-hour cancellation window
        </p>
      </div>
    </div>
  );
};

export default CartSummary;