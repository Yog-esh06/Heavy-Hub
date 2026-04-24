import React, { useState } from "react";
import { EQUIPMENT_CATEGORIES, PRICE_RANGES, INDIAN_STATES } from "../../shared/constants";
import Button from "../ui/Button";

const VehicleFilters = ({ onApplyFilters, loading = false }) => {
  const [filters, setFilters] = useState({
    type: "",
    minPrice: undefined,
    maxPrice: undefined,
    state: "",
    driverAvailable: false,
  });

  const handleTypeChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type === type ? "" : type,
    }));
  };

  const handlePriceChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: range.min,
      maxPrice: range.max,
    }));
  };

  const handleStateChange = (state) => {
    setFilters((prev) => ({
      ...prev,
      state: prev.state === state ? "" : state,
    }));
  };

  const handleDriverToggle = () => {
    setFilters((prev) => ({
      ...prev,
      driverAvailable: !prev.driverAvailable,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({
      type: "",
      minPrice: undefined,
      maxPrice: undefined,
      state: "",
      driverAvailable: false,
    });
    onApplyFilters({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 sticky top-20">
      <h2 className="text-lg font-bold text-gray-900">Filters</h2>

      {/* Equipment Type */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Equipment Type</h3>
        <div className="space-y-2">
          {EQUIPMENT_CATEGORIES.map((category) => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type === category.id}
                onChange={() => handleTypeChange(category.id)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Price Range</h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                onChange={() => handlePriceChange(range)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* State */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">State</h3>
        <select
          value={filters.state}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              state: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All States</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Driver Available */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.driverAvailable}
            onChange={handleDriverToggle}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Driver Available</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button
          onClick={handleApply}
          variant="primary"
          fullWidth
          loading={loading}
        >
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="secondary" fullWidth>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default VehicleFilters;