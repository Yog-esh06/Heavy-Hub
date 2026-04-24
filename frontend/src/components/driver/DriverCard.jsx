import React from "react";
import DriverBadge from "./DriverBadge";

const DriverCard = ({ driver, onSelect, selected = false }) => {
  if (!driver) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition ${
        selected ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {driver.fullName || driver.name || "Unnamed driver"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {driver.phone || "Phone not added"}
          </p>
        </div>
        <div className="flex gap-2">
          <DriverBadge status={driver.applicationStatus || "pending"} />
          <DriverBadge status={driver.isAvailable ? "available" : "unavailable"} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-900">Experience:</span>{" "}
          {driver.yearsOfExperience ?? driver.experienceYears ?? 0} years
        </div>
        <div>
          <span className="font-medium text-gray-900">Fee:</span>{" "}
          INR {Number(driver.feePerDay || 0).toLocaleString("en-IN")}/day
        </div>
        <div>
          <span className="font-medium text-gray-900">Rating:</span>{" "}
          {Number(driver.rating || 0).toFixed(1)}
        </div>
        <div>
          <span className="font-medium text-gray-900">Jobs:</span>{" "}
          {driver.totalJobs || driver.totalJobsCompleted || 0}
        </div>
      </div>

      {Array.isArray(driver.vehicleTypes) && driver.vehicleTypes.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {driver.vehicleTypes.map((type) => (
            <span
              key={type}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
            >
              {type}
            </span>
          ))}
        </div>
      ) : null}

      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(driver)}
          className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          {selected ? "Selected" : "Choose Driver"}
        </button>
      ) : null}
    </div>
  );
};

export default DriverCard;
