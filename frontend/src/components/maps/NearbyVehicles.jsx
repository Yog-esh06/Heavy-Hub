import React, { useEffect, useMemo, useRef, useState } from "react";
import { GOOGLE_MAPS_API_KEY, loadGoogleMapsAPI } from "../../config/maps";
import { calculateHaversineDistance, formatDistance } from "../../utils/distance";

const NearbyVehicles = ({ vehicles = [], center = null }) => {
  const [view, setView] = useState("proximity");
  const [mapError, setMapError] = useState("");
  const mapRef = useRef(null);
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
  const mappableVehicles = items.filter((vehicle) => vehicle.location?.lat != null && vehicle.location?.lng != null);

  useEffect(() => {
    if (
      !mapRef.current ||
      center?.lat == null ||
      center?.lng == null ||
      !["proximity", "heatmap"].includes(view)
    ) {
      return undefined;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError("Add a Google Maps key to render the live nearby map.");
      return undefined;
    }

    let active = true;
    let markers = [];
    let heatmapLayer = null;

    loadGoogleMapsAPI()
      .then(() => {
        if (!active || !window.google?.maps || !mapRef.current) {
          return;
        }

        setMapError("");

        const googleMaps = window.google.maps;
        const map = new googleMaps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const bounds = new googleMaps.LatLngBounds();
        bounds.extend({ lat: center.lat, lng: center.lng });

        markers.push(
          new googleMaps.Marker({
            map,
            position: { lat: center.lat, lng: center.lng },
            title: "Your location",
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              fillColor: "#f59e0b",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            },
          })
        );

        mappableVehicles.forEach((vehicle) => {
          const position = { lat: vehicle.location.lat, lng: vehicle.location.lng };
          bounds.extend(position);

          const marker = new googleMaps.Marker({
            map: view === "proximity" ? map : null,
            position,
            title: vehicle.name,
          });

          if (view === "proximity") {
            const infoWindow = new googleMaps.InfoWindow({
              content: `
                <div style="max-width:220px">
                  <strong>${vehicle.name}</strong><br />
                  <span>${vehicle.location?.address || "Location not available"}</span><br />
                  <span>${vehicle.distance == null ? "Distance unavailable" : formatDistance(vehicle.distance)}</span>
                </div>
              `,
            });

            marker.addListener("click", () => infoWindow.open({ anchor: marker, map }));
            markers.push(marker);
          }
        });

        if (view === "heatmap" && googleMaps.visualization) {
          heatmapLayer = new googleMaps.visualization.HeatmapLayer({
            data: mappableVehicles.map(
              (vehicle) => new googleMaps.LatLng(vehicle.location.lat, vehicle.location.lng)
            ),
            radius: 35,
          });
          heatmapLayer.setMap(map);
        }

        if (mappableVehicles.length > 0) {
          map.fitBounds(bounds);
        }
      })
      .catch((error) => {
        if (active) {
          setMapError(error.message || "Failed to load Google Maps.");
        }
      });

    return () => {
      active = false;
      markers.forEach((marker) => marker.setMap(null));
      if (heatmapLayer) {
        heatmapLayer.setMap(null);
      }
    };
  }, [center?.lat, center?.lng, mappableVehicles, view]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Nearby vehicles</h2>
          <p className="text-sm text-gray-600">
            See rental options around the user with distance-aware map and heatmap views.
          </p>
        </div>
        <div className="flex rounded-full border border-gray-200 bg-slate-50 p-1 text-xs">
          {["list", "proximity", "heatmap"].map((mode) => (
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

      {items.length > 0 && view === "proximity" ? (
        <div className="space-y-3">
          <div ref={mapRef} className="h-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-slate-100" />
          {mapError ? <p className="text-sm text-amber-700">{mapError}</p> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {items.slice(0, 6).map((vehicle) => (
              <div key={vehicle.id} className="rounded-xl border border-gray-200 p-3">
                <p className="font-medium text-slate-900">{vehicle.name}</p>
                <p className="text-sm text-slate-600">{vehicle.location?.address || "Address not available"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {vehicle.distance == null ? "Distance unavailable" : formatDistance(vehicle.distance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {items.length > 0 && view === "heatmap" ? (
        <div className="space-y-3">
          <div ref={mapRef} className="h-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-slate-100" />
          {mapError ? <p className="text-sm text-amber-700">{mapError}</p> : null}
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
