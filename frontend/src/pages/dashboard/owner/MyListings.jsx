import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { deleteListing, updateListing } from "../../../services/listings.service";
import { useListings } from "../../../hooks/useListings";

const MyListings = () => {
  const { user } = useAuth();
  const { listings, loading, error, refetch } = useListings({ ownerId: user?.uid });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filtered = listings.filter((listing) => {
    if (activeTab === "rent") return listing.listingType === "rent" || listing.listingType === "both";
    if (activeTab === "sale") return listing.listingType === "sale" || listing.listingType === "both";
    if (activeTab === "inactive") return listing.status === "inactive";
    return true;
  });

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading listings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error loading listings: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link to="/dashboard/owner/add" className="rounded bg-blue-600 px-4 py-2 text-white">
          Add new listing
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          {["all", "rent", "sale", "inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium capitalize ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((listing) => (
          <div key={listing.id} className="rounded-lg bg-white p-4 shadow">
            <img src={listing.images?.[0]} alt={listing.name} className="h-48 w-full rounded object-cover" />
            <h3 className="mt-3 text-lg font-semibold">{listing.name}</h3>
            <p className="text-sm text-gray-500">{listing.type}</p>
            <div className="mt-4 flex items-center justify-between">
              <Link to={`/dashboard/owner/edit/${listing.id}`} className="text-sm text-blue-600">
                Edit
              </Link>
              <button
                onClick={async () => {
                  const nextStatus = listing.status === "active" ? "inactive" : "active";
                  await updateListing(listing.id, { status: nextStatus });
                  await refetch();
                }}
                className="text-sm text-gray-700"
              >
                {listing.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={async () => {
                  await deleteListing(listing.id);
                  await refetch();
                }}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;
