import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";

interface KazawalletButtonProps {
  amount: number;
  couponCode?: string;
}

export const KazawalletButton: React.FC<KazawalletButtonProps> = ({ amount, couponCode }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!user) {
      setError("Please sign in to continue with payment.");
      return;
    }
    
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
            Subscribe Now - ${amount.toFixed(2)}/month
          </>
        )}
      </Button>
      {error && (
        <div className="mt-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
          {error}
        </div>
      )}
    </>
  );
};