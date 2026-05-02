import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as listingsService from "../services/listings.service";

export const useListings = (options = {}) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    const ownerId = options.ownerId || user?.id || user?.uid;
    if (!ownerId) return [];

    try {
      setLoading(true);
      setError(null);
      const data = await listingsService.getOwnerListings(ownerId);
      setListings(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [options.ownerId, user?.id, user?.uid]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const createListing = useCallback(
    async (listingData) => {
      if (!user) throw new Error("User not authenticated");
      setLoading(true);
      setError(null);
      try {
        const result = await listingsService.createListing({
          ...listingData,
          ownerId: user.id || user.uid,
        });
        await fetchListings();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchListings, user]
  );

  const updateListing = useCallback(async (listingId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listingsService.updateListing(listingId, updates);
      setListings((current) =>
        current.map((listing) => (listing.id === listingId ? result : listing))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (listingId) => {
    setLoading(true);
    setError(null);
    try {
      await listingsService.deleteListing(listingId);
      setListings((current) => current.filter((listing) => listing.id !== listingId));
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    listings,
    loading,
    error,
    setListings,
    fetchListings,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing,
  };
};
