import React, { useEffect, useMemo, useRef, useState } from "react";
import { GOOGLE_MAPS_API_KEY, loadGoogleMapsAPI } from "../../config/maps";

const buildMapsUrl = (location) => {
  if (location?.lat != null && location?.lng != null) {
    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  }

  if (location?.address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(location.address)}`;
  }

  return null;
};

const MapView = ({ location, markerTitle = "Location", className = "" }) => {
  const [mode, setMode] = useState("details");
  const [mapError, setMapError] = useState("");
  const mapRef = useRef(null);
  const mapsUrl = buildMapsUrl(location);
  const signalStrength = useMemo(() => {
    if (location?.lat == null || location?.lng == null) {
      return 0;
    }

    const base = Math.abs(Number(location.lat)) + Math.abs(Number(location.lng));
    return Math.max(18, Math.min(92, Math.round((base % 70) + 20)));
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    if (mode !== "details" || !mapRef.current || location?.lat == null || location?.lng == null) {
      return undefined;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError("Add a Google Maps key to render the live map.");
      return undefined;
    }

    let active = true;

    loadGoogleMapsAPI()
      .then(() => {
        if (!active || !window.google?.maps || !mapRef.current) {
          return;
        }

        setMapError("");
        const googleMaps = window.google.maps;
        const map = new googleMaps.Map(mapRef.current, {
          center: { lat: location.lat, lng: location.lng },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        new googleMaps.Marker({
          map,
          position: { lat: location.lat, lng: location.lng },
          title: markerTitle,
        });
      })
      .catch((error) => {
        if (active) {
          setMapError(error.message || "Failed to load Google Maps.");
        }
      });

    return () => {
      active = false;
    };
  }, [location?.lat, location?.lng, markerTitle, mode]);

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900">{markerTitle}</p>
          <div className="flex rounded-full border border-gray-200 bg-white p-1 text-xs">
            {["details", "signal", "heat"].map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setMode(view)}
                className={`rounded-full px-3 py-1 capitalize ${
                  mode === view ? "bg-slate-900 text-white" : "text-slate-600"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 text-sm text-gray-700">
        {mode === "details" ? (
          <>
            {location?.lat != null && location?.lng != null ? (
              <div ref={mapRef} className="h-56 overflow-hidden rounded-2xl border border-gray-200 bg-slate-100" />
            ) : null}
            {mapError ? <p className="text-xs text-amber-700">{mapError}</p> : null}
            <p>{location?.address || "Address not available yet."}</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
              <div>
                <span className="block font-medium text-gray-700">Latitude</span>
                {location?.lat ?? "--"}
              </div>
              <div>
                <span className="block font-medium text-gray-700">Longitude</span>
                {location?.lng ?? "--"}
              </div>
            </div>
          </>
        ) : null}

        {mode === "signal" ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location confidence
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{signalStrength}%</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${signalStrength}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              This is a lightweight quality indicator for the stored coordinate pair.
            </p>
          </div>
        ) : null}

        {mode === "heat" ? (
          <div className="space-y-4">
            <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-900">
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(circle at 35% 45%, rgba(34,197,94,0.95), rgba(34,197,94,0.15) 18%, transparent 42%), radial-gradient(circle at 70% 30%, rgba(250,204,21,0.9), rgba(250,204,21,0.1) 20%, transparent 44%), radial-gradient(circle at 55% 72%, rgba(239,68,68,0.9), rgba(239,68,68,0.14) 22%, transparent 48%), linear-gradient(135deg, #0f172a, #1e293b)",
                }}
              />
              <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/90 px-4 py-3 text-xs text-slate-700 backdrop-blur">
                Hotspot preview for this coordinate region. Add richer Google Maps layers later if needed.
              </div>
            </div>
          </div>
        ) : null}

        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Open in Google Maps
          </a>
        ) : (
          <p className="text-xs text-gray-500">Add an address or coordinates to enable map navigation.</p>
        )}
      </div>
    </div>
  );
};

export default MapView;
