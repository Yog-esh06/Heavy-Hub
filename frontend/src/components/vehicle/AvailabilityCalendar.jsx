import React, { useState } from "react";
import { formatDateDisplay, getMinDate, getMaxDate } from "../../utils/dateHelpers";

const AvailabilityCalendar = ({
  bookedDates = [],
  onSelectDates,
  onDateSelect,
  selectedDates,
  minDate = getMinDate(),
  maxDate = getMaxDate(),
}) => {
  const [startDate, setStartDate] = useState(selectedDates?.start || "");
  const [endDate, setEndDate] = useState(selectedDates?.end || "");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && new Date(date) <= new Date(endDate)) {
      onSelectDates?.(date, endDate);
      onDateSelect?.({ start: date, end: endDate });
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (startDate && new Date(startDate) <= new Date(date)) {
      onSelectDates?.(startDate, date);
      onDateSelect?.({ start: startDate, end: date });
    }
  };

  const isDateBooked = (dateStr) => bookedDates.includes(dateStr);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = [];
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Select Dates</h3>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {startDate && (
            <p className="text-xs text-gray-600 mt-1">{formatDateDisplay(startDate)}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate || minDate}
            max={maxDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {endDate && (
            <p className="text-xs text-gray-600 mt-1">{formatDateDisplay(endDate)}</p>
          )}
        </div>
      </div>

      {/* Calendar View */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ‹
          </button>
          <h4 className="font-semibold text-gray-900">{monthName}</h4>
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ›
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const date = day
              ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              : null;
            const dateStr = date ? formatDateISO(date) : "";
            const isBooked = date && isDateBooked(dateStr);
            const isSelected =
              date && (dateStr === startDate || dateStr === endDate);
            const isBetween =
              date &&
              startDate &&
              endDate &&
              new Date(date) > new Date(startDate) &&
              new Date(date) < new Date(endDate);

            return (
              <div key={index}>
                {day ? (
                  <button
                    onClick={() => {
                      if (!startDate) {
                        handleStartDateChange(dateStr);
                      } else if (!endDate) {
                        if (new Date(dateStr) >= new Date(startDate)) {
                          handleEndDateChange(dateStr);
                        } else {
                          handleStartDateChange(dateStr);
                          setEndDate("");
                        }
                      } else {
                        handleStartDateChange(dateStr);
                        setEndDate("");
                      }
                    }}
                    disabled={isBooked}
                    className={`w-full py-2 text-sm font-medium rounded transition-colors ${
                      isBooked
                        ? "bg-red-100 text-red-600 cursor-not-allowed"
                        : isSelected
                        ? "bg-green-600 text-white"
                        : isBetween
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded border border-red-300" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded" />
          <span>In Range</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
