import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  isTrial: boolean;
  isExpired: boolean;
  planName: string;
  trialEnd?: string;
  subscriptionEnd?: string;
  daysRemaining: number;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const { data: userRole } = useCurrentUserRole();
  
  return useQuery({
    queryKey: ['subscription-status', user?.id, userRole],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // If user is an admin, they always have active premium access
      if (userRole === 'admin') {
        return {
          isActive: true,
          isPremium: true,
          isTrial: false,
          isExpired: false,
          planName: 'premium',
          daysRemaining: 999 // Large number to indicate unlimited
        };
      }
      
      // First check if user has a subscription record
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
          status,
          trial_start_date,
          trial_end_date,
          subscription_start_date,
          subscription_end_date,
          plans:subscription_plans(name)
        `)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!subscription) {
        // No subscription found, return default values
        return {
          isActive: false,
          isPremium: false,
          isTrial: false,
          isExpired: true,
          planName: 'none',
          daysRemaining: 0
        };
      }
      
      const now = new Date();
      const status = subscription.status;
      const planName = subscription.plans?.name || 'free';
      
      let isActive = false;
      let isPremium = planName === 'premium';
      let isTrial = status === 'trial';
      let isExpired = status === 'expired';
      let endDate: Date | null = null;
      let daysRemaining = 0;
      
      // Calculate if subscription is active and days remaining
      if (status === 'trial' && subscription.trial_end_date) {
        const trialEnd = new Date(subscription.trial_end_date);
        isActive = trialEnd > now;
        isExpired = !isActive;
        endDate = trialEnd;
      } else if (status === 'active' && subscription.subscription_end_date) {
        const subscriptionEnd = new Date(subscription.subscription_end_date);
        isActive = subscriptionEnd > now;
        isExpired = !isActive;
        endDate = subscriptionEnd;
      }
      
      // Calculate days remaining
      if (endDate && isActive) {
        const diffTime = Math.abs(endDate.getTime() - now.getTime());
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      return {
        isActive,
        isPremium,
        isTrial,
        isExpired,
        planName,
        trialEnd: subscription.trial_end_date,
        subscriptionEnd: subscription.subscription_end_date,
        daysRemaining
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};