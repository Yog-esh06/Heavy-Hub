import React, { useState } from "react";
import { TIME_SLOTS } from "../../shared/constants";
import Button from "../ui/Button";

const BookingForm = ({ onSubmit, loading = false, defaultData = {} }) => {
  const [formData, setFormData] = useState({
    startTime: defaultData.startTime || "09:00",
    endTime: defaultData.endTime || "18:00",
    pickupLocation: defaultData.pickupLocation || "",
    pickupAddress: defaultData.pickupAddress || "",
    notes: defaultData.notes || "",
    driverRequested: defaultData.driverRequested || false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = "Pickup address is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>

      {/* Pickup Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pickup Address *
        </label>
        <textarea
          name="pickupAddress"
          value={formData.pickupAddress}
          onChange={handleChange}
          placeholder="Enter complete pickup address"
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.pickupAddress ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.pickupAddress && (
          <p className="text-red-600 text-sm mt-1">{errors.pickupAddress}</p>
        )}
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pickup Time *
          </label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.startTime ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.startTime && (
            <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Return Time *
          </label>
          <select
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.endTime ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.endTime && (
            <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special requests or notes for the owner?"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Terms */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs text-gray-600">
        <p>
          <strong>Cancellation Policy:</strong> You can cancel up to 48 hours
          before booking for a full refund.
        </p>
        <p>
          By confirming, you agree to our Terms of Service and acknowledge
          receipt of our Privacy Policy.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        size="lg"
      >
        Confirm Booking
      </Button>
    </form>
  );
};

export default BookingForm;