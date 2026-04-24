import React from "react";

const DriverToggle = ({
  enabled = false,
  onChange,
  driverFee = 0,
  disabled = false,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Add driver</h3>
          <p className="mt-1 text-sm text-gray-600">
            Include a verified operator for this booking.
          </p>
          {driverFee > 0 ? (
            <p className="mt-2 text-sm font-medium text-green-700">
              Additional fee: INR {Number(driverFee).toLocaleString("en-IN")} per day
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Driver pricing will be confirmed by owner.</p>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(!enabled)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${
            enabled ? "bg-green-600" : "bg-gray-300"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          aria-pressed={enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default DriverToggle;
