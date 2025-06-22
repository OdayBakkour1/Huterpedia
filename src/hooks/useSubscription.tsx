import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  has_access: boolean;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'none';
  trial_days_remaining: number;
  subscription_end_date: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus | null> => {
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_user_subscription_status', {
        _user_id: user.id
      });

      if (error) {
        console.error('Error fetching subscription status:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute to check trial expiry
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};