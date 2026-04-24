// frontend/src/pages/dashboard/renter/Cart.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useAuth } from '../../../hooks/useAuth';
import CartItem from '../../../components/CartItem';
import { createBooking } from '../../../services/bookings.service';

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateCartItem, clearCart, cartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.pricePerDay * item.totalDays) + (item.driverRequired ? item.driverFeePerDay * item.totalDays : 0), 0);
  };

  const handleConfirmAll = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');
    try {
      // Create booking for each cart item
      for (const item of cartItems) {
        await createBooking({
          vehicleId: item.vehicleId,
          renterId: user.uid,
          ownerId: item.ownerId,
          startDate: item.startDate,
          endDate: item.endDate,
          startTime: item.startTime || '09:00',
          pickupLocation: item.pickupLocation,
          totalDays: item.totalDays,
          pricePerDay: item.pricePerDay,
          driverRequested: item.driverRequired,
          driverFeePerDay: item.driverRequired ? item.driverFeePerDay : 0,
          totalAmount: (item.pricePerDay * item.totalDays) + (item.driverRequired ? item.driverFeePerDay * item.totalDays : 0),
        });
      }
      await clearCart();
      navigate('/dashboard/bookings', { state: { message: 'All bookings confirmed!' } });
    } catch (err) {
      setError('Failed to confirm bookings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-lg shadow p-8">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Looks like you haven't added any equipment to rent yet.</p>
          <Link to="/browse/rent" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({cartCount} items)</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={() => removeFromCart(item.id)}
              onUpdate={(updates) => updateCartItem(item.id, updates)}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-4 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} ({item.totalDays} days)</span>
                  <span>₹{(item.pricePerDay * item.totalDays).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {cartItems.some(i => i.driverRequired) && (
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Driver Fees</span>
                  <span>₹{cartItems.reduce((sum, i) => sum + (i.driverRequired ? i.driverFeePerDay * i.totalDays : 0), 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                <span>Grand Total</span>
                <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
            <button
              onClick={handleConfirmAll}
              disabled={loading}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Confirm All Bookings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;