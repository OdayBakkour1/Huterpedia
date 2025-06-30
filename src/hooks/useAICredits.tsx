console.log('[HOOK] useAICredits loaded');

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAICredits(userId: string) {
  console.log('[HOOK] useAICredits called');
  return useQuery({
    queryKey: ['ai-credits', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get user's AI credits from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('ai_credits')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;

      // Get current month's usage
      const { data: usageData, error: usageError } = await supabase
        .from('ai_usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_type', 'ai_summarize')
        .eq('month_year', new Date().toISOString().slice(0, 7))
        .maybeSingle();
      
      if (usageError) throw usageError;

      const currentUsage = usageData?.usage_count || 0;
      const maxCredits = profile.ai_credits || 15;
      const remainingCredits = Math.max(0, maxCredits - currentUsage);

      return {
        maxCredits,
        currentUsage,
        remainingCredits
      };
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
