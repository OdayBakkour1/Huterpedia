import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Clock, AlertTriangle } from 'lucide-react';

export const SubscriptionBanner = () => {
  const { data: subscription, isLoading } = useSubscriptionStatus();
  const navigate = useNavigate();
  
  if (isLoading || !subscription) {
    return null;
  }
  
  // Don't show banner for premium users
  if (subscription.isPremium && subscription.isActive) {
    return null;
  }
  
  // Show different banners based on subscription status
  if (subscription.isTrial && subscription.isActive) {
    return (
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-500/30 py-2 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Clock className="h-4 w-4" />
            <span>
              Your free trial ends in <span className="font-bold">{subscription.daysRemaining} days</span>. 
              Upgrade to premium for uninterrupted access.
            </span>
          </div>
          <Button 
            onClick={() => navigate('/pricing')} 
            size="sm" 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }
  
  if (subscription.isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 py-2 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Your {subscription.isTrial ? 'trial' : 'subscription'} has expired. 
              Upgrade to premium to continue enjoying all features.
            </span>
          </div>
          <Button 
            onClick={() => navigate('/pricing')} 
            size="sm" 
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
};