import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';
import { KazawalletButton } from '@/components/KazawalletButton';
import { CouponInput } from '@/components/CouponInput';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(5);
  const originalPrice = 5;

  const handleCouponApplied = (discount: number, final: number, couponCode: string) => {
    setDiscountAmount(discount);
    setFinalAmount(final);
    setAppliedCoupon(couponCode);
  };
  
  const handleCouponRemoved = () => {
    setDiscountAmount(0);
    setFinalAmount(originalPrice);
    setAppliedCoupon('');
  };

  const isSubscribed = subscription?.status === 'active';

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
            <div className="flex items-center justify-center">
              {discountAmount > 0 && (
                <div className="text-xl text-white/60 line-through mr-2">${originalPrice}</div>
              )}
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">${finalAmount.toFixed(2)}</div>
            </div>
            <div className="text-white/60 text-base">per month</div>
          </div>
          
          {!isSubscribed && (
            <div className="mb-6">
              <CouponInput 
                originalAmount={originalPrice} 
                onCouponApplied={handleCouponApplied} 
                onCouponRemoved={handleCouponRemoved} 
                appliedCoupon={appliedCoupon} 
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded-xl p-3 bg-white/5 border border-white/20 text-white placeholder-white/50 focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              readOnly={!!user?.email}
              placeholder="Enter your email"
            />
          </div>
          
          {isSubscribed ? (
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full shadow-2xl rounded-2xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-green-600 hover:bg-green-700 text-white mb-6"
            >
              <Check className="h-5 w-5 mr-2" />
              Already Subscribed - Go to Dashboard
            </Button>
          ) : user ? (
            <KazawalletButton 
              amount={finalAmount} 
              couponCode={appliedCoupon}
            />
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full shadow-2xl rounded-2xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white mb-6"
            >
              Sign In to Continue
            </Button>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-white/60 text-sm">
              By subscribing, you agree to our 
              <a href="/terms" className="text-cyan-400 hover:underline"> Terms of Service</a> 
              and 
              <a href="/privacy" className="text-cyan-400 hover:underline"> Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
      <NewPublicFooter />
    </div>
  );
};

export default Checkout;