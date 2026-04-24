import React from "react";

const VehicleSpecs = ({ vehicle, specifications }) => {
  const source = specifications || vehicle || {};
  const specs = [
    { label: "Horse Power", value: source.horsePower, unit: "hp" },
    { label: "Weight", value: source.weight, unit: "kg" },
    { label: "Fuel Type", value: source.fuelType },
    { label: "Capacity", value: source.capacity },
    { label: "Brand", value: source.brand },
    { label: "Model", value: source.model },
    { label: "Year", value: source.year },
  ].filter((item) => item.value);

  return (
    <div className="rounded-lg bg-white p-6">
      <h3 className="text-lg font-bold text-gray-900">Specifications</h3>
      {specs.length === 0 ? (
        <p className="mt-3 text-gray-600">No specifications available.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {specs.map((spec) => (
            <div key={spec.label} className="border-l-4 border-green-600 pl-4">
              <p className="text-xs font-semibold uppercase text-gray-600">{spec.label}</p>
              <p className="text-lg font-bold text-gray-900">
                {spec.value}
                {spec.unit ? ` ${spec.unit}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleSpecs;
