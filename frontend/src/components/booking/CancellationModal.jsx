import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { CancellationReasons } from "../../shared/constants";
import { calculateRefund, formatCurrency } from "../../utils/pricing";
import { formatDateDisplay } from "../../utils/dateHelpers";

const CancellationModal = ({ isOpen, onClose, booking, onConfirm, loading = false }) => {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const refundInfo = calculateRefund(booking.totalAmount, booking.startDate);

  const handleSubmit = () => {
    if (!reason || confirmText !== "CANCEL") {
      alert("Please select a reason and confirm cancellation");
      return;
    }

    onConfirm?.(booking.id, reason);
  };

  const handleClose = () => {
    setReason("");
    setConfirmText("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Booking"
      size="md"
    >
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-gray-900">{booking.vehicleName}</p>
          <p className="text-sm text-gray-600">
            {formatDateDisplay(booking.startDate)} - {formatDateDisplay(booking.endDate)}
          </p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(booking.totalAmount)}
          </p>
        </div>

        {/* Refund Policy */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Cancellation Policy</h4>

          <div className={`p-4 rounded-lg border-l-4 ${
            refundInfo.hoursUntilStart > 48
              ? "bg-green-50 border-green-600"
              : refundInfo.hoursUntilStart > 24
              ? "bg-yellow-50 border-yellow-600"
              : "bg-red-50 border-red-600"
          }`}>
            <p className="font-semibold text-gray-900">{refundInfo.policy}</p>
            <p className="text-sm text-gray-600 mt-1">
              Your booking starts in {Math.round(refundInfo.hoursUntilStart)} hours
            </p>
          </div>

          {/* Refund Amount */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2">You will receive:</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(refundInfo.refundAmount)}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              ({refundInfo.refundPercentage}% of booking amount)
            </p>
          </div>
        </div>

        {/* Cancellation Reason */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-900">
            Reason for Cancellation *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a reason</option>
            {CancellationReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Confirmation */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-900">
            Confirm Cancellation
          </label>
          <p className="text-sm text-gray-600 mb-2">
            Type <strong>CANCEL</strong> to confirm
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Type CANCEL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
          />
        </div>

        {/* Warning */}
        <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">⚠️ This action cannot be undone</p>
          <p>Once cancelled, this booking cannot be reactivated.</p>
        </div>

        {/* Footer */}
      </div>

      <div className="border-t mt-6 pt-6 flex gap-2">
        <Button
          variant="secondary"
          onClick={handleClose}
          className="flex-1"
        >
          Keep Booking
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          loading={loading}
          disabled={!reason || confirmText !== "CANCEL"}
          className="flex-1"
        >
          Cancel Booking
        </Button>
      </div>
    </Modal>
  );
};

export default CancellationModal;