import React from "react";
import { calculateHaversineDistance, formatDistance } from "../../utils/distance";

const ProximityMap = ({ center, drivers = [] }) => {
  const rows = drivers
    .map((driver) => {
      const location = driver.currentLocation || driver.location;
      if (!center || !location?.lat || !location?.lng) {
        return { driver, distance: null };
      }

      return {
        driver,
        distance: calculateHaversineDistance(
          center.lat,
          center.lng,
          location.lat,
          location.lng
        ),
      };
    })
    .sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nearby drivers</h3>
        <p className="text-sm text-gray-600">
          Lightweight fallback view until full map rendering is wired in.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No drivers available for this area yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ driver, distance }) => (
            <div
              key={driver.id || driver.userId}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {driver.fullName || driver.name || "Unnamed driver"}
                </p>
                <p className="text-sm text-gray-600">
                  {driver.phone || "No phone"} | Rating {Number(driver.rating || 0).toFixed(1)}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {distance == null ? "Distance unknown" : formatDistance(distance)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProximityMap;
