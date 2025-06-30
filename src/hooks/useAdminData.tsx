import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_FUNCTIONS_URL = 'https://gzpayeckolpfflgvkqvh.functions.supabase.co';

// Stubbed admin hooks for compatibility
export function useAddNewsArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: any) => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-add-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add news article');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    },
  });
}

export function useAddUser() { 
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: any) => {
      // Get subscription plans first
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, name');
      
      if (plansError) throw plansError;
      
      const planMap = Object.fromEntries(
        (plans || []).map((plan: any) => [plan.name.toLowerCase(), plan.id])
      );
      
      // Create user in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: userData.email,
          full_name: userData.fullName,
          subscription: userData.subscription,
          role: userData.role
        });
        
      if (profileError) throw profileError;
      
      // Create role if not user
      if (userData.role !== 'user') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.user.id,
            role: userData.role
          });
          
        if (roleError) throw roleError;
      }
      
      // Create trial subscription
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7);
      
      const planId = planMap[userData.subscription] || planMap['free'] || null;
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: authUser.user.id,
          plan_id: planId,
          status: 'trial',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEnd.toISOString()
        });
        
      if (subscriptionError) throw subscriptionError;
      
      return authUser.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('date_recorded', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export const useAddNewsSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (source: any) => {
      const { data, error } = await supabase.from('news_sources').insert(source).select('*');
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
    },
  });
};

export function useNewsSources() {
  return useQuery({
    queryKey: ['news-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDeleteNewsSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { error } = await supabase
        .from('news_sources')
        .delete()
        .eq('id', sourceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
    },
  });
}

export function useAllPaymentMethods() {
  return useQuery({
    queryKey: ['all-payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*, profiles:profiles(id, full_name, email)');
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;
      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;
      // Map roles to users
      const roleMap = Object.fromEntries(
        (roles || []).map((r: any) => [r.user_id, r.role])
      );
      return (profiles || []).map((user: any) => ({
        ...user,
        role: roleMap[user.id] || 'user',
      }));
    },
  });
}

export function useUpdateUserRole() { 
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
}

export function useUpdateUserSubscription() { 
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, subscription }: { userId: string; subscription: string }) => {
      // Get subscription plans first
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, name');
      
      if (plansError) throw plansError;
      
      const planMap = Object.fromEntries(
        (plans || []).map((plan: any) => [plan.name.toLowerCase(), plan.id])
      );
      
      // Update profile subscription
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Check if subscription record exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      const now = new Date();
      let endDate = new Date(now);
      
      if (subscription === 'premium') {
        // Premium is 1 month
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        // Free trial is 7 days
        endDate.setDate(endDate.getDate() + 7);
      }
      
      const planId = planMap[subscription] || planMap['free'] || null;
      
      if (existingSub) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription === 'premium' ? 'active' : 'trial',
            plan_id: planId,
            subscription_start_date: subscription === 'premium' ? now.toISOString() : null,
            subscription_end_date: subscription === 'premium' ? endDate.toISOString() : null,
            trial_start_date: subscription === 'free' ? now.toISOString() : null,
            trial_end_date: subscription === 'free' ? endDate.toISOString() : null
          })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            status: subscription === 'premium' ? 'active' : 'trial',
            subscription_start_date: subscription === 'premium' ? now.toISOString() : null,
            subscription_end_date: subscription === 'premium' ? endDate.toISOString() : null,
            trial_start_date: subscription === 'free' ? now.toISOString() : null,
            trial_end_date: subscription === 'free' ? endDate.toISOString() : null
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useUserSubscriptions() {
  return useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:profiles(id, email, full_name),
          plans:subscription_plans(id, name, price_monthly)
        `);
      
      if (error) throw error;
      return data || [];
    }
  });
}