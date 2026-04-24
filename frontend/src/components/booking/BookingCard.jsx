import React from "react";
import { Link } from "react-router-dom";
import { BookingStatus } from "../../shared/constants";
import { formatDateDisplay } from "../../utils/dateHelpers";
import { formatCurrency } from "../../utils/pricing";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const BookingCard = ({ booking, onCancel, onConfirm, role = "renter" }) => {
  const isRenter = role === "renter";
  const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status) && isRenter;
  const canConfirm = booking.status === BookingStatus.PENDING && !isRenter;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="flex items-start justify-between border-b bg-gradient-to-r from-green-50 to-blue-50 p-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{booking.vehicleName}</h3>
          <p className="mt-1 text-sm text-gray-600">Booking ID: {booking.id}</p>
        </div>
        <Badge variant="secondary">{booking.status}</Badge>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">From</p>
            <p className="text-sm font-semibold text-gray-900">{formatDateDisplay(booking.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">To</p>
            <p className="text-sm font-semibold text-gray-900">{formatDateDisplay(booking.endDate)}</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Total</span>
            <span className="font-semibold">{formatCurrency(booking.totalAmount || 0)}</span>
          </div>
        </div>
      </div>

      {(canCancel || canConfirm) && (
        <div className="flex gap-2 border-t bg-gray-50 px-4 py-3">
          {canConfirm ? (
            <Button variant="primary" size="sm" onClick={() => onConfirm?.(booking.id)} className="flex-1">
              Confirm
            </Button>
          ) : null}
          {canCancel ? (
            <Button variant="danger" size="sm" onClick={() => onCancel?.(booking.id)} className="flex-1">
              Cancel
            </Button>
          ) : null}
          <Link to={`/dashboard/renter/booking/${booking.id}`} className="flex-1">
            <Button variant="secondary" size="sm" fullWidth>
              View Details
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
