import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/useAuth";
import MapView from "../../../components/maps/MapView";
import { useBookings } from "../../../hooks/useBookings";
import { getDriverById, updateDriverAvailability } from "../../../services/drivers.service";
import { formatDateDisplay } from "../../../utils/dateHelpers";
import DriverApplication from "./DriverApplication";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const { bookings } = useBookings({ driverId: user?.uid });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getDriverById(user.uid);
        setProfile(data);
        setIsAvailable(Boolean(data?.isAvailable));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadProfile();
    }
  }, [user?.uid]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading driver dashboard...</div>;
  }

  if (!profile || profile.applicationStatus !== "approved") {
    return <DriverApplication />;
  }

  const currentJob = bookings.find((booking) => booking.status === "active");
  const recentJobs = bookings.filter((booking) => booking.status === "completed").slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <button
          onClick={async () => {
            const nextValue = !isAvailable;
            await updateDriverAvailability(profile.id, nextValue);
            setIsAvailable(nextValue);
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            isAvailable ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
          }`}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </button>
      </div>

      {currentJob ? (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">Current job</h2>
          <p className="font-medium">{currentJob.vehicleName}</p>
          <p className="text-sm text-gray-500">
            {formatDateDisplay(currentJob.startDate)} - {formatDateDisplay(currentJob.endDate)}
          </p>
          <div className="mt-4">
            <MapView location={currentJob.pickupLocation} className="min-h-[220px]" />
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent jobs</h2>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="rounded-lg bg-white p-4 shadow">
              <p className="font-medium">{job.vehicleName}</p>
              <p className="text-sm text-gray-500">{formatDateDisplay(job.endDate)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
