import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentRef = searchParams.get('ref');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentRef) {
      navigate('/dashboard');
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('reference', paymentRef)
          .single();

        if (error) throw error;
        setPaymentDetails(data);
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
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
            <div className="bg-green-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-white/80 mb-6">
              Thank you for your payment. Your premium subscription has been activated.
            </p>
            
            {!loading && paymentDetails && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-400">Amount:</div>
                  <div className="text-white font-medium text-right">${(paymentDetails.amount).toFixed(2)}</div>
                  
                  <div className="text-slate-400">Reference:</div>
                  <div className="text-white font-medium text-right">{paymentDetails.reference}</div>
                  
                  <div className="text-slate-400">Date:</div>
                  <div className="text-white font-medium text-right">
                    {new Date(paymentDetails.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="text-slate-400">Status:</div>
                  <div className="text-green-400 font-medium text-right">Completed</div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <NewPublicFooter />
    </div>
  );
};

export default PaymentSuccess;