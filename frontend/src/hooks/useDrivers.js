import { useState, useCallback } from "react";
import * as driversService from "../services/drivers.service";

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch nearby drivers
  const fetchNearbyDrivers = useCallback(
    async (location, radiusKm = 50) => {
      try {
        setLoading(true);
        setError(null);

        const data = await driversService.getNearbyDrivers(location, radiusKm);
        setDrivers(data);
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get driver details
  const getDriver = useCallback(async (driverId) => {
    try {
      setLoading(true);
      setError(null);

      const driver = await driversService.getDriverById(driverId);
      setSelectedDriver(driver);
      return driver;
    } catch (err) {
      console.error("Error fetching driver:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign nearest driver
  const assignNearestDriver = useCallback(
    async (pickupLocation, vehicleType, startDate) => {
      try {
        setLoading(true);
        setError(null);

        const result = await driversService.assignNearestDriver(
          pickupLocation,
          vehicleType,
          startDate
        );

        if (result.success && result.driverId) {
          setSelectedDriver(result.driver);
        }

        return result;
      } catch (err) {
        console.error("Error assigning driver:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Apply as driver
  const applyAsDriver = useCallback(async (driverData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await driversService.applyAsDriver(driverData);
      return result;
    } catch (err) {
      console.error("Error applying as driver:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get application status
  const getApplicationStatus = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const status = await driversService.getDriverApplicationStatus(userId);
      return status;
    } catch (err) {
      console.error("Error fetching application status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    drivers,
    selectedDriver,
    loading,
    error,
    fetchNearbyDrivers,
    getDriver,
    assignNearestDriver,
    applyAsDriver,
    getApplicationStatus,
  };
};