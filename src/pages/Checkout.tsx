import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CouponInput } from '@/components/CouponInput';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, ArrowLeft, CreditCard, Shield, Zap } from 'lucide-react';
import PaymentButton from '@/components/PaymentButton';
import { Helmet } from 'react-helmet-async';

const Checkout = () => {
  const { user, loading } = useAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(5.00);
  
  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  const handleCouponApplied = (discount: number, final: number, couponCode: string) => {
    setDiscountAmount(discount);
    setFinalAmount(final);
    setAppliedCoupon(couponCode);
  };
  
  const handleCouponRemoved = () => {
    setDiscountAmount(0);
    setFinalAmount(5.00);
    setAppliedCoupon('');
  };
  
  const handlePaymentSuccess = (ref: string) => {
    console.log('Payment successful, reference:', ref);
    // Payment is handled by redirect to KazaWallet
  };
  
  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Hunterpedia Checkout | Secure Subscription Process</title>
        <meta name="description" content="Subscribe to Hunterpedia securely. Get instant access to premium CVE alerts, cyber intel feeds, and real-time security news from top sources." />
        <meta property="og:title" content="Hunterpedia Checkout | Secure Subscription Process" />
        <meta property="og:description" content="Subscribe to Hunterpedia securely. Get instant access to premium CVE alerts, cyber intel feeds, and real-time security news from top sources." />
        <meta property="og:image" content="https://www.hunterpedia.site/Thumb/Checkout.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hunterpedia.site/checkout" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hunterpedia Checkout | Secure Subscription Process" />
        <meta name="twitter:description" content="Subscribe to Hunterpedia securely. Get instant access to premium CVE alerts, cyber intel feeds, and real-time security news from top sources." />
        <meta name="twitter:image" content="https://www.hunterpedia.site/Thumb/Checkout.png" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
        <div className="hidden md:block absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
        <div className="hidden md:block absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>
        <NewPublicHeader />
        
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 z-10 relative">
          <div className="max-w-4xl w-full">
            <Button 
              onClick={() => navigate(-1)} 
              variant="ghost" 
              className="mb-6 text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="grid md:grid-cols-5 gap-8">
              {/* Left column - Order summary */}
              <div className="md:col-span-3">
                <Card className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                      <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-3 py-1 rounded-full">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Premium Subscription</h3>
                          <p className="text-white/60">1 month access</p>
                        </div>
                        <span className="text-xl font-bold text-white">$5.00</span>
                      </div>
                      
                      {/* Features list */}
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Included Features:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-cyan-500/20 p-1 rounded-full">
                              <Check className="h-3 w-3 text-cyan-400" />
                            </div>
                            <span className="text-sm text-white/80">Full real-time threat feed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-cyan-500/20 p-1 rounded-full">
                              <Check className="h-3 w-3 text-cyan-400" />
                            </div>
                            <span className="text-sm text-white/80">Advanced filtering & search</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-cyan-500/20 p-1 rounded-full">
                              <Check className="h-3 w-3 text-cyan-400" />
                            </div>
                            <span className="text-sm text-white/80">Email & chat support</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-cyan-500/20 p-1 rounded-full">
                              <Check className="h-3 w-3 text-cyan-400" />
                            </div>
                            <span className="text-sm text-white/80">Personalized feed preferences</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-cyan-500/20 p-1 rounded-full">
                              <Check className="h-3 w-3 text-cyan-400" />
                            </div>
                            <span className="text-sm text-white/80">Bookmarks & saved articles</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-500/20 p-1 rounded-full">
                              <Check className="h-3 w-3 text-purple-400" />
                            </div>
                            <span className="text-sm text-white/80">30 AI summaries per month</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Coupon code */}
                      <div className="pt-4 border-t border-white/10">
                        <CouponInput 
                          originalAmount={5.00}
                          onCouponApplied={handleCouponApplied}
                          onCouponRemoved={handleCouponRemoved}
                          appliedCoupon={appliedCoupon}
                        />
                      </div>
                      
                      {/* Order total */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between mb-2">
                          <span className="text-white/70">Subtotal</span>
                          <span className="text-white">$5.00</span>
                        </div>
                        
                        {discountAmount > 0 && (
                          <div className="flex justify-between mb-2 text-green-400">
                            <span>Discount</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-white/10">
                          <span className="text-white">Total</span>
                          <span className="text-white">${finalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right column - Payment */}
              <div className="md:col-span-2">
                <Card className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Payment</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield className="h-5 w-5 text-cyan-400" />
                          <h3 className="text-white font-medium">Secure Payment</h3>
                        </div>
                        <p className="text-sm text-white/60">
                          Your payment information is processed securely. We do not store credit card details.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-white/70" />
                            <span className="text-white font-medium">Payment Method</span>
                          </div>
                          <img 
                            src="/kazawallet logo.png" 
                            alt="KazaWallet" 
                            className="h-6 object-contain" 
                          />
                        </div>
                        
                        <PaymentButton 
                          amount={finalAmount} 
                          productName="Premium Subscription (1 month)" 
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </div>
                      
                      <div className="text-center text-xs text-white/50">
                        By proceeding with payment, you agree to our 
                        <a href="/terms" className="text-cyan-400 hover:underline mx-1">Terms of Service</a> 
                        and 
                        <a href="/privacy" className="text-cyan-400 hover:underline mx-1">Privacy Policy</a>.
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={() => navigate('/pricing')} 
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    View All Plans
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <NewPublicFooter />
      </div>
    </>
  );
};

export default Checkout;