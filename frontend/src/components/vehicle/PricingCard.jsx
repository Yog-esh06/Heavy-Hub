import React from "react";
import { formatCurrency } from "../../utils/pricing";

const PricingCard = ({ price = 0, priceType = "per day", driverFee = null }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Pricing</p>
      <p className="mt-3 text-3xl font-bold text-gray-900">{formatCurrency(price || 0)}</p>
      <p className="mt-1 text-sm text-gray-600">{priceType}</p>

      {driverFee != null ? (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Driver fee: {formatCurrency(driverFee)} / day
        </div>
      ) : null}
    </div>
  );
};

export default PricingCard;
