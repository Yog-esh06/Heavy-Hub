export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

// Default map center (India geographical center)
export const DEFAULT_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

// Default zoom levels
export const MAP_ZOOM = {
  WORLD: 3,
  COUNTRY: 5,
  STATE: 8,
  CITY: 12,
  VEHICLE_DETAIL: 15,
  CLOSE: 18,
};

// Map styles
export const MAP_STYLE = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

// Marker colors
export const MARKER_COLORS = {
  VEHICLE: "#15803d", // Green
  DRIVER: "#2563eb", // Blue
  LOCATION: "#dc2626", // Red
  USER: "#f59e0b", // Amber
};

// Map container styles
export const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
  borderRadius: "8px",
};

// Places Autocomplete options
export const AUTOCOMPLETE_OPTIONS = {
  componentRestrictions: { country: "in" },
  types: ["geocode"],
  fields: ["address_components", "formatted_address", "geometry"],
};

// Search radius for nearby vehicles
export const SEARCH_RADIUS_KM = 50;
export const SEARCH_RADIUS_M = SEARCH_RADIUS_KM * 1000;

/**
 * Load Google Maps API script
 */
export const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Check if script is already in DOM
    if (document.querySelector(`script[src*="maps/api/js"]`)) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Create and append script
    const script = document.createElement("script");
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error("Google Maps API key is missing"));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,visualization`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        reject(new Error("Google Maps API failed to load"));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps API script"));
    };

    document.head.appendChild(script);
  });
};

/**
 * Check if Google Maps API is available
 */
export const isGoogleMapsAvailable = () => {
  return !!(window.google && window.google.maps);
};
