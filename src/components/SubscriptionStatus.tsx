import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Crown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const SubscriptionStatus = () => {
  const { data: subscription, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'trial':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'expired':
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Crown className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'trial':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = () => {
    switch (subscription.status) {
      case 'trial':
        return `Trial (${subscription.trial_days_remaining} days left)`;
      case 'active':
        return 'Premium Active';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'No Subscription';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Crown className="h-5 w-5 text-cyan-400" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-white font-medium">Premium Plan</span>
          </div>
          <Badge className={`${getStatusColor()} border`}>
            {getStatusText()}
          </Badge>
        </div>

        {subscription.status === 'trial' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              Your free trial ends on{' '}
              {subscription.subscription_end_date 
                ? new Date(subscription.subscription_end_date).toLocaleDateString()
                : 'Unknown'
              }
            </p>
          </div>
        )}

        {subscription.status === 'active' && subscription.subscription_end_date && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-green-300 text-sm">
              Next billing date:{' '}
              {new Date(subscription.subscription_end_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {(subscription.status === 'expired' || subscription.status === 'cancelled' || !subscription.has_access) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-300 text-sm mb-3">
              Your subscription has ended. Upgrade to continue accessing premium features.
            </p>
            <Button 
              onClick={() => navigate('/pricing')}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white"
            >
              Upgrade Now
            </Button>
          </div>
        )}

        {subscription.status === 'trial' && subscription.trial_days_remaining <= 3 && (
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}
      </CardContent>
    </Card>
  );
};