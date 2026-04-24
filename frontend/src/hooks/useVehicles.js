import { useCallback, useEffect, useState } from "react";
import * as vehiclesService from "../services/vehicles.service";

export const useVehicles = (initialFilters = null) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async (listingType = "rent") => {
    try {
      setLoading(true);
      setError(null);

      const data =
        listingType === "sale"
          ? await vehiclesService.getVehiclesForSale()
          : await vehiclesService.getVehiclesForRent();

      setVehicles(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const filterVehicles = useCallback(async (filters) => {
    try {
      setLoading(true);
      setError(null);
      const results = await vehiclesService.filterVehicles(filters);
      setVehicles(results);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicle = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      setError(null);
      return await vehiclesService.getVehicleById(vehicleId);
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchVehicles = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const results = await vehiclesService.searchVehicles(searchTerm);
      setVehicles(results);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const filtersKey = JSON.stringify(initialFilters || {});

  useEffect(() => {
    if (!initialFilters) {
      fetchVehicles();
      return;
    }

    const hasActiveFilters = Object.entries(initialFilters).some(([, value]) => {
      if (value == null) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (typeof value === "boolean") return value;
      return true;
    });

    if (hasActiveFilters) {
      filterVehicles(initialFilters);
    } else {
      fetchVehicles(initialFilters.listingType || "rent");
    }
  }, [fetchVehicles, filterVehicles, filtersKey]);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    filterVehicles,
    getVehicle,
    searchVehicles,
  };
};
