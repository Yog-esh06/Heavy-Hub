import { useEffect, useState } from "react";
import { getVehicles, searchVehicles } from "../services/vehicles.service";

export function useVehicles(filters = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = filters.query
      ? searchVehicles(filters.query, filters)
      : getVehicles(filters);

    request
      .then((data) => {
        if (!cancelled) setVehicles(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return { vehicles, loading, error, setVehicles };
}
