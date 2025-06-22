import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentCancel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentRef = searchParams.get('ref');

  useEffect(() => {
    if (!paymentRef) {
      navigate('/dashboard');
      return;
    }

    const updatePaymentStatus = async () => {
      try {
        // Update payment status to cancelled
        await supabase
          .from('payments')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('reference', paymentRef);
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    };

    updatePaymentStatus();
  }, [paymentRef, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
      <div className="hidden md:block absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
      <div className="hidden md:block absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>
      <NewPublicHeader />
      
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 z-10 relative">
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="bg-orange-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-orange-400" />
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-white/80 mb-6">
              Your payment was cancelled. No charges have been made to your account.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/checkout')} 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl"
              >
                Try Again
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <NewPublicFooter />
    </div>
  );
};

export default PaymentCancel;