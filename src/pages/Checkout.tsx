import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-4">Coming Soon</h1>
          <div className="text-center mb-6">
            <div className="text-lg text-white font-semibold mb-2">Premium Subscription</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">$5</div>
            <div className="text-white/60 text-base">per month</div>
          </div>
          
          <div className="mb-4">
            <p className="text-white/80 text-center mb-6">
              Our payment system is currently being updated. Please check back soon!
            </p>
            
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full shadow-2xl rounded-2xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white mb-6"
            >
              Return to Dashboard
            </Button>
          </div>
          
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