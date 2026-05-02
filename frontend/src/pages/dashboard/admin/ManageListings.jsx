import { useEffect, useState } from "react";
import { deleteListing, updateListing } from "../../../services/listings.service";
import { getVehicles } from "../../../services/vehicles.service";

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const allListings = await getVehicles({});
        let filtered = allListings;
        if (activeTab === "pending") {
          filtered = allListings.filter((listing) => !listing.isVerified);
        } else if (activeTab === "reported") {
          filtered = allListings.filter((listing) => Number(listing.reportCount || 0) > 0);
        }
        setListings(filtered);
      } catch (err) {
        console.error(err);
        alert("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [activeTab]);

  const handleVerifyToggle = async (listingId, currentStatus) => {
    try {
      const updated = await updateListing(listingId, { isVerified: !currentStatus });
      setListings((prev) => prev.map((listing) => (listing.id === listingId ? updated : listing)));
      alert(`Listing ${!currentStatus ? "verified" : "unverified"}`);
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (listingId) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await deleteListing(listingId);
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      alert("Listing deleted");
    } catch (err) {
      alert(err.message || "Failed to delete");
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Listings</h1>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          {["all", "pending", "reported"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 text-sm font-medium capitalize ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="px-4 py-3 text-sm">{listing.name}</td>
                <td className="px-4 py-3 text-sm">{listing.ownerName || listing.ownerId}</td>
                <td className="px-4 py-3 text-sm">{listing.type}</td>
                <td className="px-4 py-3 text-sm capitalize">{listing.listingType}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    listing.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {listing.status || "active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleVerifyToggle(listing.id, listing.isVerified)}
                    className={`px-2 py-1 rounded text-xs ${
                      listing.isVerified ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {listing.isVerified ? "Verified" : "Verify"}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => handleDelete(listing.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageListings;
