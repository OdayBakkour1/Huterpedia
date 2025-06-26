import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { format } from "date-fns";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export const WelcomeBackDialog = () => {
  const [open, setOpen] = useState(false);
  const { data: subscription } = useSubscriptionStatus();
  const { data: userRole } = useCurrentUserRole();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if dialog has been shown in this session
    const hasShownWelcome = sessionStorage.getItem('welcomeShown');
    
    // Only show welcome back dialog if it hasn't been shown yet and subscription is active
    if (!hasShownWelcome && subscription?.isActive) {
      // Small delay to ensure it doesn't show immediately on page load
      const timer = setTimeout(() => {
        setOpen(true);
        // Mark as shown for this session
        sessionStorage.setItem('welcomeShown', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [subscription]);
  
  if (!subscription?.isActive) {
    return null;
  }
  
  // Safely handle date formatting
  const getFormattedDate = () => {
    try {
      if (subscription.isTrial && subscription.trialEnd) {
        const date = new Date(subscription.trialEnd);
        if (!isNaN(date.getTime())) {
          return format(date, "MMMM d, yyyy");
        }
      } else if (subscription.subscriptionEnd) {
        const date = new Date(subscription.subscriptionEnd);
        if (!isNaN(date.getTime())) {
          return format(date, "MMMM d, yyyy");
        }
      }
      return "N/A";
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };
  
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
          <DialogDescription>
            You have successfully signed in. Review your subscription status and continue to your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-white/80">
            You have successfully signed in to your account.
          </p>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subscription.isPremium || userRole === 'admin' ? (
                  <Crown className="h-5 w-5 text-purple-400" />
                ) : (
                  <Crown className="h-5 w-5 text-blue-400" />
                )}
                <span className="font-medium text-white">
                  {userRole === 'admin' ? 'Admin Account' : (subscription.isPremium ? 'Premium Plan' : 'Free Trial')}
                </span>
              </div>
              {userRole !== 'admin' && (
                <span className={`text-sm ${subscription.isPremium ? 'text-purple-400' : 'text-blue-400'}`}>
                  {subscription.daysRemaining} days remaining
                </span>
              )}
            </div>
            
            <div className="mt-2 text-sm text-slate-400">
              {userRole === 'admin' ? (
                <>Admin account with full access to all features</>
              ) : subscription.isTrial ? (
                <>Your trial ends on {getFormattedDate()}</>
              ) : (
                <>Your subscription is active until {getFormattedDate()}</>
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