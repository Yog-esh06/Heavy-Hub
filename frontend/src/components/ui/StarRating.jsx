import React, { useState } from "react";

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  count = 5,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleHover = (rating) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex gap-1">
      {Array.from({ length: count }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleHover(star)}
          onMouseLeave={() => setHoverValue(0)}
          disabled={readOnly}
          className={`${sizeClasses[size]} transition-colors ${
            star <= displayValue ? "text-yellow-400" : "text-gray-300"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;