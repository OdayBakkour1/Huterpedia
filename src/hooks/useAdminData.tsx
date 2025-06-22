import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Stubbed admin hooks for compatibility
export function useAddNewsArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase
        .from('news_articles')
        .insert([formData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    },
  });
}

export function useAddUser() { return {}; }

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

export function useUpdateUserRole() { return {}; }
export function useUpdateUserSubscription() { return {}; }

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