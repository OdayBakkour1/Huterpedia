import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Crown } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth and subscription
  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If no user, redirect to auth (handled by useEffect)
  if (!user) {
    return null;
  }

  // If no subscription data or no access, show trial expired screen
  if (!subscription || !subscription.has_access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-slate-800/50 border-slate-700 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-red-500/20 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">
              {subscription?.status === 'trial' ? 'Trial Expired' : 'Access Expired'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              {subscription?.status === 'trial' 
                ? 'Your 7-day free trial has ended. Upgrade to Premium to continue accessing Hunterpedia.'
                : 'Your subscription has expired. Please renew to continue accessing the platform.'
              }
            </p>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">Premium Plan</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400 mb-2">$5/month</div>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Full real-time threat feed</li>
                <li>• Advanced filtering & search</li>
                <li>• 15 AI summaries per month</li>
                <li>• Personalized preferences</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has access, show trial warning if applicable
  if (subscription.status === 'trial' && subscription.trial_days_remaining <= 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Trial Warning Banner */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                Trial expires in {subscription.trial_days_remaining} day{subscription.trial_days_remaining !== 1 ? 's' : ''}
              </span>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              size="sm"
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
};