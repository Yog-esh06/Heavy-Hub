import React, { useMemo, useState } from "react";
import { calculateHaversineDistance, formatDistance } from "../../utils/distance";

const NearbyVehicles = ({ vehicles = [], center = null }) => {
  const [view, setView] = useState("list");
  const items = vehicles
    .map((vehicle) => {
      const location = vehicle.location || {};
      const hasCoords =
        center?.lat != null &&
        center?.lng != null &&
        location?.lat != null &&
        location?.lng != null;

      return {
        ...vehicle,
        distance: hasCoords
          ? calculateHaversineDistance(center.lat, center.lng, location.lat, location.lng)
          : null,
      };
    })
    .sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE));

  const regionHeat = useMemo(() => {
    const buckets = new Map();
    items.forEach((vehicle) => {
      const label =
        vehicle.location?.district ||
        vehicle.location?.state ||
        vehicle.location?.address ||
        "Unknown region";
      buckets.set(label, (buckets.get(label) || 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const maxCount = Math.max(...regionHeat.map((item) => item.count), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Nearby vehicles</h2>
          <p className="text-sm text-gray-600">
            Explore list, spread, and heat-style density views.
          </p>
        </div>
        <div className="flex rounded-full border border-gray-200 bg-slate-50 p-1 text-xs">
          {["list", "spread", "heatmap"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-3 py-1 capitalize ${
                view === mode ? "bg-slate-900 text-white" : "text-slate-600"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No vehicles matched the current filters.</p>
      ) : view === "list" ? (
        <div className="space-y-3">
          {items.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{vehicle.name}</p>
                <p className="text-sm text-gray-600">
                  {vehicle.location?.address || "Address not provided"}
                </p>
              </div>
              <div className="text-sm text-gray-700">
                {vehicle.distance == null ? "Distance unavailable" : formatDistance(vehicle.distance)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {items.length > 0 && view === "spread" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((vehicle, index) => {
            const left = 10 + ((index * 17) % 70);
            const top = 12 + ((index * 23) % 65);
            return (
              <div key={vehicle.id} className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                <div className="relative h-44 overflow-hidden rounded-xl bg-slate-900">
                  <div
                    className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-400 shadow-lg"
                    style={{ left: `${left}%`, top: `${top}%` }}
                  />
                  <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700">
                    {vehicle.name}
                    <div className="mt-1 text-slate-500">
                      {vehicle.distance == null ? "Distance unavailable" : formatDistance(vehicle.distance)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {items.length > 0 && view === "heatmap" ? (
        <div className="space-y-3">
          {regionHeat.map((region) => (
            <div key={region.label} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{region.label}</p>
                <span className="text-sm text-slate-500">{region.count} vehicles</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"
                  style={{ width: `${(region.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default NearbyVehicles;
