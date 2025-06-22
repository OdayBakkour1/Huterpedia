import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface KazawalletButtonProps {
  amount: number;
  couponCode?: string;
}

export const KazawalletButton: React.FC<KazawalletButtonProps> = ({ amount, couponCode }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!amount || amount <= 0) {
      setError("Invalid amount. Please check your coupon code or try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://gzpayeckolpfflgvkqvh.supabase.co/functions/v1/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "USD",
          email: user.email,
          userId: user.id,
          couponCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || "Failed to create payment.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
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
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-slate-900 p-8 rounded-lg flex flex-col items-center gap-4 shadow-lg">
            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-cyan-200 text-lg font-medium">Redirecting to Kazawallet…</p>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </>
  );
}; 