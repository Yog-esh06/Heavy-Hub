import React from "react";

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  available: "bg-blue-100 text-blue-800",
  unavailable: "bg-gray-100 text-gray-700",
};

const DriverBadge = ({ status = "pending", children }) => {
  const normalized = String(status).toLowerCase();
  const label = children || normalized;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        STATUS_STYLES[normalized] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
};

export default DriverBadge;
