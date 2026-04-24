import React, { useEffect, useState } from "react";

const normalizeLocation = (location) => ({
  address: location?.address || "",
  lat: location?.lat ?? "",
  lng: location?.lng ?? "",
});

const LocationPicker = ({ initialLocation = null, onLocationSelect }) => {
  const [form, setForm] = useState(normalizeLocation(initialLocation));
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    setForm(normalizeLocation(initialLocation));
  }, [initialLocation]);

  useEffect(() => {
    if (form.address || form.lat || form.lng) {
      const lat = form.lat === "" ? null : Number(form.lat);
      const lng = form.lng === "" ? null : Number(form.lng);

      onLocationSelect?.({
        address: form.address,
        lat,
        lng,
      });
    }
  }, [form, onLocationSelect]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setGeoLoading(false);
      },
      (error) => {
        setGeoError(error.message || "Unable to fetch location.");
        setGeoLoading(false);
      }
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
        <textarea
          rows="3"
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Village, district, state, landmark"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(event) => updateField("lat", event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="28.6139"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            step="any"
            value={form.lng}
            onChange={(event) => updateField("lng", event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="77.2090"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={geoLoading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
        >
          {geoLoading ? "Fetching..." : "Use current location"}
        </button>

        <p className="text-xs text-gray-500">Manual coordinates work too if Maps is not configured yet.</p>
      </div>

      {geoError ? <p className="text-sm text-red-600">{geoError}</p> : null}
    </div>
  );
};

export default LocationPicker;
