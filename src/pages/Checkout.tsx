import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/kazawallet/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5,
          currency: 'USD',
          email,
          user_id: user?.id || 'guest',
        }),
      });
      const data = await res.json();
      if (res.ok && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        setError(data.error || 'Failed to create payment link.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
      <div className="hidden md:block absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
      <div className="hidden md:block absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>
      <NewPublicHeader />
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 z-10 relative">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-4">Checkout</h1>
          <div className="text-center mb-6">
            <div className="text-lg text-white font-semibold mb-2">Premium Subscription</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">$5</div>
            <div className="text-white/60 text-base">per month</div>
          </div>
          <div className="mb-4">
            <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded-xl p-3 bg-white/5 border border-white/20 text-white placeholder-white/50 focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={!!user?.email}
              placeholder="Enter your email"
            />
          </div>
          {error && <div className="text-red-400 text-sm mb-4 text-center">{error}</div>}
          <Button onClick={handlePay} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl py-4 text-lg font-semibold transition-all duration-300 hover:scale-105" disabled={loading}>
            {loading ? 'Redirecting...' : 'Pay with Kazawallet'}
          </Button>
        </div>
      </div>
      <NewPublicFooter />
    </div>
  );
};

export default Checkout; 