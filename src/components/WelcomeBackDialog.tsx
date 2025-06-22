import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { format } from "date-fns";

export const WelcomeBackDialog = () => {
  const [open, setOpen] = useState(false);
  const { data: subscription } = useSubscriptionStatus();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show welcome back dialog only for active subscriptions
    if (subscription?.isActive) {
      // Small delay to ensure it doesn't show immediately on page load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [subscription]);
  
  if (!subscription?.isActive) {
    return null;
  }
  
  const endDateString = subscription.isTrial 
    ? subscription.trialEnd 
    : subscription.subscriptionEnd;
  
  const endDate = endDateString ? new Date(endDateString) : null;
  const isValidDate = endDate && !isNaN(endDate.getTime());
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex flex-col items-center gap-4">
            <div className="bg-green-500/20 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Welcome Back!
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-white/80">
            You have successfully signed in to your account.
          </p>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subscription.isPremium ? (
                  <Crown className="h-5 w-5 text-purple-400" />
                ) : (
                  <Crown className="h-5 w-5 text-blue-400" />
                )}
                <span className="font-medium text-white">
                  {subscription.isPremium ? 'Premium Plan' : 'Free Trial'}
                </span>
              </div>
              <span className={`text-sm ${subscription.isPremium ? 'text-purple-400' : 'text-blue-400'}`}>
                {subscription.daysRemaining} days remaining
              </span>
            </div>
            
            <div className="mt-2 text-sm text-slate-400">
              {subscription.isTrial ? (
                <>Your trial ends on {isValidDate ? format(endDate, "MMMM d, yyyy") : 'N/A'}</>
              ) : (
                <>Your subscription is active until {isValidDate ? format(endDate, "MMMM d, yyyy") : 'N/A'}</>
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl"
          >
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};