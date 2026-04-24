import React from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import VehicleCard from "../../components/vehicle/VehicleCard";
import { useVehicles } from "../../hooks/useVehicles";
import { EQUIPMENT_CATEGORIES } from "../../shared/constants";

const LandingPage = () => {
  const { vehicles, loading } = useVehicles({ listingType: "rent" });
  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            HeavyHub
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Rent, buy, and manage heavy equipment from one marketplace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Browse listings without signing in. Authentication only appears when a user
            tries to book, list equipment, or access a dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/browse/rent"
              className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Browse rentals
            </Link>
            <Link
              to="/browse/buy"
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-900 hover:bg-slate-100"
            >
              Browse sales
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-900 hover:bg-slate-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">For renters</h2>
            <p className="mt-2 text-sm text-slate-600">
              Search by machine type, compare pricing, and request a driver only when needed.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">For owners</h2>
            <p className="mt-2 text-sm text-slate-600">
              List equipment, upload photos, and manage incoming bookings from one dashboard.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">For drivers</h2>
            <p className="mt-2 text-sm text-slate-600">
              Apply once, stay available, and get matched to nearby jobs.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Live listings
            </p>
            <h2 className="mt-2 text-2xl font-bold">Featured vehicles</h2>
          </div>
          <Link to="/browse/rent" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            View all rentals
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10">
            <Spinner text="Loading featured vehicles..." />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Categories
          </p>
          <h2 className="mt-2 text-2xl font-bold">Popular equipment types</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EQUIPMENT_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/search?q=${encodeURIComponent(category.name)}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
