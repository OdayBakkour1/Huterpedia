import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentButton({ amount, productName, onSuccess, onError }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    if (!user) {
      setError('You must be logged in to make a payment.');
      if (onError) onError('not_authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          email: user.email,
          userId: user.id,
          productInfo: productName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        if (onSuccess) onSuccess(data.ref);
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'Failed to create payment link.');
        if (onError) onError(data.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      if (onError) onError('network_error');
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handlePay}
        disabled={loading}
        className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-2 px-4 rounded shadow"
      >
        {loading ? 'Redirecting...' : 'Pay with KazaWallet'}
      </button>
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
    </>
  );
} 