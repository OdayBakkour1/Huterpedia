import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Crown, Loader2 } from 'lucide-react';

export default function PaymentButton({ amount, productName, onSuccess, onError }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    if (!user) {
      const errorMessage = 'You must be logged in to make a payment.';
      setError(errorMessage);
      if (onError) onError('not_authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Creating payment with:", { amount, email: user.email, userId: user.id, productInfo: productName });
      
      const res = await fetch('https://gzpayeckolpfflgvkqvh.supabase.co/functions/v1/create-payment', {
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
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Payment API error (${res.status}):`, errorText);
        throw new Error(`Payment service error (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Payment API response:", data);
      
      if (data.paymentUrl) {
        if (onSuccess) onSuccess(data.ref);
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Failed to create payment link.');
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || 'Network error. Please try again.');
      if (onError) onError('network_error');
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full shadow-2xl rounded-2xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white mb-6"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Crown className="h-5 w-5 mr-2" />
            Pay with KazaWallet
          </>
        )}
      </Button>
      {error && <div className="mt-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
    </>
  );
}