import { useState, useCallback } from "react";
import * as driversService from "../services/drivers.service";

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNearbyDrivers = useCallback(async (location, radiusKm = 50) => {
    try {
      setLoading(true);
      setError(null);
      const data = await driversService.getNearbyDrivers(location, radiusKm);
      setDrivers(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDriver = useCallback(async (driverId) => {
    try {
      setLoading(true);
      setError(null);
      const driver = await driversService.getDriverById(driverId);
      setSelectedDriver(driver);
      return driver;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignNearestDriver = useCallback(async (pickupLocation, vehicleType, startDate) => {
    try {
      setLoading(true);
      setError(null);
      const result = await driversService.assignNearestDriver(
        pickupLocation?.lat,
        pickupLocation?.lng,
        startDate,
        vehicleType
      );
      setSelectedDriver(result || null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyAsDriver = useCallback(async (driverData) => {
    try {
      setLoading(true);
      setError(null);
      return await driversService.applyAsDriver(driverData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApplicationStatus = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      return await driversService.getDriverApplicationStatus(userId);
    } catch (err) {
      setError(err.message);
      return null;
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
