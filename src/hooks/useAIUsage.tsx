import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

console.log('[HOOK] useAIUsage loaded');

export const useAIUsage = () => {
  console.log('[HOOK] useAIUsage called');
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_or_create_monthly_usage', {
        _user_id: user.id,
        _feature_type: 'ai_summarize'
      });

      if (error) {
        console.error('Error fetching AI usage:', error);
        throw error;
      }

      return {
        current: data?.[0]?.usage_count || 0,
        limit: 15,
        remaining: Math.max(0, 15 - (data?.[0]?.usage_count || 0))
      };
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce database calls
  });
};
