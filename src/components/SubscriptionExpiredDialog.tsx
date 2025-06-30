import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export const SubscriptionExpiredDialog = () => {
  console.log('[COMP] SubscriptionExpiredDialog render');
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { data: subscription } = useSubscriptionStatus();
  const { data: userRole } = useCurrentUserRole();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only show dialog if subscription is expired and user is not an admin
    if (subscription?.isExpired && userRole !== 'admin') {
      // Small delay to ensure it doesn't show immediately on page load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [subscription, userRole]);
  
  // Set up countdown timer when dialog is opened
  useEffect(() => {
    if (open && subscription?.isExpired && userRole !== 'admin') {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate('/checkout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [open, subscription, userRole, navigate]);
  
  if (!subscription?.isExpired || userRole === 'admin') {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex flex-col items-center gap-4">
            <div className="bg-red-500/20 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Subscription Expired
            </span>
          </DialogTitle>
          <DialogDescription>
            Your subscription has ended. Please upgrade to continue accessing premium features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-white/80">
            Your {subscription.isTrial ? 'free trial' : 'subscription'} has ended. 
            To continue accessing premium features, please upgrade your account.
          </p>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Redirecting to checkout in {countdown} seconds</span>
            </div>
            <p className="text-sm text-slate-400">
              Upgrade now to continue enjoying all premium features without interruption.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/checkout')} 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            
            <Button 
              onClick={() => {
                setOpen(false);
                navigate('/pricing');
              }} 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              View Pricing Options
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};