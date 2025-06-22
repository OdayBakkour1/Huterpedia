import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import NewPublicHeader from '@/components/NewPublicHeader';
import NewPublicFooter from '@/components/NewPublicFooter';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (!ref) {
      setStatus('error');
      setMessage('Invalid payment reference. Please contact support.');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('status')
          .eq('ref', ref)
          .single();

        if (error) {
          console.error('Error checking payment:', error);
          setStatus('error');
          setMessage('Unable to verify payment. Please contact support.');
          return;
        }

        if (data.status === 'fulfilled') {
          setStatus('success');
          setMessage('Your payment was successful! Your subscription is now active.');
        } else if (data.status === 'pending') {
          // Payment still processing, check again in 3 seconds
          setTimeout(checkPaymentStatus, 3000);
        } else {
          setStatus('error');
          setMessage('Payment was not completed. Please try again or contact support.');
        }
      } catch (err) {
        console.error('Error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please contact support.');
      }
    };

    checkPaymentStatus();
  }, [ref]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      <NewPublicHeader />
      
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <Card className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {status === 'loading' && 'Processing Payment'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'error' && 'Payment Issue'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-2">
            <p className="text-white/70 mb-6">
              {message}
            </p>
            
            {status !== 'loading' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white"
                >
                  {status === 'success' ? 'Go to Dashboard' : 'Return to Dashboard'}
                </Button>
                
                {status === 'error' && (
                  <Button 
                    onClick={() => navigate('/pricing')}
                    variant="outline"
                    className="w-full border-white/20 text-white/80 hover:bg-white/10"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <NewPublicFooter />
    </div>
  );
};

export default PaymentSuccess;